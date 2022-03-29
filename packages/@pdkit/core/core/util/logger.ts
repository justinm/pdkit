import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.cli(),
  defaultMeta: { service: "user-service" },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.Stream({ stream: process.stderr, level: "error" }),
    new winston.transports.Console({ level: process.env.LOG_LEVEL ?? "info" }),
  ],
});
