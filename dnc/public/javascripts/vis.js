var cloud = require('./cloud');
var tree = require('./tree');
var chart = require('./map');
var $ = require('jquery-browserify');

$(document).ready(function() {
    // Default tree and pie chart
    chart.render('gardem@dnc.org', function() { addClickListeners(); });
    tree.render('democratic');

    function addClickListeners() {
        $('#map svg g rect').click(function() {
            chart.render(this.id.toLowerCase(), function() {
                addClickListeners();
            });
        });
    }


    $('#cloud svg g text').click(function() {
        tree.render(this.textContent);
    });


});
