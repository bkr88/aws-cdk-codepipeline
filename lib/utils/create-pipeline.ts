import {
  CloudFormationCreateUpdateStackAction,
  CodeBuildAction,
  GitHubSourceAction,
} from 'aws-cdk-lib/aws-codepipeline-actions';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';

import { AwsCdkCodepipelineStack } from '../aws-cdk-codepipeline-stack';

export const createPipeline = (
  ref: AwsCdkCodepipelineStack,
  role: Role,
  artifactBucket: IBucket,
  pipelineName: string,
  sourceActions: GitHubSourceAction[],
  buildActions: CodeBuildAction[],
  deplotActions: CloudFormationCreateUpdateStackAction[]
) => {
  const pipeline = new Pipeline(ref, 'codepipeline', {
    pipelineName,
    role,
    artifactBucket,
    stages: [
      {
        stageName: 'Source',
        actions: sourceActions,
      },
      {
        stageName: 'Build',
        actions: buildActions,
      },
      {
        stageName: 'Deploy',
        actions: deplotActions,
      },
    ],
  });

  pipeline.addToRolePolicy(
    new PolicyStatement({
      actions: ['sts:AssumeRole'],
      resources: [role.roleArn],
    })
  );

  return pipeline;
};
