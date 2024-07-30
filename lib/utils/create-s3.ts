import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Key } from 'aws-cdk-lib/aws-kms';
import { RemovalPolicy } from 'aws-cdk-lib';
import { Role } from 'aws-cdk-lib/aws-iam';

import { AwsCdkCodepipelineStack } from '../aws-cdk-codepipeline-stack';

export const createS3 = (
  ref: AwsCdkCodepipelineStack,
  key: Key,
  role: Role,
  bucketName: string
) => {
  const artifactBucket = new Bucket(ref, 'bucket', {
    bucketName,
    encryptionKey: key,
    encryption: BucketEncryption.KMS,
    removalPolicy: RemovalPolicy.DESTROY,
    autoDeleteObjects: true,
  });

  artifactBucket.grantReadWrite(role);

  return artifactBucket;
};
