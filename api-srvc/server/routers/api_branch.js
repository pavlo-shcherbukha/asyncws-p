import express from 'express';
import {ValidationError, ApplicationError, ServerError,AxiosError, ErrorHandler} from '../error/appError.js';


/**
 *  Async Web Services
 *  Branch API router
 * 
 * @param {*} app 
 */
export default function branch_router (app) {
    const router = express.Router();
    const logger = app.get('logger');
    const res_callb = app.get('rescallb');
    const rmq = app.get('rmq');

    router.post('/', async function(req, res, next) {
        const log = logger.child({ hostname: process.env.HOSTNAME||'localhost', label: 'http-post-branch' });

        try{
            log.info("=========Branch API========");
            log.info('Request: ' + JSON.stringify(req.body)) ;
            log.info("=========Branch API========");
            log.info("Publisting request to RabbitMQ for branch creation");
            const payload = req.body; 
            const correlationId = await rmq.publishRequestCreateBranch(payload); 
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
              res_err.Error.target="branch api"
            }  
            log.error(res_err)
            res.status(res_status_code).json( res_err );
        }    


    });
    router.get('/', async function(req, res, next) {
        const log = logger.child({ hostname: process.env.HOSTNAME||'localhost', label: 'http-get-branch-list' });

        try{
            const payload = {"operationid": "get-branch-list"};
            const correlationId = await rmq.publishRequestReadBranchList(payload);
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
            let res_err={};
            let res_status_code=422;
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
              res_err.Error.target="GET-TODO"
            }  
            log.error(res_err)
            res.status(res_status_code).json( res_err );
        }    
    });


    app.use('/api/branch', router);
}

