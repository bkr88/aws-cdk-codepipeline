import { AwsCdkCodepipelineStack } from '../aws-cdk-codepipeline-stack';
import { Role, CompositePrincipal, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';

export const createRole = (
  ref: AwsCdkCodepipelineStack,
  {
    roleName,
    description,
    managedPolicy,
  }: {
    roleName: string;
    description: string;
    managedPolicy: string;
  }
): Role => {
  const role = new Role(ref, 'role', {
    roleName,
    description,
    assumedBy: new CompositePrincipal(
      new ServicePrincipal('cloudformation.amazonaws.com'),
      new ServicePrincipal('codebuild.amazonaws.com'),
      new ServicePrincipal('codepipeline.amazonaws.com')
    ),
  });

  role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName(managedPolicy));

  return role;
};
