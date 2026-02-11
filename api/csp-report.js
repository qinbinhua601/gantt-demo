export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method not allowed');
  }

  try {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }

    const contentType = req.headers['content-type'] || '';
    let payload = body;
    if (contentType.includes('application/json') && body) {
      payload = JSON.parse(body);
    }

    // Log CSP violation report for debugging/monitoring
    console.log('CSP Violation Report:', payload);

    res.status(204).end();
  } catch (error) {
    console.error('CSP report handler error:', error);
    res.status(400).end('Invalid report');
  }
}
