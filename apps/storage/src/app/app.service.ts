import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config'; // <-- FIX 1: Use 'import type'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Config from './config/s3.config';

@Injectable()
export class AppService {
  private readonly s3Client: S3Client;
  private readonly config: ConfigType<typeof s3Config>;

  constructor(
    @Inject(s3Config.KEY)
    config: ConfigType<typeof s3Config>,
  ) {
    this.config = config;

    const { endpoint, region, accessKeyId, secretAccessKey } = this.config;
    if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
      throw new InternalServerErrorException('Missing S3 configuration');
    }


    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async getPresignedUploadUrl(fileName: string) {
    if (!this.config.bucket) {
      throw new InternalServerErrorException('Missing S3 bucket configuration');
    }

    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: fileName,
    });

    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 300, // 5 minutes
    });

    return { uploadUrl: signedUrl };
  }
}