import { Request, Response, NextFunction } from 'express';
import { config } from '../../config/config';
import * as Client from '../../models/client';
import { ErrorCodes } from '../../models/models';
import * as logger from '../../models/logs';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let JWT_KEY = "9H16wS8ssMhetbP1hAwR";

/**
 * Function check imail is valid or not 
 * If it is valid return true otherwise return false
 */
async function ValidateEmail(email) {
   const mailformat =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
   if (email.match(mailformat)) {
      return true;
   } else {
      return false;
   }
}

/**
 * data is bcrypt 
 */
async function hashData(data) {
   const hash = bcrypt.hashSync(data, 10);
   return hash;
}
/**
 * Find client details by using ID
 * If client is find then get details of client and genrate token
 * Then store in db and send token to client as response
 */
async function compareAndGenerate(
   id,
   key,
   req: Request | any,
   res: Response,
   next: NextFunction
) {
   Client.confirmDetails(id, async (err: Error, data: any) => {
      if (err) {
         req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1009],
         };
         logger.error(logger.LogModule.ROUTE, req.txId, "Error in confirm details = " + err);
         next();
         return;
      }
      let resp = await bcrypt.compare(key, data.secretKey);
      if (resp) {
         const token = await jwt.sign(
            { _id: data._id, name: data.name, email: data.email },
            JWT_KEY,
            { expiresIn: '28d' } // 28 days
         );

         Client.updateTokenData(id, token, (err: Error, data: any) => {
            if (err) {
               req.apiStatus = {
                  isSuccess: false,
                  error: ErrorCodes[1009],
               };
               logger.error(logger.LogModule.ROUTE, req.txId, "Error in update token data = " + err);
               next();
               return;
            } else {
               req.apiStatus = {
                  isSuccess: true,
                  data: token,
               };
               logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "Client token retrieved");
               next();
               return;
            }
         });
      } else {
         req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1009],
         };
         logger.error(logger.LogModule.ROUTE, null, "Error in compare and genrate function = " + "Missing information");
         next();
         return;
      }
   });
}

/**
 * Get all clients details
 */
export function getAllClients(
   req: Request | any,
   res: Response,
   next: NextFunction
) {
   try {
      Client.getAllClients((err: Error, data: any) => {
         if (err) {
            req.apiStatus = {
               isSuccess: false,
               error: ErrorCodes[1003],
               data: err,
            };
            logger.error(logger.LogModule.ROUTE, req.txId, "Error in get all clients = " + err);
            next();
            return;
         }

         if (data.length === 0) {
            req.apiStatus = {
               isSuccess: false,
               error: ErrorCodes[1003],
            };
            logger.error(logger.LogModule.ROUTE, null, "Error in get all client = " + "client not find");
            next();
            return;
         } else {
            req.apiStatus = {
               isSuccess: true,
               data,
            };
            logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "Clients details retrieved");
            next();
         }
      });
   } catch (error) {
      req.apiStatus = {
         isSuccess: false,
         error: ErrorCodes[1102],
      };
      logger.error(logger.LogModule.ROUTE, null, "Error in get all clients = " + error);
      next();
      return;
   }
}

/**
 * Get perticuler client details using Id(mongoId)
 * If client is find then send response to user
 */
export function getClient(
   req: Request | any,
   res: Response,
   next: NextFunction
) {
   try {
      const id: any = req.params.id;

      Client.getClientById(id, (err: Error, data: any) => {
         if (err) {
            req.apiStatus = {
               isSuccess: false,
               error: ErrorCodes[1003],
               data: err,
            };
            logger.error(logger.LogModule.ROUTE, req.txId, "Error in get client = " + err);
            next();
            return;
         }

         if (data === null) {
            req.apiStatus = {
               isSuccess: false,
               error: ErrorCodes[1003],
               data: err,
            };
            logger.error(logger.LogModule.ROUTE, req.txId, "Error = " + err);
            next();
            return;
         } else {
            req.apiStatus = {
               isSuccess: true,
               data,
            };
            logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "client details retrieved");
            next();
         }
      });
   } catch (error) {
      req.apiStatus = {
         isSuccess: false,
         error: ErrorCodes[1102],
      };
      logger.error(logger.LogModule.ROUTE, null, "Error in get client details = " + error);
      next();
      return;
   }
}

/**
 * Check clientId and and email
 * Find clientId and email is present or not in db
 * If it is present then we can not add user
 * If it not present in db then add
 */
