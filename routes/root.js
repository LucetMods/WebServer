const express = require('express');
const router = express.Router();
const path = require('path');

router.get(/^\/$|^\/index(.html)?$/, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html')); // send the index.html file to the client - not working (industry standard way to send files)?
});

module.exports = router;