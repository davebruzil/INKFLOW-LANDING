# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hebrew RTL landing page for "INKFLOW" - a tattoo studio management system with CRM and WhatsApp automation features. The project consists of a static frontend with an integrated chat widget that connects to n8n workflows via a Python proxy server.

## Commands

### Development Server
- **Start proxy server**: `python proxy_server.py` - Serves landing page and proxies chat requests to n8n
- **Start simple server**: `python server.py` or `start-server.bat` - Basic HTTP server without chat functionality  
- **Access application**: Navigate to `http://localhost:8000`

### Testing
- **Chat connection test**: Run `test-chat-connection.js` in browser console to test chat connectivity
- **Photo button test**: Run `testPhotoButton()` in browser console to test file upload functionality

## Architecture

### Frontend Architecture
- **Static landing page** with Hebrew RTL layout and decorative animations
- **Integrated chat widget** with photo upload capability and WhatsApp-style interface
- **Dual JavaScript implementation**:
  - `chat.js` - Main ChatWidget class with advanced error handling and retry logic
  - Inline JavaScript in `index.html` - Simplified fallback implementation

### Backend Architecture  
- **Proxy server** (`proxy_server.py`) - Handles CORS, proxies chat requests to n8n, processes file uploads
- **n8n integration** - Multiple webhook endpoints tested via proxy:
  - `http://localhost:5678/webhook/tattoo-chat` (primary)
  - `http://localhost:5678/webhook-test/tattoo-chat` (fallback)

### Chat System Design
- **Session management** with persistent session IDs across conversations
- **File upload handling** - Client-side preview, FormData transmission, server-side processing
- **Connection resilience** - Automatic retries, error categorization, extension interference detection
- **Hebrew language support** - RTL text rendering, Hebrew error messages

### n8n Workflow Files
Multiple n8n workflow JSON files for different configurations:
- `tattoo-chat-*.json` - Various iterations and testing configurations
- Workflows handle chat processing, likely with AI agent integration

## Development Notes

### Chat Widget Integration Issues
- The landing page attempts to connect to n8n via `/api/chat` endpoint
- **Critical**: Must run `proxy_server.py` (not `server.py`) for chat functionality to work
- Duplicate JavaScript implementations can cause conflicts - prioritize `chat.js` over inline code

### File Upload Architecture  
- Client: Preview → FormData → `/api/chat`
- Proxy: Parse multipart → JSON payload → n8n webhook
- Files converted to metadata (filenames, count) for n8n processing

### Common Connection Problems
- **CORS errors**: Use proxy server, not direct n8n calls
- **Extension interference**: Browser extensions (uBlock, AdBlock) may block requests  
- **n8n unavailable**: Proxy attempts multiple webhook URLs with fallback logic

### Hebrew/RTL Considerations
- All text content is in Hebrew with RTL direction
- Chat interface maintains RTL layout consistency
- Error messages localized to Hebrew