async function insertData(
   req: Request | any,
   res: Response,
   next: NextFunction
) {
   let ClientObj = {};
   const { name, email, clientId, secretKey } = req.body;

   let checkEmail = await ValidateEmail(email);
   if (!checkEmail) {
      req.apiStatus = {
         isSuccess: false,
         error: ErrorCodes[1009],
      };
      logger.error(logger.LogModule.ROUTE, null, "Error in insert data = " + "email is invalid !");
      next();
      return;
   }

   let hashedSecretKey = await hashData(secretKey);

   ClientObj = {
      name,
      email,
      clientId,
      secretKey: hashedSecretKey,
   };

   Client.addClientData(ClientObj, (err: Error, data: any) => {
      if (err) {
         req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1003],
            data: err,
         };
         logger.error(logger.LogModule.ROUTE, req.txid, "Error in insert data = " + err);
         next();
         return;
      }

      req.apiStatus = {
         isSuccess: true,
         data,
      };
      logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "client added");
      next();
   });
}
/**
 * Add new client details
 * Find clientId and email is present or not in db
 * If it is present then we can not add user
 * If it not present in db then add
 */
export async function addClient(
   req: Request | any,
   res: Response,
   next: NextFunction
) {
   try {
      const { email, clientId } = req.body;

      Client.insertioncheckQuery(
         { $or: [{ clientId }, { email }] },
         (err: Error, data: any) => {
            if (err) {
               req.apiStatus = {
                  isSuccess: false,
                  error: ErrorCodes[1003],
                  data: err,
               };
               logger.error(logger.LogModule.ROUTE, req.txId, "Error add client = " + err);
               next();
               return;
            }

            if (data) {
               req.apiStatus = {
                  isSuccess: false,
                  error: ErrorCodes[1008],
                  data: err,
               };
               logger.error(logger.LogModule.ROUTE, req.txId, "Error in add client = " + err);
               next();
               return;
            } else {
               insertData(req, res, next);
            }
         }
      );
   } catch (error) {
      req.apiStatus = {
         isSuccess: false,
         error: ErrorCodes[1102],
      };
      logger.error(logger.LogModule.ROUTE, null, "Error in add client data = " + error);
      next();
      return;
   }
}

/**
 * Check client email and client Id is alredy taken or no
 * If not then update client details and send as response
 */
async function updateData(
   req: Request | any,
   res: Response,
   next: NextFunction
) {
   let ClientObj = {};
   const { id, name, email, clientId, secretKey } = req.body;

   let checkEmail = await ValidateEmail(email);
   if (!checkEmail) {
      req.apiStatus = {
         isSuccess: false,
         error: ErrorCodes[1009],
      };
      logger.error(logger.LogModule.ROUTE, null, "Error update data = " + "email is invalid!");
      next();
      return;
   }

   let hashedSecretKey: any;
   secretKey !== undefined ? (hashedSecretKey = await hashData(secretKey)) : '';

   ClientObj =
      secretKey !== undefined
         ? {
              name,
              email,
              clientId,
              secretKey: hashedSecretKey,
           }
         : {
              name,
              email,
              clientId,
           };

   Client.updateClientData(id, ClientObj, (err: Error, data: any) => {
      if (err) {
         req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1007],
            data: err,
         };
         logger.error(logger.LogModule.ROUTE, req.txId, "Error in update client data = " + err);
         next();
         return;
      }

      if (data.nModified > 0) {
         req.apiStatus = {
            isSuccess: true,
         };
         logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "client details updated");
         next();
      } else {
         req.apiStatus = {
            isSuccess: true,
            message: 'No changes Recorded',
         };
         logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "client details updated");
         next();
      }
   });
}

/**
 * update client details
 * Check client has already email taken or not
 * Check client has alredy clientId taken or not
 * If it is taken then send already taken as error
 * Otherwise update client information
 */
export async function updateClient(
   req: Request | any,
   res: Response,
   next: NextFunction
) {
   try {
      const { id, email, clientId } = req.body;

      Client.updateEmailCheck(email, (err, data) => {
         if (data && data.id !== id) {
            req.apiStatus = {
               isSuccess: false,
               error: ErrorCodes[1005],
               message: 'Email already taken',
            };
            logger.error(logger.LogModule.ROUTE, req.txId, "Error = " + "email already taken");
            next();
            return;
         } else {
            Client.updateClientIdCheck(clientId, (err, data) => {
               if (data && data.id !== id) {
                  req.apiStatus = {
                     isSuccess: false,
                     error: ErrorCodes[1005],
                     message: 'ClientId already taken',
                  };
                  logger.error(logger.LogModule.ROUTE, req.txId, "Error in update client id check = " + "client id already taken");
                  next();
                  return;
               } else {
                  updateData(req, res, next);
               }
            });
         }
      });
   } catch (error) {
      req.apiStatus = {
         isSuccess: false,
         error: ErrorCodes[1102],
      };
      logger.error(logger.LogModule.ROUTE, null, "Error in update client= " + error);
      next();
      return;
   }
}

