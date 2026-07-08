/**
 * Scheduler
 * This scheduler will manage cron jobs for the worker
 * Implementation will be added in future phases
 */

import cron from 'node-cron';

export class Scheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  start() {
    console.log('Starting scheduler...');
    
    // TODO: Add scheduled jobs
    // Example: Run match processing every 30 seconds
    // const matchJob = cron.schedule('*/30 * * * * *', () => {
    //   matchProcessingJob.execute();
    // });
    // this.jobs.set('match-processing', matchJob);
    
    console.log('Scheduler started');
  }

  stop() {
    console.log('Stopping scheduler...');
    this.jobs.forEach((job) => job.stop());
    this.jobs.clear();
    console.log('Scheduler stopped');
  }
}

export const scheduler = new Scheduler();
