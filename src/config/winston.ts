import { createLogger, format, transports, LoggerOptions, Logger } from "winston";
import DailyRotateFile = require("winston-daily-rotate-file");
import { LogLevel, DEFAULT_MODULE } from "../models/logs";
import { config } from "./config";
// import winston = require("winston/lib/winston/config");
// import { Config } from "./config";
// let Config = new Config();

const transportOptions: any = [
  new DailyRotateFile({
    filename: "logs/" + config.serviceName.toLowerCase() + "_info-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "5m",
    maxFiles: "14d",
    level: "info", // info and below to rotate
  }),
  new DailyRotateFile({
    filename: "logs/" + config.serviceName.toLowerCase() + "_error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    json: false,
    zippedArchive: true,
    maxSize: "5m",
    maxFiles: "14d",
    level: "error", // error and below to rotate
  }),
  new DailyRotateFile({
    filename: "logs/" + config.serviceName.toLowerCase() + "_silly-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "5m",
    maxFiles: "1d",
    level: "silly", // silly and below to rotate
  }),
  new transports.Console({
    level: "silly",
  }),
];

const options = {
  format: format.combine(
    format.label({ label: DEFAULT_MODULE }),
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss.SSS",
    }),
    format.simple()
  ),
  transports: transportOptions,
};

let loggerMap: Map<string, Logger> = new Map<string, Logger>();

let winstonLog = function (label: string, level: LogLevel, txId: string | null, details: string) {
  let logVar: Logger;
  if (loggerMap.hasOwnProperty(label) || loggerMap.has(label)) {
    logVar = loggerMap.get(label) || createLogger(options);
  } else {
    logVar = newLogger(label);
    loggerMap.set(label, logVar);
  }

  switch (level) {
    case LogLevel.VERBOSE:
      logVar.verbose(txId + " - " + details);
      break;
    case LogLevel.DEBUG:
      logVar.debug(txId + " - " + details);
      break;
    case LogLevel.INFO:
      logVar.info(txId + " - " + details);
      break;
    case LogLevel.WARNING:
      logVar.warn(txId + " - " + details);
      break;
    case LogLevel.ERROR:
      logVar.error(txId + " - " + details);
      break;
  }
};

// let logger = createLogger(options);
let newLogger = function (label: string) {
  return createLogger({
    format: format.combine(
      format.label({ label: label }),
      format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss.SSS",
      }),
      format.simple()
    ),
    transports: transportOptions,
  });
};

//export { logger, newLogger };
export { winstonLog };
