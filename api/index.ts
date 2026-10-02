export default function handler(_req: any, res: any) {
  const data = {
    service: 'Khath & Co. API',
    status: 'active',
    features: ['memory-folio', 'private-workspace-session', '4k-preservation']
  };
  if (typeof res.status === 'function') {
    return res.status(200).json(data);
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}
