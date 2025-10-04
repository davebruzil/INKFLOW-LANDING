from http.server import BaseHTTPRequestHandler
import json
import urllib.request
import urllib.error
import os

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        """Handle POST requests to /api/chat"""
        try:
            # Get content length
            content_length = int(self.headers.get('Content-Length', 0))

            # Read request body
            post_data = self.rfile.read(content_length)

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
            webhook_url = f"{n8n_url}/webhook/tattoo-chat"

            print(f"[DEBUG] Forwarding to: {webhook_url}")
            print(f"[DEBUG] Payload: {json.dumps(payload)}")

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
