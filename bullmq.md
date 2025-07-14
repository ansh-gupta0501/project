# **What is BullMQ?**

**BullMQ** is a popular **Node.js** library for handling distributed jobs and messages using **Redis** as the backing store. It helps you build background job queues, scheduled tasks, rate-limiting, and more, in a reliable, scalable way.

---

# **Key Features of BullMQ:**

1. **Job Queues**
   You can create queues where producers add jobs and workers consume them asynchronously.

2. **Retries & Backoff Strategies**
   Automatic retry of failed jobs with customizable backoff delays (e.g., exponential backoff).

3. **Delayed & Scheduled Jobs**
   Schedule jobs to run after a delay or at a specific timestamp.

4. **Rate Limiting**
   Control how many jobs are processed per unit time.

5. **Job Priorities**
   Assign priorities so urgent jobs run first.

6. **Job Progress & Events**
   Track job progress and listen to events such as completed, failed, stalled.

7. **Concurrency & Workers**
   Run multiple workers in parallel for higher throughput.

8. **Repeatable Jobs**
   Jobs that run on a schedule (cron-like).

9. **Atomic Operations with Redis**
   Uses Redis transactions and Lua scripts to ensure reliability.

10. **Extensible & Scalable**
    Works in distributed environments and multiple node processes.

---

# **How Redis fits into BullMQ?**

BullMQ uses Redis as its data store. Redis stores:

* Job data (payload, status, timestamps)
* Queues (lists of jobs pending, active, delayed, completed)
* Locks (to prevent race conditions between workers)
* Rate limit and retry data

**Redis Connection**:
BullMQ needs to connect to a Redis server (local or remote). This is done by passing a Redis client configuration (`host`, `port`, `password`, etc.) when creating queues or workers.

Redis is the backbone that enables BullMQ to keep queues and jobs consistent, even if your Node.js app crashes or restarts.

---

# **Now, let's walk through your code step-by-step**

---

### 1. Redis Connection Configuration

```js
export const redisConnection = {
    username : process.env.REDIS_USERNAME, 
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
}
```

* You are creating a Redis connection config object by reading environment variables.
* This config will be used by BullMQ to connect to your Redis instance.
* Typical Redis connection info includes host, port, and authentication.

---

### 2. Default Queue Configuration

```js
export const defaultQueueConfig = {
    removeOnComplete : {
        count : 100,               // Keep max 100 completed jobs
        age : 60*60*24             // Remove jobs older than 1 day (in seconds)
    },
    attempts : 3,                  // Retry failed jobs up to 3 times
    backoff : {
        type : 'exponential',      // Retry delay increases exponentially
        delay : 1000               // 1 second delay between retries
    }
}
```

* This sets defaults for every job added to the queue.
* Jobs are removed from Redis after they are complete to save space, but only after keeping 100 or if older than 1 day.
* Failed jobs will retry automatically up to 3 times.
* The delay between retries increases exponentially starting from 1 second.

---

### 3. Import BullMQ and Configs

```js
import {Queue, Worker} from 'bullmq'
import { defaultQueueConfig, redisConnection } from '../config/queue.js'
import logger from '../config/logger.js';
import { sendEmail } from '../config/mailer.js';
```

* Importing `Queue` and `Worker` classes from BullMQ.
* Importing your Redis config and queue options.
* Logger for logging info and errors.
* `sendEmail` function is your custom email sending logic.

---

### 4. Defining Queue Name and Creating Queue Instance

```js
export const emailQueueName = 'email-queue'

export const emailQueue = new Queue(emailQueueName, {
    connection: redisConnection,
    defaultJobOptions: defaultQueueConfig
})
```

* `emailQueueName` is just a string identifying this queue.
* You create a new BullMQ `Queue` with this name.
* Pass the Redis connection config.
* Pass default job options for retries, removal, backoff.
* The `Queue` object allows you to **add jobs** to the queue.

---

### 5. Creating a Worker to Process Jobs

```js
export const handler = new Worker(
    emailQueueName,
    async (job) => {
       try {
         const data = job.data
         await Promise.all(
             data.map(item => sendEmail(item.toEmail, item.subject, item.body))
         );
       } catch (error) {
         console.log("error in sending email", error)
       }
    },
    {connection: redisConnection}
);
```

