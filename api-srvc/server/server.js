import https from "https";
import http from "http";
import express from 'express';
import cookieParser  from 'cookie-parser';
import session from 'express-session';
import bodyParser from 'body-parser';
import query from 'querystring';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import multiparty from 'multiparty';
import format from 'util';
import  FormData  from 'form-data';
import fs from 'fs';
import path  from 'path';
import axios from 'axios';
import useragent from 'express-useragent';
import {logger}  from './config/winston.js';
import morgan from'morgan';
import  localconfig from './config/local.json' assert { type: 'json' };
import { fileURLToPath } from 'url';
import {ServiceRabbitMQ} from './services/srvc-rabbitmq.js';


const responseCallbacks = new Map();

dotenv.config();
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const apphost=process.env.HOSTNAME||'localhost' 
const appport = process.env.PORT || localconfig.port;
const app = express();
app.set('logger', logger);
app.set('x-powered-by', false);
const applogger = app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'app' });
applogger.info("app logger added");


app.set('branchlist',path.join(__dirname, process.env.BRANCHLIST));

app.set('upltemp', path.join(__dirname, process.env.UPLOAD_TMP))
app.set('uplstrg', path.join(__dirname, process.env.UPLOAD_STORE))
app.set('rmq_host',process.env.RMQ_HOST);
app.set('rmq_port',process.env.RMQ_PORT);
app.set('rmq_usr',process.env.RMQ_USR);
app.set('rmq_psw',process.env.RMQ_PSW);


applogger.debug("==========================================================================")
applogger.debug(`Метаданні branch api ${app.get("branchlist")}`)
applogger.debug("==========================================================================")


app.set('rescallb',responseCallbacks);
applogger.debug("==");
const rmq = new ServiceRabbitMQ( app );
app.set('rmq', rmq);
await rmq.connectToRabbitMQ();


// Кожен інстанс Node.js створить свою ексклюзивну чергу для відповідей
// Ім'я черги буде згенероване RabbitMQ
applogger.debug("Creating exclusive response queue for this Node.js instance")
const q = await rmq.channel.assertQueue('', { exclusive: true, autoDelete: true });
const responseQueueName = q.queue; // Зберігаємо згенероване ім'я черги
app.set('responseQueueName', responseQueueName);
applogger.debug(`Node.js instance listening for responses on queue: ${responseQueueName}`);

//let responseQueueName = 'wsq_responses';
//await rmq.channel.assertQueue(responseQueueName, { durable: true });
//await rmq.channel.assertQueue(responseQueueName);

rmq.channel.consume(responseQueueName, (msg) => {
    applogger.debug(`RabbitMQ consume messages from ${responseQueueName}`);
    if (msg) {
        applogger.debug(`Received message: ${msg.content.toString()}`);
        const response = JSON.parse(msg.content.toString());
        const correlationId = msg.properties.correlationId;
        const httpStatus = msg.properties.headers.http_status_code || 200;
        applogger.debug(`Correlation ID: ${correlationId}`);
        const pending = responseCallbacks.get(correlationId);
        if (pending) {
            const { res, timeoutId } = pending;
            clearTimeout(timeoutId); // Очищаємо таймаут, оскільки відповідь надійшла
            applogger.debug(`Sending response for correlationID: ${correlationId}`);
            applogger.debug(`Response: ${JSON.stringify(response)}`);
            res.status(httpStatus).json(response); // Відправляємо позитивну відповідь
            applogger.debug(`Delete responseCallbacks for correlationId: ${correlationId}`);
            responseCallbacks.delete(correlationId); // Видаляємо запис
        } else {
            // Якщо pending == undefined, можливо, таймаут вже спрацював
            applogger.error(`Received response for unknown or timed out request: ${correlationId}`);
        }
        rmq.channel.ack(msg);
    }
},{ noAck: false });


/*
https does not work in this task
export const server = https.createServer(
  {
    key: fs.readFileSync('./server/bin/server-key.pem'),
    cert: fs.readFileSync('./server/bin/server-crt.pem'),
    ca: fs.readFileSync('./server/bin/ca-crt.pem'),
    requestCert: false,
    rejectUnauthorized: false,
    ciphers: [
      'ECDHE-RSA-AES128-GCM-SHA256',
      'ECDHE-ECDSA-AES128-GCM-SHA256',
      'ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-ECDSA-AES256-GCM-SHA384',
      'DHE-RSA-AES128-GCM-SHA256',
      'ECDHE-RSA-AES128-SHA256',
      'DHE-RSA-AES128-SHA256',
      'ECDHE-RSA-AES256-SHA384',
      'DHE-RSA-AES256-SHA384',
      'ECDHE-RSA-AES256-SHA256',
      'DHE-RSA-AES256-SHA256',
      'HIGH',
      '!aNULL',
      '!eNULL',
      '!EXPORT',
      '!DES',
      '!RC4',
      '!MD5',
      '!PSK',
      '!SRP',
      '!CAMELLIA'
    ].join(':'),
    honorCipherOrder: true
  }, app);
*/

export const server2 = http.createServer(app);


app.use(useragent.express());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// === app routers ============================
import health from './routers/health.js';
import branch_router from './routers/api_branch.js';
import uplfile_router from './routers/api_uplfile.js';
import report_router from './routers/api_report.js';
import globaltime_router from './routers/api_globaltime.js';

health(app)
branch_router(app)
uplfile_router(app)
report_router(app)
globaltime_router(app)
// ============================================



/*
https does not work in this task
server.listen(appport , function () {
  applogger.info(`listening on https://${apphost}:${appport }`);

});
*/

server2.listen( parseInt(appport) + 2, function () {
  applogger.info(`listening on http://${apphost}:${ parseInt(appport) + 2}`);

});



