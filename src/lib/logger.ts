type LoggerMeta = Record<string, unknown>;

function log(level: "info" | "warn" | "error", message: string, meta?: LoggerMeta): void {
  const payload = meta ? { message, ...meta } : { message };
  if (level === "info") {
    console.info(payload);
    return;
  }
  if (level === "warn") {
    console.warn(payload);
    return;
  }
  console.error(payload);
}

export const logger = {
  info(message: string, meta?: LoggerMeta): void {
    log("info", message, meta);
  },
  warn(message: string, meta?: LoggerMeta): void {
    log("warn", message, meta);
  },
  error(message: string, meta?: LoggerMeta): void {
    log("error", message, meta);
  },
};
