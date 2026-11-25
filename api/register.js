// Vercel serverless function: validates the form, sets the ticket price by date (IST),
// then forwards everything to your Google Sheet + Drive script (SHEET_WEBHOOK_URL).
const IST = 5.5 * 3600e3;
const TIERS = [['Early Bird', 1200, Date.UTC(2026, 10, 27)], ['Regular', 1800, Date.UTC(2026, 11, 21)], ['Late Owl', 1900, Date.UTC(2026, 11, 23)]];
const clean = (v, n = 200) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  const url = process.env.SHEET_WEBHOOK_URL;
  if (!url) return res.status(500).json({ ok: false, error: 'Registration isn’t set up yet. Please contact the host.' });
  let b = req.body;
  try { if (typeof b === 'string') b = JSON.parse(b); } catch { b = null; }
  if (!b || typeof b !== 'object') return res.status(400).json({ ok: false, error: 'Bad request' });
  if (b.hp) return res.status(200).json({ ok: true }); // honeypot: bots fill the hidden field
  const tier = TIERS.find(t => Date.now() < t[2] - IST);
  if (!tier) return res.status(410).json({ ok: false, error: 'Ticket sales have closed.' });
  const d = { name: clean(b.name, 80), phone: clean(b.phone, 20), email: clean(b.email, 120), friend: clean(b.friend, 80), fphone: clean(b.fphone, 20), food: clean(b.food, 20), crown: clean(b.crown, 30), note: clean(b.note, 500) };
  if (!d.name || !/^[0-9+\s-]{10,15}$/.test(d.phone) || !/^\S+@\S+\.\S+$/.test(d.email)) return res.status(400).json({ ok: false, error: 'Please check your name, number and e-mail.' });
  const shot = String(b.shot || '');
  if (!/^[A-Za-z0-9+/=]+$/.test(shot) || shot.length < 1000 || shot.length > 3.5e6) return res.status(400).json({ ok: false, error: 'Please attach a valid payment screenshot.' });
  Object.assign(d, { tier: tier[0], amount: tier[1] * (d.friend ? 2 : 1), shot });
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(d), redirect: 'follow' });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error);
    return res.status(200).json({ ok: true, tier: d.tier, amount: d.amount });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ ok: false, error: 'Could not save your registration. Please try again.' });
  }
};
