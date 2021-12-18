import { Document, Schema, Model, model, Mongoose } from 'mongoose';
import path from 'path';

export interface IClient {
   name: string;
   email: string;
   clientId: string;
   secretKey: string;
   token: string;
}

export interface IClientModel extends IClient, Document {}

export const ClientSchema: Schema = new Schema(
   {
      name: String,
      email: { type: String },
      clientId: { type: String },
      secretKey: String,
      token: { type: String, default: null },
   },
   {
      usePushEach: true,
      bufferCommands: false,
      versionKey: false,
   }
);

ClientSchema.set('toObject', { virtuals: true });
ClientSchema.set('toJSON', { virtuals: true });

export const ClientModal: Model<IClientModel> = model<IClientModel>(
   'Client',
   ClientSchema,
   'auth0-tenant'
);

/**
 * Check email is present in collection or not
 * If present then send as response data
 * Otherwise send error
 */
export var updateEmailCheck = function (email: any, cb: Function) {
   ClientModal.findOne({ email }, function (err, data) {
      cb(err, data);
   });
};

/**
 * Check clientId is present in collection or not
 * If present then send  response as client details
 * Otherwise send error
 */
export var updateClientIdCheck = function (clientId: any, cb: Function) {
   ClientModal.findOne({ clientId }, function (err, data) {
      cb(err, data);
   });
};

/**
 * Check email or clientId is present in collection or not
 * If present then send response as cleint details
 * Otherwise send error
 */
export var insertioncheckQuery = function (query: object, cb: Function) {
   ClientModal.findOne(query, function (err, data) {
      cb(err, data);
   });
};

/**
 * Check email or clientId is present in collection or not
 * If present then send  response as data
 * Otherwise send error
 */
export var updationcheckQuery = function (query: object, cb: Function) {
   ClientModal.findOne(query, function (err, data) {
      cb(err, data);
   });
};
/**
 * Get all clients details
 */
export var getAllClients = function (cb: Function) {
   ClientModal.find({}, function (err, data) {
      cb(err, data);
   });
};
/**
 * Get perticuler client details by using clientId
 * If present then send response as client details
 * Otherwise send error
 */
export var getClientById = function (id: any, cb: Function) {
   ClientModal.findOne({ clientId: id }, function (err, data) {
      cb(err, data);
   });
};
/**
 * Get perticuler client details by using Id
 * If present then send response as client details
 * Otherwise send error
 */
export var getIdDetails = function (id: any, cb: Function) {
   ClientModal.findOne({ _id: id }, function (err, data) {
      cb(err, data);
   });
};

/**
 * Add new client details into collection
 */
export var addClientData = async function (data: any, cb: Function) {
   const user = new ClientModal(data);
   user.save((err, data) => {
      cb(err, data);
   });
};
/**
 * Update client details
 * Find client by Id
 * If client details is find then add new updated details and update client collection
* Send response as client details 
*/
// update Client
export var updateClientData = async function (
   id: any,
   data: any,
   cb: Function
) {
   data.secretKey !== undefined
      ? await ClientModal.updateOne(
           { _id: id },
           {
              $set: {
                 name: data.name,
                 email: data.email,
                 clientId: data.clientId,
                 secretKey: data.secretKey,
              },
           },
           { upsert: false },
           (err, data) => {
              cb(err, data);
           }
        )
      : await ClientModal.updateOne(
           { _id: id },
           {
              $set: {
                 name: data.name,
                 email: data.email,
                 clientId: data.clientId,
              },
           },
           { upsert: false },
           (err, data) => {
              cb(err, data);
           }
        );
};

/**
 * Update token
 * Find client by Id
 * If client details is find then add  updated toekn details and update client collection
*  Send response as client details 
*/
// update token
export var updateTokenData = async function (id: any, data: any, cb: Function) {
   await ClientModal.updateOne(
      { clientId: id },
      {
         $set: {
            token: data,
         },
      },
      { upsert: false },
      (err, data) => {
         cb(err, data);
      }
   );
};
/**
 * Delete client details
 * Find client by Id
 * If client details is find then remove details from client collection
 */
// delete Client
export var deleteClientData = async function (id: any, cb: Function) {
   await ClientModal.remove({ _id: id }, { upsert: false }, (err, data) => {
      cb(err, data);
   });
};

/**
 * confirm client details
 * Find client by Id
 * If client details is find and match 
 * Send response as client details
 */
export var confirmDetails = function (clientId: any, cb: Function) {
   ClientModal.findOne({ clientId }, function (err, data) {
      cb(err, data);
   });
};
