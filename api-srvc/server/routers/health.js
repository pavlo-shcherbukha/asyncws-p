import express from 'express';
import {ValidationError, ApplicationError, ServerError,AxiosError, ErrorHandler} from '../error/appError.js';

export default function health (app) {
    const router = express.Router();
    const logger = app.get('logger');
    router.get('/', function(req, res, next) {
        const log = logger.child({ hostname: process.env.HOSTNAME||'localhost', label: 'http-get-health' });

        try{
          let resp={ok: true};
          log.info('health router send response')
          return res.status(200).json(resp)                                              
        }
        catch( err){
            let res_status_code=422
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

    app.use('/api/health', router);
}

