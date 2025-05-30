import  redis from 'redis';

import { reject }  from 'async';
import {ValidationError, ApplicationError, ServerError,AxiosError } from '../error/appError.js';
import {isDefined, formatError } from  '../applib/apputils.js';
import  RedisSMQ  from "rsmq";
//const apperror = require('../error/appError');
//const applib = require('../applib/apputils');



export class ServiceRedis  {
    constructor(app){
        this.app=app
        this.irds_host = this.app.get('rds_host');
        this.irds_port = this.app.get('rds_port');
        this.irds_psw = this.app.get('rds_psw');
        this.irds_qname = this.app.get('rds_psp_queue');
        this.itoken = 'diiatoken';


        this.rcln = redis.createClient({
            port: this.irds_port,
            host: this.irds_host,
            password: this.irds_psw
        });
            
        
        this.ioptions={socket_keepalive: true};
        this.rsmq = new RedisSMQ( {host: this.irds_host, port: this.irds_port, options: this.ioptions, ns: "rsmq", password: this.irds_psw} );
    }

    stringToBoolean (string) {
        switch (string.toLowerCase().trim()) {
            case "true": case "yes": case "1": return true;
            case "false": case "no": case "0": case null: return false;
            default: return Boolean(string);
        }
    }

    dbOpen1() {
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'service-redis:dbOpen1' });
        log.debug('dbOpen - Start');
        let that = this;
        return new Promise(function (resolve, reject) {
            

            that.rcln = redis.createClient({
                port: that.irds_port,
                host: that.irds_host,
                password: that.irds_psw
            });
            that.rcln.on("error", function (err) {
                log.debug('dbOpen: redis-connection-error ' + err.message);
                return reject(err);

            });

            that.rcln.on('connect', function () {
                log.debug('dbOpen: redis-connected');
                return resolve({ ok: true });
            })


        });
    }

    dbOpen() {
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'service-redis:dbOpen' });
        log.debug('dbOpen - Start');
        return new Promise(function (resolve, reject) {
                return resolve({ ok: true });
        });
    }

    dbClose1() {
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'service-redis:dbClose1' });
        return new Promise(function (resolve, reject) {
            that.rcln.quit(function (err) {
                if (err) {
                    return reject(err);
                } else {
                    return resolve({ ok: true });
                };
            });

        });

    }
    
    dbClose() {
        const log = logger.child({ hostname: process.env.HOSTNAME||'localhost', label: 'service-redis:dbClose' });
        log.debug("db close")
        return new Promise(function (resolve, reject) {
                    return resolve({ ok: true });
        });

    }

    /*========= Работа с TracePoint ==================== 
    *    
    * Это структура для отслеживания совпадений по запросам и ответам
    * При отправке запроса на документы создем структуру
    * При приеме документа проверяем, а наш ли это запрос был
    */

    /**
     * создать точку тарссировки при исходящем запросе
     * @param {*} 
     * tracepoint: { trace_id: 'trace_id',  //идентификатор запроса* 
     *               token: 'token' ,  //токен авторизации 
     *               requestid: 'requestid', //ID заявки запроса в банковской системе 
     *               created: 123456677, // время создания
     *               expire: 2345677777  // время истеяения
     * 
     *             };
     * @returns 
     */
    createTracePoint( tracepoint ) {
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'service-redis:createTracePoint(' });
        log.debug('createTracePoint - Start');
        let that = this;
        return new Promise(function (resolve, reject) {
            let l_ctx = {
                token: tracepoint.token,
                requestid: tracepoint.requestid,
                branchid:  tracepoint.branchid,
                barcode:   tracepoint.barcode,
                created: tracepoint.created,
                expire: tracepoint.expire,
                channel: tracepoint.channel
            };
            that.rcln.hmset(tracepoint.trace_id, l_ctx, (err, result) => {
                if (err) {
                    log.error(` error!!  ${err.message}`)
                    return reject(err);
                } else {
                    return resolve({ ok: true, trace_id: tracepoint.trace_id, tracepoint: l_ctx });

                };

            });
        });
    }

    /**
     * Прочитать tracepoint
     * @returns 
     */
    readTracepoint(  trace_id ) {
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'service-redis:readTracepoint' });
        log.debug('Читаем tracepoint из Redis');
        let that = this;
        return new Promise(function (resolve, reject) {
            let l_ctx = {};
            that.rcln.hmget(trace_id, 'token', 'requestid','branchid','created', 'expire', 'channel', (err, result) => {
                if (err) {
                    log.error(`Errorr!!!!   ${err.message}`)
                    return reject(err);
                } else {
                    l_ctx.token = result[0];
                    l_ctx.requestid = Number.parseInt(result[1]);
                    l_ctx.branchid = result[2];
                    l_ctx.created = Number.parseInt(result[3]);
                    l_ctx.expire = Number.parseInt(result[4]);
                    l_ctx.channel = result[5];
                    return resolve(l_ctx);
                }
            });
        });
    }

    deleteTracepoint(  trace_id ) {
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'service-redis:deleteTracepoint' });
        log.debug('Читаем tracepoint из Redis');
        let that = this;
        return new Promise(function (resolve, reject) {
            that.rcln.del(trace_id, (err, result) => {
                if (err) {
                    log.error(`Errorr!!!!   ${err.message}`)
                    return reject(err);
                } else {
                    return resolve({ok: true});
                }
            });
        });
    }

    readAllKeys() {
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'service-redis:readAllKeys' });
        log.debug('Читаем все ключи из Redis');
        let that = this;
        return new Promise(function (resolve, reject) {
            that.rcln.keys( '*', (err, result) => {
                if (err) {
                    return reject(err);
                } else {
                    result.forEach( function(  value, index ){
                        log.debug(  'key:'+ value + 'index:' + index  );
                    });
                    return resolve({ok: true, keys: result});
                }
            });
        });
    }

    readKey(  akey ) {
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'service-redis:readKey' });
        log.debug('Читаем все ключи из Redis');
        let that = this;
        return new Promise(function (resolve, reject) {
            that.rcln.hgetall( akey, function(err, result){
                if (err) {
                    return reject(err);
                } else {
                    return resolve({ok: true, result: result});
                }
            });
        });
    }

    deleteKey(  akey ) {
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'service-redis:deleteKey' });
        log.debug('deleteKey удалить ключ из Redis');
        let that = this;
        return new Promise(function (resolve, reject) {
            that.rcln.del( akey, function(err, result){
                if (err) {
                    log.debug('RDB.deleteKey error=' + err.message);
                    return reject(err);
                } else {
                    log.debug('RDB.deleteKey OK=' + result);
                    return resolve({ok: true, result: result});
                }
            });
        });
    }

    //============ Кеширование паспортных данных =====================================
    /**
     * создать точку тарссировки при исходящем запросе
     * @param {*} 
     * tracepoint: { trace_id: 'trace_id',  //идентификатор запроса* 
     *               token: 'token' ,  //токен авторизации 
     *               requestid: 'requestid', //ID заявки запроса в банковской системе 
     *               created: 123456677, // время создания
     *               expire: 2345677777  // время истеяения
     * 
     *             };
     * @returns 
     */
    createPspDataEnc( pspkey, pspdata ) {
            const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'service-redis:createPspDataEnc' });
            log.debug('createPspDataEnc - Start');
            return new Promise(function (resolve, reject) {
                let l_ctx = {data: Buffer.from(   JSON.stringify(pspdata) ).toString('base64')};
                that.rcln.hmset( pspkey, l_ctx, (err, result) => {
                    if (err) {
                        return reject(err);
                    } else {
                        return resolve({ ok: true, pspkey: pspkey});
    
                    };
                });
            });
    }


    //============ Программное API по работе с очередями =====================================
    /**
     * Получить список очередей
     */
    listQueues(){
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'service-redis:listQueues' });
        log.debug('listQueues - Start');
        let that = this;
        return new Promise(function (resolve, reject) {
            that.rsmq.listQueues(function (err, queues) {
                if (err) {
                    log.error(err.message)
                    return reject(err);
                } else {
                    log.debug("Active queues: " + queues.join( "," ) );
                    return resolve({ ok: true, listqueues: queues });
                }
            });

        });
    }

    /**
     * Получить список очередей
     */
    rQuit(){
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'service-redis:rQuit' });
        log.debug('rQuit - Start');
        let that = this;
        return new Promise(function (resolve, reject) {
            that.rsmq.quit(function (err, queues) {
                if (err) {
                    log.error(err.message)
                    return reject(err);
                } else {
                    log.debug("quit: " );
                    return resolve({ ok: true });
                }
            });

        });
    }
        
    /**
     * Получить список очередей
     * opts = { qname: "myqueue" }
     */
    createQueue( opts ){
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'service-redis:createQueue' });
        log.debug('createQueue - Start');
        let that = this;
        return new Promise(function (resolve, reject) {
            that.rsmq.createQueue(  opts, function (err, result) {
                if (err) {
                    log.error(err.message)
                    return reject(err);
                } else {
                    if (result === 1){
                        log.debug("created queue: " + opts.qname );
                        return resolve({ ok: true});
                    } else {
                        log.debug("wrong creating queue: " + opts.qname );
                        return resolve({ ok: false});
                    } ;
                    
                };
                
            });

        });
    }

    /**
     * Удалить учередь
     * @param {*} opts 
     * opts = { qname: "myqueue" }
     * @returns 
     */
    deleteQueue ( opts ){
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'service-redis:deleteQueue' });
        logger.debug('deleteQueue - Start');
        let that = this;
        return new Promise(function (resolve, reject) {
            that.rsmq.deleteQueue(  opts, function (err, result) {
                if (err) {
                    log.error(err.message)
                    return reject(err);
                } else {
                    if (result === 1){
                        log.debug("deleted queue: " + opts.qname );
                        return resolve({ ok: true});
                    } else {
                        log.debug("wrong deleting queue: " + opts.qname );
                        return resolve({ ok: false});
                    } ;
                    
                };
                
            });

        });
    }

    /**
     * 
     * @param {*} opts 
     * opts = { qname: "myqueue" }
     * @returns 
     * Returns an object:
     *     vt (Number): The visibility timeout for the queue in seconds
     *     delay (Number): The delay for new messages in seconds
     *     maxsize (Number): The maximum size of a message in bytes
     *     totalrecv (Number): Total number of messages received from the queue
     *     totalsent (Number): Total number of messages sent to the queue
     *     created (Number): Timestamp (epoch in seconds) when the queue was created
     *     modified (Number): Timestamp (epoch in seconds) when the queue was last modified with setQueueAttributes
     *     msgs (Number): Current number of messages in the queue
     *     hiddenmsgs (Number): Current number of hidden / not visible messages. A message can be hidden while "in 
     */
    getQueueAttributes( opts ){
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'service-redis:getQueueAttributes' });
        log.debug('getQueueAttributes - Start');
        let that = this;
        return new Promise(function (resolve, reject) {
            that.rsmq.getQueueAttributes(  opts, function (err, resp) {
                if (err) {
                    log.error(err.message)
                    return reject(err);
                } else {
                    log.debug("==============================================");
                    log.debug("=================Queue Stats==================");
                    log.debug("==============================================");
                    log.debug("visibility timeout: ", resp.vt);
                    log.debug("delay for new messages: ", resp.delay);
                    log.debug("max size in bytes: ", resp.maxsize);
                    log.debug("total received messages: ", resp.totalrecv);
                    log.debug("total sent messages: ", resp.totalsent);
                    log.debug("created: ", resp.created);
                    log.debug("last modified: ", resp.modified);
                    log.debug("current n of messages: ", resp.msgs);
                    log.debug("hidden messages: ", resp.hiddenmsgs);
                    log.debug("return getQueueAttributes: " + opts.qname );
                    return resolve({ ok: true, resp});
                } ;
            });

        });
    }
    /**
     * 
     * @param {*} opts 
     * { qname: "myqueue", message: "Hello World "}
     * @returns 
     */
    sendMessage( opts ){
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'service-redis:sendMessage' });
        log.debug('sendMessage - Start');
        let that = this;
        return new Promise(function (resolve, reject) {
            that.rsmq.sendMessage(  opts, function (err, result) {
                if (err) {
                    log.error(err.message)
                    return reject(err);
                } else {
                    log.debug("Message sent ID=: " + result );
                    let reso = { ok: true, messageid: result};
                    return resolve( reso );
                 };
            
                
            });

        });
    }
    /**
     * 
     * @param {*} opts
     * { "qname": "qqq", "vt": 12 }
     * Parameters:
     * qname (String): The Queue name.
     * vt (Number): optional (Default: queue settings) The length of time, in seconds, that the received message will be invisible to others. Allowed values: 0-9999999 (around 115 days)
     *  Returns an object:
     *      message (String): The message's contents.
     *      id (String): The internal message id.
     *      sent (Number): Timestamp of when this message was sent / created.
     *      fr (Number): Timestamp of when this message was first received.
     *      rc (Number): Number of times this message was received.
     *
     *  
     * @returns 
     */
    receiveMessage( opts ){
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'service-redis:receiveMessage' });
        log.debug('receiveMessage - Start');
        let that = this;
        return new Promise(function (resolve, reject) {
            that.rsmq.receiveMessage(  opts, function (err, result) {
                if (err) {
                    log.error(err.message);
                    return reject(err);
                } else {
                    let reso = null;
                    if ( result.id ) {
                        log.debug("Message received.", JSON.stringify( result ) );
                        let msgs = result.message ;
                        log.debug( 'body=' + msgs);
                        let msgo = JSON.parse(msgs);
                    
                        reso ={ ok: true, messageid: result.id, message: msgo};
                        log.debug( JSON.stringify(  reso  ) );
                    } else {
                        log.debug("No messages for me...")
                        reso ={ ok: false, messageid: null, message: null};
                    }
                    return resolve(  reso  );
                 };
            
                
            });

        });
    }
        /**
     * Прочитеть сообщение с удалением
     * @param {*} opts 
     * { qname: "myqueue" }
     * @returns 
     *     Returns an object:
     *      message (String): The message's contents.
     *      id (String): The internal message id.
     *      sent (Number): Timestamp of when this message was sent / created.
     *      fr (Number): Timestamp of when this message was first received.
     *      rc (Number): Number of times this message was received.
     *
     */
    popMessage( opts ){
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'service-redis:popMessage' });
        log.debug('sendMessage - Start');
        let that = this;
        return new Promise(function (resolve, reject) {
            that.rsmq.popMessage(  opts, function (err, result) {
                if (err) {
                    log.error(err.message)
                    return reject(err);
                } else {

                    let reso = null;
                    if ( result.id ) {
                        log.debug("Message received.", JSON.stringify( result ) );
                        let msgs = result.message ;
                        log.debug( 'body=' + msgs);
                        let msgo = JSON.parse(msgs);
                        reso ={ ok: true, messageid: result.id, message: msgo};
                        log.debug( JSON.stringify(  reso  ) );
                    } else {
                        log.debug("No messages for me...")
                        reso ={ ok: false, messageid: null, message: null};
                    }
                    return resolve(  reso  );

                    };
            
                
            });

        });
    }
        /**
     * 
     * @param {*} opts 
     * { qname: "myqueue", id: "dhoiwpiirm15ce77305a5c3a3b0f230c6e20f09b55" }
     * @returns 
     * 1 if successful, 0 if the message was not found (Number).
     */
    deleteMessage( opts ){
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'service-redis:deleteMessage' });
        log.debug('sendMessage - Start');
        let that = this;
        let reso = {};
        return new Promise(function (resolve, reject) {
            that.rsmq.deleteMessage(  opts, function (err, result) {
                if (err) {
                    log.error(err.message)
                    return reject(err);
                } else {
                    if (result===1){
                        log.debug("Message deleted: " + result );
                        reso.ok=true;
                    } else {
                        log.debug("Message not found: " + result );
                        reso.ok=false;
                    }
                    return resolve( reso  );
                    };
            
                
            });

        });
    }
}











