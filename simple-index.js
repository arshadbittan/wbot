const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Simple health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        whatsappReady: false,
        message: 'Server running - WhatsApp functionality disabled for now',
        timestamp: new Date().toISOString()
    });
});

// Homepage
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>WhatsApp Gmail Bot</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1>🤖 WhatsApp Gmail Bot</h1>
                <p>Server is running successfully!</p>
                <p><strong>Status:</strong> ⚠️ WhatsApp functionality temporarily disabled</p>
                <p>This is due to Chromium/Puppeteer issues on the hosting platform.</p>
                <div style="margin: 30px;">
                    <a href="/health" style="display: inline-block; margin: 10px; padding: 15px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">📊 Check Status</a>
                </div>
            </body>
        </html>
    `);
});

// Webhook endpoint (placeholder)
app.post('/send-whatsapp', (req, res) => {
    console.log('📧 Received webhook request:', req.body);
    res.json({ 
        success: false, 
        message: 'WhatsApp functionality temporarily disabled due to server limitations',
        received: req.body
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Visit your app to see status`);
    console.log(`⚠️  WhatsApp functionality disabled due to Chromium issues`);
});