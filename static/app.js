var width = 1000, height = 650, centered;

var path = d3.geoPath();

var projection = d3.geoAlbersUsa();
var scale = projection.scale() * 600 / 500;
projection.scale(scale).translate([960/2,600/2])
var projectedPath = d3.geoPath().projection(projection);
var svg = d3.select("body").append("svg")
         .attr("width", width)
         .attr("height", height);

svg.append("rect")
.attr("class", "background")
.attr("width", width)
.attr("height", height)
.on("click", clicked);

var g = svg.append("g");

d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
if (error) throw error;

g.append("g")
.attr("id", "states")
.selectAll("path")
.data(topojson.feature(us, us.objects.states).features)
.enter().append("path")
.attr("d", path)
.on("click", clicked);

g.append("path")
.datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
.attr("id", "state-borders")
.attr("d", path);

// add circles to svg
//latitude longitutde
aa = [-73.9965, 40.7295];
bb = [-79.9528342, 40.4502787];
    
svg.selectAll("circle")
        .data([bb,aa]).enter()
		.append("circle")
		.attr("cx", function (d) { return projection(d)[0]; })
		.attr("cy", function (d) { return projection(d)[1]; })
		.attr("r", "2px")
		.attr("fill", "blue")

});

function clicked(d) {
    var x, y, k;

    if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 2.5;
    centered = d;
    } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
    }

    g.selectAll("path")
    .classed("active", centered && function(d) { return d === centered; });

    g.transition()
    .duration(750)
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
    .style("stroke-width", 1.5 / k + "px");

    
d3.selectAll("circle")
.transition()
.duration(750)
.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
}