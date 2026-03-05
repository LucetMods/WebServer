const express = require('express');
const app = express();  // typical naming convention for the express application
// common core modules - built in modules that come with node
const path = require('path');
const cors = require('cors'); // cross origin resource sharing - allows the server to accept requests from different origins (domains) - for example, if the client is hosted on a different domain than the server, the server will reject the request unless CORS is enabled
const corsOptions = require('./config/corsOptions')
const { logger } = require('./middleware/logEvents'); // import the logger middleware function from the logEvents module
const errorHandler = require('./middleware/errorHandler'); // import the errorHandler middleware function from the errorHandler module
const { error } = require('console');
const PORT = process.env.PORT || 3500;  // local port - the port that the server will listen on


// custom middleware - middleware functions that are created by the developer
app.use(logger); // use the logger middleware function for all routes - this will log the request method and url to a file called reqLog.txt and to the console for every request that is made to the server

app.use(cors(corsOptions));

// built in middleware - middleware functions that are included with express
// waterfall of middleware functions - the order of the middleware functions matters - the first middleware function that matches the request will be executed
app.use(express.urlencoded({ extended: false }));  // handles url encoded data (form data) - extended: false means that the querystring library is used to parse the data, extended: true means that the qs library is used to parse the data
app.use(express.json()); // handles json data - parses the json data and makes it available in req.body
app.use('/', express.static(path.join(__dirname, '/public'))); // serves static files from the public folder - the path.join() method is used to join the __dirname variable (the current directory) with the 'public' string to create the full path to the public folder
// change the path in htm files to match the new path to the public folder - for example, change <link rel="stylesheet" href="../css/style.css" /> to <link rel="stylesheet" href="css/style.css" />

// routes
app.use('/', require('./routes/root'));
app.use('/auth', require('./routes/api/auth'));
app.use('/register', require('./routes/api/register'));
app.use('/employees', require('./routes/api/employees'));

// app.get(/^\/chain(.html)?$/, [one, two, three]); // chain multiple route handlers together - the route handlers will be executed in the order they are defined in the array

app.get(/.*/, (req, res) => {
    res.status(404).sendFile('./views/404.html', { root: __dirname }); // send the 404.html file to the client if the requested page is not found
});

app.use(errorHandler); // use the errorHandler middleware function for all routes - this will log the error to a file called errLog.txt and send the error message to the client with a 500 status code (internal server error) if an error occurs in any of the route handlers

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

