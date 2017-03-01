function getData(callback) {
    var count = 0;
    var data = {};
    var categories = ['age', 'race', 'education', 'povertyStatus', 'maritalStatus', 'region'];

    categories.forEach(function(item, index) {
        d3.csv('./' + categories[index] + '.csv').get(function(error, rows) {
            data[categories[index]] = rows;
            count++;
            if(count === 6) {
                callback(data);
            }
        });
    });
}

function processData(data) {
    var colors = ['#00907F', '#0010E5', '#E54000', '#DAA800', '#CE0ACE', '#FCC50D', '#6CF10C'];
    var catNames = {
        age: 'Age',
        education: 'Education',
        maritalStatus: 'Marital status',
        povertyStatus: 'Poverty status',
        race: 'Race',
        region: 'Region'
    };
    Object.keys(data).forEach(function(item, index) {
        var currentData = data[item];
        var colorRange = colors.slice(0, currentData.length - 1);
        var svg = d3.select('#' + item),
            margin = {top: 20, right: 20, bottom: 20, left: 20},
            width = +svg.attr('width') - margin.left - margin.right,
            height = +svg.attr('height') - margin.top - margin.bottom,
            g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        var x0 = d3.scaleBand()
            .rangeRound([0, width])
            .paddingInner(0.1);

        var x1 = d3.scaleBand()
            .paddingInner(.05);

        var y = d3.scaleLinear()
            .rangeRound([height, 0]);

        var z = d3.scaleOrdinal()
            .range(colorRange);

        var keys = Object.keys(currentData[0]).slice(1);

        x0.domain(currentData.map(function(d) {
            return d[catNames[item]];
        }));
        x1.domain(keys).rangeRound([0, x0.bandwidth()]);
        y.domain([0, d3.max(currentData, function(d) {
            return d3.max(keys, function(key) {
                return d[key];
            });
        })]);

        console.log(x0.bandwidth());
        console.log(x1.bandwidth());

        g.append('g')
            .selectAll('g')
            .data(currentData)
            .enter().append('g')
            .attr('transform', function(d) {
                return 'translate(' + x0(d[catNames[item]]) + ',0)';
            })
            .selectAll('rect')
            .data(function(d) {
                return keys.map(function(key) {
                    return {key: key, value: d[key]};
                });
            })
            .enter().append('rect')
            .attr('x', function(d) {
                // console.log(x1(d.key));
                return x1(d.key);
            })
            .attr('y', function(d) {
                // console.log(y(d.value));
                return y(d.value);
            })
            .attr('width', x1.bandwidth())
            .attr('height', function(d) {
                // console.log(y(d.value));
                return height - y(d.value);
            })
            .attr('fill', function(d) {
                // console.log(z(d.key));
                return z(d.key);
            });

        g.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(x0));

        g.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(y).ticks(null, 's'))
            .append('text')
            .attr('x', 2)
            .attr('y', y(y.ticks().pop()) + 0.5)
            .attr('dy', '0.32em')
            .attr('fill', '#000')
            .attr('font-weight', 'bold')
            .attr('text-anchor', 'start')
            .text('Percentage of US Population');

        var legend = g.append('g')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 10)
            .attr('text-anchor', 'end')
            .selectAll('g')
            .data(keys.slice().reverse())
            .enter().append('g')
            .attr('transform', function(d, i) {
                return 'translate(0,' + i * 20 + ')';
            });

        legend.append('rect')
            .attr('x', width - 19)
            .attr('width', 19)
            .attr('height', 19)
            .attr('fill', z);

        legend.append('text')
            .attr('x', width - 24)
            .attr('y', 9.5)
            .attr('dy', '0.32em')
            .text(function(d) {
                return d;
            });

    });
}

getData(processData);
