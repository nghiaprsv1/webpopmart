const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Cấu hình
const PORT = 8000;
const ZALO_APP_ID = process.env.ZALO_APP_ID || 'YOUR_ZALO_APP_ID';
const ZALO_APP_SECRET = process.env.ZALO_APP_SECRET || 'YOUR_ZALO_APP_SECRET';
const REDIRECT_URI = 'http://localhost:8000/callback';

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Tạo server
const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // API Routes
    if (pathname === '/api/zalo/token' && req.method === 'POST') {
        handleZaloToken(req, res);
        return;
    }

    if (pathname === '/api/zalo/user' && req.method === 'GET') {
        handleZaloUser(req, res);
        return;
    }

    // Static files
    if (pathname === '/') {
        serveFile(res, 'app.html');
    } else {
        const filePath = path.join(__dirname, pathname);
        
        // Security: prevent directory traversal
        if (!filePath.startsWith(__dirname)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Forbidden');
            return;
        }

        fs.exists(filePath, (exists) => {
            if (exists && fs.statSync(filePath).isFile()) {
                serveFile(res, pathname);
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
        });
    }
});

// Serve file
function serveFile(res, filePath) {
    const fullPath = path.join(__dirname, filePath);
    const ext = path.extname(fullPath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(fullPath, (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

// Handle Zalo Token Exchange
function handleZaloToken(req, res) {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const code = data.code;

            // Gọi Zalo API để lấy access token
            const postData = JSON.stringify({
                app_id: ZALO_APP_ID,
                app_secret: ZALO_APP_SECRET,
                code: code,
                grant_type: 'authorization_code'
            });

            const options = {
                hostname: 'oauth.zaloapi.com',
                port: 443,
                path: '/v4/oa/access_token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const https = require('https');
            const request = https.request(options, (response) => {
                let responseData = '';

                response.on('data', chunk => {
                    responseData += chunk;
                });

                response.on('end', () => {
                    try {
                        const result = JSON.parse(responseData);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(result));
                    } catch (e) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid response from Zalo' }));
                    }
                });
            });

            request.on('error', (error) => {
                console.error('Error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            });

            request.write(postData);
            request.end();
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid request' }));
        }
    });
}

// Handle Zalo User Info
function handleZaloUser(req, res) {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No access token' }));
        return;
    }

    const options = {
        hostname: 'graph.zalo.me',
        port: 443,
        path: '/v2.0/me?fields=id,name,picture,phone',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    const https = require('https');
    const request = https.request(options, (response) => {
        let responseData = '';

        response.on('data', chunk => {
            responseData += chunk;
        });

        response.on('end', () => {
            try {
                const result = JSON.parse(responseData);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid response from Zalo' }));
            }
        });
    });

    request.on('error', (error) => {
        console.error('Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    });

    request.end();
}

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📱 Mini App URL: http://localhost:${PORT}/app.html`);
    console.log(`🔐 Zalo App ID: ${ZALO_APP_ID}`);
});

