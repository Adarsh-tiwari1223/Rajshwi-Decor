import { test, expect } from '../../../core/fixtures/customFixtures';
import { Config } from '../../../utils/env';
import * as path from 'path';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import { generateAllUserContactFiles, USERS_CONFIG, createExcelFile, generateUserContactRecords } from '../../../testdata/lead/generateBulkFiles';

test.describe('Rajasvi Decor - Admin Bulk Contact Upload Tests', () => {

  test.beforeAll(async () => {
    // Ensure all user Excel files are generated with 5 authentic records each
    generateAllUserContactFiles();
  });

  test.beforeEach(async ({ loginPage }) => {
    // Only Admin can perform Bulk Upload
    await loginPage.goto();
    await loginPage.login(Config.adminEmail, Config.adminPassword);
  });

  test('RD_BLK_01: Verify Bulk Upload Modal structure, controls, and file chooser', async ({ contactPage }) => {
    await contactPage.goto();

    // Verify Bulk Upload button is visible on toolbar
    await expect(contactPage.bulkUploadBtn).toBeVisible();

    // Open Bulk Upload modal
    await contactPage.openBulkUploadModal();

    // Verify Modal Header
    await expect(contactPage.bulkUploadModal.modalTitle).toHaveText('Bulk Upload');
    await expect(contactPage.bulkUploadModal.closeIconBtn).toBeVisible();

    // Verify On Behalf Users dropdown
    await expect(contactPage.bulkUploadModal.onBehalfUserDropdown).toBeVisible();

    // Verify Assigned To dropdown
    await expect(contactPage.bulkUploadModal.assignedToDropdown).toBeVisible();

    // Verify Source dropdown
    await expect(contactPage.bulkUploadModal.sourceDropdown).toBeVisible();

    // Verify Choose Excel File component
    await expect(contactPage.bulkUploadModal.chooseFileBtn).toBeVisible();
    await expect(contactPage.bulkUploadModal.chooseFileBtn).toContainText('Choose Excel File');

    // Verify Action Buttons
    await expect(contactPage.bulkUploadModal.saveBtn).toBeVisible();
    await expect(contactPage.bulkUploadModal.closeBtn).toBeVisible();

    // Dismiss via CLOSE button
    await contactPage.bulkUploadModal.clickClose();
    await contactPage.bulkUploadModal.waitForClosed();
  });

  test('RD_BLK_02: Dismiss Bulk Upload modal via top-right X icon', async ({ contactPage }) => {
    await contactPage.goto();
    await contactPage.openBulkUploadModal();

    // Dismiss via X icon
    await contactPage.bulkUploadModal.closeViaIcon();
    await contactPage.bulkUploadModal.waitForClosed();
  });

  test('RD_BLK_03: Perform Bulk Upload for on-behalf user and verify contact creation', async ({ contactPage, page }) => {
    await contactPage.goto();
    await contactPage.openBulkUploadModal();

    // Select On Behalf User directly from dropdown
    const targetUser = await contactPage.bulkUploadModal.selectOnBehalfUser('Rahul Sharma');
    console.log('Selected Target User for Bulk Upload:', targetUser);

    // Select Source directly from dropdown (mandatory field)
    const targetSource = await contactPage.bulkUploadModal.selectSource('Website');
    console.log('Selected Source in Bulk Upload:', targetSource);

    // Dynamically map selected user to their corresponding Excel file
    const bulkDir = path.resolve('testdata/lead/bulk_upload');
    const matchedConfig = USERS_CONFIG.find(u => 
      targetUser.toLowerCase().includes(u.key.toLowerCase()) || 
      targetUser.toLowerCase().includes(u.displayName.toLowerCase())
    );
    const fileName = matchedConfig ? `${matchedConfig.key}_contact.xlsx` : 'rahul_contact.xlsx';
    const filePath = path.join(bulkDir, fileName);

    // Ensure the Excel file exists
    if (!fs.existsSync(filePath)) {
      const records = generateUserContactRecords(5);
      createExcelFile(filePath, records);
    }
    expect(fs.existsSync(filePath), `Excel file ${fileName} must exist for user ${targetUser}`).toBeTruthy();

    // Read the records from the dynamic Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetRecords = XLSX.utils.sheet_to_json<any>(workbook.Sheets[workbook.SheetNames[0]]);
    const firstUploadedRecord = sheetRecords[0];
    console.log(`[Dynamic Excel File Selected]: ${fileName} (${sheetRecords.length} records). First contact: "${firstUploadedRecord.name}" (${firstUploadedRecord.number})`);

    // Listen for upload network request & response
    let uploadApiUrl = '';
    let uploadApiStatus = 0;
    let uploadApiBody: any = null;

    page.on('response', async res => {
      const url = res.url();
      if (res.request().method() === 'POST' && (url.toLowerCase().includes('bulk') || url.toLowerCase().includes('upload') || url.toLowerCase().includes('contact'))) {
        uploadApiUrl = url;
        uploadApiStatus = res.status();
        try { uploadApiBody = await res.json(); } catch (_) {
          try { uploadApiBody = await res.text(); } catch (_) {}
        }
      }
    });

    // Attach dynamic Excel file
    await contactPage.bulkUploadModal.uploadFile(filePath);

    // Wait for the initial "Excel file selected" toast to clear
    await page.locator('.p-toast-message').waitFor({ state: 'hidden', timeout: 6000 }).catch(() => {});

    // Submit Bulk Upload
    await contactPage.bulkUploadModal.clickSave();

    // Capture the ACTUAL save feedback toast
    const saveToast = await contactPage.getToastText(10000);
    console.log(`[Bulk Upload Save Response Status]: ${uploadApiStatus} (${uploadApiUrl})`);
    console.log(`[Bulk Upload Save API Body]:`, uploadApiBody);
    console.log(`[Bulk Upload Real Save Toast]: "${saveToast}"`);

    // Strict assertions: Toast must NOT be just "Excel file selected"
    expect(saveToast, 'A server feedback toast must appear after clicking SAVE').toBeTruthy();
    expect(saveToast, 'Toast must confirm upload completion, not just file selection').not.toBe('SuccessExcel file selected');

    // Modal MUST actually close on success (no silent .catch)
    await expect(contactPage.bulkUploadModal.modalDialog, 'Bulk Upload modal must close upon successful upload').toBeHidden({ timeout: 10000 });

    // Verify the newly uploaded contact exists in the Contact table
    await contactPage.goto();
    await contactPage.searchContact(firstUploadedRecord.name);
    const searchRowCount = await contactPage.getDisplayedRowCount();
    expect(searchRowCount, `Uploaded contact "${firstUploadedRecord.name}" must be found in table`).toBeGreaterThanOrEqual(1);

    const firstRowData = await contactPage.getRowData(0);
    expect(firstRowData.name.toLowerCase(), `First row name must match uploaded contact "${firstUploadedRecord.name}"`).toContain(firstUploadedRecord.name.toLowerCase());
  });

});
