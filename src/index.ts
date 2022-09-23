import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: !!process.env.CI });
  const page = await browser.newPage();
  await page.goto(`https://checkin.timewatch.co.il/punch/punch.php`);

  const companyInput = await page.$('#compKeyboard');
  const employeeInput = await page.$('#nameKeyboard');
  const passwordInput = await page.$('#pwKeyboard');
  const button = await page.$("input[name='B1']");

  await companyInput.type(process.env.COMPANY_ID);
  await employeeInput.type(process.env.USERNAME);
  await passwordInput.type(process.env.PASSWORD);
  await button.click();

  await page.click('a:has-text("Update attendance data")');

  await page.waitForSelector('.content > .table-responsive > table');

  const missingLine = page.locator("tr > td:has-text('Entry/Exit missing')");

  let missingLineCount = await missingLine.count();

  while (missingLineCount > 0) {
    const table = page
      .locator('.content > .table-responsive > table > tbody > tr:has(td:has-text("Entry/Exit missing"))')
      .nth(0);
    const row = await table.elementHandle();

    const timeNeededNode = await row.$('td:nth-child(4)');
    const hasMissingHoursNode = await row.$('td:nth-child(13)');
    const hasMissingHours = await hasMissingHoursNode.textContent();
    const timeNeeded = await timeNeededNode.textContent();
    if (timeNeeded && hasMissingHours === 'Entry/Exit missing') {
      const [hoursNeeded, minutesNeeded] = timeNeeded.split(':');
      const hoursNeededNumber = Number(hoursNeeded);
      const minutesNeededNumber = Number(minutesNeeded);

      await row.click();

      await page.waitForSelector('.modal-content');

      const entryHoursNode = page.locator('#ehh0');
      const entryMinutesNode = page.locator('#emm0');
      const exitHoursNode = page.locator('#xhh0');
      const exitMinutesNode = page.locator('#xmm0');
      const updateButton = page.locator('button:has-text("Update")');

      await entryHoursNode.type('09');
      await entryMinutesNode.type('00');
      await exitHoursNode.type(String(hoursNeededNumber + 9).padStart(2, '0'));
      await exitMinutesNode.type(String(minutesNeededNumber).padStart(2, '0'));
      await updateButton.click();
      missingLineCount--;
      await page.waitForTimeout(4000);
    }
  }

  process.exit(0);
})();
