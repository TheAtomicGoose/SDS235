var async = require('async');
var mysql = require('mysql');

exports.getContacts = function(email, callback) {
    var con = mysql.createConnection(require('./db'));

    con.query('SELECT emails.from_email, email_to.to_email FROM email_to INNER JOIN emails ON email_to.email_id = emails.id WHERE UPPER(emails.from_email) LIKE UPPER(\'%' + email + '%\')', function(err, rows) {

        var frequency = {};

        async.each(rows, function(row, rowCallback) {
            var email = row.to_email.toLowerCase();
            if (!frequency.hasOwnProperty(email)) {
                frequency[email] = {
                    email: email,
                    sent: 1
                };
            } else {
                frequency[email].sent += 1;
            }

            rowCallback();
        }, function(err) {
            if (err) console.log(err);

            var frequencyArray = [];
            async.each(frequency, function(contact, innerCallback) {
                frequencyArray.push({ email: contact.email, sent: contact.sent });
                innerCallback();
            }, function(innerErr) {
                if (innerErr) console.log(innerErr);

                callback(frequencyArray.slice(0, 10));
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

                wordIndex = text.indexOf(word);

                function wordsAroundWord(num, index, WAWCallback) {
                    var splitAroundWord = text.split(text.substring(index, index + word.length));
                    var before = splitAroundWord[0].split(' ');
                    var after = splitAroundWord[1].split(' ');
                    var complete = before.slice(before.length - num - 1, before.length).join(' ') + word + after.slice(0, num + 1).join(' ');

                    WAWCallback(complete);
                }

                if (wordIndex !== -1) {
                    wordsAroundWord(10, wordIndex, function(phrase) {
                        phrases.push([phrase]);
                        rowCallback();
                    });
                }
            }, function(err) {
                if (err) console.log('error iterating over db rows: ' + err);
                callback(phrases);
                con.close(function(err) {});
            });
        }
    });
};
