import { NextFunction, Response } from "express";
import * as logger from "../models/logs";
import uniqid from "uniqid";

/**
 *User send a request and payload
 *It  come first inside entry point 
 */
export function entryPoint(req: any, res: Response, next: NextFunction) {
  req.txId = generateTransactionId();
  logger.debug(
    logger.LogModule.ROUTE,
    req.txId,
    "entryPoint(" +
      req.txId +
      "): " +
      req.url +
      (req.body ? ", payload: present " : "")
  );
  next();
}

export function generateTransactionId() {
  return uniqid("tx");
}
