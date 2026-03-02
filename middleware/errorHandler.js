const { logEvents } = require('./logEvents'); // import the logEvents function from the logEvents module

const errorHandler = (err, req, res, next) => {
    logEvents(`${err.name}: ${err.message}`, 'errLog.txt'); // log the error to a file called errLog.txt
    console.error(err.stack);   // log the error stack trace to the console 
    res.status(500).send(err.message); // send the error message to the client with a 500 status code (internal server error)
}

module.exports = errorHandler;