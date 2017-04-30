var d3 = require('d3');
var cloud = require('d3-cloud');
var $ = require('jquery-browserify');

var fill = d3.schemeCategory20;

var rawWords = require('./words');
var words = [];

Object.keys(rawWords).forEach(function(key) {
    words.push({text: key.toLowerCase(), size: Math.sqrt(rawWords[key] / 10)});
});

var layout = cloud().size([$('#cloud').width(), $('#cloud').height()])
    .words(words)
    .padding(5)
    .rotate(function() { return ~~(Math.random() * 2) * 90; })
    .font('Impact')
        .fontSize(function(d) {
            console.log(d, d.size);
            return d.size;
        })
    .on('end', draw);

layout.start();

function draw(words) {
    d3.select('#cloud').append('svg')
            .attr('width', layout.size()[0])
            .attr('height', layout.size()[1])
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

$(document).ready(function() {
    $('#cloud svg g text').click(function() {
        console.log(this.textContent);
    });
});
