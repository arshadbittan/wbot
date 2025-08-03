# 🚀 Deploy WhatsApp Gmail Bot to Render.com

## Prerequisites
- GitHub account
- Render.com account (free)

## Step 1: Push Code to GitHub

1. **Create a new repository on GitHub**
   - Go to github.com
   - Click "New repository"
   - Name it: `whatsapp-gmail-bot`
   - Make it public or private
   - Don't initialize with README (we have files already)

2. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - WhatsApp Gmail Bot"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/whatsapp-gmail-bot.git
   git push -u origin main
   ```

## Step 2: Deploy to Render.com

1. **Go to Render.com**
   - Visit [render.com](https://render.com)
   - Sign up/Login with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `whatsapp-gmail-bot` repository

3. **Configure Deployment**
   - **Name**: `whatsapp-gmail-bot` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. **Add Environment Variables**
   - `NODE_ENV`: `production`
   - `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD`: `true`
   - `PUPPETEER_EXECUTABLE_PATH`: `/usr/bin/google-chrome-stable`

5. **Enable Persistent Disk (Important for WhatsApp Session)**
   - In your service settings, go to "Disks"
   - Add a new disk:
     - **Name**: `whatsapp-session-disk`
     - **Mount Path**: `/app/whatsapp-session`
     - **Size**: `1 GB` (free tier)

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)

## Step 3: Connect WhatsApp

1. **Get your Render URL**
   - After deployment: `https://your-app-name.onrender.com`

2. **Connect WhatsApp**
   - Visit: `https://your-app-name.onrender.com/qr`
   - Scan QR code with WhatsApp
   - Wait for "WhatsApp client is ready!" message

## Step 4: Update Google Apps Script

1. **Update webhook URL in Google Apps Script**
   ```javascript
   const WEBHOOK_URL = 'https://your-app-name.onrender.com/send-whatsapp';
   ```

2. **Test the integration**
   - Send yourself a test email with phone number format
   - Check if WhatsApp message is sent

## Step 5: Keep It Running 24/7

### Option 1: UptimeRobot (Recommended)
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Create free account
3. Add monitor:
   - **Type**: HTTP(s)
   - **URL**: `https://your-app-name.onrender.com/health`
   - **Interval**: 5 minutes

### Option 2: Cron-job.org
1. Go to [cron-job.org](https://cron-job.org)
2. Create free account
3. Add cron job:
   - **URL**: `https://your-app-name.onrender.com/health`
   - **Schedule**: Every 5 minutes

## Troubleshooting

### WhatsApp Session Issues
- If WhatsApp disconnects, visit `/qr` endpoint to reconnect
- Session is stored on persistent disk, so it should survive restarts

### App Sleeping (Free Tier)
- Free tier apps sleep after 15 minutes of inactivity
- Use UptimeRobot to ping every 5 minutes
- Built-in keep-alive mechanism pings itself every 14 minutes

### Deployment Fails
- Check build logs in Render dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

### Gmail Integration Not Working
- Verify Google Apps Script webhook URL
- Check Google Apps Script execution logs
- Test webhook manually: `POST /send-whatsapp`

## Monitoring

- **Health Check**: `https://your-app-name.onrender.com/health`
- **WhatsApp Status**: Check `whatsappReady` field in health response
- **Render Logs**: Available in Render dashboard
- **Google Apps Script Logs**: Available in Apps Script editor

## Security Notes

- Never commit `.env` files with sensitive data
- WhatsApp session is stored securely on Render's persistent disk
- Use HTTPS for all webhook communications
- Monitor logs for suspicious activity

## Cost

- **Render.com**: Free tier (with limitations)
- **UptimeRobot**: Free tier (50 monitors)
- **Google Apps Script**: Free (generous quotas)
- **Total**: $0/month

Your WhatsApp Gmail Bot is now running 24/7 on Render.com! 🎉