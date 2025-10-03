# INKFLOW - Smart Tattoo Studio Management System

> Hebrew RTL landing page showcasing an AI-powered CRM and WhatsApp automation platform for tattoo studios.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://your-live-demo.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🎯 Overview

INKFLOW is a comprehensive tattoo studio management system featuring:

- **AI Chat Agent** - 24/7 customer interaction via WhatsApp
- **Smart CRM** - Automatic client profile creation and management
- **Photo Gallery** - Reference photo collection and organization
- **Appointment System** - Automated scheduling and reminders

## 🚀 Live Demo

**Frontend**: [https://your-frontend.vercel.app](https://your-frontend.vercel.app)

Try the interactive chat demo to see the AI agent in action!

## 🏗️ Architecture

```
Frontend (Vercel) → Proxy Server (Railway) → n8n Workflow (via ngrok) → AI Agent
```

### Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Proxy Server**: Python 3.x with built-in http.server
- **Automation**: n8n workflow automation
- **Deployment**: Vercel (Frontend) + Railway (Backend)

## 📁 Project Structure

```
.
├── src/                    # Frontend source files
│   ├── index.html         # Main landing page
│   ├── styles.css         # RTL Hebrew styles
│   ├── chat.js            # Chat widget with error handling
│   └── images/            # UI assets
├── server/                # Backend proxy server
│   ├── proxy_server.py    # Main server with CORS & n8n proxy
│   └── requirements.txt   # Python dependencies
├── workflows/             # n8n workflow configurations
│   └── tattoo-chat-complete.json
├── docs/                  # Documentation
│   ├── CLAUDE.md          # Project instructions
│   ├── DEPLOYMENT.md      # Deployment guide
│   └── SERVER_STABILITY_FIXES.md
└── tests/                 # Test utilities

```

## 🛠️ Local Development

### Prerequisites

- Python 3.7+
- n8n (Docker recommended)
- ngrok (paid account for custom domains)

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/inkflow.git
cd inkflow
```

2. **Install dependencies**

```bash
cd server
pip install -r requirements.txt
```

3. **Configure environment**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start n8n (Docker)**

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

5. **Import n8n workflow**

- Open n8n at `http://localhost:5678`
- Import `workflows/tattoo-chat-complete.json`
- Configure AI agent credentials
- Activate workflow

6. **Start proxy server**

```bash
cd server
python proxy_server.py
```

7. **Access the application**

Open `http://localhost:8000` in your browser

## 🌐 Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

**Frontend (Vercel):**
```bash
vercel
```

**Backend (Railway):**
```bash
railway up
```

**n8n (ngrok):**
```bash
ngrok http 5678 --domain=your-custom-domain.ngrok.io
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `N8N_WEBHOOK_BASE_URL` | n8n webhook endpoint | `http://localhost:5678` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:8000` |
| `PORT` | Server port | `8000` |
| `HOST` | Server host | `0.0.0.0` |

## ✨ Features

### 1. Interactive Chat Widget
- Real-time AI responses
- Photo upload support
- Session persistence
- Error recovery & retry logic
- Hebrew RTL interface

### 2. Proxy Server
- CORS handling
- n8n webhook proxy
- File upload processing
- Connection limits & monitoring
- Health check endpoint

### 3. n8n Workflow
- AI agent integration
- WhatsApp automation
- CRM data synchronization
- Photo reference management

## 🔧 Configuration

### Proxy Server

Edit `server/.env`:

```env
N8N_WEBHOOK_BASE_URL=https://your-ngrok-domain.ngrok.io
ALLOWED_ORIGINS=https://your-frontend.vercel.app
MAX_FILE_SIZE_MB=10
MAX_FILES_PER_REQUEST=5
```

### Frontend

Edit `src/chat.js` to point to your proxy server:

```javascript
const url = 'https://your-proxy.railway.app/api/chat';
```

## 📊 Monitoring

- **Proxy Health**: `http://localhost:8000/api/health`
- **n8n Executions**: n8n dashboard → Executions
- **Logs**: Check `server/proxy_server.log`

## 🐛 Troubleshooting

### Chat not responding
1. Check n8n workflow is active
2. Verify ngrok tunnel is running
3. Check proxy server logs
4. Test webhook directly: `curl -X POST https://your-ngrok.io/webhook/tattoo-chat`

### CORS errors
1. Update `ALLOWED_ORIGINS` in `.env`
2. Restart proxy server
3. Clear browser cache

### 502 Bad Gateway
1. Restart n8n
2. Restart ngrok tunnel
3. Check n8n workflow for errors

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 👤 Author

**Your Name**
- Portfolio: [your-portfolio.com](https://your-portfolio.com)
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- n8n for workflow automation
- Vercel for hosting
- Railway for backend deployment

---

**Built with ❤️ for tattoo artists**
