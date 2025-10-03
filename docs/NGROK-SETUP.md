# ngrok Auto-Start Setup Guide

This guide will configure your Windows computer to automatically start ngrok + n8n when it boots up.

## Quick Start

1. **Edit the startup script** with your ngrok domain:
   - Open `start-ngrok-n8n.bat`
   - Replace `your-custom-domain.ngrok.io` with your actual ngrok domain
   - Save the file

2. **Test the script manually**:
   ```batch
   start-ngrok-n8n.bat
   ```

   Should see:
   - ✓ Docker running
   - ✓ n8n started
   - ✓ ngrok tunnel active

3. **Add to Windows Startup** (choose one method below)

---

## Method 1: Startup Folder (Easiest)

1. Press `Win + R`
2. Type: `shell:startup`
3. Press Enter
4. Right-click in the folder → New → Shortcut
5. Browse to `start-ngrok-n8n.bat`
6. Click Next → Finish

**Test:** Restart your computer. Script should auto-run.

---

## Method 2: Task Scheduler (Most Reliable)

### Create Task

1. Press `Win + R`
2. Type: `taskschd.msc`
3. Press Enter
4. Click **"Create Task"** (not "Create Basic Task")

### General Tab

- **Name:** `InkFlow ngrok Auto-Start`
- **Description:** `Automatically starts n8n and ngrok tunnel for InkFlow demo`
- ✅ **Run whether user is logged on or not**
- ✅ **Run with highest privileges**
- **Configure for:** Windows 10/11

### Triggers Tab

1. Click **New**
2. **Begin the task:** `At startup`
3. **Delay task for:** `30 seconds` (wait for Docker to start)
4. ✅ **Enabled**
5. Click OK

### Actions Tab

1. Click **New**
2. **Action:** `Start a program`
3. **Program/script:** Browse to `start-ngrok-n8n.bat`
4. Click OK

### Conditions Tab

- ✅ **Start only if the following network connection is available:** `Any connection`
- ❌ Uncheck "Start the task only if the computer is on AC power"

### Settings Tab

- ✅ **Allow task to be run on demand**
- ✅ **If the running task does not end when requested, force it to stop**
- **If the task fails, restart every:** `1 minute`
- **Attempt to restart up to:** `3 times`

### Save & Test

1. Click OK
2. Enter your Windows password if prompted
3. Right-click task → **Run**
4. Check if ngrok started successfully

---

## Method 3: Background Service (Advanced)

Run ngrok as a Windows service that runs even when not logged in.

### Install NSSM (Non-Sucking Service Manager)

1. Download from: https://nssm.cc/download
2. Extract to `C:\nssm\`

### Create Service

```batch
# Open PowerShell as Administrator
cd C:\nssm\win64

# Install ngrok as service
.\nssm.exe install ngrok-n8n "C:\path\to\ngrok.exe" "http 5678 --domain=your-custom-domain.ngrok.io"

# Configure service
.\nssm.exe set ngrok-n8n Description "ngrok tunnel for n8n - InkFlow"
.\nssm.exe set ngrok-n8n Start SERVICE_AUTO_START
.\nssm.exe set ngrok-n8n AppStdout "C:\Users\david\OneDrive\Desktop\landing page\logs\ngrok.log"
.\nssm.exe set ngrok-n8n AppStderr "C:\Users\david\OneDrive\Desktop\landing page\logs\ngrok-error.log"

# Start service
.\nssm.exe start ngrok-n8n
```

Service will now run 24/7, even if you log out.

---

## Power Settings

**Prevent computer from sleeping:**

1. Settings → System → Power & Sleep
2. **Screen:** Turn off after 10 minutes
3. **Sleep:** **Never** (when plugged in)
4. Click **Additional power settings**
5. **Change plan settings** → **Change advanced power settings**
6. **Sleep** → **Allow wake timers:** **Enable**

---

## Verify Setup

### Check ngrok is running:

```batch
curl http://localhost:4040/api/tunnels
```

Should return JSON with your tunnel info.

### Check n8n is running:

Open browser: `http://localhost:5678`

### Check ngrok public URL:

Open browser: `https://your-custom-domain.ngrok.io`

---

## Troubleshooting

### Script doesn't start on boot

1. Check Docker Desktop is set to start on boot
2. Increase Task Scheduler delay to 60 seconds
3. Check Windows Event Viewer for errors

### ngrok says "domain not found"

1. Verify your ngrok paid plan includes custom domains
2. Check domain is configured in ngrok dashboard
3. Make sure you replaced `your-custom-domain.ngrok.io` in the script

### n8n container fails to start

1. Check Docker Desktop is running
2. Manually start: `docker start n8n`
3. Check logs: `docker logs n8n`

### Computer still goes to sleep

1. Check power settings again
2. Disable hibernation: `powercfg /hibernate off` (as admin)
3. Disable sleep: `powercfg /change standby-timeout-ac 0`

---

## Monitoring

### Check if services are running:

```batch
# Check Docker containers
docker ps

# Check ngrok status
curl http://localhost:4040/status

# Check ngrok tunnels
curl http://localhost:4040/api/tunnels
```

### View ngrok dashboard:

Open: `http://localhost:4040`

Shows live requests, tunnel status, and traffic.

---

## Stopping the Services

### Stop manually:

```batch
# Stop ngrok (press Ctrl+C in terminal)

# Stop n8n
docker stop n8n
```

### Disable auto-start:

- **Startup Folder:** Delete shortcut
- **Task Scheduler:** Disable or delete task
- **Service:** `nssm stop ngrok-n8n` then `nssm remove ngrok-n8n`

---

## Cost Estimate

### Electricity Usage

Running 24/7:
- Average PC: ~100W
- Cost: ~$10-15/month (varies by location)

### Internet Bandwidth

Minimal - only chat messages and webhook calls.

### Total Monthly Cost

- ngrok Paid: $8/month
- Electricity: ~$10-15/month
- **Total: ~$18-23/month**

vs Cloud hosting (~$10-25/month) = Similar cost but you have full control.

---

## Next Steps

1. Configure auto-start using one of the methods above
2. Test by restarting your computer
3. Update your deployment `.env` with ngrok URL
4. Deploy frontend and proxy server to cloud
5. Your portfolio demo is live! 🎉
