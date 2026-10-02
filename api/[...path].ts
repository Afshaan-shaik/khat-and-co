import { handleApiRequest } from '../src/server/apiHandler';

export default async function handler(req: any, res: any) {
  const url = req.url || '';
  const handled = await handleApiRequest(req, res, url);
  if (!handled) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
}
