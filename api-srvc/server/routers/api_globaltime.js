import express from 'express';
import {ValidationError, ApplicationError, ServerError,AxiosError, ErrorHandler} from '../error/appError.js';


/**
 *  Async Web Services
 *  Branch API router
 * 
 * @param {*} app 
 */
export default function globaltime_router (app) {
    const router = express.Router();
    const logger = app.get('logger');
    const res_callb = app.get('rescallb');
    const rmq = app.get('rmq');

    router.post('/', async function(req, res, next) {
        const log = logger.child({ hostname: process.env.HOSTNAME||'localhost', label: 'http-post-globaltime' });

        try{
            log.info("=========GlobalTime API========");
            log.info('Request: ' + JSON.stringify(req.body)) ;
            log.info("=========GlobalTime API========");
            log.info("Publisting request to RabbitMQ for global time");
            const payload = req.body; 
            const correlationId = await rmq.publishRequestReadTime(payload); 
            // Зберігаємо об'єкт res та встановлюємо таймаут
            log.debug(`Correlation ID: ${correlationId}`);
            const timeoutId = setTimeout(() => {
                    if (res_callb.has(correlationId)) {
                        res_callb.delete(correlationId);
                        log.error(`Request timeout for correlationId: ${correlationId}`);
                        res.status(408).send({ error: 'Request timeout: No response received from IBM ACE.' });
                    }
                }, 30000); // 30 секунд таймаут
            log.debug(`Store resp as callback for correlationId: ${correlationId}`);
            res_callb.set(correlationId, { res, timeoutId });                                           
        }
        catch( err){
            let res_status_code=422
            let res_err;
            if( err instanceof ValidationError){
                res_status_code=err.status_code
                res_err=ErrorHandler(err)
            } else if(err instanceof ApplicationError){
                res_status_code=err.status_code
                res_err=ErrorHandler(err)
            } else if(err instanceof ServerError){
                res_status_code=err.status_code 
                res_err=ErrorHandler(err)
            } else if( err instanceof AxiosError){
                res_status_code=err.status
                res_err=ErrorHandler(err)
            } else {
              res_err= ErrorHandler(err)
              res_err.Error.code="InternalError"
              res_err.Error.target="globaltime api"
            }  
            log.error(res_err)
            res.status(res_status_code).json( res_err );
        }    


    });


    app.use('/api/globaltime', router);
}

