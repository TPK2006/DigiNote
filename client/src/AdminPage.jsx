import React, { useState, useRef, useEffect } from 'react';
// Using fetch instead of axios for HTTP requests
import QRCodeStyling from 'qr-code-styling';
import jsQR from 'jsqr';
import io from 'socket.io-client';  


const AdminPage = () => {
    const [qrId, setQrId] = useState(null);
    const [qrData, setQrData] = useState(null);
    const [qrImagePath, setQrImagePath] = useState(null);
    const [savedQRs, setSavedQRs] = useState([]);
    const [networkIP, setNetworkIP] = useState('localhost');
    const [scanResult, setScanResult] = useState('');
    const [error, setError] = useState('');
    const [scanMessage, setScanMessage] = useState('');
    const [scanCount, setScanCount] = useState(0);
    const [lastScanInfo, setLastScanInfo] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const qrRef = useRef(null);
    const socketRef = useRef(null);

    // Initialize WebSocket
    useEffect(() => {
        // Try to connect to network IP first, fallback to localhost
        const socketUrl = networkIP !== 'localhost' ? `http://${networkIP}:5005` : 'http://localhost:5005';
        
        socketRef.current = io(socketUrl, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
        console.log('Attempting to connect to WebSocket at:', socketUrl);

        socketRef.current.on('connect', () => {
            console.log('WebSocket connected:', socketRef.current.id);
        });

        socketRef.current.on('qrScanned', (data) => {
            console.log('Received qrScanned event:', data);
            setScanMessage(data.message);
            setScanCount(data.scanCount);
            setLastScanInfo({
                timestamp: data.timestamp,
                userAgent: data.userAgent,
                ip: data.ip
            });
            // Clear message after 15 seconds
            setTimeout(() => {
                setScanMessage('');
                setLastScanInfo(null);
            }, 15000);
        });

        socketRef.current.on('connect_error', (err) => {
            console.error('WebSocket connection error:', err.message);
        });

        socketRef.current.on('disconnect', () => {
            console.log('WebSocket disconnected');
        });

        return () => {
            socketRef.current.disconnect();
            console.log('WebSocket cleanup');
        };
    }, [networkIP]);

    // Debug ref initialization
    useEffect(() => {
        if (qrRef.current) {
            console.log('qrRef is initialized:', qrRef.current);
        } else {
            console.warn('qrRef is not initialized');
        }
    }, []);

    // Generate QR Code
    const generateQRCode = async () => {
        try {
            console.log('Attempting to generate QR code...');
            setError('');
            setScanMessage('');
            setScanCount(0);
            setLastScanInfo(null);
            
            const response = await fetch('http://localhost:5005/api/qr/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('QR code response:', data);
            const { qrId, qrUrl, networkIP: detectedIP, fileName, filePath } = data;
            setQrId(qrId);
            setQrData(qrUrl);
            setQrImagePath(filePath);
            setNetworkIP(detectedIP || 'localhost');
            
            // Load saved QR codes list
            loadSavedQRs();

            // Create QR code
            if (!qrRef.current) {
                console.error('qrRef.current is null, cannot render QR code');
                setError('Failed to render QR code: Container not found');
                return;
            }

            const qrCode = new QRCodeStyling({
                width: 300,
                height: 300,
                data: qrUrl,
                dotsOptions: { color: '#000000', type: 'rounded' },
                backgroundOptions: { color: '#ffffff' },
                cornersSquareOptions: { color: '#000000', type: 'extra-rounded' },
                cornersDotOptions: { color: '#000000', type: 'dot' }
            });
            qrRef.current.innerHTML = ''; // Clear previous QR code
            qrCode.append(qrRef.current);
            console.log('QR code appended to DOM');
        } catch (err) {
            console.error('Frontend QR generation error:', err.message);
            setError(`Failed to generate QR code: ${err.message}`);
        }
    };

    // Load saved QR codes
    const loadSavedQRs = async () => {
        try {
            const response = await fetch('http://localhost:5005/api/qr/list');
            if (response.ok) {
                const qrList = await response.json();
                setSavedQRs(qrList);
            }
        } catch (err) {
            console.error('Error loading saved QRs:', err);
        }
    };

    // Load saved QRs on component mount
    useEffect(() => {
        loadSavedQRs();
    }, []);

    // Start camera for scanning
    const startCamera = async () => {
        try {
            console.log('Starting camera...');
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            scanQRCode();
        } catch (err) {
            console.error('Camera access error:', err);
            setError('Failed to access camera');
        }
    };

    // Scan QR code
    const scanQRCode = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext('2d');

        const scan = () => {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.height = 300;
                canvas.width = 300;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const qrData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(qrData.data, qrData.width, qrData.height);
                if (code) {
                    console.log('Scanned QR code:', code.data);
                    setScanResult(`Scanned QR ID: ${code.data.split('/').pop()}`);
                    stopCamera();
                } else {
                    setScanResult('No QR code detected');
                }
            }
            requestAnimationFrame(scan);
        };

        scan();
    };

    // Stop camera
    const stopCamera = () => {
        console.log('Stopping camera...');
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        }
    };

    const formatUserAgent = (userAgent) => {
        if (!userAgent) return 'Unknown device';
        if (userAgent.includes('iPhone')) return '📱 iPhone';
        if (userAgent.includes('Android')) return '📱 Android';
        if (userAgent.includes('iPad')) return '📱 iPad';
        if (userAgent.includes('Mobile')) return '📱 Mobile Device';
        return '💻 Desktop';
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            {/* Network Info */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                    <strong>Network:</strong> {networkIP !== 'localhost' ? `${networkIP}:5005` : 'localhost:5005'}
                    {networkIP !== 'localhost' && (
                        <span className="ml-2 text-green-600">✅ Mobile devices can scan!</span>
                    )}
                </p>
            </div>

            {/* Saved QR Codes Section */}
            {savedQRs.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Recently Generated QR Codes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savedQRs.slice(0, 6).map((qr) => (
                            <div key={qr.qrId} className="border rounded-lg p-4 bg-gray-50">
                                <img 
                                    src={`http://localhost:5005${qr.filePath}`} 
                                    alt={`QR Code ${qr.qrId.substring(0, 8)}`}
                                    className="w-32 h-32 object-contain mx-auto mb-2 bg-white rounded border"
                                />
                                <div className="text-xs text-gray-600 space-y-1">
                                    <p><strong>ID:</strong> {qr.qrId.substring(0, 8)}...</p>
                                    <p><strong>Created:</strong> {new Date(qr.createdAt).toLocaleDateString()}</p>
                                    <p><strong>Scans:</strong> {qr.scanCount}</p>
                                    {qr.lastScanned && (
                                        <p><strong>Last Scan:</strong> {new Date(qr.lastScanned).toLocaleDateString()}</p>
                                    )}
                                </div>
                                <a 
                                    href={`http://localhost:5005${qr.filePath}`} 
                                    download 
                                    className="block mt-2 text-center px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                                >
                                    Download
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Status Section */}
            {scanMessage && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    <p className="text-center animate-pulse font-semibold text-lg">
                        {scanMessage}
                    </p>
                    {scanCount > 0 && (
                        <p className="text-center text-sm mt-2">
                            Total scans: <strong>{scanCount}</strong>
                        </p>
                    )}
                    {lastScanInfo && (
                        <div className="mt-3 p-3 bg-green-50 rounded text-sm">
                            <p><strong>Device:</strong> {formatUserAgent(lastScanInfo.userAgent)}</p>
                            <p><strong>Time:</strong> {new Date(lastScanInfo.timestamp).toLocaleString()}</p>
                            {lastScanInfo.ip && <p><strong>IP:</strong> {lastScanInfo.ip}</p>}
                        </div>
                    )}
                </div>
            )}

            {/* QR Generation Section */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-6">Generate QR Code</h2>
                <button
                    onClick={generateQRCode}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded mb-4 transition-colors"
                >
                    Generate New QR Code
                </button>
                <div>
                    {qrId && <p className="mb-2 text-gray-600">QR Code ID: <code className="bg-gray-100 px-2 py-1 rounded">{qrId.substring(0, 8)}...</code></p>}
                    
                    {/* Display QR code image if saved */}
                    {qrImagePath ? (
                        <div className="mx-auto w-fit border-2 border-gray-200 rounded-lg p-4 bg-white">
                            <img 
                                src={`http://localhost:5005${qrImagePath}`} 
                                alt="Generated QR Code" 
                                className="w-80 h-80 object-contain"
                            />
                        </div>
                    ) : (
                        <div ref={qrRef} className="mx-auto w-fit border-2 border-gray-200 rounded-lg p-4 bg-white"></div>
                    )}
                    {qrData && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
                            <p><strong>QR URL:</strong> <code className="break-all">{qrData}</code></p>
                            {qrImagePath && (
                                <div className="mt-2">
                                    <p><strong>Saved as:</strong> <code>{qrImagePath}</code></p>
                                    <a 
                                        href={`http://localhost:5005${qrImagePath}`} 
                                        download 
                                        className="inline-block mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                    >
                                        📥 Download JPG
                                    </a>
                                </div>
                            )}
                            <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400">
                                <p className="text-blue-700 font-medium">📱 Instructions:</p>
                                <ul className="text-blue-600 text-xs mt-2 list-disc list-inside space-y-1">
                                    <li>Open any camera app on your mobile device</li>
                                    <li>Point the camera at this QR code</li>
                                    <li>Tap the notification/link that appears</li>
                                    <li>Watch for the scan notification above!</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
                        <p><strong>Error:</strong> {error}</p>
                    </div>
                )}
            </div>

            {/* QR Scanning Section */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Local QR Scanner (Testing)</h2>
                <div className="space-x-2 mb-4">
                    <button
                        onClick={startCamera}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        Start Camera
                    </button>
                    <button
                        onClick={stopCamera}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        Stop Camera
                    </button>
                </div>
                <div className="relative">
                    <video ref={videoRef} className="w-full max-w-md mx-auto mb-4 rounded border-2 border-gray-300" />
                    <canvas ref={canvasRef} className="hidden" />
                </div>
                {scanResult && (
                    <p className="text-center mt-2 p-2 bg-gray-100 rounded text-gray-700">
                        {scanResult}
                    </p>
                )}
            </div>
        </div>
    );
};

export default AdminPage;