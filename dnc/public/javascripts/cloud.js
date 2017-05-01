var d3 = require('d3');
var cloud = require('d3-cloud');
var tree = require('./tree');
var $ = require('jquery-browserify');

var fill = d3.schemeCategory20;

var rawWords = require('./words');
var words = [];

Object.keys(rawWords).forEach(function(key) {
    words.push({text: key.toLowerCase(), size: Math.sqrt(rawWords[key] / 10)});
});

var margin = {top: 80, right: 10, bottom: 0, left: 0};

var layout = cloud().size([$('#cloud').width() - margin.right - margin.left, $('#cloud').height() - margin.top - margin.bottom])
    .words(words)
    .padding(5)
    .rotate(function() { return ~~(Math.random() * 2) * 90; })
    .font('Impact')
        .fontSize(function(d) {
            return d.size;
        })
    .on('end', draw);

layout.start();

function draw(words) {
    d3.select('#cloud').append('svg')
            .attr('width', layout.size()[0] + margin.left + margin.right)
            .attr('height', layout.size()[1] + margin.top + margin.bottom)
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .append('g')
            .attr('transform', 'translate(' + layout.size()[0] / 2 + ',' + layout.size()[1] / 2 + ')')
        .selectAll('text')
            .data(words)
        .enter().append('text')
            .style('font-size', function(d) { return d.size + 'px'; })
            .style('font-family', 'Impact')
            .style('fill', function(d, i) { return fill[i]; })
            .attr('text-anchor', 'middle')
            .attr('transform', function(d) {
                return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
            })
            .text(function(d) { return d.text; });

}

