
export class CouchDbError extends Error {
  constructor(message) {
    super(message);
    this.name = "CouchDbError";
  }
}


export class ServerError extends Error {
  constructor(message, code=undefined,  target=undefined, status_code=422, payload=undefined) {
      super(message);
      this.name = "ServerError";
      if( typeof code !== "undefined") {
        this.code=code
      }
      if( typeof target !== "undefined") {
        this.target=target
      }
      if( typeof status_code !== "undefined") {
        this.status_code=status_code
      }
      if( typeof payload !== "undefined") {
        this.payload=payload
      }
  }
}

export class ValidationError extends Error {
  constructor(message,  code=undefined,  target=undefined, status_code=422, payload=undefined ) {
      super(message);
      this.name = "ValidationError";
      if( typeof code !== "undefined") {
        this.code=code
      }
      if( typeof target !== "undefined") {
        this.target=target
      }
      if( typeof status_code !== "undefined") {
        this.status_code=status_code
      }
      if( typeof payload !== "undefined") {
        this.payload=payload
      }
  }
}

export class ApplicationError extends Error {
  constructor(message,  code=undefined,  target=undefined, status_code=422, payload=undefined ) {
      super(message);
      this.name = "ApplicationError";
      if( typeof code !== "undefined") {
        this.code=code
      }
      if( typeof target !== "undefined") {
        this.target=target
      }
      if( typeof status_code !== "undefined") {
        this.status_code=status_code
      }
      if( typeof payload !== "undefined") {
        this.payload=payload
      }
  }
}

export class AxiosError extends Error {
  constructor(err) {
    let err_message = err.message;
    if (   typeof  err.response !== "undefined" ) {

            if (err.response.data.hasOwnProperty('message')) {
              err_message = err_message + ' [' + err.response.data.message + ']';
            } else {
                err_message = '[' + err.message + '] (' + err.stack + ')';
            }     
    } else {
      err_message = '[' + err.message + '] (' + err.stack + ')';
    }
    super(err_message);

    this.name = "AxiosError";
    this.code = null;
    this.data = null;
    this.status = null;
    this.http_details = {};

    if (   typeof  err.response !== "undefined"   ) {
      if (err.response.data.hasOwnProperty('code')) {

        if (typeof  err.response.data.code !== "undefined" || err.response.data.code !== null){
            this.code = err.response.data.code;
        } else {
          this.code = 500;
        }    
      }
      if (err.response.hasOwnProperty('status')) {

        if (typeof  err.response.status !== "undefined" ||  err.response.status !== null ){
            this.status = err.response.status;
        } else {
          this.status = 500; 
        }


      }
      if (err.response.data.hasOwnProperty('data')) {
        this.data = err.response.data.data;
      }

      if (err.hasOwnProperty("config")) {
        this.http_details.reqURL = err.response.config.url;
        this.http_details.headers = err.response.config.headers;
      }

    } else {
      this.code = 500;
      this.status = 500; 

    }

  }
}

export function ErrorHandler(err){
  let errdsc={}
  let err_code=""
  let err_descr=""
  let err_target=""
  let err_payload={}
  if (typeof err.code !== 'undefined'){
      err_code=err.code
  }
  if (typeof err.message !== 'undefined'){
    err_descr=err.message
  }
  if (typeof err.target !== 'undefined'){
    err_target=err.target
  }

  if (typeof err.payload !== 'undefined'){
    err_payload=err.payload
  }
  
  if (typeof err.stack !== 'undefined'){
    err_payload.stack=err.stack
  }  
  if(typeof err.http_details !== 'undefined'){
    err_payload.http_details=err.http_details
  }
  if(typeof err.data !== 'undefined'){
    err_payload.data=err.data
  }

  errdsc["code"] = err_code
  errdsc["description"] = err_descr
  errdsc["target"] = err_target
  let rv={}
  rv["Error"]=errdsc
  rv["Error"]["Inner"]=err_payload
  return rv

}