* You create a `Worker` that listens to the `emailQueueName` queue.
* For each job in the queue, the async function runs.
* The job’s `data` is expected to be an array of email info objects.
* It sends all emails **in parallel** using `Promise.all`.
* If sending fails, it catches and logs the error.
* The worker also needs the Redis connection config to connect and receive jobs.

---

### 6. Worker Event Listeners

```js
handler.on('completed', (job) => {
    logger.info({job: job, message: "job completed"})
    console.log(`The job ${job.id} is completed`);
});

handler.on('failed', (job) => {
    console.log(`The job ${job.id} is failed`);
});
```

* Listening to **events** on the worker.
* When a job completes, you log success.
* When a job fails, you log failure.
* You can also add listeners for other events like `stalled`, `progress`, etc.

---

# **Summary of What Happens When You Use This Setup**

1. Somewhere in your app, you add jobs to `emailQueue`:

```js
await emailQueue.add('sendEmails', emailsDataArray);
```

2. BullMQ stores the job data in Redis.

3. Your `handler` worker listens for new jobs on Redis.

4. When a job is available, the worker picks it up, runs your async email sending logic.

5. If the job completes, it emits `completed` event; if fails, it retries or emits `failed`.

6. Jobs get removed after completion based on `removeOnComplete` config.

---

# **Additional BullMQ Concepts You Can Use**

* **Job Priorities:** You can assign priority to jobs for urgent processing.
* **Delayed Jobs:** Schedule jobs to run after a delay (useful for reminders, retries).
* **Repeatable Jobs:** Jobs that run periodically, like cron jobs.
* **Rate Limiting:** Limit how many jobs your worker processes per second/minute.
* **Job Progress:** Workers can update job progress to track long-running jobs.
* **Multi-worker setups:** You can run multiple workers to scale out processing.
* **Queue Events:** You can listen for global events at the queue level.
* **Job Dependencies:** Make jobs dependent on others (advanced workflows).

---

# **How Redis Connection is Established in BullMQ**

* BullMQ uses the `ioredis` client under the hood.
* When you pass the config (`host`, `port`, `username`, `password`), BullMQ creates Redis clients.
* These clients handle job storage, locking, and all queue operations atomically.
* You can also pass a custom Redis client instance if you want more control.
---

---

# Sending the Same Email to Multiple Users

Right now, your worker expects `job.data` to be an array of email objects, each with individual info like `toEmail`, `subject`, and `body`.

```js
await Promise.all(
    data.map(item => sendEmail(item.toEmail, item.subject, item.body))
);
```

## How to Send the Same Email Content to Multiple Users?

You have two main approaches:

### Option A: Pass the Same Email Content Once, with a List of Recipients

```js
// job.data = {
//   recipients: ['user1@example.com', 'user2@example.com'],
//   subject: 'Hello',
//   body: 'Welcome to our service'
// }

const { recipients, subject, body } = job.data;

await Promise.all(
    recipients.map(email => sendEmail(email, subject, body))
);
```

This way you send the same email to multiple users efficiently.

### Option B: Add Separate Jobs, One per User/Email

Instead of sending a batch of emails in one job, add many jobs each with single recipient info.

```js
for (const userEmail of usersList) {
  await emailQueue.add('sendEmailJob', {
    toEmail: userEmail,
    subject: 'Hello',
    body: 'Welcome to our service'
  });
}
```

This lets BullMQ handle each email individually with retries, failures, etc.

## Multiple Queues and Workers

### Can You Have Multiple Queues?

Yes! You can create multiple queues for different purposes.

For example:

```js
export const emailQueue = new Queue('email-queue', { connection: redisConnection });
export const smsQueue = new Queue('sms-queue', { connection: redisConnection });
export const pushNotificationQueue = new Queue('push-notif-queue', { connection: redisConnection });
```

### What About Workers?

Typically, you create one worker per queue, so it knows how to process that queue's jobs.

If you want to scale processing power for one queue, you can run multiple worker instances for the same queue (even in different processes or servers).

But for different queues (e.g., email and SMS), you need separate workers each listening to their specific queue.

Example:

```js
const emailWorker = new Worker('email-queue', emailJobProcessor, { connection: redisConnection });
const smsWorker = new Worker('sms-queue', smsJobProcessor, { connection: redisConnection });
```
