import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Backed by any S3-compatible bucket (Cloudflare R2, AWS S3, etc). Uploads used to go to
// local disk, which doesn't survive a redeploy and isn't visible across separate services
// (admin vs public) once each runs in its own container.
function getClient(): S3Client {
  const endpoint = process.env["S3_ENDPOINT"];
  const accessKeyId = process.env["S3_ACCESS_KEY_ID"];
  const secretAccessKey = process.env["S3_SECRET_ACCESS_KEY"];
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Object storage is not configured. Set S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY.");
  }
  return new S3Client({
    endpoint,
    region: process.env["S3_REGION"] ?? "auto",
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function uploadPublicFile(key: string, body: Buffer, contentType: string): Promise<string> {
  const bucket = process.env["S3_BUCKET"];
  const publicUrlBase = process.env["S3_PUBLIC_URL_BASE"];
  if (!bucket || !publicUrlBase) {
    throw new Error("Object storage is not configured. Set S3_BUCKET, S3_PUBLIC_URL_BASE.");
  }

  await getClient().send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));

  return `${publicUrlBase.replace(/\/$/, "")}/${key}`;
}
