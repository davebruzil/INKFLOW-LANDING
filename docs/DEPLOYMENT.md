# InkFlow Deployment Guide

This guide walks you through deploying InkFlow to production using ngrok for n8n backend and cloud hosting for the frontend and proxy server.

## Architecture Overview

```
User → Vercel (Frontend) → Railway (Proxy Server) → ngrok → Your Local n8n (Docker)
```

## Prerequisites

- **ngrok** paid account with custom domain
- **n8n** running locally in Docker
- **Vercel** account (free tier works)
- **Railway** or **Render** account (free tier works)
- **Git** repository for version control

---

## Step 1: Setup ngrok for n8n

### 1.1 Configure ngrok Custom Domain

```bash
# Start ngrok with your custom domain
ngrok http 5678 --domain=inkflow-n8n.ngrok.io
```

**Keep this terminal open!** Your n8n must stay online for the demo to work.

### 1.2 Note Your ngrok URL

Your permanent URL will be: `https://inkflow-n8n.ngrok.io`

### 1.3 Update n8n Webhook Settings

1. Open n8n at `http://localhost:5678`
2. Go to **Settings** → **Security**
3. Add your ngrok URL to allowed webhook origins: `https://inkflow-n8n.ngrok.io`
4. Save settings

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2.2 Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your Git repository
4. **Root Directory**: Leave as root (Vercel will detect `vercel.json`)
5. Click **Deploy**

### 2.3 Note Your Frontend URL

Example: `https://inkflow-landing.vercel.app`

---

## Step 3: Deploy Proxy Server to Railway

### 3.1 Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will detect `railway.toml` automatically

### 3.2 Set Environment Variables

In Railway dashboard, go to **Variables** tab and add:

```env
N8N_WEBHOOK_BASE_URL=https://inkflow-n8n.ngrok.io
ALLOWED_ORIGINS=https://inkflow-landing.vercel.app,https://your-custom-domain.com
PORT=8000
```

### 3.3 Note Your Proxy Server URL

Example: `https://inkflow-proxy.up.railway.app`

---

## Step 4: Connect Frontend to Proxy Server

### 4.1 Update Chat API Endpoint

Edit `src/chat.js`:

```javascript
// Change from:
const url = '/api/chat';

// To:
const url = 'https://inkflow-proxy.up.railway.app/api/chat';
```

### 4.2 Redeploy Frontend

```bash
git add .
git commit -m "Update API endpoint for production"
git push
```

Vercel will automatically redeploy.

---

## Step 5: Test End-to-End

### 5.1 Verify Each Component

1. **n8n**: Visit `http://localhost:5678` - should be running
2. **ngrok**: Visit `https://inkflow-n8n.ngrok.io` - should show n8n
3. **Proxy Server**: Visit `https://inkflow-proxy.up.railway.app/api/health` - should return `{"status":"healthy"}`
4. **Frontend**: Visit `https://inkflow-landing.vercel.app` - chat should work!

### 5.2 Send Test Message

1. Open your live site
2. Send a chat message
3. Check n8n executions to verify workflow ran
4. Verify response appears in chat

---

## Step 6: Optional - Custom Domain

### 6.1 Add Custom Domain to Vercel

1. In Vercel project → **Settings** → **Domains**
2. Add your domain (e.g., `inkflow.yourportfolio.com`)
3. Configure DNS as instructed

### 6.2 Update CORS Settings

Update Railway environment variable:

```env
ALLOWED_ORIGINS=https://inkflow.yourportfolio.com,https://inkflow-landing.vercel.app
```

---

## Troubleshooting

### Chat Not Working

1. **Check proxy server logs** in Railway dashboard
2. **Verify ngrok is running**: `curl https://inkflow-n8n.ngrok.io`
3. **Check CORS**: Browser console should not show CORS errors
4. **Verify n8n workflow is active** in n8n dashboard

### 502 Bad Gateway

- **n8n is down**: Restart n8n Docker container
- **ngrok expired**: Restart ngrok with your domain
- **n8n workflow error**: Check workflow execution logs

### CORS Errors

- **Update ALLOWED_ORIGINS** in Railway to include your frontend URL
- **Redeploy proxy server** after updating environment variables

---

## Cost Breakdown

| Service | Tier | Cost |
|---------|------|------|
| Vercel | Free | $0/month |
| Railway | Free Tier | $0/month (500 hours) |
| ngrok | Paid | ~$8/month (custom domain) |
| **Total** | | **~$8/month** |

---

## Keeping n8n Online

For 24/7 uptime, consider these options:

### Option A: Deploy n8n to Cloud

Deploy n8n Docker to Railway/Render instead of using local + ngrok:

1. Create new Railway service
2. Deploy n8n Docker image
3. Update `N8N_WEBHOOK_BASE_URL` to Railway n8n URL
4. **Cost**: ~$10-15/month

### Option B: Run on Home Server

Keep your local machine online 24/7:

- Use systemd/Task Scheduler to auto-start n8n
- Configure ngrok to start on boot
- Ensure stable internet connection

---

## Monitoring & Maintenance

### Health Checks

- **Proxy Server**: `https://your-proxy.up.railway.app/api/health`
- **ngrok Status**: Check ngrok dashboard
- **n8n Status**: Check n8n dashboard

### Logs

- **Railway**: View logs in dashboard
- **Vercel**: View deployment logs
- **n8n**: Check execution history

---

## Security Best Practices

1. **Rate Limiting**: Already implemented in proxy server
2. **API Keys**: Keep AI API keys in n8n environment variables
3. **CORS**: Only allow your frontend domain
4. **HTTPS**: Enforced by all platforms
5. **Secrets**: Never commit `.env` files

---

## Next Steps

- Add usage analytics (Vercel Analytics)
- Implement session limits for free demo
- Add custom domain
- Set up monitoring alerts
- Configure backup strategy for n8n workflows

---

## Support

For issues or questions:

1. Check Railway/Vercel logs
2. Review n8n workflow executions
3. Test components individually
4. Check this deployment guide

**Your live demo is now ready for your portfolio!** 🎉
