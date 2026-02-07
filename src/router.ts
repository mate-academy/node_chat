import type { IncomingMessage, ServerResponse } from 'http';
import * as fs from 'fs';

type Handler = (
  req: IncomingMessage,
  res: ServerResponse,
  params: Record<string, string>,
) => void | Promise<void>;

interface Route {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: Handler;
}

export class Router {
  private routes: Route[] = [];

  get(routePath: string, handler: Handler): void {
    this.addRoute('GET', routePath, handler);
  }

  post(routePath: string, handler: Handler): void {
    this.addRoute('POST', routePath, handler);
  }

  private addRoute(method: string, routePath: string, handler: Handler): void {
    const paramNames: string[] = [];
    const pattern = routePath.replace(/:(\w+)/g, (_, name) => {
      paramNames.push(name);

      return '([^/]+)';
    });

    this.routes.push({
      method,
      pattern: new RegExp(`^${pattern}$`),
      paramNames,
      handler,
    });
  }

  async handle(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
    const method = req.method ?? 'GET';
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
    const pathname = url.pathname;

    for (const route of this.routes) {
      if (route.method !== method) {
        continue;
      }

      const match = pathname.match(route.pattern);

      if (!match) {
        continue;
      }

      const params: Record<string, string> = {};

      route.paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });

      await route.handler(req, res, params);

      return true;
    }

    return false;
  }
}

// Body parser
export async function parseBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let data = '';

    req.on('data', (chunk) => (data += chunk));

    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Cookie parser
export function parseCookies(req: IncomingMessage): Record<string, string> {
  const cookies: Record<string, string> = {};
  const header = req.headers.cookie;

  if (!header) {
    return cookies;
  }

  header.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.split('=');

    if (name) {
      cookies[name.trim()] = rest.join('=').trim();
    }
  });

  return cookies;
}

// Static file server
export function serveStatic(
  res: ServerResponse,
  filePath: string,
  contentType: string,
): void {
  try {
    const content = fs.readFileSync(filePath);

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not Found');
  }
}

// JSON response helper
export function jsonResponse(
  res: ServerResponse,
  data: unknown,
  status = 200,
): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Get content type by extension
export function getContentType(ext: string): string {
  const types: Record<string, string> = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
  };

  return types[ext] ?? 'application/octet-stream';
}
