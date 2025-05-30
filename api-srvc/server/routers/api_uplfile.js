import express from 'express';
import {ValidationError, ApplicationError, ServerError,AxiosError, ErrorHandler} from '../error/appError.js';
import fs from 'fs';
import multiparty from 'multiparty';



/**
 *  Async Web Services
 *  Upload Files
 * 
 * @param {*} app 
 */
export default function uplfile_router (app) {
    const router = express.Router();
    const logger = app.get('logger');
    const res_callb = app.get('rescallb');
    const rmq = app.get('rmq');  



    router.post('/', function(req, res, next) {
        const log = logger.child({ hostname: process.env.HOSTNAME||'localhost', label: 'http-post-upl-file' });
        log.info('Creating form object');
        
        const form = new multiparty.Form();
        form.autoFiles=true;
        form.autoFields=true;
        let infiles=[]
        let infields=[]
        let uplodedstrg=app.get('uplstrg');

        try{
            let headers = req.headers;
            log.info("=========Upload file========");
            log.info('Request headers: ' + JSON.stringify(headers)) ;
            log.info("=========Branch API========");

            form.on('error',  function( error ){
                log.error('-on error: ' + error.message);
                var r={ok: false, message: error.message};
                throw new ServerError(error.message, error.code, 'uplfile router', 422, error)
             
            });
            form.on('field',  function( name, value ){
                log.info(`Processing fields: ${name}  ${value}`)
                infields.push({fieldname: name, fieldvalue: value})
            }) ;            

            form.on('file',  function( name, file ){
                log.info(`Uploading file ${name}`);
                log.info(`Uploading file properties ${ JSON.stringify(file) }`);
                log.info(`Uploading file content type is `)
                let fileContent = fs.readFileSync(  file.path);
                let infilename=file.originalFilename;
                infiles.push({filename: file.originalFilename, filemime: file.headers["content-type"], filecontent: fileContent.toString('base64')})
                fs.writeFileSync(`${uplodedstrg}/${infilename}`, fileContent );
                log.info(`Content is saved`);

            }) ;

            form.on('close', async function() {
                log.info('Upload completed!');

                const payload ={ok: true, message: "file uploded", files: infiles, fields: infields};
                const correlationId = await rmq.publishRequestUploadfile(payload);
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

                //return res.status(200).json({ok: true, message: "file uploded", files: infiles, fields: infields})    

            });
    
    
            form.parse(req);
                                 
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


    app.use('/api/uplfile', router);
}

