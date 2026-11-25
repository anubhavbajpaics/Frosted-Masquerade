/**
 * Frosted Masqueradé: receives registrations from the Vercel site.
 * Paste into: Google Sheet > Extensions > Apps Script. Then Deploy > New deployment > Web app
 * (Execute as: Me, Who has access: Anyone). Copy the /exec URL into Vercel as SHEET_WEBHOOK_URL.
 */
const SPREADSHEET_ID = '1Hd-VH_10vr6fMYEWCPun2kj6r3nicxXGtR6KUWJefSs';
const FOLDER_NAME = 'Frosted Masquerade - Payment Proofs';
const HEAD = ['Time (IST)', 'Name', 'Phone', 'Email', 'Ticket', 'Amount (₹)', 'Friend', 'Friend phone', 'Food', 'Crown', 'Note', 'Payment proof'];
const reply = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const d = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sh = ss.getSheetByName('Responses') || ss.insertSheet('Responses');
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEAD);
      sh.setFrozenRows(1);
      ['A:E', 'G:L'].forEach(r => sh.getRange(r).setNumberFormat('@')); // plain text: keeps phone numbers intact, blocks formulas
    }
    const it = DriveApp.getFoldersByName(FOLDER_NAME);
    const folder = it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
    const blob = Utilities.newBlob(Utilities.base64Decode(d.shot), 'image/jpeg', d.name + ' - ' + d.phone + '.jpg');
    const link = folder.createFile(blob).getUrl();
    sh.appendRow([Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a'), d.name, d.phone, d.email, d.tier, d.amount, d.friend, d.fphone, d.food, d.crown, d.note, link]);
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}
