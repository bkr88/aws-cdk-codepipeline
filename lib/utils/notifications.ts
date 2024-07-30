import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { NotificationRule } from 'aws-cdk-lib/aws-codestarnotifications';
import { PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import { Role } from 'aws-cdk-lib/aws-iam';
import { Topic } from 'aws-cdk-lib/aws-sns';

import { AwsCdkCodepipelineStack } from '../aws-cdk-codepipeline-stack';

export const generateNotifications = (
  ref: AwsCdkCodepipelineStack,
  role: Role,
  topicName: string,
  emails: string[]
) => {
  const topic = new Topic(ref, 'topic', { topicName });

  topic.grantPublish(role);

  emails.map((email) => {
    const subscription = new EmailSubscription(email);

    topic.addSubscription(subscription);
  });

  return topic;
};

export const generateNotificationRules = (
  ref: AwsCdkCodepipelineStack,
  topic: Topic,
  projects: { source: PipelineProject; name: string }[]
) =>
  projects.forEach(
    (build) =>
      new NotificationRule(ref, `${build.name}-notifications`, {
        notificationRuleName: `${build.name}-notifications`,
        source: build.source,
        events: ['codebuild-project-build-state-succeeded', 'codebuild-project-build-state-failed'],
        targets: [topic],
      })
  );
