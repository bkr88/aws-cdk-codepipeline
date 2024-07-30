import { IAwsCdkCodepipelineStackProps } from './stack-config-types';

const environmentConfig: IAwsCdkCodepipelineStackProps = {
  tags: {
    Developer: 'Antal Bokor',
    Application: 'AwsCdkCodepipeline',
  },
  role: {
    roleName: 'codepipeline-role',
    description: 'IAM role for Codepipeline',
    managedPolicy: 'AdministratorAccess',
  },
  keyDescription: 'KMS key used by Codepipeline',
  github: {
    tokenSecretName: 'demo-github-token',
    owner: 'bkr88',
    repo: 'my-first-cdk',
    branch: 'codepipeline',
  },
  codebuild: {
    templateProject: 'BuildTemplate',
    lambdaProject: 'BuildLambda',
    targetStack: 'MyFirstCdkStack',
    targetLambda: 'index.js',
  },
  pipelineName: 'LambdaDeploymentPipeline',
  bucketName: 'bkr88-codepipeline-bucket',
  topic: {
    name: 'codepipeline-topic',
    subEmails: ['antalbokor@gmail.com'],
  },
};

export default environmentConfig;
