var async = require('async');
var mysql = require('mysql');

exports.getContacts = function(email, callback) {
    var con = mysql.createConnection(require('./db'));

    con.query('SELECT emails.from_name, emails.from_email, email_to.to_name, email_to.to_email FROM email_to INNER JOIN emails ON email_to.email_id = emails.id WHERE UPPER(emails.from_email) LIKE UPPER(\'%' + email + '%\')', function(err, rows) {

        var frequency = {};

        async.each(rows, function(row, rowCallback) {
            var name = row.to_name,
                email = row.to_email.toLowerCase();
            if (!frequency.hasOwnProperty(email)) {
                frequency[email] = {
                    name: name,
                    email: email,
                    sent: 1
                };
            } else {
                frequency[email].sent += 1;
            }

            rowCallback();
        }, function(err) {
            if (err) console.log(err);

            var names = [],
                emails = [],
                sent = [];
            async.each(frequency, function(contact, innerCallback) {
                names.push(contact.name);
                emails.push(contact.email);
                sent.push(contact.sent);
                innerCallback();
            }, function(innerErr) {
                if (innerErr) console.log(innerErr);

                names = names.slice(0, 10);
                emails = emails.slice(0, 10);
                sent = sent.slice(0, 10);

                callback(names, emails, sent);
            });
        });
    });
};

exports.getPhrases = function (word, callback) {

    var con = mysql.createConnection(require('./db'));

    con.query('SELECT parsed_text FROM emails WHERE UPPER(parsed_text) LIKE UPPER(\'%' + word + '%\')', function(err, rows) {
        if (err) {
            console.log(err);
        } else {
            var phrases = [['Phrases']];
            async.each(rows, function(row, rowCallback) {
                var wordIndex = [];

                var text = row.parsed_text;

                // If the email has multiple instances of the relevant word
                // if (text.indexOf(word) !== text.lastIndexOf(word)) {
                //     var regexp = new RegExp(word, 'i');
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
                    wordIndex = text.indexOf(word);
                // }

                // Gets the n (num) words around the relevant word
                function wordsAroundWord(num, index, WAWCallback) {
                    var splitAroundWord = text.split(text.substring(index, index + word.length));
                    var before = splitAroundWord[0].split(' ');
                    var after = splitAroundWord[1].split(' ');
                    var complete = before.slice(before.length - num - 1, before.length).join(' ') + word + after.slice(0, num + 1).join(' ');

                    WAWCallback(complete);
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
                        phrases.push([phrase]);
                        rowCallback();
                    });
                }
                // }
            }, function(err) {
                if (err) console.log('error iterating over db rows: ' + err);
                callback(phrases);
            });
        }
    });
}
