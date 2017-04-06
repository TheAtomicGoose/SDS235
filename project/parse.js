/**
 * DNC Email Visualization
 * SDS235 - Visual Analytics
 * Written by Jesse Evers
 */

var d3 = require('d3');
var fs = require('fs');
var jsonfile = require('jsonfile');
var simpleParser = require('mailparser').simpleParser;

fs.readFile('./Email\ ID\ 001\ 113CDEC5-0957-4014-8F4B-6257D0283D48@dnc.org.eml', 'utf8', function(err, data) {
    if (err) {
        console.log(err);
    } else {
        parseEmail(data);
    }
});

function parseEmail(email) {
    simpleParser(email).then(
        mail => {
            jsonfile.writeFile('')
        }
    ).catch(
        err => {
            console.log(err);
        }
    );
}
