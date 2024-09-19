// main.mjs - this is a server that just serves the current directory

import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

// get the clientApi from the environment variable
//const clientApi = process.env.CLIENT_API;
//const route = process.env.ROUTE;
const clientApi = 'YOUR_CLIENT_API';

const getToken = async (route) => {
    return fetch('https://simplystream.com/api/v1/tokens', {
        method: 'POST',
        headers: {
            "client_api": clientApi,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "route": route,
            "timeout": 0,
            "single_use": 1,
            "metadata": '{}'
        })
    })
}

const server = createServer(async (req, res) => {
    const url_parts = req.url.split('/');
    const path = url_parts[url_parts.length - 1];
    // set common headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp;report-to=\"coep\"');
    try {
        if (path.startsWith('getToken')) {
            const path_parts = path.split('?');
            const search = path_parts[1];
            const route = search.split('=')[1];
            console.log('getToken', route);
            res.setHeader('Content-Type', 'application/json');
            let token = await getToken(route);
            token = await token.json();
            token.route = route;
            res.end(JSON.stringify(token));
        } else if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
            const data = await readFile(path);
            res.end(data);
        } else if (path === '') {
            res.setHeader('Content-Type', 'text/html');
            const data = await readFile('index.html');
            res.end(data);
        }
        else {
            const data = await readFile(path);
            res.end(data);
        }
    } catch (err) {
        console.error(err);
        res.statusCode = 404;
        res.end('Not Found');
    }
}
);

server.listen(8000);