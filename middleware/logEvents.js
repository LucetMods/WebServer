// import format from 'date-fns';

const { format } = require('date-fns');
const { v4: uuid } = require('uuid');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const logEvents = async (message, logName) => {
    const dateTime = `${format(new Date(), 'yyyy/MM/dd\tHH:mm:ss')}`;
    
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;
    console.log(logItem);

    try {
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) 
            await fsPromises.mkdir(path.join(__dirname,'..', 'logs'));
        await fsPromises.appendFile(path.join(__dirname,'..', 'logs', logName), logItem);
    } catch (err) {
        console.log(err);
    }
}

const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.txt'); // log the request method and url to a file called reqLog.txt
    console.log(`${req.method} ${req.url} ${req.path}`); // log the request method and url to the console
    next(); // call the next middleware function in the stack - in this case, the next route handler that matches the request
};
    
module.exports = { logEvents, logger };