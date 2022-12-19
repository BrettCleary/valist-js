import { expect } from '@playwright/test';
import { test } from './fixtures';
import { connectWallet } from './helpers';

test('name-taken', async ({ page, injectWeb3Provider, signers }) => {
  const wallet = await injectWeb3Provider(signers[2]);

  // start at account page
  await page.goto('/yolo');

  // connect wallet
  await connectWallet(page, wallet);

  // navigate to new project
  await page.getByText('New Project').click();

  // enter taken project name
  await page.getByLabel('Project Name').fill('yolo');

  // error should be shown
  await expect(page.getByText('Name has been taken')).toBeVisible();

  // continue button disabled
  await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();
});

test('create-transaction', async ({ page, injectWeb3Provider, signers }) => {
  const wallet = await injectWeb3Provider(signers[2]);

  // start at account page
  await page.goto('/yolo');

  // connect wallet
  await connectWallet(page, wallet);

  // navigate to new project
  await page.getByText('New Project').click();

  // Basic Info
  await page.getByLabel('Project Name').fill('new-project');
  await page.getByLabel('Display Name').fill('new-project');
  await page.getByPlaceholder('Select type').click();
  await page.getByRole('option', { name: 'web' }).click();
  
  // Descriptions
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Short Description').fill('playwright test');

  // Members
  await page.getByRole('button', { name: 'Continue' }).click();

  // Media
  await page.getByRole('button', { name: 'Continue' }).click();

  // create project
  await page.getByRole('button', { name: 'Create' }).click();

  // wait for loading dialog
  await expect(page.getByText('Creating transaction')).toBeVisible();
});