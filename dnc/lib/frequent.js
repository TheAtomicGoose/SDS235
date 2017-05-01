// Requirements
var async = require('async');
var fs = require('fs');
var jsonfile = require('jsonfile');
var mysql = require('mysql');
var mostCommon = require('most-common');


// Create MySQL connection
var con = mysql.createConnection(require('./db'));

function pare(matches) {

    var commonWords = require('../common');
    console.log(commonWords);
    Object.keys(commonWords).forEach(function(key) {

        if (commonWords[key] < matches) {
            delete commonWords[key];
        }
    });

    jsonfile.writeFile('./common.json', commonWords, function(err) {
        if (err) {
            console.log('err saving common.json: ' + err);
        }
    });
}

function findMostCommon(connection) {
    con.query('SELECT parsed_text FROM emails', function(err, rows) {
        var commonWords = require('./common');
        if (err) {
            console.log('query error: ' + err);
        } else {

            // Loop over rows returned by the database
            async.each(rows, function(row, rowCallback) {

                // Modifies the text for analysis
                //  - Removes all characters except letters and spaces
                //  - Creates array of words by splitting at spaces
                //  - Filters out all words shorter than 5 characters
                modText = row.parsed_text.split(' ').filter(function(word) {
                    return word.length > 4;
                });

                // Loop over the most common words in each row
                async.each(mostCommon(modText, 15), function(word, callback) {
                    if (commonWords[word.token]) {
                        commonWords[word.token] += word.count;
                    } else {
                        commonWords[word.token] = word.count;
                    }
                    // console.log(commonWords);
                    callback();
                }, function(err) {
                    if (err) {
                        console.log('word loop err: ' + err);
                    }
                    rowCallback();
                });
            }, function(err) {
                if (err) {
                    console.log('row loop error: ' + err);
                } else {

                    // Write commonWords to common.json
                    jsonfile.writeFile('./common.json', commonWords, function(err) {
                        if (err) console.log('jsonfile write error: ' + err);
                        console.log('write successful');
                    });

                    // Close MySQL connection
                    con.end(function(err) {
                        if (err) {
                            throw err;
                        }
                    });
                    console.log('common words analysis complete!');
                }
            });
        }
    });
}

// findMostCommon(con);
pare(1000);
