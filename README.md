# Frosted Masqueradé: invite site (Vercel)

A static page plus one serverless function. Registrations go to your Google Sheet, payment screenshots to your Google Drive. All free.

## Set up (about 10 minutes)

### 1) Google Sheet + script
1. Create a new Google Sheet (any name).
2. Extensions > Apps Script. Delete the sample code, paste `apps-script/Code.gs`, Save.
3. Deploy > New deployment > type **Web app** > Execute as **Me** · Who has access **Anyone** > Deploy. Authorise when asked (if Google warns: Advanced > Go to project).
4. Copy the **Web app URL** (ends in `/exec`).

### 2) Vercel
1. Put this folder in a GitHub repo, then vercel.com > Add New > Project > import it. (Or run `npx vercel` inside this folder.)
2. Settings > Environment Variables: add `SHEET_WEBHOOK_URL` = the URL from step 1.4.
3. Deploy (or Redeploy after adding the variable).

### 3) Test
Register once with a small screenshot. A row appears in the sheet's **Responses** tab and the image in Drive > *Frosted Masquerade - Payment Proofs*.

## Editing later
- Ticket prices and dates: `TIERS` in `api/register.js` **and** `T` in `public/index.html` (keep them identical). The server sets the tier and amount from the date (IST), so guests never choose a category.
- Payment QR: replace `public/pay-qr.png`; the UPI ID text is `id="upi"` in `public/index.html`.
- After changing `Code.gs`: Deploy > Manage deployments > pencil icon > Version: New version > Deploy.
- Nothing on the site shows counts or totals. Only you can open the sheet and the Drive folder.
