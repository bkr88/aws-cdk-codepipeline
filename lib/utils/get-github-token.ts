import { Role } from 'aws-cdk-lib/aws-iam';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

import { AwsCdkCodepipelineStack } from '../aws-cdk-codepipeline-stack';

export const getGithubToken = (
  ref: AwsCdkCodepipelineStack,
  role: Role,
  tokenSecretName: string
) => {
  const githubToken = Secret.fromSecretNameV2(ref, 'githubSecret', tokenSecretName);

  githubToken.grantRead(role);

  return githubToken;
};
