import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { config } from './config/config';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';
import * as http from 'http';
import * as logger from './models/logs';
import cors from 'cors';
// import * as Token from "./models/accesstoken";
// import * as Users from "./models/users";
import { ResponseObj } from './models/models';
// import passport from "passport";
// import BearerStrategy from "passport-http-bearer";
import path from 'path';
import errorhandler from 'errorhandler';
var expressValidator = require('express-validator');
require('dotenv').config();

import { DB } from './models/db';

const app = express();
const server = http.createServer(app);
const db = new DB();
const port = config.port || 8000;
const mongodbURI: string = config.mongodbURI;
const LABEL = config.serviceName;
app.use(cors());

app.set('port', port);
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

//Express Validator
app.use(
   expressValidator({
      errorFormatter: function (param, msg, value) {
         var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

         while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
         }
         return {
            param: formParam,
            msg: msg,
            value: value,
         };
      },
   })
);
// swagger using json file
var options = {
   explorer: true,
};

/**
 * Genrate swagger documention file
 */
app.use(
   '/api-docs',
   swaggerUi.serveFiles(swaggerDocument, options),
   swaggerUi.setup(swaggerDocument)
);

/**
 * Check developemt running or not
 */
if ('development' === app.get('env')) {
   logger.info(
      logger.DEFAULT_MODULE,
      null,
      'Running in Development Environment ..'
   );
   app.use(errorhandler());
}

// Bring in the database!
db.connectWithRetry(mongodbURI);

//allow requests from any host
app.use(function (req, res, next) {
   res.header('Access-Control-Allow-Origin', '*');
   res.header(
      'Access-Control-Allow-Headers',
      'Origin, Authorization, X-Requested-With, Content-Type, Accept'
   );
   res.header('Access-Control-Allow-Methods', 'GET, POST,PUT, DELETE');
   next();
});

//ROUTES
app.use('/v1/client', require('./routes/v1/client'));

app.use('/test', (req, res) => {
   return res.status(200).send("Auth0- Tenant API's are live");
});

//server static files
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, '../public')));
app.get('*', (req, res) => {
   res.sendFile(path.join(__dirname + '/../public/index.html'));
});

// START THE SERVER
server.listen(port, () => {
   console.log(LABEL + ' is running on port ' + port);
});

//catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
   res.status(404).send('Page/Api Not Found');
   return;
});

process.on('SIGINT', function () {
   process.exit(0);
});

process.on('SIGTERM', function () {
   process.exit(0);
});

module.exports = app;
