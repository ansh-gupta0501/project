`Winston` logger setup, line by line. This logger is designed for logging structured messages to console and files with formatting, level-based routing, and environment-based output.

---

## 🔧 1. **Imports and Setup**

```js
import winston, { format } from "winston";
const { combine, timestamp, label, printf } = format;
```

* **`winston`**: Main logging library.
* **`format`**: Utility from `winston` for combining multiple log formatting options.
* **`combine`**: Composes multiple format functions.
* **`timestamp`**: Adds a timestamp to each log message.
* **`label`**: Adds a label (tag) to categorize logs.
* **`printf`**: Allows custom formatting of the log message.

---

## 🧱 2. **Custom Format Function**

```js
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});
```

This defines **how the log message will look**.

> 🧾 Example Output:

```
2025-07-13T14:15:03.589Z [right meow!] info: User created successfully
```

* **timestamp** → Time when the log was created
* **label** → Custom string label for context
* **level** → Log level like `info`, `error`, etc.
* **message** → The actual log message

---

## 🏗️ 3. **Create Logger Instance**

```js
const logger = winston.createLogger({
  level: 'info',
```

* Sets the **minimum logging level**.
* All logs from `info` and above (`info`, `warn`, `error`, etc.) will be recorded.
* Lower-priority logs like `debug` or `verbose` are ignored unless level is changed.

---

```js
  format: combine(
    label({ label: 'right meow!' }),
    timestamp(),
    myFormat
  ),
```

* Combines formatting steps:

  * Adds a label
  * Adds a timestamp
  * Applies your custom `myFormat` for final message output

---

```js
  defaultMeta: { service: 'user-service' },
```

* Adds static metadata to all log messages.
* Useful for identifying service/module in microservices.

---

## 📁 4. **Transports (Where to Send Logs)**

```js
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
```

* Logs of level **`error` and above** (i.e., only `error`) go to `error.log`.

```js
    new winston.transports.File({ filename: 'combined.log' }),
```

* Logs of level `info` and above (`info`, `warn`, `error`) go to `combined.log`.

So:

* If you call `logger.error()`, it logs to **both files**
* If you call `logger.info()`, it logs only to `combined.log`

---

## 🖥️ 5. **Console Logging for Development**

```js
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

* If the app is **not running in production**, also log to **console**.
* `simple()` format is like:

  ```
  info: Server started
  error: Something failed
  ```

This avoids cluttering console in production but provides visibility during development.

---

## 📤 6. **Export Logger**

```js
export default logger;
```

* Allows you to import and use the logger in other files:

  ```js
  import logger from './logger.js';
  logger.info("User created");
  logger.error("DB connection failed");
  ```

---

## 🎯 Summary

| Feature             | Purpose                                             |
| ------------------- | --------------------------------------------------- |
| `combine(...)`      | Combines label, timestamp, and custom formatting    |
| `level: 'info'`     | Only logs messages with level `info` and above      |
| `defaultMeta`       | Adds metadata (`service: user-service`) to each log |
| `error.log`         | Logs only errors                                    |
| `combined.log`      | Logs all info and higher level messages             |
| `Console transport` | Used only in development (not in `production`)      |
| `myFormat`          | Custom format to shape log message output           |

---



## 🚦 1. **What Are Log Levels?**

Log levels represent **the severity or importance of the message**. Winston (by default) follows the **npm logging levels** which are numeric, where **lower numbers mean higher priority**.

---

## 📊 2. **Winston Default Levels (npm levels)**

| Level     | Priority | Description                                                                |
| --------- | -------- | -------------------------------------------------------------------------- |
| `error`   | **0**    | Critical issue. App or request failed. Should always be logged.            |
| `warn`    | **1**    | Warning. Not critical, but something went wrong.                           |
| `info`    | **2**    | General operational info (e.g., user created, service started).            |
| `http`    | **3**    | HTTP requests logs (if manually logged).                                   |
| `verbose` | **4**    | More detailed info, usually for debugging.                                 |
| `debug`   | **5**    | Internal app state info, very detailed. Use during development.            |
| `silly`   | **6**    | Extremely detailed and least important. Mostly for fun or ultra-debugging. |

> Winston logs **only levels equal to or higher priority than the set level**.
> For example, if `level: 'info'`, it will log:

* ✅ `info`, `warn`, `error`
* ❌ `debug`, `silly`, `verbose`

---

## 📦 3. **Setting the Logger Level**

```js
const logger = winston.createLogger({
  level: 'info',
  ...
});
```

* This means: only log messages at level `info` (2) **and above**.

Want to capture everything? Set it to `'silly'`.

---

## 🧪 4. **Using the Levels in Code**

```js
logger.error("Something broke!");
logger.warn("Deprecated API called");
logger.info("User signed in");
logger.verbose("User details: {...}");
logger.debug("DB query executed");
logger.silly("Entered loop iteration");
```

---

## 🔁 5. **Custom Log Levels (optional)**

You can override the default levels:

```js
const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    success: 3,
    info: 4,
    debug: 5,
  },
  colors: {
    fatal: 'red',
    error: 'magenta',
    warn: 'yellow',
    success: 'green',
    info: 'blue',
    debug: 'gray',
  }
};

