import amqp from 'amqplib';
import { reject }  from 'async';
import {ValidationError, ApplicationError, ServerError,AxiosError } from '../error/appError.js';
import {isDefined, formatError } from  '../applib/apputils.js';
import { v4 as uuidv4 } from 'uuid';



export class ServiceRabbitMQ  {
    constructor(app){
        this.app=app
        this.irmq_host = this.app.get('rmq_host');
        this.irmq_port = this.app.get('rmq_port');
        this.irmq_usr = this.app.get('rmq_usr');
        this.irmq_psw = this.app.get('rmq_psw');

        this.irmq_url= `amqp://${this.irmq_usr}:${this.irmq_psw}@${this.irmq_host}:${this.irmq_port}`;
        this.connection = null;
        this.channel = null;
    }

    stringToBoolean (string) {
        switch (string.toLowerCase().trim()) {
            case "true": case "yes": case "1": return true;
            case "false": case "no": case "0": case null: return false;
            default: return Boolean(string);
        }
    }
    /**
     * Connect to RabbitMQ server
     */
    async connectToRabbitMQ() {
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'srvc-rabbitmq:connect' });
        try {
            log.debug( `Connecting to RqbbitMQ at ${this.irmq_url}`);
            // Connect to RabbitMQ server
            if( !isDefined(this.irmq_url)){
                log.error('RabbitMQ URL is not defined');
                throw new ApplicationError('RabbitMQ URL is not defined');
            }
            this.connection = await amqp.connect(this.irmq_url);
            this.channel = await this.connection.createChannel();
            log.debug('Connected to RabbitMQ');

            //await channel.close();
            //await connection.close();
        } catch (error) {
            log.error('Failed to connect to RabbitMQ:', error);
        }
    }

    async publishRequestUploadfile( payload) {
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'srvc-rabbitmq:publishRequestUploadfile' });
        const correlationId = uuidv4();
        const replyToQueue  = this.app.get('responseQueueName');
        const exchangeName= "syncws_exchange";
        const routingKey = "api-srvc.uplfile.worker";
      


        await this.channel.assertExchange(exchangeName, 'topic', { durable: true });
        log.debug(`Exchange '${exchangeName}' asserted`);
        const messageBuffer = Buffer.from(JSON.stringify(payload));
        const published = this.channel.publish(
            exchangeName,
            routingKey,
            messageBuffer,
            { 
                persistent: true,
                correlationId: correlationId,
                replyTo: replyToQueue,
                contentType: 'application/json',
                headers: {
                    'x-cerrelation-id': correlationId,
                    'x-request-id': correlationId,
                    'x-request-type': 'uploadfile'

                }
            } 
            
                                
        );
        if (published) {
            log.debug(`Message published to exchange '${exchangeName}' with routing key '${routingKey}':`);
           
        } else {
            log.warning('Message was not immediately published (channel might be blocked).');
        }

        return correlationId;
    }

    async publishRequestReport( payload) {
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'srvc-rabbitmq:publishRequestReport' });
        const correlationId = uuidv4();
        const replyToQueue  = this.app.get('responseQueueName');
        const exchangeName= "syncws_exchange";
        const routingKey = "api-srvc.report.worker";
      


        await this.channel.assertExchange(exchangeName, 'topic', { durable: true });
        log.debug(`Exchange '${exchangeName}' asserted`);
        const messageBuffer = Buffer.from(JSON.stringify(payload));
        const published = this.channel.publish(
            exchangeName,
            routingKey,
            messageBuffer,
            { 
                persistent: true,
                correlationId: correlationId,
                replyTo: replyToQueue,
                contentType: 'application/json',
                headers: {
                    'x-cerrelation-id': correlationId,
                    'x-request-id': correlationId,
                    'x-request-type': 'report'

                }
            } 
            
                                
        );
        if (published) {
            log.debug(`Message published to exchange '${exchangeName}' with routing key '${routingKey}':`);
           
        } else {
            log.warning('Message was not immediately published (channel might be blocked).');
        }

        return correlationId;
    }

    async publishRequestCreateBranch( payload) {
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'srvc-rabbitmq:publishRequestCreateBranch' });
        const correlationId = uuidv4();
        const replyToQueue  = this.app.get('responseQueueName');
        const exchangeName= "syncws_exchange";
        const routingKey = "api-srvc.create-branch.worker";
      


        await this.channel.assertExchange(exchangeName, 'topic', { durable: true });
        log.debug(`Exchange '${exchangeName}' asserted`);
        const messageBuffer = Buffer.from(JSON.stringify(payload));
        const published = this.channel.publish(
            exchangeName,
            routingKey,
            messageBuffer,
            { 
                persistent: true,
                correlationId: correlationId,
                replyTo: replyToQueue,
                contentType: 'application/json',
                headers: {
                    'x-cerrelation-id': correlationId,
                    'x-request-id': correlationId,
                    'x-request-type': 'createBranch'

                }
            } 
            
                                
        );
        if (published) {
            log.debug(`Message published to exchange '${exchangeName}' with routing key '${routingKey}':`);
           
        } else {
            log.warning('Message was not immediately published (channel might be blocked).');
        }

        return correlationId;
    }

    async publishRequestReadBranchList( payload) {
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'srvc-rabbitmq:publishRequestReadBranchList' });
        const correlationId = uuidv4();
        const replyToQueue  = this.app.get('responseQueueName');
        const exchangeName= "syncws_exchange";
        const routingKey = "api-srvc.read-branch-list.worker";
      


        await this.channel.assertExchange(exchangeName, 'topic', { durable: true });
        log.debug(`Exchange '${exchangeName}' asserted`);
        const messageBuffer = Buffer.from(JSON.stringify(payload));
        const published = this.channel.publish(
            exchangeName,
            routingKey,
            messageBuffer,
            { 
                persistent: true,
                correlationId: correlationId,
                replyTo: replyToQueue,
                contentType: 'application/json',
                headers: {
                    'x-cerrelation-id': correlationId,
                    'x-request-id': correlationId,
                    'x-request-type': 'readBranchList'

                }
            } 
            
                                
        );
        if (published) {
            log.debug(`Message published to exchange '${exchangeName}' with routing key '${routingKey}':`);
           
        } else {
            log.warning('Message was not immediately published (channel might be blocked).');
        }

        return correlationId;
    }
    async publishRequestReadTime( payload) {
        const log = this.app.get('logger').child({ hostname: process.env.HOSTNAME||'localhost', label: 'srvc-rabbitmq:publishRequestReadTime' });
        const correlationId = uuidv4();
        const replyToQueue  = this.app.get('responseQueueName');
        const exchangeName= "syncws_exchange";
        const routingKey = "api-srvc.read-time.worker";
      


        await this.channel.assertExchange(exchangeName, 'topic', { durable: true });
        log.debug(`Exchange '${exchangeName}' asserted`);
        const messageBuffer = Buffer.from(JSON.stringify(payload));
        const published = this.channel.publish(
            exchangeName,
            routingKey,
            messageBuffer,
            { 
                persistent: true,
                correlationId: correlationId,
                replyTo: replyToQueue,
                contentType: 'application/json',
                headers: {
                    'x-cerrelation-id': correlationId,
                    'x-request-id': correlationId,
                    'x-request-type': 'readTime'

                }
            } 
            
                                
        );
        if (published) {
            log.debug(`Message published to exchange '${exchangeName}' with routing key '${routingKey}':`);
           
        } else {
            log.warning('Message was not immediately published (channel might be blocked).');
        }

        return correlationId;
    }

}











