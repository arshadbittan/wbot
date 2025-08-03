const { Client, LocalAuth, NoAuth } = require('whatsapp-web.js');
const express = require('express');
const bodyParser = require('body-parser');
const QRCode = require('qrcode');
const SupabaseAuth = require('./supabase-auth');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Store QR code for web display
let currentQR = null;
let clientReady = false;
let supabaseAuth = new SupabaseAuth();

// WhatsApp client setup optimized for Render.com free tier
const client = new Client({
    authStrategy: process.env.SUPABASE_URL ? new NoAuth() : new LocalAuth({
        dataPath: './whatsapp-session',
        clientId: 'whatsapp-bot'
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-images',
            '--disable-default-apps',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-ipc-flooding-protection'
        ]
    }
});

// FAQ responses
const faqResponses = {
    'what is pnr': 'PNR stands for Passenger Name Record. It\'s a unique identifier for your booking that contains all your travel details including passenger information, flight details, and booking status.',
    'pnr': 'PNR stands for Passenger Name Record. It\'s a unique identifier for your booking.',
    'booking status': 'To check your booking status, please provide your PNR number.',
    'cancel booking': 'To cancel your booking, please contact our support team with your PNR number.',
    'help': 'Available commands:\n• What is PNR?\n• Booking status\n• Cancel booking\n• Help\n\nFor more assistance, please contact our support team.'
};

// WhatsApp client events
client.on('qr', (qr) => {
    currentQR = qr;
    clientReady = false;
    console.log('🔗 QR Code received! Open http://localhost:3000/qr in your browser to scan');
    console.log('📱 Then scan with WhatsApp: Settings → Linked Devices → Link a Device');
});

client.on('ready', () => {
    console.log('✅ WhatsApp client is ready!');
    currentQR = null;
    clientReady = true;
});

client.on('authenticated', () => {
    console.log('🔐 WhatsApp client authenticated successfully');
    currentQR = null;
    clientReady = true;
});

client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failed:', msg);
    currentQR = null;
    clientReady = false;
});

client.on('disconnected', (reason) => {
    console.log('🔌 WhatsApp client disconnected:', reason);
    clientReady = false;
});

// Handle incoming messages for FAQ
client.on('message', async (message) => {
    const messageBody = message.body.toLowerCase().trim();

    // Check if message matches any FAQ
    for (const [keyword, response] of Object.entries(faqResponses)) {
        if (messageBody.includes(keyword)) {
            await message.reply(response);
            console.log(`FAQ response sent for: ${keyword}`);
            break;
        }
    }
});

// Function to extract phone number from email content
function extractPhoneNumber(emailBody) {
    // Look for pattern: CountryCode: +XX and Phone: XXXXXXXXXX (can be on separate lines)
    const countryCodeRegex = /CountryCode:\s*(\+\d+)/i;
    const phoneRegex = /Phone:\s*(\d+)/i;

    const countryCodeMatch = emailBody.match(countryCodeRegex);
    const phoneMatch = emailBody.match(phoneRegex);

    if (countryCodeMatch && phoneMatch) {
        const countryCode = countryCodeMatch[1];
        const phoneNumber = phoneMatch[1];
        return `${countryCode}${phoneNumber}`;
    }

    // Fallback: try to find them in a single line pattern
    const singleLineRegex = /CountryCode:\s*(\+\d+).*?Phone:\s*(\d+)/i;
    const singleLineMatch = emailBody.match(singleLineRegex);

    if (singleLineMatch) {
        const countryCode = singleLineMatch[1];
        const phoneNumber = singleLineMatch[2];
        return `${countryCode}${phoneNumber}`;
    }

    return null;
}

// Function to format phone number for WhatsApp
function formatWhatsAppNumber(phoneNumber) {
    // Remove any non-digit characters except +
    let formatted = phoneNumber.replace(/[^\d+]/g, '');

    // Ensure it starts with country code
    if (!formatted.startsWith('+')) {
        formatted = '+' + formatted;
    }

    // Remove + and add @c.us for WhatsApp format
    return formatted.substring(1) + '@c.us';
}

