// common core modules - built in modules that come with node
const http = require('http');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

// third party modules - modules that are not built in, but can be installed via npm
const { log } = require('console');
const logEvents = require('./middleware/logEvents');
// logEvents("Event Logged");
const EventEmitter = require('events');

class Emitter extends EventEmitter { };
const myEmitter = new Emitter();
// last
myEmitter.on('log', (msg, fileName) => logEvents(msg, fileName)); // listen for the log event and call the logEvents function when the event is emitted

const PORT = process.env.PORT || 3500;  // local port - the port that the server will listen on

const serveFile = async (filePath, contentType, response) => {
    try {
        const rawData = await fsPromises.readFile(
            filePath,
            !contentType.includes('image') ? 'utf8' : ''
        );
        const data = contentType === 'application/json'
            ? JSON.parse(rawData) : rawData;
        response.writeHead(
            filePath.includes('404.html') ? 404 : 200,
            { 'Content-Type': contentType }
        ); // The writeHead() method of the http.ServerResponse class is used to send a response header to the client. The status code is set to 404 if the file path includes '404.html', otherwise it is set to 200. The Content-Type header is set to the content type of the file being served.
        response.end(
            contentType === 'application/json' ? JSON.stringify(data) : data
        );
    } catch (err) {
        console.log(err);
        myEmitter.emit('log', `${err.name}: ${err.message}`, 'errLog.txt');
        response.statusCode = 500;
        response.end();
    }
}

// create server - create a server that listens for requests and sends responses
const server = http.createServer((req, res) => {
    console.log(req.url, req.method); // req.url is the url that the client is requesting, req.method is the method that the client is using (GET, POST, etc.)
    
    // last
    myEmitter.emit('log', `${req.url}\t${req.method}`, 'reqLog.txt'); // log the request url and method to a file called reqLog.txt

    const extension = path.extname(req.url); // get the file extension of the requested url
    
    let contentType;  // variable to hold the content type of the response

    // determine content type based on file extension
    switch (extension) {
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.jpg':
            contentType = 'image/jpeg';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.txt':
            contentType = 'text/plain';
            break;
        default:
            contentType = 'text/html';
    }

    // chained ternary operator to determine the file path of the requested url
    // could use an if/else statement, but this is more concise
    // the if/else looks like this:
    // if (contentType === 'text/html' && req.url === '/') {
    //     filePath = path.join(__dirname, 'views', 'index.html');
    // } else if (contentType === 'text/html' && req.url.slice(-1) === '/') {
    //     filePath = path.join(__dirname, 'views', req.url);
    // } else if (contentType === 'text/html') {
    //     filePath = path.join(__dirname, 'views', req.url);
    // } else {
    //     filePath = path.join(__dirname, req.url);
    // }

    let filePath =
        contentType === 'text/html' && req.url === '/'              // if the client is requesting the root url, serve the index.html page
            ? path.join(__dirname, 'views', 'index.html') :         // if the client is requesting a url that ends with a slash, serve the corresponding html page in the views folder
            contentType === 'text/html' && req.url.slice(-1) === '/'// if the client is requesting a url that ends with a slash, serve the corresponding html page in the views folder
                ? path.join(__dirname, 'views', req.url) :
                contentType === 'text/html'                         // if the client is requesting a url that does not end with a slash, serve the corresponding html page in the views folder
                    ? path.join(__dirname, 'views', req.url) :
                    path.join(__dirname, req.url);                  // if the client is requesting a file that is not an html file, serve the file from the root directory

    if (!extension && req.url.slice(-1) !== '/') filePath += '.html'; // if the client is requesting a url that does not have a file extension and does not end with a slash, add .html to the end of the file path

    const fileExists = fs.existsSync(filePath); // check if the file exists

    if (fileExists) {
        serveFile(filePath, contentType, res); // if the file exists, serve the file
    } else {
        switch (path.parse(filePath).base) {
            case 'old-page.html':
                res.writeHead(301, { 'Location': '/new-page.html' }); // if the client is requesting old-page.html, redirect to new-page.html
                res.end();
                break;
            case 'www-page.html':
                res.writeHead(301, { 'Location': '/' }); // if the client is requesting www-page.html, redirect to the root page. 301 is the status code for a permanent redirect, which tells the client that the resource has been permanently moved to a new location.
                res.end();
                break;
            default:
                res.statusCode = 404; // if the file does not exist, send a 404 response
                serveFile(path.join(__dirname, 'views', '404.html'), 'text/html', res); // serve the 404.html page
        } // log the file path to the console for debugging purposes
    }



    // serve a page from our project - if the client is requesting the root url, serve the index.html page
    // not efficient to read the file every time a request is made, but this is just for demonstration purposes
    // if (req.url === '/' || req.url === 'index.html') {
    //     res.statusCode = 200;
    //     res.setHeader('Content-Type', 'text/html');
    //     path.join(__dirname, 'views', 'index.html');
    //     fs.readFile(path.join(__dirname, 'views', 'index.html'), 'utf-8', (err, data) => {
    //         if (err) {
    //             res.statusCode = 500;
    //             res.setHeader('Content-Type', 'text/html');
    //             res.write('<h1>Internal Server Error</h1>');
    //         } else {
    //             res.end(data); // end the response and send it back to the client
    //         }
    //     });
    // } else {
    //     res.statusCode = 404;
    //     res.setHeader('Content-Type', 'text/html');
    //     res.write('<h1>Page Not Found</h1>');
    // }   
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

