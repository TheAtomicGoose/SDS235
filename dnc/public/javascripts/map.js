var d3 = require('d3');


var d3Legend = require('d3-svg-legend');
var $ = require('jquery-browserify');

exports.render = function(email, callback) {

    $.post('/', { email: email }, function(data) {

        // If this person hasn't sent any emails
        if (data.length === 0) {
            return;
        }

        // Remove old chart if it exists
        if ($('#map svg').length > 0) {
            $('#map svg').remove();
        }

        var svg = d3.select('#map').append('svg')
                .attr('width', $('#map').width())
                .attr('height', $('#map').height())
                .attr('style', 'border-left: 1px solid #d3d3d3'),
            margin = {top: 20, right: 20, bottom: 140, left: 140 },
            width = 600 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;

        var x = d3.scaleBand().range([0, width]).domain(data.map(function(d) {
            return d.email;
        })).padding(.1),
            y = d3.scaleLinear().range([height, 0]).domain([0, d3.max(data, function(d) { return d.sent; })]);

        var g = svg.append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        var color = d3.scaleOrdinal(d3.schemeCategory20);

        color.domain(data.map(function(d) { return d.email; }));

        g.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .attr('class', 'x-axis')
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-65)');

        g.append('g')
            .call(d3.axisLeft(y).ticks(4))
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '0.71em')
            .attr('text-anchor', 'end')
            .text('Emails Sent to Address');

        g.selectAll('.bar')
            .data(data)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('id', function(d) { return d.email; })
            .attr('x', function(d) { return x(d.email); })
            .attr('y', function(d) { return y(d.sent); })
            .attr('width', x.bandwidth())
            .attr('height', function(d) { return height - y(d.sent); })
            .attr('fill', function(d) { return color(d.email); });

        $('h2#email').text(email);

        callback();
    });
};
