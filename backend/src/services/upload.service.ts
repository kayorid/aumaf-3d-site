import { randomUUID } from 'node:crypto'
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3 } from '../lib/s3-client'
import { env } from '../config/env'
import { logger } from '../config/logger'
import type { PresignInput, PresignOutput } from '@aumaf/shared'

const BUCKET = env.S3_BUCKET
const PRESIGN_EXPIRES = 900 // 15 min

export async function ensureBucket(): Promise<void> {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET }))
    logger.info({ bucket: BUCKET }, 'MinIO bucket ready')
  } catch {
    logger.info({ bucket: BUCKET }, 'Creating MinIO bucket')
    await s3.send(new CreateBucketCommand({ Bucket: BUCKET }))

    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET}/*`],
        },
      ],
    }
    try {
      await s3.send(new PutBucketPolicyCommand({ Bucket: BUCKET, Policy: JSON.stringify(policy) }))
      logger.info({ bucket: BUCKET }, 'Public read policy applied')
    } catch (err) {
      logger.warn({ err }, 'Could not apply public read policy — uploads may not be publicly accessible')
    }
  }
}

function safeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.\-_]/g, '')
    .slice(-80)
}

export async function presignUpload(input: PresignInput): Promise<PresignOutput> {
  const id = randomUUID()
  const key = `posts/${id}-${safeFilename(input.filename)}`

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: input.contentType,
    ContentLength: input.size,
  })

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: PRESIGN_EXPIRES })
  const publicUrl = `${env.S3_PUBLIC_URL}/${BUCKET}/${key}`

  return {
    uploadUrl,
    publicUrl,
    key,
    expiresIn: PRESIGN_EXPIRES,
  }
}
