import { BuildSpec, LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import { Role } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';

import { AwsCdkCodepipelineStack } from '../aws-cdk-codepipeline-stack';

export const buildSpec = (
  ref: AwsCdkCodepipelineStack,
  role: Role,
  key: Key,
  name: string,
  commands: string[],
  dir: string,
  files: string[]
) =>
  new PipelineProject(ref, name, {
    projectName: name,
    role,
    encryptionKey: key,
    environment: { buildImage: LinuxBuildImage.STANDARD_7_0 },
    buildSpec: BuildSpec.fromObject({
      version: '0.2',
      phases: {
        install: {
          commands: ['npm ci'],
        },
        build: {
          commands: ['npm run build'],
        },
        post_build: {
          commands,
        },
      },
      artifacts: {
        'base-directory': dir,
        files,
      },
    }),
  });
