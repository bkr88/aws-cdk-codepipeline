import { Artifact } from 'aws-cdk-lib/aws-codepipeline';
import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';

import {
  generateBuildAction,
  generateDeploymentAction,
  generateSourceAction,
} from './utils/create-action';
import { buildSpec } from './utils/build-spec';
import { createKey } from './utils/create-kms';
import { createPipeline } from './utils/create-pipeline';
import { createRole } from './utils/create-role';
import { createS3 } from './utils/create-s3';
import { generateNotificationRules, generateNotifications } from './utils/notifications';
import { getGithubToken } from './utils/get-github-token';
import { IAwsCdkCodepipelineStackProps } from '../bin/stack-config-types';

export class AwsCdkCodepipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: IAwsCdkCodepipelineStackProps) {
    super(scope, id, props);

    /** IAM Role used by Codepipeline and assumed by related components */
    const role = createRole(this, props.role);

    /** KMS Key used for S3 bucket in Codepipeline */
    const key = createKey(this, props.keyDescription, role);

    /** Github Token */
    const githubToken = getGithubToken(this, role, props.github.tokenSecretName);

    /** Codepipeline Artifacts and S3 bucket used in Codepipeline */
    const artifactBucket = createS3(this, key, role, props.bucketName);
    const source = new Artifact();
    const templateOutput = new Artifact('templateOutput');
    const lambdaOutput = new Artifact('lambdaOutput');

    /** Codebuild for building template and lambda code */
    const buildTemplate = buildSpec(
      this,
      role,
      key,
      props.codebuild.templateProject,
      [`npx cdk synth ${props.codebuild.targetStack} -o dist`],
      'dist',
      [`${props.codebuild.targetStack}.template.json`]
    );

    const buildLambda = buildSpec(
      this,
      role,
      key,
      props.codebuild.lambdaProject,
      ['npm run test'],
      'dist/src',
      [props.codebuild.targetLambda]
    );

    /** Codepipeline Actions */
    const sourceAction = generateSourceAction(
      source,
      githubToken,
      props.github.owner,
      props.github.repo,
      props.github.branch
    );

    const buildAction = generateBuildAction(
      'Building_Template',
      buildTemplate,
      templateOutput,
      role,
      source
    );

    const buildLambdaAction = generateBuildAction(
      'Building_Lambda',
      buildLambda,
      lambdaOutput,
      role,
      source
    );

    const deployAction = generateDeploymentAction(
      role,
      templateOutput,
      lambdaOutput,
      props.codebuild.targetStack
    );

    /** Codepipeline */
    createPipeline(
      this,
      role,
      artifactBucket,
      props.pipelineName,
      [sourceAction],
      [buildAction, buildLambdaAction],
      [deployAction]
    );

    /** Notifications */
    const topic = generateNotifications(this, role, props.topic.name, props.topic.subEmails);

    generateNotificationRules(this, topic, [
      { source: buildTemplate, name: 'template' },
      { source: buildLambda, name: 'lambda' },
    ]);
  }
}
