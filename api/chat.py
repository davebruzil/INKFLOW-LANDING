from http.server import BaseHTTPRequestHandler
import json
import urllib.request
import urllib.error
import os
import base64
import io
from urllib.parse import parse_qs

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        """Handle POST requests to /api/chat"""
        try:
            # Get content length and type
            content_length = int(self.headers.get('Content-Length', 0))
            content_type = self.headers.get('Content-Type', '')

            # Read request body
            post_data = self.rfile.read(content_length)

            print(f"[DEBUG] Content-Type: {content_type}")
            print(f"[DEBUG] Content-Length: {content_length}")

            # Handle multipart/form-data (file uploads)
            if content_type.startswith('multipart/form-data'):
                payload = self._parse_multipart(post_data, content_type)
            else:
                # Parse JSON
                try:
                    payload = json.loads(post_data.decode('utf-8'))
                except json.JSONDecodeError as e:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Invalid JSON"}).encode())
                    return

            # Get n8n webhook URL from environment
            n8n_url = os.getenv('N8N_WEBHOOK_BASE_URL', 'https://inkflow.eu.ngrok.io')
            webhook_url = f"{n8n_url}/webhook-test/chat"

            print(f"[DEBUG] Forwarding to: {webhook_url}")

            # Truncate imageUrl for logging to avoid huge logs
            log_payload = payload.copy()
            if 'imageUrl' in log_payload:
                log_payload['imageUrl'] = log_payload['imageUrl'][:100] + '...[truncated]'
            print(f"[DEBUG] Payload: {json.dumps(log_payload)}")

            # Forward to n8n
            req = urllib.request.Request(
                webhook_url,
                data=json.dumps(payload).encode('utf-8'),
                headers={
                    'Content-Type': 'application/json',
                    'User-Agent': 'InkFlow-Vercel/1.0'
                }
            )

            try:
                with urllib.request.urlopen(req, timeout=30) as response:
                    response_data = response.read()

                    print(f"[DEBUG] n8n response status: {response.status}")
                    print(f"[DEBUG] n8n response: {response_data[:200]}")

                    # Send response
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
                    self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                    self.end_headers()

                    if response_data:
                        self.wfile.write(response_data)
                    else:
                        self.wfile.write(json.dumps({
                            "status": "success",
                            "message": "הודעה נשלחה בהצלחה!"
                        }).encode())

            except urllib.error.HTTPError as e:
                error_body = e.read().decode() if e.fp else str(e)
                print(f"[ERROR] n8n HTTP error {e.code}: {error_body}")

                self.send_response(502)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": f"n8n error {e.code}",
                    "details": error_body
                }).encode())

            except urllib.error.URLError as e:
                print(f"[ERROR] n8n connection error: {str(e)}")

                self.send_response(502)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": "Cannot reach n8n",
                    "details": str(e)
                }).encode())

        except Exception as e:
            print(f"[ERROR] Unexpected error: {str(e)}")

            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                "error": "Internal server error",
                "details": str(e)
            }).encode())

    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def _parse_multipart(self, post_data, content_type):
        """Parse multipart/form-data and convert to JSON with base64 images"""
        try:
            # Extract boundary from content-type
            boundary = content_type.split('boundary=')[1].encode()
            parts = post_data.split(b'--' + boundary)

            payload = {}
            images = []

            for part in parts:
                if not part or part == b'--\r\n' or part == b'--':
                    continue

                # Split headers from content
                if b'\r\n\r\n' not in part:
                    continue

                headers_section, content = part.split(b'\r\n\r\n', 1)
                content = content.rstrip(b'\r\n')

                # Parse Content-Disposition header
                headers = headers_section.decode('utf-8', errors='ignore')

                if 'name="chatInput"' in headers:
                    payload['chatInput'] = content.decode('utf-8', errors='ignore')
                    print(f"[DEBUG] Chat message: {payload['chatInput']}")

                elif 'name="photo_' in headers and 'filename=' in headers:
                    # Extract filename
                    filename_start = headers.find('filename="') + 10
                    filename_end = headers.find('"', filename_start)
                    filename = headers[filename_start:filename_end]

                    # Convert file to base64
                    file_b64 = base64.b64encode(content).decode('utf-8')

                    # Determine MIME type from filename
                    mime_type = 'image/jpeg'
                    if filename.lower().endswith('.png'):
                        mime_type = 'image/png'
                    elif filename.lower().endswith('.gif'):
                        mime_type = 'image/gif'
                    elif filename.lower().endswith('.webp'):
                        mime_type = 'image/webp'

                    images.append({
                        'filename': filename,
                        'mimeType': mime_type,
                        'data': file_b64
                    })

                    print(f"[DEBUG] Image attached: {filename} ({len(content)} bytes)")

            # Add images to payload if any
            if images:
                # Convert first image to data URI for AI agent vision
                first_image = images[0]
                data_uri = f"data:{first_image['mimeType']};base64,{first_image['data']}"
                payload['imageUrl'] = data_uri
                payload['hasImage'] = True
                print(f"[DEBUG] Image data URI created: {first_image['filename']}")

            return payload

        except Exception as e:
            print(f"[ERROR] Multipart parsing error: {str(e)}")
            raise ValueError(f"Failed to parse multipart data: {str(e)}")
