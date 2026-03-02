const express = require('express');
const app = express();  // typical naming convention for the express application
// common core modules - built in modules that come with node
const path = require('path');
const cors = require('cors'); // cross origin resource sharing - allows the server to accept requests from different origins (domains) - for example, if the client is hosted on a different domain than the server, the server will reject the request unless CORS is enabled
// change made
// const logEvents = require('./middleware/logEvents');
const { logger } = require('./middleware/logEvents'); // import the logger middleware function from the logEvents module
const errorHandler = require('./middleware/errorHandler'); // import the errorHandler middleware function from the errorHandler module
const { error } = require('console');
const PORT = process.env.PORT || 3500;  // local port - the port that the server will listen on


// custom middleware - middleware functions that are created by the developer
app.use(logger); // use the logger middleware function for all routes - this will log the request method and url to a file called reqLog.txt and to the console for every request that is made to the server
// cross origin resource sharing - allows the server to accept requests from different origins (domains) - for example, if the client is hosted on a different domain than the server, the server will reject the request unless CORS is enabled
const whitelist = ['https://www.yourhostdomain.com', 'http://127.0.0.1:5500', 'http://localhost:3500']; // list of allowed origins - only requests from these origins will be accepted by the server
const corsOptions = {
    origin: (origin, callback) => {
        if (whitelist.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 - set the status code to 200 for successful OPTIONS requests
}
app.use(cors(corsOptions)); 

// built in middleware - middleware functions that are included with express
// waterfall of middleware functions - the order of the middleware functions matters - the first middleware function that matches the request will be executed
app.use(express.urlencoded({ extended: false }));  // handles url encoded data (form data) - extended: false means that the querystring library is used to parse the data, extended: true means that the qs library is used to parse the data
app.use(express.json()); // handles json data - parses the json data and makes it available in req.body
app.use('/', express.static(path.join(__dirname, '/public'))); // serves static files from the public folder - the path.join() method is used to join the __dirname variable (the current directory) with the 'public' string to create the full path to the public folder
app.use('/subdir', express.static(path.join(__dirname, '/public'))); // serves static files from the public folder - the path.join() method is used to join the __dirname variable (the current directory) with the 'public' string to create the full path to the public folder
// change the path in htm files to match the new path to the public folder - for example, change <link rel="stylesheet" href="../css/style.css" /> to <link rel="stylesheet" href="css/style.css" />

// routes
app.use('/', require('./routes/root'));
app.use('/subdir', require('./routes/subdir'));

// app.get(/^\/$|^\/index(.html)?$/, (req, res) => {
//     // res.send("Hello World");
//     res.sendFile('./views/index.html', { root: __dirname }); // send the index.html file to the client
//     // res.sendFile(path.join(__dirname, 'views', 'index.html')); // send the index.html file to the client - not working (industry standard way to send files)?
// });

// app.get(/^\/new-page(.html)?$/, (req, res) => {
//     res.sendFile('./views/new-page.html', { root: __dirname }); // send the new-page.html file to the client
// });

// app.get(/^\/old-page(.html)?$/, (req, res) => {
//     res.redirect(301, '/new-page.html'); // redirect the client to the new-page.html file with a 301 status code (permanent redirect)  // 302 default status code for res.redirect() is 302 (temporary redirect) 
// });

// Route handlers - the order of the route handlers matters - the first route handler that matches the request will be executed

// app.get(/^\/hello(.html)?$/, (req, res, next) => {
//     console.log('Hello World'); // send a string response to the client
//     next(); // call the next middleware function in the stack - in this case, the next route handler that matches the request
// });

// const one = (req, res, next) => {
//     console.log('one');
//     next(); // call the next middleware function in the stack - in this case, the next route handler that matches the request
// };

// const two = (req, res, next) => {
//     console.log('two');
//     next(); // call the next middleware function in the stack - in this case, the next route handler that matches the request
// };  

// const three = (req, res) => {
//     console.log('three');
//     res.send('Finished'); // send a string response to the client
// };

// app.get(/^\/chain(.html)?$/, [one, two, three]); // chain multiple route handlers together - the route handlers will be executed in the order they are defined in the array

app.get(/.*/, (req, res) => {
    res.status(404).sendFile('./views/404.html', { root: __dirname }); // send the 404.html file to the client if the requested page is not found
});

app.use(errorHandler); // use the errorHandler middleware function for all routes - this will log the error to a file called errLog.txt and send the error message to the client with a 500 status code (internal server error) if an error occurs in any of the route handlers

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

