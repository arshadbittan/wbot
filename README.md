# WhatsApp Gmail Bot

A WhatsApp bot that automatically processes Gmail emails and sends WhatsApp messages using WhatsApp Web.js.

## Features

- 📧 Automatically monitors Gmail for emails with phone numbers
- 📱 Sends WhatsApp messages via WhatsApp Web.js
- 🤖 Responds to FAQ queries automatically
- 🆓 Completely free to run and deploy
- ☁️ Deployable on Render.com free tier

## How It Works

1. **Gmail Monitoring**: Google Apps Script monitors your Gmail for emails containing phone numbers
2. **Phone Extraction**: Extracts country code and phone number from email body
3. **WhatsApp Messaging**: Sends a booking confirmation message via WhatsApp Web
4. **FAQ Responses**: Automatically responds to common questions

## Setup Instructions

### Step 1: Local Development Setup

1. **Clone/Download the project**
   ```bash
   # If you have the files, navigate to the project directory
   cd whatsapp-gmail-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the bot locally**
   ```bash
   npm start
   ```

4. **Scan QR Code**
   - A QR code will appear in your terminal
   - Open WhatsApp on your phone
   - Go to Settings > Linked Devices > Link a Device
   - Scan the QR code

### Step 2: Google Apps Script Setup

1. **Go to Google Apps Script**
   - Visit [script.google.com](https://script.google.com)
   - Click "New Project"

2. **Add the Gmail monitoring code**
   - Delete the default code
   - Copy the content from `google-apps-script.js`
   - Paste it into the script editor

3. **Enable Gmail API**
   - Click on "Services" (+ icon) in the left sidebar
   - Find and add "Gmail API"

4. **Set up the trigger**
   - Run the `createTrigger()` function once to set up automatic email monitoring
   - Or manually set up a time-based trigger to run `processGmailEmails` every 5 minutes

### Step 3: Deploy to Render.com

1. **Create a Render account**
   - Go to [render.com](https://render.com)
   - Sign up for free

2. **Create a new Web Service**
   - Click "New +" > "Web Service"
   - Connect your GitHub repository (or upload files)

3. **Configure the service**
   - **Name**: `whatsapp-gmail-bot`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. **Add Environment Variables**
   - `NODE_ENV`: `production`
   - `PORT`: `3000` (Render will override this automatically)

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

### Step 4: Connect Google Apps Script to Render

1. **Get your Render URL**
   - After deployment, you'll get a URL like: `https://your-app-name.onrender.com`

2. **Update Google Apps Script**
   - In your Google Apps Script, update the `WEBHOOK_URL` variable:
   ```javascript
   const WEBHOOK_URL = 'https://your-app-name.onrender.com/send-whatsapp';
   ```

3. **Test the connection**
   - Run the `testEmailProcessing()` function in Google Apps Script
   - Check your Render logs for incoming requests

### Step 5: WhatsApp Authentication on Render

**Important**: You need to authenticate WhatsApp on Render. Here's how:

1. **Temporary local authentication**:
   - Run the bot locally first: `npm start`
   - Scan the QR code with WhatsApp
   - This creates a session in the `whatsapp-session` folder

2. **Upload session to Render**:
   - The session files need to be persistent on Render
   - Consider using Render's persistent disk feature (paid) or re-authenticate periodically

**Alternative approach for free hosting**:
- Set up a simple endpoint to display QR codes
- Add this to your `index.js`:

```javascript
app.get('/qr', (req, res) => {
    res.send(`
        <html>
            <body>
                <h2>Scan QR Code with WhatsApp</h2>
                <div id="qr"></div>
                <script>
                    // You can implement QR display here
                </script>
            </body>
        </html>
    `);
});
```

## Email Format Expected

Your Gmail emails should contain fields like:
```
CountryCode: +91
Phone: 9876543210
```

The bot will extract `+91` and `9876543210`, combine them as `+919876543210`, and send a WhatsApp message.

### Testing Phone Number Extraction

You can test if the phone extraction works with your email format:

1. **Local testing**: Create a test file `test-email.txt` with your email content
2. **API testing**: Send a POST request to `/test-extraction`:
   ```bash
   curl -X POST http://localhost:3000/test-extraction \
     -H "Content-Type: application/json" \
     -d '{"emailBody": "Your email content here..."}'
   ```

This will show you exactly what phone number gets extracted without sending any WhatsApp messages.

## FAQ Responses

The bot automatically responds to these keywords:
- "what is pnr" → Explains PNR
- "pnr" → Short PNR explanation
- "booking status" → Asks for PNR number
- "cancel booking" → Provides cancellation info
- "help" → Shows available commands

## Adding More FAQs

Edit the `faqResponses` object in `index.js`:

```javascript
const faqResponses = {
    'your keyword': 'Your response here',
    // Add more as needed
};
```

## Keeping It Running 24/7

**Render.com Free Tier Limitations**:
- Free services sleep after 15 minutes of inactivity
- They wake up when receiving requests

**Solutions**:
1. **Use a ping service** (free):
   - [UptimeRobot](https://uptimerobot.com) - pings your app every 5 minutes
   - [Cron-job.org](https://cron-job.org) - scheduled HTTP requests

2. **Self-ping mechanism**:
   Add this to your `index.js`:
   ```javascript
   // Keep the service awake
   setInterval(() => {
       fetch(`https://your-app-name.onrender.com/health`)
           .catch(err => console.log('Self-ping failed:', err));
   }, 14 * 60 * 1000); // Every 14 minutes
   ```

## Troubleshooting

### Common Issues:

1. **WhatsApp session expires**
   - Re-scan QR code
   - Check Render logs for authentication errors

2. **Gmail not triggering**
   - Check Google Apps Script execution logs
   - Verify Gmail API permissions
   - Test with `testEmailProcessing()` function

3. **Phone number not extracted**
   - Verify email format matches: `CountryCode: +XX, Phone: XXXXXXXX`
   - Check Render logs for extraction errors

4. **Render app sleeping**
   - Set up UptimeRobot or similar ping service
   - Use the self-ping mechanism

### Logs and Monitoring:

- **Render logs**: Available in Render dashboard
- **Google Apps Script logs**: In the Apps Script editor
- **WhatsApp status**: Check `/health` endpoint

## Cost Breakdown

- **Render.com**: Free tier (with limitations)
- **Google Apps Script**: Free (generous quotas)
- **WhatsApp Web.js**: Free (uses your WhatsApp account)
- **Total**: $0/month

## Security Notes

- Never commit sensitive data to version control
- Use environment variables for configuration
- Regularly monitor logs for suspicious activity
- Consider rate limiting for production use

## Support

If you encounter issues:
1. Check the logs in Render dashboard
2. Test individual components (Gmail → Apps Script → Render)
3. Verify WhatsApp authentication status
4. Ensure email format matches expected pattern