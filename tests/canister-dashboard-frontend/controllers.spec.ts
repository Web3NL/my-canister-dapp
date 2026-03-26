import { test, expect } from '../fixtures.js';
import { login } from './login';
import {
  TEST_CONTROLLER,
  waitForListUpdate,
  setupConsoleErrorMonitoring,
} from './shared';

test('add and remove canister controllers', async ({ page }, testInfo) => {
  const testUrl = testInfo.project.metadata.testUrl;

  if (!testUrl) {
    throw new Error('testUrl not found in project metadata');
  }

  const getConsoleErrors = setupConsoleErrorMonitoring(page);

  await page.goto(testUrl);
  await login(page);

  console.log('Testing controller addition...');

  await page.waitForSelector('#controllers-list');
  await expect(async () => {
    const items = await page.locator('#controllers-list li').allTextContents();
    const realItems = items.filter(t => t.trim() && !/loading/i.test(t));
    expect(realItems.length).toBeGreaterThan(0);
  }).toPass({ timeout: 10000 });

  await page.fill('#controller-input', TEST_CONTROLLER);
  await page.click('#controller-add');

  await waitForListUpdate(page, '#controllers-list', TEST_CONTROLLER, true);

  const controllersAfterAdd = await page.locator('#controllers-list li .data-display').allTextContents();
  expect(controllersAfterAdd.map(t => t.trim())).toContain(TEST_CONTROLLER);
  console.log('Controller successfully added to the list');

  const inputValueAfterAdd = await page.inputValue('#controller-input');
  expect(inputValueAfterAdd).toBe('');

  console.log('Testing controller removal...');
  await page.fill('#controller-input', TEST_CONTROLLER);
  await page.click('#controller-remove');

  await waitForListUpdate(page, '#controllers-list', TEST_CONTROLLER, false);

  const controllersAfterRemove = await page.locator('#controllers-list li .data-display').allTextContents();
  expect(controllersAfterRemove.map(t => t.trim())).not.toContain(TEST_CONTROLLER);
  console.log('Controller successfully removed from the list');

  const inputValueAfterRemove = await page.inputValue('#controller-input');
  expect(inputValueAfterRemove).toBe('');

  console.log('Controller management tests completed successfully');
  expect(getConsoleErrors()).toEqual([]);
});

test('reject invalid principal text', async ({ page }, testInfo) => {
  const testUrl = testInfo.project.metadata.testUrl;

  if (!testUrl) {
    throw new Error('testUrl not found in project metadata');
  }

  const getConsoleErrors = setupConsoleErrorMonitoring(page);

  await page.goto(testUrl);
  await login(page);

  await page.waitForSelector('#controllers-list');
  await expect(async () => {
    const items = await page.locator('#controllers-list li').allTextContents();
    const realItems = items.filter(t => t.trim() && !/loading/i.test(t));
    expect(realItems.length).toBeGreaterThan(0);
  }).toPass({ timeout: 10000 });

  // Capture the current controller list before the invalid attempt
  const controllersBefore = await page.locator('#controllers-list li .data-display').allTextContents();

  const invalidPrincipal = 'not-a-valid-principal-text!!!';
  await page.fill('#controller-input', invalidPrincipal);
  await page.click('#controller-add');

  // Error section should become visible with an error message
  const errorSection = page.locator('#error-section');
  await expect(errorSection).toBeVisible({ timeout: 10000 });
  const errorMessages = await errorSection.locator('.error-message').allTextContents();
  expect(errorMessages.length).toBeGreaterThan(0);
  console.log(`Error displayed: ${errorMessages.join('; ')}`);

  // Controller list should not have changed
  const controllersAfter = await page.locator('#controllers-list li .data-display').allTextContents();
  expect(controllersAfter.map(t => t.trim())).toEqual(controllersBefore.map(t => t.trim()));

  console.log('Invalid principal rejection test completed successfully');

  // Allow the expected console error from the invalid controller attempt
  const errors = getConsoleErrors().filter(e => !/principal/i.test(e) && !/controller/i.test(e));
  expect(errors).toEqual([]);
});