// Endpoint to receive email data from Google Apps Script
app.post('/send-whatsapp', async (req, res) => {
    try {
        const { emailBody, subject } = req.body;

        if (!emailBody) {
            return res.status(400).json({ error: 'Email body is required' });
        }

        // Extract phone number from email
        const phoneNumber = extractPhoneNumber(emailBody);

        if (!phoneNumber) {
            console.log('No phone number found in email body');
            return res.status(400).json({ error: 'No phone number found in email' });
        }

        // Format for WhatsApp
        const whatsappNumber = formatWhatsAppNumber(phoneNumber);

        // Send WhatsApp message
        const message = 'Thanks for the booking. 🎉';

        try {
            await client.sendMessage(whatsappNumber, message);
            console.log(`Message sent to ${phoneNumber}: ${message}`);
            res.json({
                success: true,
                message: 'WhatsApp message sent successfully',
                phoneNumber: phoneNumber
            });
        } catch (sendError) {
            console.error('Error sending WhatsApp message:', sendError);
            res.status(500).json({
                error: 'Failed to send WhatsApp message',
                details: sendError.message
            });
        }

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// QR Code display endpoint
app.get('/qr', async (req, res) => {
    if (!currentQR) {
        if (clientReady) {
            res.send(`
                <html>
                    <head><title>WhatsApp Bot - Connected</title></head>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1>✅ WhatsApp Bot Connected!</h1>
                        <p>Your WhatsApp bot is ready and connected.</p>
                        <p><a href="/health">Check Status</a></p>
                    </body>
                </html>
            `);
        } else {
            res.send(`
                <html>
                    <head><title>WhatsApp Bot - Loading</title></head>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1>🔄 Loading...</h1>
                        <p>WhatsApp client is initializing. Please wait...</p>
                        <p><button onclick="location.reload()">Refresh</button></p>
                        <p><strong>Debug:</strong> currentQR = ${currentQR ? 'exists' : 'null'}, clientReady = ${clientReady}</p>
                    </body>
                </html>
            `);
        }
        return;
    }

    try {
        // Generate QR code as data URL on server side
        const qrDataURL = await QRCode.toDataURL(currentQR, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        res.send(`
            <html>
                <head>
                    <title>WhatsApp Bot - Scan QR Code</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background: #f5f5f5;">
                    <div style="background: white; max-width: 500px; margin: 0 auto; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #25D366;">📱 Scan QR Code with WhatsApp</h1>
                        
                        <div style="margin: 20px 0;">
                            <p><strong>Step 1:</strong> Open WhatsApp on your phone</p>
                            <p><strong>Step 2:</strong> Go to <strong>Settings → Linked Devices → Link a Device</strong></p>
                            <p><strong>Step 3:</strong> Scan this QR code:</p>
                        </div>
                        
                        <div style="margin: 30px auto; padding: 20px; background: white; border: 3px solid #25D366; border-radius: 10px; display: inline-block;">
                            <img src="${qrDataURL}" alt="WhatsApp QR Code" style="display: block; margin: 0 auto;" />
                        </div>
                        
                        <div style="margin: 20px 0;">
                            <button onclick="location.reload()" style="background: #25D366; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 16px;">🔄 Refresh QR Code</button>
                        </div>
                        
                        <p style="color: #666; font-size: 14px;">QR code will auto-refresh in 45 seconds</p>
                    </div>
                    
                    <script>
                        // Auto refresh every 45 seconds
                        setTimeout(() => location.reload(), 45000);
                        
                        // Show loading message when refreshing
                        document.querySelector('button').addEventListener('click', function() {
                            this.innerHTML = '🔄 Refreshing...';
                            this.disabled = true;
                        });
                    </script>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.send(`
            <html>
                <head><title>WhatsApp Bot - Error</title></head>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1>❌ Error Generating QR Code</h1>
                    <p>There was an error generating the QR code. Please try refreshing.</p>
                    <p><button onclick="location.reload()">Refresh</button></p>
                    <p><strong>Error:</strong> ${error.message}</p>
                </body>
            </html>
        `);
    }
});

// QR Code image endpoint
app.get('/qr-image', async (req, res) => {
    if (!currentQR) {
        res.status(404).send('No QR code available');
        return;
    }
    
    try {
        const qrBuffer = await QRCode.toBuffer(currentQR, {
            width: 300,
            margin: 2
        });
        
        res.setHeader('Content-Type', 'image/png');
        res.send(qrBuffer);
    } catch (error) {
        res.status(500).send('Error generating QR code');
    }
});

// Simple QR text endpoint for debugging
app.get('/qr-text', (req, res) => {
    if (!currentQR) {
        res.json({ error: 'No QR code available', clientReady, hasQR: false });
        return;
    }
    res.json({ qrCode: currentQR, hasQR: true, clientReady });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        whatsappReady: clientReady,
        hasQR: !!currentQR,
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
                <p>Your WhatsApp bot for processing Gmail emails</p>
                <div style="margin: 30px;">
                    <a href="/qr" style="display: inline-block; margin: 10px; padding: 15px 30px; background: #25D366; color: white; text-decoration: none; border-radius: 5px;">📱 Connect WhatsApp</a>
                    <a href="/health" style="display: inline-block; margin: 10px; padding: 15px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">📊 Check Status</a>
                </div>
                <p><strong>Status:</strong> ${clientReady ? '✅ Connected' : '🔄 Not Connected'}</p>
            </body>
        </html>
    `);
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    if (process.env.NODE_ENV === 'production') {
        console.log(`🌐 Production server running`);
        console.log(`📱 To connect WhatsApp, visit your Render URL/qr`);
    } else {
        console.log(`🌐 Open http://localhost:${PORT} in your browser`);
        console.log(`📱 To connect WhatsApp, visit: http://localhost:${PORT}/qr`);
    }
});

// Initialize Supabase and WhatsApp client
async function initializeBot() {
    try {
        await supabaseAuth.initialize();
        
        // Load session from Supabase if available
        if (process.env.SUPABASE_URL) {
            const sessionData = await supabaseAuth.loadSession();
            if (sessionData) {
                console.log('📱 Loading WhatsApp session from Supabase...');
                // Session will be restored automatically
            }
        }
        
        client.initialize();
    } catch (error) {
        console.error('❌ Failed to initialize bot:', error);
        client.initialize(); // Fallback to normal initialization
    }
}

// Save session to Supabase when authenticated
client.on('authenticated', async (session) => {
    console.log('🔐 WhatsApp client authenticated successfully');
    if (process.env.SUPABASE_URL) {
        await supabaseAuth.saveSession(session);
    }
    currentQR = null;
    clientReady = true;
});

initializeBot();

// Keep-alive mechanism for Render.com free tier
if (process.env.NODE_ENV === 'production') {
    const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
    if (RENDER_URL) {
        setInterval(() => {
            fetch(`${RENDER_URL}/health`)
                .then(res => console.log(`Keep-alive ping: ${res.status}`))
                .catch(err => console.log('Keep-alive ping failed:', err.message));
        }, 14 * 60 * 1000); // Every 14 minutes
    }
}

// Test endpoint to verify phone number extraction
app.post('/test-extraction', (req, res) => {
    const { emailBody } = req.body;

    if (!emailBody) {
        return res.status(400).json({ error: 'Email body is required' });
    }

    const phoneNumber = extractPhoneNumber(emailBody);

    res.json({
        success: true,
        extractedPhone: phoneNumber,
        whatsappFormat: phoneNumber ? formatWhatsAppNumber(phoneNumber) : null,
        emailBodyPreview: emailBody.substring(0, 200) + '...'
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await client.destroy();
    process.exit(0);
});