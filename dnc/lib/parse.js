/**
 * DNC Email Visualization
 * SDS235 - Visual Analytics
 * Written by Jesse Evers
 */

var async = require('async');
var fs = require('fs');
var path = require('path');
var jsonfile = require('jsonfile');
var simpleParser = require('mailparser').simpleParser;
var mysql = require('mysql');
var exec = require('child_process').exec;


var con = mysql.createConnection(require('./db'));


var emailDir = './dnc/';
var parsedDir = './parsed/';

// Read directory and parse all .eml files into JSON objects
// fs.readdir(emailDir, function(err, files) {
//     if (err) {
//         console.log('directory error: ' + err);
//     } else {
//         files.forEach(function(file, index) {

//             fs.readFile(emailDir + file, 'utf8', function(err, data) {
//                 if (err) {
//                     console.log(err);
//                 } else {
//                     parseEmail(data, index);
//                 }
//             });
//         });
//     }
// });


con.query('SELECT id, text FROM emails', function(err, rows) {
    if (err) {
        console.log(err);
    } else {
        async.each(rows, function(row, callback) {
            modText = row.text.replace(/[^a-zA-Z ]/g, '');

            modText = modText.toLowerCase().split(' ').filter(function(element) {
                return element.length < 20;
            }).join(' ');

            con.query('UPDATE emails SET parsed_text = ? WHERE id = ?', [modText, row.id], function(err, result) {
                if (err) console.log(err);


            });

            callback();
        }, function(err) {
            if (err) {
                console.log(err);
            } else {
                con.end(function(err) {});
            }
        });
    }
});


// files.forEach(function(file, index) {

//     var json = require('./parsed/' + file);

//     if (json.headers.from && json.headers.to && json.text) {

//         var emailId;

//         var emailText = JSON.stringify(json.text);

//         if (emailText.length < 65536) {
//             email = {
//                 from_name: json.headers.from.value[0].name,
//                 from_email: json.headers.from.value[0].address,
//                 text: emailText
//             };

//             con.query('INSERT INTO emails SET ?', email, function(err, result) {
//                 if (err) {

//                     function puts(error, stdout, stderr) {
//                         console.log(error);
//                         console.log(stdout);
//                         console.log(stderr);
//                     }
//                     exec('mv ./parsed/' + file + ' ./ && cp ./parsed/1.json ./parsed/' + file);

//                     throw err;
//                 } else {
//                     emailId = result.insertId;
//                     var to = [];

//                     json.headers.to.value.forEach(function(element) {
//                         to.push({email_id: emailId, to_name: element.name, to_email: element.address});
//                     });

//                     to.forEach(function(element) {
//                         con.query('INSERT INTO email_to SET ?', element, function(err, result) {
//                             if (err) {
//                                 console.log(err);
//                                 con.end();
//                                 return;
//                             } else {
//                                 console.log(result);
//                             }
//                         });
//                     });
//                 }

//             });

//         }
//     }

// });



/**
 * Converts a .eml file to a JSON object and saves it as a .json file
 *
 * @param File email   the email to convert to JSON
 * @param String name  the name of the file to save the JSON object to
 */
function parseEmail(email, name) {
    // Parse email with simpleParser
    simpleParser(email).then(
        mail => {
            // Convert headers from map to object
            strMapToObj(mail.headers, function(headers) {
                mail.headers = headers;
                // Write JSON to file
                jsonfile.writeFile(parsedDir + name + '.json', mail, function(err) {
                    console.log(err);
                });
            });
        }
    ).catch(
        err => {
            console.log(err);
        }
    );
}

/**
 * Converts a map to an object. Adapted from http://2ality.com/2015/08/es6-map-json.html.
 *
 * @param Map strMap         a map object
 * @param Function callback  a function that is called with the converted object
 */
function strMapToObj(strMap, callback) {
    var obj = Object.create(null);
    for (var [k,v] of strMap) {
        obj[k] = v;
    }
    callback(obj);
}
