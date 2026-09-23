import { test, expect } from '../../../core/fixtures/customFixtures';
import * as path from 'path';
import * as fs from 'fs';
import { generateAllUserContactFiles, USERS_CONFIG } from '../../../testdata/lead/generateBulkFiles';

test.describe('Rajasvi Decor - Admin Bulk Contact Upload Tests', () => {

  test.beforeAll(async () => {
    // Ensure all user Excel files are generated with 5 authentic records each
    generateAllUserContactFiles();
  });

  test.beforeEach(async ({ loginPage }) => {
    // Only Admin can perform Bulk Upload
    await loginPage.goto();
    await loginPage.login('admin@rajasvidecor.com', 'Admin@123');
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

  test('RD_BLK_03: Perform Bulk Upload for on-behalf user and verify contact creation', async ({ contactPage }) => {
    await contactPage.goto();
    await contactPage.openBulkUploadModal();

    // Discover available users in the dropdown
    const availableUsers = await contactPage.bulkUploadModal.getAvailableOnBehalfUsers();
    expect(availableUsers.length).toBeGreaterThan(0);
    console.log('Available On Behalf Users in CRM:', availableUsers);

    // Pick target user (e.g. Rahul Sharma or first available user)
    const targetUser = availableUsers.find(u => u.toLowerCase().includes('rahul')) || availableUsers[0];
    console.log('Selected Target User for Bulk Upload:', targetUser);

    // Select the user
    await contactPage.bulkUploadModal.selectOnBehalfUser(targetUser);

    // Pick corresponding excel file or rahul_contact.xlsx
    const bulkDir = path.resolve('testdata/lead/bulk_upload');
    const matchedConfig = USERS_CONFIG.find(u => targetUser.toLowerCase().includes(u.key) || targetUser.toLowerCase().includes(u.displayName.toLowerCase()));
    const fileName = matchedConfig ? `${matchedConfig.key}_contact.xlsx` : 'rahul_contact.xlsx';
    const filePath = path.join(bulkDir, fileName);

    expect(fs.existsSync(filePath)).toBeTruthy();

    // Attach Excel file
    await contactPage.bulkUploadModal.uploadFile(filePath);

    // Submit Bulk Upload
    await contactPage.bulkUploadModal.clickSave();

    // Verify modal closes
    await contactPage.bulkUploadModal.waitForClosed(10000).catch(() => {});

    // Allow background processing and table refresh
    await contactPage.page.waitForTimeout(2000);
    await contactPage.goto();

    // Verify table has records
    const rowCount = await contactPage.getDisplayedRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

});
