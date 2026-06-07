'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_http_1 = require("node:http");
const node_path_1 = __importDefault(require("node:path"));
const router_1 = require("./router");
const utils_1 = require("./utils/utils");
const PUBLIC_DIR = node_path_1.default.join(__dirname, 'public');
const DEFAULT_FILE = 'index.html';
const CONTENT_TYPES = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml; charset=utf-8',
};
function sendNoContent(request, response) {
    (0, utils_1.setCorsHeaders)(request, response);
    response.writeHead(204, {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Content-Length': '0',
    });
    response.end();
}
function resolvePublicPath(urlPathname) {
    const normalizedPath = urlPathname === '/' ? `/${DEFAULT_FILE}` : urlPathname;
    const safeRelativePath = node_path_1.default
        .normalize(normalizedPath)
        .replace(/^(\.\.[/\\])+/, '');
    return node_path_1.default.join(PUBLIC_DIR, safeRelativePath);
}
async function serveStaticFile(request, response, pathname) {
    const filePath = resolvePublicPath(pathname);
    const relativePath = node_path_1.default.relative(PUBLIC_DIR, filePath);
    if (relativePath.startsWith('..') || node_path_1.default.isAbsolute(relativePath)) {
        (0, utils_1.sendJson)(request, response, 403, { error: 'Forbidden' });
        return true;
    }
    try {
        const fileStat = await (0, promises_1.stat)(filePath);
        if (!fileStat.isFile()) {
            return false;
        }
        const extension = node_path_1.default.extname(filePath);
        const contentType = CONTENT_TYPES[extension] || 'application/octet-stream';
        response.writeHead(200, {
            'Content-Type': contentType,
        });
        (0, node_fs_1.createReadStream)(filePath).pipe(response);
        return true;
    }
    catch {
        return false;
    }
}
async function requestListener(request, response) {
    const method = request.method || 'GET';
    const url = new URL(request.url || '/', 'http://localhost');
    const { pathname } = url;
    if (method === 'OPTIONS') {
        sendNoContent(request, response);
        return;
    }
    if (method === 'GET') {
        const fileServed = await serveStaticFile(request, response, pathname);
        if (fileServed) {
            return;
        }
    }
    const handled = await (0, router_1.router)(method, pathname, request, response);
    if (handled) {
        return;
    }
    (0, utils_1.sendJson)(request, response, 404, { error: 'Not found' });
}
const app = (0, node_http_1.createServer)((request, response) => {
    void requestListener(request, response);
});
exports.default = app;
