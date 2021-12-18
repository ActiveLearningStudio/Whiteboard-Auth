import express, { Request, Response, NextFunction } from "express";
const router = express.Router();
import { entryPoint } from "../../middlewares/entryPoint";
import { config } from "../../config/config";
import { exitPoint } from "../../middlewares/exitPoint";
import * as Client from "../../controllers/client";
import * as logger from "../../models/logs";

// Serve the client routes only in development mode..
logger.debug(
  "process.env.ENVIRONMENT",
  null,
  process.env.ENVIRONMENT || "not set"
);
if ("development" === process.env.ENVIRONMENT) {
  logger.debug("process.env.ENVIRONMENT", null, "inside");
  /**
   * User send get request for get all client details using /all_client route
   */
  router.get("/all_client", entryPoint, Client.getAllClients, exitPoint);

  /**
   * User send get request for get perticuler client details using /client/:id route
   */
  router.get("/client/:id", entryPoint, Client.getClient, exitPoint);

  /**
   * User send post request for add new client details using /add_client route
   */
  router.post("/add_client", entryPoint, Client.addClient, exitPoint);

  /**
   * User send put request for update exsting client details using /update_client route
   */
  router.put("/update_client", entryPoint, Client.updateClient, exitPoint);

  /**
   * User send delete request for delete perticuler client details using /delete_client route
   */
  router.delete("/delete_client", entryPoint, Client.deleteClient, exitPoint);
}
/**
 * User send post request for get token details using /get_token route
 */
router.post("/get_token", entryPoint, Client.getToken, exitPoint);
/**
 * User send post request for verify token using /verify_token route
 */
router.post("/verify_token", entryPoint, Client.verifyToken, exitPoint);

module.exports = router;