winston.addColors(customLevels.colors);

const logger = winston.createLogger({
  levels: customLevels.levels,
  level: 'info',
  ...
});
```

> Custom levels allow you to align logging with your own app logic or domain (like `success`, `fatal`, etc.).

---

## 🎨 6. **Color-Coded Logs (for Console)**

You can colorize logs using:

```js
format.combine(
  format.colorize(),
  format.simple()
)
```

This is useful during development to visually distinguish between log levels.

---

## ✅ Best Practices

* Use `error` for exceptions, failed DB queries, API failures.
* Use `warn` for soft failures (deprecated routes, retries).
* Use `info` for app startup, user actions, success logs.
* Use `debug`/`verbose` in development only.
* Avoid `silly` in production unless testing something specific.

---


# Advanced 
Yes! In **industry-level (production-grade)** projects, Winston is often extended and customized far beyond just basic file logging. Below is a list of **advanced and professional-level features** and techniques that are commonly used with Winston in real-world applications.

---

## 🔥 1. **Log File Rotation**

**Purpose:** Avoid giant log files that grow forever.

📦 **Library Used:** `winston-daily-rotate-file`

```bash
npm install winston-daily-rotate-file
```

✅ **Usage:**

```js
import winston from 'winston';
import 'winston-daily-rotate-file';

const transport = new winston.transports.DailyRotateFile({
  filename: 'logs/app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,       // compress old logs
  maxSize: '20m',
  maxFiles: '14d'            // keep logs for 14 days
});

const logger = winston.createLogger({
  transports: [ transport ]
});
```

---

## 📁 2. **Separate Logs by Level**

You can write different levels to different files.

```js
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/info.log', level: 'info' }),
    new winston.transports.File({ filename: 'logs/debug.log', level: 'debug' }),
  ]
});
```

---

## 🌐 3. **Logging to Remote Services**

Many companies push logs to centralized log management systems like:

| Tool             | How                                              | Winston Support         |
| ---------------- | ------------------------------------------------ | ----------------------- |
| 📦 Logstash      | via TCP or filebeat                              | ✅ with custom transport |
| 📦 Elasticsearch | JSON + custom transport                          | ✅                       |
| 📦 Datadog       | Agent or HTTP API                                | ✅                       |
| 📦 Loggly        | `winston-loggly-bulk`                            | ✅                       |
| 📦 Sentry        | Use `@sentry/node` for error tracking separately |                         |

✅ Example:

```bash
npm install winston-loggly-bulk
```

```js
require('winston-loggly-bulk');
logger.add(new winston.transports.Loggly({
  token: "your-loggly-token",
  subdomain: "your-subdomain",
  tags: ["Winston-NodeJS"],
  json: true
}));
```

---

## 🧪 4. **Error Handling (Uncaught Exceptions & Rejections)**

Catch errors and log them even if your app crashes.

```js
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'logs/error.log' })
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});
```

---

## 🔄 5. **Structured JSON Logging**

For production logging and parsing by tools like ELK, Datadog, etc.

```js
format: winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
)
```

Output:

```json
{
  "level": "info",
  "message": "User created",
  "timestamp": "2025-07-13T14:15:03.589Z"
}
```

---

## 🎨 6. **Colorized Console Output (Dev Mode)**

Use `format.colorize()` and `format.printf()` for nice logs in development:

```js
format: winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
)
```

---

## 🧱 7. **Custom Transports**

Winston allows you to create **custom transports** if none of the built-ins or plugins work.

```js
class MyCustomTransport extends winston.Transport {
  log(info, callback) {
    // send info to a custom API or database
    callback();
  }
}
```

---

## ⚙️ 8. **Environment-Based Logging**

Configure logging differently for `development`, `testing`, and `production`.

```js
const transports = [];

if (process.env.NODE_ENV === 'production') {
  transports.push(new winston.transports.File({ filename: 'logs/combined.log' }));
} else {
  transports.push(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

const logger = winston.createLogger({ transports });
```

---

## 🔍 9. **Log Context and Metadata**

You can attach metadata to every log:

```js
logger.info('User created', {
  userId: 123,
  ip: req.ip,
  role: 'admin'
});
```

This helps in tracing requests, debugging user actions, and analyzing patterns.

---

## 🧭 10. **Trace ID or Request ID Logging**

Used in microservices or request-based logging.

You attach a `request ID` to every log entry using middleware (like `express-winston` or `morgan`) and log it.

This helps in **correlating logs** across services.

---

## 🚀 TL;DR: What’s Used in Industry?

| Feature                           | Common in Industry |
| --------------------------------- | ------------------ |
| Log file rotation                 | ✅                  |
| Centralized logging (Loggly, ELK) | ✅                  |
| Environment-based output          | ✅                  |
| Structured JSON logs              | ✅                  |
| Uncaught exception/rejection logs | ✅                  |
| Request ID logging                | ✅                  |
| Metadata tagging                  | ✅                  |
| Debug/trace levels in dev only    | ✅                  |

---

Let me know if you want a complete production-level Winston setup file or want to integrate it with something like `Express`, `NestJS`, or a remote logging service.