/**
 * Delete client from db
 * Find perticuler client using Id 
 * If client is find then remove that client 
 * Send response successfully deleted
 */
export async function deleteClient(
   req: Request | any,
   res: Response,
   next: NextFunction
) {
   try {
      const { id } = req.body;

      Client.deleteClientData(id, (err: Error, data: any) => {
         if (err) {
            req.apiStatus = {
               isSuccess: false,
               error: ErrorCodes[1005],
               data: err,
            };
            logger.error(logger.LogModule.ROUTE, req.txId, "Error in delete client = " + err);
            next();
            return;
         }

         if (data.deletedCount > 0) {
            req.apiStatus = {
               isSuccess: true,
            };
            logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "client deleted");
            next();
         } else {
            req.apiStatus = {
               isSuccess: true,
               message: 'No changes Recorded',
            };
            logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "No record change");
            next();
         }
      });
   } catch (error) {
      req.apiStatus = {
         isSuccess: false,
         error: ErrorCodes[1102],
      };
      logger.error(logger.LogModule.ROUTE, null, "Error in delete client = " + error);
      next();
      return;
   }
}

/**
 * Get Token by using clint Id and secretKey 
 * Find perticuler client details by using clientId
 * If client is find and secrete key match then
 * Get token from client details and send as a response
 */
export async function getToken(
   req: Request | any,
   res: Response,
   next: NextFunction
) {
   try {
      const { clientId, secretKey } = req.body;

      Client.getClientById(clientId, async (err: Error, data: any) => {
         if (err) {
            req.apiStatus = {
               isSuccess: false,
               error: ErrorCodes[1003],
               data: err,
            };
            logger.error(logger.LogModule.ROUTE, req.txId, "Error in get client by Id = " + err);
            next();
            return;
         }

         if (data === null) {
            req.apiStatus = {
               isSuccess: false,
               error: ErrorCodes[1003],
               data: err,
            };
            logger.error(logger.LogModule.ROUTE, req.txId, "Error in get token  = " + err);
            next();
            return;
         } else {
            await compareAndGenerate(clientId, secretKey, req, res, next);
         }
      });
   } catch (error) {
      req.apiStatus = {
         isSuccess: false,
         error: ErrorCodes[1102],
      };
      logger.error(logger.LogModule.ROUTE, null, "Error in get token = " + error);
      next();
      return;
   }
}

/**
 * Verify token
 * When load whiteboard that time it check client details
 * If client details find by Id  then check token is expired or not
 * If expired then send response token has been expired
 * Otherwise send clent details as response
 */
export async function verifyToken(
   req: Request | any,
   res: Response,
   next: NextFunction
) {
   try {
      const bearerHeader = req.headers['authorization'];

      if (typeof bearerHeader !== 'undefined') {
         const bearar = bearerHeader.split(' ');
         const beararToken = bearar[1];
         jwt.verify(beararToken, JWT_KEY, (err, data) => {
            if (err) {
               req.apiStatus = {
                  isSuccess: false,
                  error: ErrorCodes[1101],
                  data: 'token has been expired!',
               };
               logger.error(logger.LogModule.ROUTE, null, "Error in verify token = " + "toekn has been expired");
               next();
               return;
            }
            Client.getIdDetails(data._id, async (err: Error, data: any) => {
               if (err) {
                  req.apiStatus = {
                     isSuccess: false,
                     error: ErrorCodes[1009],
                  };
                  logger.error(logger.LogModule.ROUTE, req.txId, "Error in getId details verify token = " + err);
                  next();
                  return;
               }
               req.apiStatus = {
                  isSuccess: true,
                  data,
               };
               logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "client retrieved");
               next();
               return;
            });
         });
      } else {
         req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1101],
            data: 'token not provided',
         };
         logger.error(logger.LogModule.ROUTE, null, "Error verify token = " + "token not provide");
         next();
         return;
      }
   } catch (error) {
      console.log(error);

      req.apiStatus = {
         isSuccess: false,
         error: ErrorCodes[1102],
      };
      logger.error(logger.LogModule.ROUTE, null, "Error in verify token = " + error);
      next();
      return;
   }
}
