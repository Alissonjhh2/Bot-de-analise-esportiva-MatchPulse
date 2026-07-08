/**
 * Notification Job
 * This job will be responsible for sending notifications to users
 * Implementation will be added in future phases
 */

export class NotificationJob {
  async execute(userId: string, message: string) {
    // TODO: Implement notification sending logic
    console.log(`Notification job executed for user ${userId}: ${message}`);
  }
}

export const notificationJob = new NotificationJob();
