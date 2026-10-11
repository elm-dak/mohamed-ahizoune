import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const failures = [];
for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844], ['small-mobile', 320, 740]]) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce', colorScheme: 'dark' });
  page.on('pageerror', error => failures.push(`${name}: ${error.message}`));
  const response = await page.goto('http://127.0.0.1:4321', { waitUntil: 'networkidle' });
  if (response.status() !== 200) throw new Error(`${name}: HTTP ${response.status()}, preview did not load`);
  await page.evaluate(() => Promise.all([...document.images].map(async image => { image.loading = 'eager'; try { await image.decode(); } catch {} })));
  const state = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    brokenImages: [...document.images].filter(img => !img.complete || !img.naturalWidth).length,
    brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.getElementById(a.getAttribute('href').slice(1))).length,
  }));
  if (state.overflow || state.brokenImages || state.brokenAnchors) failures.push(`${name}: ${JSON.stringify(state)}`);
  await page.getByText('Where do I start?', { exact: true }).click();
  if (!(await page.locator('details').first().getAttribute('open') === '')) failures.push(`${name}: FAQ did not open`);
  if (width < 761) {
    await page.getByRole('button', { name: 'Open navigation' }).click();
    if (!await page.locator('#navigation').isVisible()) failures.push(`${name}: mobile menu did not open`);
    await page.locator('#navigation').getByText('Coaching', { exact: true }).click();
    if (await page.getByRole('button', { name: 'Open navigation' }).getAttribute('aria-expanded') !== 'false') failures.push(`${name}: mobile menu did not close`);
  }
  const contact = page.locator('.contact-instagram');
  if (await contact.getAttribute('href') !== 'https://www.instagram.com/_mohamed_ahizoune/') failures.push(`${name}: contact destination`);
  await expect(page.locator('.hero-topline')).toHaveCount(0);
  await expect(page.locator('.discipline-badge')).toHaveCount(0);
  await expect(page.locator('.pack-price').nth(0)).toContainText('900');
  await expect(page.locator('.pack-price').nth(1)).toContainText('2,519.10');
  await expect(page.locator('.pack-price').nth(2)).toContainText('4,049.10');
  await expect(page.locator('#achievements')).toContainText('NPC Pro Qualifier Marrakech');
  await expect(page.locator('#achievements')).toContainText('Finals Moroccan Championship');
  await expect(page.locator('#achievements')).toContainText('The Réal Contest');
  const finder = page.locator('#pack-finder');
  for (const pack of ['Starter Pack', 'Transformation Pack', 'Elite Pack']) {
    await finder.locator(`input[value="${pack}"]`).check();
    await expect(page.locator('#fit-pack-name')).toHaveText(pack);
  }
  await finder.locator('input[value="Competition preparation"]').check();
  await expect(page.locator('#fit-focus')).toHaveText('Your focus: Competition preparation');
  await finder.getByRole('link', { name: 'Discuss this fit' }).click();
  await expect(page.locator('select[name="goal"]')).toHaveValue('Competition preparation');
  await expect(page.locator('select[name="pack"]')).toHaveValue('Elite Pack');
  await finder.locator('input[value="Build muscle"]').check();
  await finder.locator('input[value="Transformation Pack"]').check();
  await page.locator('#programs').scrollIntoViewIfNeeded();
  await expect(page.locator('.floating-enquiry')).toBeVisible();
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await expect(page.locator('.floating-enquiry')).toBeHidden();
  const marks = page.locator('.svg-mark');
  if (await marks.count() < 25) failures.push(`${name}: missing SVG visual system`);
  const checkDashes = async () => {
    const text = await page.locator('body').innerText();
    if (/[-–—]/.test(text)) failures.push(`${name}: dash in visible copy: ${text.split('\n').filter(line => /[-–—]/.test(line)).join(' | ')}`);
  };
  for (const program of ['strength', 'hypertrophy', 'dumbbell']) {
    await page.locator(`#goal-${program}`).click();
    const panel = page.locator(`#program-${program}`);
    await expect(panel).toBeVisible();
    const days = panel.locator('.session-tabs [role="tab"]');
    for (let index = 0; index < await days.count(); index++) {
      await days.nth(index).click();
      const session = panel.locator('.session-panel:not([hidden])');
      const checkbox = session.locator('input[type="checkbox"]').first();
      await checkbox.check();
      await expect(session.locator('output')).toContainText('1 /');
      await session.getByRole('button', { name: 'Reset checklist' }).click();
      await expect(checkbox).not.toBeChecked();
      await checkDashes();
    }
  }
  await page.locator('#goal-strength').focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#goal-hypertrophy')).toBeFocused();
  await expect(page.locator('#program-hypertrophy')).toBeVisible();
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#program-hypertrophy').getByRole('button', { name: 'Save sample week' }).click()]);
  if (!download.suggestedFilename().includes('hypertrophy')) failures.push(`${name}: incorrect sample download`);
  await download.saveAs(`artifacts/${name}-sample.txt`);
  await page.locator('#program-hypertrophy').getByRole('link', { name: 'Make it personal' }).click();
  await expect(page.locator('select[name="goal"]')).toHaveValue('Build muscle');
  await page.getByRole('link', { name: 'Choose Transformation' }).click();
  await expect(page.locator('select[name="pack"]')).toHaveValue('Transformation Pack');
  await page.locator('input[name="name"]').fill('Test visitor');
  await page.locator('input[name="phone"]').fill('+212 600 000 000');
  await page.locator('select[name="experience"]').selectOption('One to three years');
  await page.locator('textarea[name="message"]').fill('I can train four days per week.');
  await page.getByRole('button', { name: 'Prepare my enquiry' }).click();
  await expect(page.locator('#enquiry-review')).toBeVisible();
  await expect(page.locator('#message-preview')).toContainText('Test visitor');
  await expect(page.locator('#message-preview')).toContainText('Transformation Pack');
  await expect(page.locator('#message-preview')).toContainText('Upper / lower split');
  await expect(page.locator('#whatsapp-link')).toBeVisible();
  await expect(page.locator('.whatsapp-pending')).toBeHidden();
  const coachDestination = new URL(await page.locator('#whatsapp-link').getAttribute('href'));
  if (coachDestination.hostname !== 'wa.me' || coachDestination.pathname !== '/212661328967' || !coachDestination.searchParams.get('text').includes('Transformation Pack')) failures.push(`${name}: coach WhatsApp destination`);
  await page.getByRole('button', { name: 'Copy my message' }).click();
  await expect(page.locator('.copy-status')).not.toBeEmpty();
  await page.getByRole('button', { name: 'Edit details' }).click();
  // Verify a missing configuration degrades honestly, without sending anything.
  await page.locator('#coaching-enquiry').evaluate(form => form.dataset.whatsappNumber = '');
  await page.getByRole('button', { name: 'Prepare my enquiry' }).click();
  await expect(page.locator('#whatsapp-link')).toBeHidden();
  await expect(page.locator('.whatsapp-pending')).toBeVisible();
  await page.getByRole('button', { name: 'Edit details' }).click();
  await page.locator('#coaching-enquiry').evaluate(form => { if (form instanceof HTMLFormElement) form.reset(); form.dataset.whatsappNumber = '212661328967'; });
  await page.locator('#selected-program').evaluate(element => element.hidden = true);
  await page.locator('#goal-strength').click();
  await page.locator('#day-strength-0').click();
  for (const theme of ['dark', 'light']) {
    const current = await page.locator('html').getAttribute('data-theme');
    if (current !== theme) await page.locator('.theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) failures.push(`${name} ${theme}: horizontal overflow`);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `artifacts/${name}-${theme}-hero.png` });
    await page.screenshot({ path: `artifacts/${name}-${theme}.png`, fullPage: true });
    if (name === 'desktop') {
      for (const section of ['about', 'programs', 'skills', 'pricing', 'pack-finder', 'achievements', 'contact']) await page.locator(`#${section}`).screenshot({ path: `artifacts/${section}-${theme}.png` });
    }
  }
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('.theme-toggle').click();
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: `artifacts/${name}-hero.png` });
  await page.screenshot({ path: `artifacts/${name}.png`, fullPage: true });
  await page.close();
  console.log(`${name}: SVG graphics, coaching fit selector, enquiry visibility, both themes, program controls, downloads, pricing, achievements, contact form, WhatsApp destination, theme persistence, layout, assets, and navigation passed`);
}
await browser.close();
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log('All browser checks passed.');
