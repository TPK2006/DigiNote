const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const os = require('os');
const QRCodeLib = require('qrcode'); // Renamed to avoid conflict
const fs = require('fs');
const path = require('path');

// Function to get local network IP
function getLocalNetworkIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            const { address, family, internal } = interface;
            if (family === 'IPv4' && !internal) {
                return address;
            }
        }
    }
    return 'localhost';
}

// QR Code Schema
const qrSchema = new mongoose.Schema({
    qrId: { type: String, required: true, unique: true },
    qrUrl: { type: String, required: true },
    fileName: { type: String, required: true }, // Added filename field
    createdAt: { type: Date, default: Date.now },
    scannedAt: { type: Date },
    scanCount: { type: Number, default: 0 }
});

const QRCodeModel = mongoose.model('QRCode', qrSchema); // Renamed to avoid conflict

// Generate QR Code
router.post('/generate', async (req, res) => {
    try {
        console.log('Received request to generate QR code');
        const qrId = new mongoose.Types.ObjectId().toString();
        
        // Use network IP instead of localhost
        const networkIP = getLocalNetworkIP();
        const qrUrl = `http://${networkIP}:5005/api/qr/scan/${qrId}`;
        
        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `qr_${qrId.substring(0, 8)}_${timestamp}.jpg`;
        const filePath = path.join(__dirname, '..', 'assets', fileName);
        
        // Ensure assets directory exists
        const assetsDir = path.join(__dirname, '..', 'assets');
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true });
            console.log('Created assets directory');
        }
        
        // Generate QR code and save as JPG
        await QRCodeLib.toFile(filePath, qrUrl, { // Using QRCodeLib instead of QRCode
            type: 'jpeg',
            quality: 0.92,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            width: 400
        });
        
        console.log('QR code image saved to:', filePath);
        console.log('Generated QR ID:', qrId, 'URL:', qrUrl);
        console.log('Network IP detected:', networkIP);
        
        const qrCode = new QRCodeModel({ // Using QRCodeModel instead of QRCode
            qrId,
            qrUrl,
            fileName
        });
        
        await qrCode.save();
        console.log('QR code saved to MongoDB');
        
        res.json({ 
            qrId, 
            qrUrl, 
            networkIP, 
            fileName,
            filePath: `/components/${fileName}` // URL path for accessing the image
        });
    } catch (err) {
        console.error('Error generating QR code:', err);
        res.status(500).json({ error: `Failed to generate QR code: ${err.message}` });
    }
});

// Scan QR Code endpoint (this gets called when someone scans the QR)
router.get('/scan/:qrId', async (req, res) => {
    try {
        console.log('QR code scanned with ID:', req.params.qrId);
        console.log('Scan request from IP:', req.ip);
        console.log('User Agent:', req.get('User-Agent'));
        
        const qrCode = await QRCodeModel.findOne({ qrId: req.params.qrId }); // Using QRCodeModel
        if (!qrCode) {
            console.log('QR code not found');
            return res.status(404).send(`
                <html>
                    <body style="font-family: Arial; text-align: center; padding: 50px;">
                        <h2>❌ QR Code Not Found</h2>
                        <p>This QR code is invalid or has expired.</p>
                    </body>
                </html>
            `);
        }
        
        // Update scan information
        qrCode.scannedAt = new Date();
        qrCode.scanCount += 1;
        await qrCode.save();
        
        console.log('QR code scan recorded:', qrCode);
        
        // Emit WebSocket event to notify admin
        const io = req.app.get('io');
        io.emit('qrScanned', {
            message: `🎉 A device just scanned the QR code!`,
            qrId: req.params.qrId,
            timestamp: new Date(),
            scanCount: qrCode.scanCount,
            userAgent: req.get('User-Agent'),
            ip: req.ip
        });
        
        // Send HTML response to the scanning device
        res.send(`
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>QR Code Scanned</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            text-align: center;
                            padding: 50px 20px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            margin: 0;
                            min-height: 100vh;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                        }
                        .container {
                            max-width: 400px;
                            margin: 0 auto;
                            background: rgba(255, 255, 255, 0.1);
                            border-radius: 20px;
                            padding: 40px 30px;
                            backdrop-filter: blur(10px);
                            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                        }
                        .success-icon {
                            font-size: 60px;
                            margin-bottom: 20px;
                            animation: bounce 2s infinite;
                        }
                        @keyframes bounce {
                            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                            40% { transform: translateY(-10px); }
                            60% { transform: translateY(-5px); }
                        }
                        h1 { margin-bottom: 15px; color: #fff; }
                        p { margin-bottom: 10px; opacity: 0.9; }
                        .scan-info {
                            background: rgba(255, 255, 255, 0.1);
                            border-radius: 10px;
                            padding: 15px;
                            margin-top: 20px;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="success-icon">✅</div>
                        <h1>QR Code Scanned Successfully!</h1>
                        <p>Your scan has been recorded.</p>
                        <p>Scan #${qrCode.scanCount}</p>
                        <div class="scan-info">
                            <p><strong>QR ID:</strong> ${req.params.qrId.substring(0, 8)}...</p>
                            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                    </div>
                </body>
            </html>
        `);
        
    } catch (err) {
        console.error('Error processing QR scan:', err);
        res.status(500).send(`
            <html>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h2>❌ Error</h2>
                    <p>Failed to process QR scan: ${err.message}</p>
                </body>
            </html>
        `);
    }
});

// Verify QR Code (original endpoint for verification)
router.get('/verify/:qrId', async (req, res) => {
    try {
        console.log('Verifying QR code with ID:', req.params.qrId);
        const qrCode = await QRCodeModel.findOne({ qrId: req.params.qrId }); // Using QRCodeModel
        if (!qrCode) {
            console.log('QR code not found');
            return res.status(404).json({ error: 'QR code not found' });
        }
        console.log('QR code found:', qrCode);
        res.json(qrCode);
    } catch (err) {
        console.error('Error verifying QR code:', err);
        res.status(500).json({ error: `Failed to verify QR code: ${err.message}` });
    }
});

// Add endpoint to list all saved QR codes
router.get('/list', async (req, res) => {
    try {
        const qrCodes = await QRCodeModel.find().sort({ createdAt: -1 }).limit(20); // Using QRCodeModel
        const qrList = qrCodes.map(qr => ({
            qrId: qr.qrId,
            fileName: qr.fileName,
            filePath: `/components/${qr.fileName}`,
            createdAt: qr.createdAt,
            scanCount: qr.scanCount,
            lastScanned: qr.scannedAt
        }));
        res.json(qrList);
    } catch (err) {
        console.error('Error listing QR codes:', err);
        res.status(500).json({ error: `Failed to list QR codes: ${err.message}` });
    }
});

module.exports = router;