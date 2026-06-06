// Vercel serverless function — receives waitlist signups, notifies via Resend
// Requires env var: RESEND_API_KEY (get one free at resend.com)

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://premiumbuns.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Premium Buns <onboarding@resend.dev>',
          to: ['reggieblack@gmail.com'],
          subject: `New waitlist signup: ${email}`,
          html: `<p style="font-family:sans-serif">New signup on the <strong>Premium Buns</strong> waitlist:</p><p style="font-family:monospace;font-size:1.1em">${email}</p>`,
        }),
      });
    } catch (err) {
      console.error('Resend error:', err.message);
    }
  } else {
    console.log('Waitlist signup (no RESEND_API_KEY set):', email);
  }

  return res.status(200).json({ success: true });
};
