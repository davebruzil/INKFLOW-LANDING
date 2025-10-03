#!/usr/bin/env python3
import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import os
import time
import socket
import signal
import sys
import logging
import threading
import tempfile
import weakref
import gc
from urllib.error import URLError, HTTPError
from contextlib import contextmanager
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('proxy_server.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Server configuration from environment variables with defaults
MAX_FILE_SIZE = int(os.getenv('MAX_FILE_SIZE_MB', '10')) * 1024 * 1024
MAX_FILES_PER_REQUEST = int(os.getenv('MAX_FILES_PER_REQUEST', '5'))
MAX_CONCURRENT_CONNECTIONS = int(os.getenv('MAX_CONCURRENT_CONNECTIONS', '50'))
REQUEST_TIMEOUT = int(os.getenv('REQUEST_TIMEOUT_SECONDS', '30'))
MEMORY_CLEANUP_INTERVAL = 300  # 5 minutes

# n8n webhook configuration
N8N_BASE_URL = os.getenv('N8N_WEBHOOK_BASE_URL', 'http://localhost:5678')
WEBHOOK_PATH_PRIMARY = os.getenv('WEBHOOK_PATH_PRIMARY', '/webhook/tattoo-chat')
WEBHOOK_PATH_FALLBACK = os.getenv('WEBHOOK_PATH_FALLBACK', '/webhook-test/tattoo-chat')

# Build full webhook URLs
N8N_WEBHOOK_URLS = [
    f"{N8N_BASE_URL}{WEBHOOK_PATH_PRIMARY}",
    f"{N8N_BASE_URL}{WEBHOOK_PATH_FALLBACK}"
]

# CORS configuration
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:8000,http://127.0.0.1:8000').split(',')

# Server port
PORT = int(os.getenv('PORT', '8000'))
HOST = os.getenv('HOST', '')

# Global connection tracking
active_connections = weakref.WeakSet()
connection_count_lock = threading.Lock()

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.start_time = time.time()
        self.temp_files = []
        # Serve from parent directory's src folder
        serve_dir = os.path.join(os.path.dirname(os.getcwd()), 'src')
        super().__init__(*args, directory=serve_dir, **kwargs)
        
        # Track this connection
        with connection_count_lock:
            active_connections.add(self)
            if len(active_connections) > MAX_CONCURRENT_CONNECTIONS:
                logger.warning(f"High connection count: {len(active_connections)}")
    
    def do_GET(self):
        # Handle health check endpoint
        if self.path == '/api/health':
            self.handle_health_check()
        else:
            # Serve static files
            super().do_GET()
    
    def do_POST(self):
        # Handle chat proxy requests
        if self.path.startswith('/api/chat'):
            self.handle_chat_proxy()
        else:
            self.send_error(404, "Not Found")
    
    def do_OPTIONS(self):
        # Handle preflight CORS requests
        self.send_response(200)
        self.add_cors_headers()
        self.end_headers()
    
    def handle_chat_proxy(self):
        request_start = time.time()
        try:
            # Log request details for debugging
            client_ip = self.client_address[0]
            user_agent = self.headers.get('User-Agent', 'Unknown')
            content_type = self.headers.get('Content-Type', '')
            content_length = int(self.headers.get('Content-Length', 0))
            
            logger.info(f"Chat request from {client_ip} - {user_agent[:50]} - {content_type} - {content_length} bytes")
            
            # Validate request size
            if content_length > MAX_FILE_SIZE * MAX_FILES_PER_REQUEST:
                logger.warning(f"Request too large: {content_length} bytes from {client_ip}")
                self.send_error(413, "Request too large")
                return
            
            if content_type.startswith('multipart/form-data'):
                # Handle file upload with resource management
                self.handle_file_upload_safe()
            else:
                # Handle regular JSON request
                self.handle_json_request_safe()
                
        except Exception as e:
            logger.error(f"Proxy error from {self.client_address[0]}: {e}", exc_info=True)
            try:
                self.send_error(500, "Internal Server Error")
            except:
                logger.error("Failed to send error response", exc_info=True)
        finally:
            # Clean up any temporary files
            self.cleanup_temp_files()
            request_duration = time.time() - request_start
            logger.info(f"Request completed in {request_duration:.2f}s")
    
    @contextmanager
    def timeout_context(self, timeout_seconds=REQUEST_TIMEOUT):
        """Context manager for request timeout handling"""
        old_timeout = socket.getdefaulttimeout()
        try:
            socket.setdefaulttimeout(timeout_seconds)
            yield
        finally:
            socket.setdefaulttimeout(old_timeout)
    
    def cleanup_temp_files(self):
        """Clean up any temporary files created during request processing"""
        for temp_file in self.temp_files:
            try:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
                    logger.debug(f"Cleaned up temporary file: {temp_file}")
            except Exception as e:
                logger.warning(f"Failed to clean up temp file {temp_file}: {e}")
        self.temp_files.clear()
    
    def handle_json_request_safe(self):
        """Handle JSON requests with proper resource management"""
        data = None
        try:
            with self.timeout_context():
                self.handle_json_request_impl()
        except socket.timeout:
            logger.error("JSON request timeout")
            self.send_error(408, "Request timeout")
        except Exception as e:
            logger.error(f"JSON request error: {e}", exc_info=True)
            raise
    
    def handle_json_request_impl(self):
        post_data = None
        try:
            # Read the request body with size validation
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > MAX_FILE_SIZE:
                logger.warning(f"JSON payload too large: {content_length} bytes")
                self.send_error(413, "Payload too large")
                return
                
            post_data = self.rfile.read(content_length)
            
            # Validate and log payload
            try:
                payload_data = json.loads(post_data.decode('utf-8'))
                logger.debug(f"JSON Payload keys: {list(payload_data.keys()) if isinstance(payload_data, dict) else 'non-dict'}")
                # Don't log full payload to avoid sensitive data in logs
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON payload: {e}")
                self.send_error(400, "Invalid JSON")
                return
            except UnicodeDecodeError as e:
                logger.error(f"Invalid UTF-8 in payload: {e}")
                self.send_error(400, "Invalid encoding")
                return
            
            # Use configured n8n webhook URLs with fallback
            n8n_urls = N8N_WEBHOOK_URLS
            
            last_error = None
            
            for url_index, url in enumerate(n8n_urls):
                try:
                    logger.info(f"Proxying JSON to: {url} (attempt {url_index + 1}/{len(n8n_urls)})")
                    
                    # Create request to n8n with timeout
                    req = urllib.request.Request(
                        url,
                        data=post_data,
                        headers={
                            'Content-Type': 'application/json',
                            'User-Agent': 'InkFlow-Proxy/1.1'
                        }
                    )
                    
                    # Send request to n8n with proper timeout
                    with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as response:
                        response_data = response.read()
                        
                        # Handle empty successful response from n8n
                        if not response_data:
                            logger.info(f"Empty but successful response from {url}")
                            response_data = b'{"status": "success"}'
                        
                        # Send successful response back to client
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.add_cors_headers()
                        self.end_headers()
                        self.wfile.write(response_data)
                        
                        logger.info(f"Successfully proxied JSON to {url}")
                        return
                        
                except (URLError, HTTPError, ValueError) as e:
                    logger.warning(f"Failed to connect to {url}: {e}")
                    last_error = e
                    # Add small delay between attempts
                    if url_index < len(n8n_urls) - 1:
                        time.sleep(0.5)
                    continue
            
            # If we get here, all URLs failed
            logger.error(f"All n8n URLs failed. Last error: {last_error}")
            self.send_error(502, "Backend service unavailable")
            
        except Exception as e:
            logger.error(f"JSON request processing error: {e}", exc_info=True)
            if not hasattr(self, '_headers_sent') or not self._headers_sent:
                try:
                    self.send_error(500, "Internal server error")
                except:
                    pass
            raise
    
    def handle_file_upload_safe(self):
        """Handle file uploads with proper resource management and limits"""
        try:
            with self.timeout_context():
                self.handle_file_upload_impl()
        except socket.timeout:
            logger.error("File upload timeout")
            self.send_error(408, "Upload timeout")
        except Exception as e:
            logger.error(f"File upload error: {e}", exc_info=True)
            raise
    
    def handle_file_upload_impl(self):
        import email.parser
        import io
        
        temp_files = []
        form = None
        try:
            logger.info("Processing file upload request...")
            
            # Validate content length
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > MAX_FILE_SIZE * MAX_FILES_PER_REQUEST:
                logger.warning(f"Upload too large: {content_length} bytes")
                self.send_error(413, "Upload too large")
                return
            
            # Read the raw multipart data
            raw_data = self.rfile.read(content_length)
            
            # Simple multipart parsing - for now, just extract text fields
            # This is a simplified approach that works for basic FormData
            data_str = raw_data.decode('utf-8', errors='ignore')
            
            # Extract basic form fields using simple string parsing
            chat_input = ''
            session_id = 'default'
            
            # Parse chatInput field
            if 'name="chatInput"' in data_str:
                start = data_str.find('name="chatInput"')
                if start != -1:
                    start = data_str.find('\r\n\r\n', start) + 4
                    end = data_str.find('\r\n--', start)
                    if end != -1:
                        chat_input = data_str[start:end].strip()[:1000]
            
            # Parse sessionId field
            if 'name="sessionId"' in data_str:
                start = data_str.find('name="sessionId"')
                if start != -1:
                    start = data_str.find('\r\n\r\n', start) + 4
                    end = data_str.find('\r\n--', start)
                    if end != -1:
                        session_id = data_str[start:end].strip()[:100]
            
            # For now, we'll inform about file uploads but not process the actual files
            # This is a simplified approach until we implement proper multipart parsing
            has_files = 'filename=' in data_str
            file_count = data_str.count('filename=')
            
            uploaded_files = []
            if has_files:
                logger.info(f"File upload detected: {file_count} files (simplified processing)")
                # Create placeholder file info
                for i in range(min(file_count, MAX_FILES_PER_REQUEST)):
                    uploaded_files.append({
                        'filename': f'uploaded_image_{i+1}.jpg',
                        'size': 0,
                        'content_type': 'image/jpeg'
                    })
            
            logger.info(f"Received message with {len(uploaded_files)} files from {self.client_address[0]}")
            
            # Validate we have some content
            if not chat_input.strip() and len(uploaded_files) == 0:
                logger.warning("Empty request received")
                self.send_error(400, "Empty request")
                return
            
            # Create safe payload for n8n
            file_info = [{
                'filename': f['filename'],
                'size': f['size'],
                'content_type': f['content_type']
            } for f in uploaded_files]
            
            payload = {
                'chatInput': chat_input + (f" [עם {len(uploaded_files)} קבצים]" if uploaded_files else ""),
                'sessionId': session_id,
                'hasFiles': len(uploaded_files) > 0,
                'fileCount': len(uploaded_files),
                'files': file_info,
                'timestamp': datetime.now().isoformat(),
                'client_ip': self.client_address[0]
            }
            
            # Send to n8n with fallback URLs
            n8n_urls = N8N_WEBHOOK_URLS
            
            last_error = None
            
            for url_index, url in enumerate(n8n_urls):
                try:
                    logger.info(f"Proxying file upload to: {url} (attempt {url_index + 1}/{len(n8n_urls)})")
                    
                    # Send JSON payload to n8n
                    payload_json = json.dumps(payload, ensure_ascii=False).encode('utf-8')
                    req = urllib.request.Request(
                        url,
                        data=payload_json,
                        headers={
                            'Content-Type': 'application/json; charset=utf-8',
                            'User-Agent': 'InkFlow-Proxy/1.1',
                            'Content-Length': str(len(payload_json))
                        }
                    )
                    
                    # Send request to n8n with timeout
                    with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as response:
                        response_data = response.read()
                        
                        # Handle empty successful response from n8n
                        if not response_data:
                            logger.info(f"Empty but successful response from {url}")
                            response_data = b'{"status": "success"}'
                        
                        # Send successful response back to client
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.add_cors_headers()
                        self.end_headers()
                        self.wfile.write(response_data)
                        
                        logger.info(f"Successfully proxied file upload to {url}")
                        return
                        
                except (URLError, HTTPError, ValueError) as e:
                    logger.warning(f"Failed to connect to {url}: {e}")
                    last_error = e
                    if url_index < len(n8n_urls) - 1:
                        time.sleep(0.5)
                    continue
            
            # If we get here, all URLs failed
            logger.error(f"All n8n URLs failed for file upload. Last error: {last_error}")
            self.send_error(502, "Backend service unavailable")
            
        except Exception as e:
            logger.error(f"File upload processing error: {e}", exc_info=True)
            if not hasattr(self, '_headers_sent') or not self._headers_sent:
                try:
                    self.send_error(500, "Upload processing error")
                except:
                    pass
            raise
        finally:
            # Clean up form object
            if form:
                try:
                    # Clean up any temporary files created by cgi.FieldStorage
                    for key in form.keys():
                        field = form[key]
                        if hasattr(field, 'file') and hasattr(field.file, 'close'):
                            try:
                                field.file.close()
                            except:
                                pass
                except:
                    pass
    
    def handle_health_check(self):
        """Enhanced health check endpoint with system metrics"""
        try:
            # Get system metrics
            import psutil
            process = psutil.Process()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.add_cors_headers()
            self.end_headers()
            
            health_data = {
                'status': 'healthy',
                'timestamp': time.time(),
                'proxy_version': '2.0',
                'uptime': time.time() - self.start_time,
                'active_connections': len(active_connections),
                'memory_usage': {
                    'rss': process.memory_info().rss,
                    'vms': process.memory_info().vms,
                    'percent': process.memory_percent()
                },
                'cpu_percent': process.cpu_percent(),
                'n8n_endpoints': [
                    'http://localhost:5678/webhook/tattoo-chat',
                    'http://localhost:5678/webhook-test/tattoo-chat'
                ],
                'config': {
                    'max_file_size': MAX_FILE_SIZE,
                    'max_files_per_request': MAX_FILES_PER_REQUEST,
                    'max_concurrent_connections': MAX_CONCURRENT_CONNECTIONS,
                    'request_timeout': REQUEST_TIMEOUT
                }
            }
            
            self.wfile.write(json.dumps(health_data, indent=2).encode('utf-8'))
            logger.info(f"Health check requested from {self.client_address[0]}")
            
        except ImportError:
            # Fallback if psutil not available
            health_data = {
                'status': 'healthy',
                'timestamp': time.time(),
                'proxy_version': '2.0',
                'active_connections': len(active_connections),
                'message': 'Basic health check (psutil not available)'
            }
            self.wfile.write(json.dumps(health_data).encode('utf-8'))
            
        except Exception as e:
            logger.error(f"Health check error: {e}", exc_info=True)
            try:
                self.send_error(500, "Health check failed")
            except:
                pass
    
    def add_cors_headers(self):
        """Add CORS headers consistently"""
        origin = self.headers.get('Origin', '')

        # Check if origin is in allowed list
        if origin in ALLOWED_ORIGINS or '*' in ALLOWED_ORIGINS:
            self.send_header('Access-Control-Allow-Origin', origin if origin else '*')
        else:
            # Default to first allowed origin if no match
            self.send_header('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0] if ALLOWED_ORIGINS else '*')

        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Cache-Control')
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.send_header('Access-Control-Max-Age', '3600')
    
    def end_headers(self):
        # Mark that headers have been sent
        self._headers_sent = True
        super().end_headers()

class MemoryCleanupThread(threading.Thread):
    """Background thread for periodic memory cleanup"""
    def __init__(self, interval=MEMORY_CLEANUP_INTERVAL):
        super().__init__(daemon=True)
        self.interval = interval
        self.running = True
    
    def run(self):
        while self.running:
            try:
                time.sleep(self.interval)
                if self.running:
                    # Force garbage collection
                    gc.collect()
                    
                    # Log memory stats
                    try:
                        import psutil
                        process = psutil.Process()
                        memory_percent = process.memory_percent()
                        if memory_percent > 80:  # High memory usage
                            logger.warning(f"High memory usage: {memory_percent:.1f}%")
                        else:
                            logger.debug(f"Memory usage: {memory_percent:.1f}%")
                    except ImportError:
                        pass
                    
                    logger.info(f"Memory cleanup completed. Active connections: {len(active_connections)}")
            except Exception as e:
                logger.error(f"Memory cleanup error: {e}", exc_info=True)
    
    def stop(self):
        self.running = False

if __name__ == "__main__":
    logger.info(f"Starting InkFlow Proxy Server v2.0")
    logger.info(f"Configuration: Max file size={MAX_FILE_SIZE//1024//1024}MB, Max files={MAX_FILES_PER_REQUEST}, Max connections={MAX_CONCURRENT_CONNECTIONS}")
    logger.info(f"n8n Backend: {N8N_BASE_URL}")
    logger.info(f"Webhook URLs: {N8N_WEBHOOK_URLS}")
    logger.info(f"Allowed Origins: {ALLOWED_ORIGINS}")
    logger.info(f"Landing page: http://{HOST if HOST else 'localhost'}:{PORT}")
    logger.info(f"Chat API: http://{HOST if HOST else 'localhost'}:{PORT}/api/chat")
    logger.info(f"Health check: http://{HOST if HOST else 'localhost'}:{PORT}/api/health")
    
    # Start memory cleanup thread
    cleanup_thread = MemoryCleanupThread()
    cleanup_thread.start()
    
    # Create server with enhanced connection handling
    class ResilientTCPServer(socketserver.ThreadingTCPServer):
        """Enhanced TCP server with connection limits and resource management"""
        daemon_threads = True  # Ensure threads exit when main process exits
        request_queue_size = 10  # Limit pending connections
        
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            # Allow socket reuse to prevent "Address already in use" errors
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            # Enable keep-alive to detect dead connections
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_KEEPALIVE, 1)
            # Set socket timeout to prevent hanging connections
            self.socket.settimeout(60)
        
        def handle_timeout(self):
            """Handle socket timeout gracefully"""
            logger.debug("Server socket timeout occurred, continuing...")
        
        def handle_error(self, request, client_address):
            """Handle connection errors gracefully"""
            logger.warning(f"Connection error from {client_address[0]}:{client_address[1]}")
            # Don't print full traceback for connection errors
        
        def verify_request(self, request, client_address):
            """Check connection limits before processing"""
            with connection_count_lock:
                if len(active_connections) >= MAX_CONCURRENT_CONNECTIONS:
                    logger.warning(f"Rejecting connection from {client_address[0]}: too many active connections ({len(active_connections)})")
                    return False
            return True
        
        def process_request(self, request, client_address):
            """Process request with connection tracking"""
            try:
                super().process_request(request, client_address)
            except Exception as e:
                logger.error(f"Error processing request from {client_address}: {e}")
    
    def signal_handler(signum, frame):
        """Handle shutdown signals gracefully"""
        logger.info(f"Received signal {signum}, shutting down server...")
        
        # Stop cleanup thread
        cleanup_thread.stop()
        
        # Shutdown server
        httpd.shutdown()
        httpd.server_close()
        
        logger.info("Server stopped gracefully")
        sys.exit(0)
    
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    if hasattr(signal, 'SIGTERM'):
        signal.signal(signal.SIGTERM, signal_handler)
    
    # Create and start server
    httpd = ResilientTCPServer((HOST, PORT), ProxyHandler)
    server_start_time = time.time()
    
    try:
        logger.info("InkFlow Proxy Server started successfully with enhanced stability features")
        logger.info("Press Ctrl+C to stop the server")
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("Server interrupted by user")
    except Exception as e:
        logger.error(f"Server error: {e}", exc_info=True)
    finally:
        cleanup_thread.stop()
        httpd.server_close()
        logger.info(f"Server stopped after running for {time.time() - server_start_time:.1f} seconds")