class ExpressError extends Error {
    constructor(statusCode, message){
        super(); // we must call super() before using this in inheritance in js
        this.message=message;
        this.statusCode=statusCode;
    }
}
module.exports = ExpressError;