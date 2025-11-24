const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

class S3Service {
  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'news-marketplace';
    this.region = process.env.AWS_REGION || 'eu-north-1';

    // Use AWS default credential chain if environment variables are not set
    const credentials = (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      : undefined;

    this.client = new S3Client({
      region: this.region,
      credentials
    });
  }

  /**
   * Upload a file to S3
   * @param {Buffer|stream.Readable} fileBuffer - File buffer or readable stream
   * @param {string} key - S3 key (file path in bucket)
   * @param {string} contentType - MIME type of the file
   * @param {string} originalFilename - Original filename for metadata
   * @returns {Promise<string>} - S3 URL of uploaded file
   */
  async uploadFile(fileBuffer, key, contentType, originalFilename = '') {
    try {
      // Check if fileBuffer is provided
      if (!fileBuffer) {
        throw new Error('File buffer is not available');
      }

      let body = fileBuffer;

      if (contentType.startsWith('image/')) {
        // Convert stream to buffer if necessary
        let inputBuffer;
        if (fileBuffer instanceof Buffer) {
          inputBuffer = fileBuffer;
        } else if (fileBuffer && typeof fileBuffer[Symbol.asyncIterator] === 'function') {
          const chunks = [];
          for await (const chunk of fileBuffer) {
            chunks.push(chunk);
          }
          inputBuffer = Buffer.concat(chunks);
        } else {
          throw new Error('Invalid file buffer type for image processing');
        }

        // Get image metadata
        const metadata = await sharp(inputBuffer).metadata();

        // Optimization options
        let options = {};
        if (contentType === 'image/jpeg') {
          options.quality = 80;
        } else if (contentType === 'image/png') {
          options.compressionLevel = 6;
        }

        let scale = 1.0;
        let optimizedBuffer;
        let size;

        do {
          let sharpInstance = sharp(inputBuffer);

          if (scale < 1.0) {
            sharpInstance = sharpInstance.resize(Math.floor(metadata.width * scale), Math.floor(metadata.height * scale), { withoutEnlargement: true });
          }

          if (contentType === 'image/jpeg') {
            sharpInstance = sharpInstance.jpeg({ quality: options.quality });
          } else if (contentType === 'image/png') {
            sharpInstance = sharpInstance.png({ compressionLevel: options.compressionLevel });
          } else if (contentType === 'image/gif') {
            sharpInstance = sharpInstance.gif();
          }

          optimizedBuffer = await sharpInstance.toBuffer();
          size = optimizedBuffer.length;

          if (size <= 500 * 1024) break;

          // Reduce quality or compression
          if (contentType === 'image/jpeg' && options.quality > 10) {
            options.quality -= 10;
          } else if (contentType === 'image/png' && options.compressionLevel < 9) {
            options.compressionLevel += 1;
          } else {
            // Reduce scale
            scale *= 0.9;
            if (scale < 0.1) {
              // Too small, upload original
              optimizedBuffer = inputBuffer;
              break;
            }
          }
        } while (true);

        body = optimizedBuffer;
      }

      const params = {
        Bucket: this.bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
        Metadata: {
          originalFilename: originalFilename
        }
      };

      await this.client.send(new PutObjectCommand(params));
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * Upload a file from local path to S3
   * @param {string} localPath - Local file path
   * @param {string} key - S3 key (file path in bucket)
   * @param {string} contentType - MIME type of the file
   * @returns {Promise<string>} - S3 URL of uploaded file
   */
  async uploadFromLocalPath(localPath, key, contentType) {
    try {
      const fileStream = fs.createReadStream(localPath);
      const originalFilename = path.basename(localPath);

      return await this.uploadFile(fileStream, key, contentType, originalFilename);
    } catch (error) {
      console.error('S3 upload from local path error:', error);
      throw new Error(`Failed to upload file from local path to S3: ${error.message}`);
    }
  }

  /**
   * Delete a file from S3
   * @param {string} key - S3 key (file path in bucket)
   * @returns {Promise<boolean>} - Success status
   */
  async deleteFile(key) {
    try {
      if (!key) return true; // No key to delete

      const params = {
        Bucket: this.bucketName,
        Key: key
      };

      await this.client.send(new DeleteObjectCommand(params));
      return true;
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  /**
   * Extract S3 key from S3 URL
   * @param {string} s3Url - Full S3 URL
   * @returns {string|null} - S3 key or null if not found
   */
  extractKeyFromUrl(s3Url) {
    if (!s3Url) return null;

    try {
      const url = new URL(s3Url);
      // Remove the bucket name and leading slash from pathname
      const pathParts = url.pathname.split('/').filter(part => part);
      // Skip the bucket name (first part) and join the rest
      return pathParts.slice(1).join('/');
    } catch (error) {
      console.error('Error extracting key from S3 URL:', error);
      return null;
    }
  }

  /**
   * Generate a unique key for S3 upload
   * @param {string} folder - Folder name (e.g., 'websites', 'agencies')
   * @param {string} fieldName - Field name (e.g., 'bank_details')
   * @param {string} originalFilename - Original filename
   * @returns {string} - Unique S3 key
   */
  generateKey(folder, fieldName, originalFilename) {
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1E9);
    const extension = path.extname(originalFilename);
    return `${folder}/${fieldName}-${timestamp}-${randomSuffix}${extension}`;
  }

  /**
   * Get content type from file extension
   * @param {string} filename - Filename
   * @returns {string} - MIME type
   */
  getContentType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain'
    };

    return contentTypes[ext] || 'application/octet-stream';
  }
}

module.exports = new S3Service();