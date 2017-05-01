var d3 = require('d3');
var d3Legend = require('d3-svg-legend');
var $ = require('jquery-browserify');

exports.render = function(email, callback) {

    $.post('/', { email: email }, function(contacts) {

        // If this person hasn't sent any emails
        if (contacts.length === 0) {
            return;
        }

        var data = contacts;

        var outerWidth = 800;
        var outerHeight = 400;
        var margin = { left: 11, top: 75, right: 377, bottom: 88 };
        var radiusMax = 150;

        var innerWidth  = outerWidth  - margin.left - margin.right;
        var innerHeight = outerHeight - margin.top  - margin.bottom;

        // Remove old chart if it exists
        if ($('#map svg').length > 0) {
            $('#map svg').remove();
        }

        var svg = d3.select("#map").append("svg")
            .attr("width",  outerWidth)
            .attr("height", outerHeight);

        var g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var xAxisG = g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + innerHeight + ")");

        var pieG = g.append("g");
        // var textG = g.append('g');
        // var polylineG = g.append('g');

        var colorLegendG = g.append("g")
            .attr("class", "color-legend")
            .attr("transform", "translate(440, -36)");

        var names = [];
        var emails = [];
        var sent = [];
        data.forEach(function(element) {
            names.push(element.name);
            emails.push(element.email);
            sent.push(element.sent);
        });

        var xScale = d3.scalePoint().range([0, innerWidth]);
        var radius = d3.scaleSqrt().range([0, radiusMax]);
        var color = d3.scaleOrdinal(d3.schemeCategory20);

        // var key = function(d) {
        //     return d.data.name;
        // };

        var xAxis = d3.axisBottom().scale(xScale).tickSizeOuter(0);

        var colorLegend = d3Legend.legendColor()
            .scale(color)
            .shapePadding(3)
            .shapeWidth(20)
            .shapeHeight(20)
            .labelOffset(4);


        xScale.domain(data.map(function(d) {
            return 'Jordan, I thought you\'d appreciate this pie chart...';
        }));
        radius.domain([0, d3.max(sent)]);
        color.domain(emails);

        var pie = d3.pie()(data.map(function(d) {
            return d.sent;
        }));

        Array.prototype.max = function() {
            return Math.max.apply(null, this);
        };

        var arc = d3.arc().outerRadius(function(d) {
            return d.data * (120 / sent.max());
        }).innerRadius(0);

        pieG.attr("transform", "translate(" + innerWidth / 2 + "," + innerHeight / 2 + ")");

        var slices = pieG.selectAll("path").data(pie);
        slices.enter().append("path")
            .attr("d", arc)
            .attr("fill", function (d) {
                return color(emails[d.index]);
            });
        slices.exit().remove();

        // function midAngle(d) {
        //     return d.startAngle + (d.endAngle - d.startAngle) / 2;
        // }

        // var text = textG.selectAll('text')
        //     .data(pie, key);

        // text.enter()
        //     .append('text')
        //     .attr('dy', '.35em')
        //     .attr('transform', function(d) {
        //             var pos = arc.centroid(d);
        //             return 'translate(' + pos + ')';
        //     }).text(function(d) {
        //         return names[d.index];
        //     });
        // text.exit().remove();

        // var polyline = polylineG.selectAll('polyline')
        //     .data(pie, key);

        // polyline.enter()
        //     .append('polyline');

        // polyline.exit().remove();

        xAxisG.call(xAxis);
        colorLegendG.call(colorLegend);

        $('h2#email').text(email);

        callback();
    });

};
