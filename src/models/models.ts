export const ErrorCodes = {
   // 10XX - Common errors
   1001: {
      message: 'Missing mandatory inpur params',
      errorCode: 1001,
      statusCode: 400,
   },
   1002: {
      message: 'Failed to create entry in DB',
      errorCode: 1002,
      statusCode: 500,
   },
   1003: {
      message: 'Object Not Found in DB',
      errorCode: 1003,
      statusCode: 404,
   },
   1004: { message: 'Object Not Found', errorCode: 1004, statusCode: 404 },
   1005: {
      message: 'Failed to delete entry in DB',
      errorCode: 1005,
      statusCode: 500,
   },
   1006: {
      message: 'Failed to upload image',
      errorCode: 1006,
      statusCode: 400,
   },
   1007: {
      message: 'Failed to update entry in DB',
      errorCode: 1007,
      statusCode: 500,
   },
   1008: {
      message: 'Record alredy exist in DB',
      errorCode: 1008,
      statusCode: 400,
   },
   1009: { message: 'Invalid Input', errorCode: 1009, statusCode: 400 },

   //11XX - Custom error codes redeclared to feeds, posts, comments, reactions etc...
   1101: {
      message: 'This action is disabled',
      errorCode: 1101,
      statusCode: 400,
   },
   1102: {
      message: 'Something went wrong! try agaib',
      errorCode: 1102,
      statusCode: 400,
   },
};

export class ResponseObj {
   public status: number;
   public message: string;
   public data: any;

   constructor(status: number, message: string, data: any) {
      this.status = status;
      this.message = message;
      this.data = data;
   }

   public toJson() {
      return { status: this.status, message: this.message, data: this.data };
   }

   public toJsonString() {
      return JSON.stringify({
         status: this.status,
         message: this.message,
         data: this.data,
      });
   }
}
