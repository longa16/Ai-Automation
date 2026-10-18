import http from 'node:http';
import { mkdir, appendFile, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const root = path.dirname(fileURLToPath(import.meta.url));
const services = new Set(['Mes prospects', 'Ma relation client', 'Mes opérations', 'Je souhaite être conseillé']);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon' };

export function validateContact(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return 'La demande est invalide.';
  if (typeof data.name !== 'string' || data.name.trim().length < 2 || data.name.length > 100) return 'Veuillez renseigner votre nom (2 à 100 caractères).';
  if (typeof data.email !== 'string' || data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'Veuillez renseigner une adresse e-mail valide.';
  if (data.company != null && (typeof data.company !== 'string' || data.company.length > 150)) return 'Le nom de l’entreprise est trop long.';
  if (!services.has(data.service)) return 'Veuillez sélectionner un besoin proposé.';
  if (typeof data.message !== 'string' || data.message.trim().length < 10 || data.message.length > 5000) return 'Veuillez décrire votre besoin en 10 à 5 000 caractères.';
  if (data.consent !== 'on' && data.consent !== true) return 'Votre consentement est nécessaire pour traiter la demande.';
  return null;
}

export async function createApp({ dev = false, dataDirectory = process.env.CONTACT_DATA_DIR || path.join(root, '.data') } = {}) {
  const vite = dev ? await (await import('vite')).createServer({ root, server: { middlewareMode: true }, appType: 'spa' }) : null;
  const attempts = new Map();
  function json(res, status, body) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(JSON.stringify(body));
  }
  const server = http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/health') return json(res, 200, { status: 'ok' });
    if (url.pathname === '/api/contact') {
      if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, { error: 'Méthode non autorisée.' }); }
      if (!req.headers['content-type']?.startsWith('application/json')) return json(res, 415, { error: 'Le format JSON est requis.' });
      if (req.headers.origin) {
        let origin;
        try { origin = new URL(req.headers.origin); } catch { return json(res, 403, { error: 'Origine de la demande non autorisée.' }); }
        if (origin.host !== req.headers.host) return json(res, 403, { error: 'Origine de la demande non autorisée.' });
      }
      const client = req.socket.remoteAddress;
      const now = Date.now();
      for (const [key, entry] of attempts) if (now - entry.start > 900_000) attempts.delete(key);
      const limit = attempts.get(client) || { start: now, count: 0 };
      if (limit.count >= 10) return json(res, 429, { error: 'Trop de demandes. Veuillez réessayer dans 15 minutes.' });
      limit.count++; attempts.set(client, limit);
      const chunks = [];
      let bodySize = 0;
      try {
        for await (const chunk of req) {
          bodySize += chunk.length;
          if (bodySize > 32_768) { json(res, 413, { error: 'Le message est trop volumineux.' }); req.resume(); return; }
          chunks.push(chunk);
        }
        const body = Buffer.concat(chunks).toString('utf8');
        let data;
        try { data = JSON.parse(body); } catch { return json(res, 400, { error: 'La demande est invalide.' }); }
        if (data?.website) return json(res, 200, { ok: true });
        const error = validateContact(data);
        if (error) return json(res, 400, { error });
        const entry = { id: randomUUID(), createdAt: new Date().toISOString(), name: data.name.trim(), email: data.email.trim(), company: data.company?.trim() || '', service: data.service, message: data.message.trim(), consent: true };
        await mkdir(dataDirectory, { recursive: true, mode: 0o700 });
        await appendFile(path.join(dataDirectory, 'contacts.jsonl'), JSON.stringify(entry) + '\n', { mode: 0o600 });
        return json(res, 201, { ok: true, id: entry.id });
      } catch {
        return json(res, 500, { error: 'Impossible d’enregistrer votre demande pour le moment. Veuillez réessayer.' });
      }
    }
    if (url.pathname.startsWith('/api/')) return json(res, 404, { error: 'Ressource introuvable.' });
    if (vite) return vite.middlewares(req, res);
    if (!['GET', 'HEAD'].includes(req.method)) return json(res, 405, { error: 'Méthode non autorisée.' });
    try {
      const dist = path.join(root, 'dist');
      const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
      let filename = path.resolve(dist, relative || 'index.html');
      if (!filename.startsWith(dist + path.sep)) return json(res, 403, { error: 'Accès refusé.' });
      try { if (!(await stat(filename)).isFile()) throw new Error(); } catch {
        if (path.extname(relative)) return json(res, 404, { error: 'Ressource introuvable.' });
        filename = path.join(dist, 'index.html');
      }
      const content = await readFile(filename);
      res.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream', 'Cache-Control': filename.includes(path.sep + 'assets' + path.sep) ? 'public, max-age=31536000, immutable' : 'no-cache' });
      res.end(req.method === 'HEAD' ? undefined : content);
    } catch { json(res, 500, { error: 'Le site est indisponible. Exécutez npm run build avant le démarrage en production.' }); }
  });
  server.on('close', () => vite?.close());
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  const server = await createApp({ dev: process.argv.includes('--dev') });
  server.listen(port, '0.0.0.0', () => console.log(`AI Automation Agency — serveur démarré sur le port ${port}`));
}
