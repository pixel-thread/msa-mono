import { env } from '@src/env';
import { ContextStore } from '@src/shared/lib';
import { logger } from '@src/shared/logger';
import type { StorageProvider, UploadParams, UploadResult } from '@src/shared/types/storage';
import path from 'node:path';
import SftpClient from 'ssh2-sftp-client';

/** Returns the SFTP connection config from env vars. */
function getSftpConfig() {
  return {
    host: env.SFTP_HOST,
    port: env.SFTP_PORT,
    timeout: env.SFTP_TIMEOUT,
    username: env.SFTP_USERNAME,
    password: env.SFTP_PASSWORD,
    readyTimeout: env.SFTP_TIMEOUT,
  };
}

/** SFTP-backed storage provider. Requires SFTP_HOST, SFTP_USER, SFTP_PASSWORD env vars. */
export class SftpStorageProvider implements StorageProvider {
  /** Uploads a file buffer to the SFTP server, creating intermediate directories if needed. */
  async upload(params: UploadParams): Promise<UploadResult> {
    const userId = ContextStore.getByKey('userId');
    const associationId = ContextStore.getByKey('associationId');
    const traceId = ContextStore.getByKey('requestId');
    const sftp = new SftpClient('upload-client');
    const config = getSftpConfig();

    logger.debug(
      {
        host: config.host,
        port: config.port,
        username: config.username,
        readyTimeout: config.readyTimeout,
        traceId,
        userId,
        associationId,
      },
      '[Storage] SFTP connecting...',
    );

    try {
      await sftp.connect(config);
    } catch (error) {
      logger.error({ error, traceId, userId, associationId }, '[Storage] SFTP connection failed');
      await sftp.end().catch(() => {});
      throw error;
    }

    const key = `${params.folder}/${Date.now()}-${params.fileName}`;
    const remotePath = path.posix.join('/', env.SFTP_ROOT, env.STORAGE_BUCKET, key);
    const remoteDir = path.posix.dirname(remotePath);

    try {
      // Ensure the target directory exists — sftp.put() hangs if it doesn't
      await sftp.mkdir(remoteDir, true);

      logger.debug(
        { remotePath, traceId, userId, associationId },
        '[Storage] SFTP uploading file...',
      );
      await sftp.put(params.fileBuffer, remotePath);
      logger.debug(
        {
          remotePath,

          traceId,
          userId,
          associationId,
        },
        '[Storage] SFTP upload complete',
      );
    } catch (error) {
      logger.error({ error, remotePath }, '[Storage] SFTP upload failed');
      throw error;
    } finally {
      await sftp
        .end()
        .catch((error) =>
          logger.error(
            { error, traceId, userId, associationId },
            '[Storage] SFTP connection failed',
          ),
        );
    }

    const url = `${env.PUBLIC_STORAGE_URL}/${key}`;

    return {
      key,
      url,
    };
  }

  /** Removes a file from the SFTP server by its storage key. */
  async delete(fileKey: string) {
    const sftp = new SftpClient('delete-client');

    try {
      logger.debug({ fileKey }, '[Storage] SFTP deleting file...');
      await sftp.connect(getSftpConfig());
      await sftp.delete(path.posix.join('/', env.SFTP_ROOT, env.STORAGE_BUCKET, fileKey));
    } finally {
      await sftp.end().catch(() => {});
    }
  }

  /** Returns the public CDN URL for a stored file. */
  async getPublicUrl(fileKey: string) {
    return `${env.SFTP_HOST}${path.posix.join('/', env.SFTP_ROOT, env.STORAGE_BUCKET, fileKey)}`;
  }
}
