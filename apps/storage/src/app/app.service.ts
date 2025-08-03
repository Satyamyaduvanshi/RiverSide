import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class AppService {
 
  constructor(private readonly s3Client:S3Client){}
  
}
