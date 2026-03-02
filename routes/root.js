const express = require('express');
const router = express.Router();
const path = require('path');

router.get(/^\/$|^\/index(.html)?$/, (req, res) => {
    // res.send("Hello World");
    // res.sendFile('./views/index.html', { root: __dirname }); // send the index.html file to the client
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html')); // send the index.html file to the client - not working (industry standard way to send files)?
});

router.get(/^\/new-page(.html)?$/, (req, res) => {
    // res.sendFile('./views/new-page.html', { root: __dirname }); // send the new-page.html file to the client
    res.sendFile(path.join(__dirname, '..', 'views', 'new-page.html')); // send the index.html file to the client - not working (industry standard way to send files)?

});

router.get(/^\/old-page(.html)?$/, (req, res) => {
    res.redirect(301, '/new-page.html'); // redirect the client to the new-page.html file with a 301 status code (permanent redirect)  // 302 default status code for res.redirect() is 302 (temporary redirect) 
});

module.exports = router;