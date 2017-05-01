var express = require('express');
var utils = require('./lib/utils');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/', function(req, res, next) {
    if (req.body.word) {
        utils.getPhrases(req.body.word, function(phrases) {
            res.send(phrases);
        });
    } else if (req.body.email) {
        utils.getContacts(req.body.email, function(contacts) {
            console.log(contacts);
            res.send(contacts);
        });
    }
});

module.exports = router;
