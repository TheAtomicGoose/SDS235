var $ = require('jquery-browserify');


exports.render = function(word) {

    google.charts.load('current', {packages:['wordtree']});

    var data;

    $.post('/', { word: word }, function(phrases) {
        data = phrases;
        google.charts.setOnLoadCallback(drawSimpleNodeChart);
    });

    function drawSimpleNodeChart() {
        var table = google.visualization.arrayToDataTable(data);

        var options = {
            wordtree: {
                format: 'implicit',
                type: 'double',
                word: word
            }
        };

        var wordtree = new google.visualization.WordTree(document.getElementById('tree'));
        wordtree.draw(table, options);
    }
};
