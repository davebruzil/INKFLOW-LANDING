import json
import urllib.request
import urllib.error
import os
from http.server import BaseHTTPRequestHandler

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
            except json.JSONDecodeError:
                self.send_error(400, "Invalid JSON")
                return

            # Get n8n webhook URL from environment
            n8n_url = os.getenv('N8N_WEBHOOK_BASE_URL', 'https://inkflow.eu.ngrok.io')
            webhook_url = f"{n8n_url}/webhook/tattoo-chat"

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
                        self.wfile.write(b'{"status":"success","message":"הודעה נשלחה בהצלחה!"}')

            except urllib.error.URLError as e:
                self.send_error(502, f"Backend unavailable: {str(e)}")
                return

        except Exception as e:
            self.send_error(500, str(e))
            return

    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
