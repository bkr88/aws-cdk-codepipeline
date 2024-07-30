import {
  CloudFormationCreateUpdateStackAction,
  CodeBuildAction,
  GitHubSourceAction,
  GitHubTrigger,
} from 'aws-cdk-lib/aws-codepipeline-actions';
import { Artifact } from 'aws-cdk-lib/aws-codepipeline';
import { IProject } from 'aws-cdk-lib/aws-codebuild';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import { Role } from 'aws-cdk-lib/aws-iam';
import { CfnCapabilities } from 'aws-cdk-lib';

export const generateSourceAction = (
  source: Artifact,
  githubToken: ISecret,
  owner: string,
  repo: string,
  branch: string
) =>
  new GitHubSourceAction({
    actionName: 'Checking_Out_Source_Code',
    output: source,
    owner,
    repo,
    branch,
    oauthToken: githubToken.secretValueFromJson('secret'),
    trigger: GitHubTrigger.WEBHOOK,
    runOrder: 1,
  });

export const generateBuildAction = (
  actionName: string,
  project: IProject,
  artifact: Artifact,
  role: Role,
  source: Artifact
) =>
  new CodeBuildAction({
    actionName,
    role,
    input: source,
    project,
    outputs: [artifact],
    runOrder: 2,
  });

export const generateDeploymentAction = (
  role: Role,
  templateOutput: Artifact,
  lambdaOutput: Artifact,
  stackName: string
) =>
  new CloudFormationCreateUpdateStackAction({
    actionName: 'Deploying_Stack',
    role,
    deploymentRole: role,
    adminPermissions: true,
    replaceOnFailure: true,
    stackName,
    templatePath: templateOutput.atPath(`${stackName}.template.json`),
    extraInputs: [lambdaOutput],
    cfnCapabilities: [CfnCapabilities.NAMED_IAM, CfnCapabilities.AUTO_EXPAND],
    parameterOverrides: {
      bucketName: lambdaOutput.bucketName,
      bucketKey: lambdaOutput.objectKey,
    },
    runOrder: 3,
  });
