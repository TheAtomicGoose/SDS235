var async = require('async');
var fork = require('child_process').fork;
var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var con = mysql.createConnection(require('./lib/db'));

/* GET home page. */
router.get('/', function(req, res, next) {
    con.query('SELECT parsed_text FROM emails WHERE UPPER(parsed_text) LIKE UPPER(\'%' + 'trump' + '%\')', function(err, rows) {
        if (err) {
            console.log(err);
        } else {
            var phrases = [['Phrases']];
            async.each(rows, function(row, callback) {
                var wordIndex = [];

                var text = row.parsed_text;

                // If the email has multiple instances of the relevant word
                // if (text.indexOf('trump') !== text.lastIndexOf('trump')) {
                //     var regexp = new RegExp('trump', 'i');
                //     var match, matches = [];

                //     async.timesSeries(10, function(n, next) {
                //         if ((match = regexp.exec(text)) !== null) {
                //             matches.push(match.index);
                //             next();
                //         } else {
                //             next();
                //         }
                //     }, function(err) {
                //         if (err) {
                //             console.log(err);
                //         }
                //     });

                //     // Find all indices of word
                //     // while ((match = regexp.exec(text)) !== null) {
                //     //     matches.push(match.index);
                //     // }
                //     console.log(matches);
                // } else {
                    wordIndex = text.indexOf('trump');
                // }

                // Gets the n (num) words around the relevant word
                function wordsAroundWord(num, index, callback) {
                    var splitAroundWord = text.split(text.substring(index, index + 'trump'.length));
                    console.log(index);
                    var before = splitAroundWord[0].split('\\s+');
                    var after = splitAroundWord[1].split('\\s+');
                    var complete = before.slice(before.length - num - 1, before.length).join(' ') + ' ' + 'trump' + ' ' + after.slice(num + 1).join(' ');

                    // console.log('splitAroundWord: ' + splitAroundWord[0] + '***' + splitAroundWord[1]);
                    // console.log('before: ' + before);
                    // console.log('after: ' + after);
                    // console.log('complete: ' + complete);
                    callback(complete);
                }

                // if (typeof(wordIndex) === 'object') {
                //     async.each(wordIndex, function(index, innerCallback) {
                //         wordsAroundWord(10, index, function(phrase) {
                //             phrases.push(phrase);
                //             innerCallback();
                //         }, function(err) {
                //             if (err) {
                //                 console.log('error adding phrases: ' + err);
                //             } else {
                //                 callback();
                //             }
                //         });
                //     });
                // } else {

                if (wordIndex !== -1) {
                    wordsAroundWord(10, wordIndex, function(phrase) {
                        phrases.push(phrase);
                        callback();
                    });
                }
                // }
            }, function(err) {
                console.log('error iterating over db rows: ' + err);
            });

            console.log(phrases);
        }
    });
    res.render('index', { title: 'Express' });
});

router.post('/', function(req, res, next) {
});

module.exports = router;
