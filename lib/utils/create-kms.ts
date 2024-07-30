import { Key } from 'aws-cdk-lib/aws-kms';
import { RemovalPolicy } from 'aws-cdk-lib';
import { Role } from 'aws-cdk-lib/aws-iam';

import { AwsCdkCodepipelineStack } from '../aws-cdk-codepipeline-stack';

export const createKey = (ref: AwsCdkCodepipelineStack, description: string, role: Role) => {
  const key = new Key(ref, 'key', {
    description,
    removalPolicy: RemovalPolicy.DESTROY,
  });

  key.grantEncryptDecrypt(role);

  return key;
};
