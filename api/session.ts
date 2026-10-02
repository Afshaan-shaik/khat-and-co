import { handleApiRequest } from './_handler';

export default async function handler(req: any, res: any) {
  try {
    const url = req.url || '/api/session';
    const handled = await handleApiRequest(req, res, url.startsWith('/api') ? url : `/api${url}`);
    if (!handled) {
      if (typeof res.status === 'function') {
        return res.status(404).json({ error: 'Endpoint not found' });
      }
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Endpoint not found' }));
    }
  } catch (err: any) {
    console.error('API Error in /api/session:', err);
    if (typeof res.status === 'function') {
      return res.status(500).json({ error: err?.message || 'Internal Server Error' });
    }
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: err?.message || 'Internal Server Error' }));
  }
}
