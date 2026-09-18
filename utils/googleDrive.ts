import { google, drive_v3 } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from './env';
import { logger } from './logger';

export class GoogleDriveService {
  private drive: drive_v3.Drive | null = null;
  private isInitialized = false;

  constructor(private keyPath: string = Config.googlePrivateKeyPath) {}

  /**
   * Initialize Google Drive API client using Service Account keyFile
   */
  async initialize(): Promise<boolean> {
    try {
      const absoluteKeyPath = path.resolve(process.cwd(), this.keyPath);
      if (!fs.existsSync(absoluteKeyPath)) {
        logger.warn(`Credentials file not found at ${absoluteKeyPath}. Operating in dry-run mode.`);
        return false;
      }

      const auth = new google.auth.GoogleAuth({
        keyFile: absoluteKeyPath,
        scopes: [
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/drive.file'
        ]
      });

      this.drive = google.drive({ version: 'v3', auth });
      this.isInitialized = true;
      logger.info('Google Drive service initialized successfully.');
      return true;
    } catch (error) {
      logger.error(`Failed to initialize Google Drive service: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * List files in Google Drive matching query
   */
  async listFiles(query = "trashed = false", pageSize = 10): Promise<drive_v3.Schema$File[]> {
    if (!this.isInitialized || !this.drive) {
      await this.initialize();
    }
    if (!this.drive) return [];

    try {
      const res = await this.drive.files.list({
        q: query,
        pageSize,
        fields: 'files(id, name, mimeType, modifiedTime, webViewLink)'
      });
      return res.data.files || [];
    } catch (error) {
      logger.error(`Error listing Google Drive files: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Get metadata of a specific file
   */
  async getFileMetadata(fileId: string): Promise<drive_v3.Schema$File | null> {
    if (!this.isInitialized || !this.drive) {
      await this.initialize();
    }
    if (!this.drive) return null;

    try {
      const res = await this.drive.files.get({
        fileId,
        fields: 'id, name, mimeType, webViewLink'
      });
      return res.data;
    } catch (error) {
      logger.error(`Error getting file metadata: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Upload an artifact, test report, or screenshot to Google Drive
   */
  async uploadFile(fileName: string, filePath: string, mimeType = 'application/octet-stream', folderId?: string): Promise<string | null> {
    if (!this.isInitialized || !this.drive) {
      await this.initialize();
    }
    if (!this.drive) return null;

    try {
      const fileMetadata: drive_v3.Schema$File = {
        name: fileName,
        parents: folderId ? [folderId] : undefined
      };

      const media = {
        mimeType,
        body: fs.createReadStream(filePath)
      };

      const res = await this.drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id, name, webViewLink'
      });

      logger.info(`File uploaded to Google Drive: ${fileName} (ID: ${res.data.id})`);
      return res.data.id || null;
    } catch (error) {
      logger.error(`Failed to upload file to Google Drive: ${(error as Error).message}`);
      return null;
    }
  }
}
