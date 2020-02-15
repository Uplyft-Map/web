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

var json = '[{"name": "Princeton", "size": 8374, "coord": [-74.6551, 40.3431], "depression": 0.0}, {"name": "Harvard", "size": 20739, "coord": [-71.1167, 42.377], "depression": 0.0}, {"name": "Columbia", "size": 33032, "coord": [-73.9626, 40.8075], "depression": 0.0}, {"name": "MIT", "size": 11520, "coord": [-71.0942, 42.3601], "depression": 0.0}, {"name": "Yale", "size": 13433, "coord": [-72.9223, 41.3163], "depression": 0.0}, {"name": "Stanford", "size": 17249, "coord": [-122.1697, 37.4275], "depression": 0.0}, {"name": "UChicago", "size": 16445, "coord": [-87.5987, 41.7886], "depression": 0.0}, {"name": "UPenn", "size": 21960, "coord": [-75.1932, 39.9522], "depression": 0.0}, {"name": "Northwestern", "size": 21208, "coord": [-87.6739,42.0549], "depression": 0.0}, {"name": "JHU", "size": 21208, "coord": [-76.6205, 39.3299], "depression": 0.0}, {"name": "Caltech", "size": 2233, "coord": [-118.1253, 34.1377], "depression": 0.0}, {"name": "Dartmouth", "size": 6571, "coord": [-72.2887, 43.7044], "depression": 0.0}, {"name": "Brown", "size": 10257, "coord": [-71.4025, 41.8268], "depression": 0.0}, {"name": "Notre Dame", "size": 12292, "coord": [-86.2353, 41.7056], "depression": 0.0}, {"name": "Vanderbilt", "size": 13131, "coord": [-86.8027, 36.1447], "depression": 0.0}, {"name": "Cornell", "size": 15043, "coord": [-76.4735, 42.4534], "depression": 0.0}, {"name": "Rice", "size": 7124, "coord": [-95.4018, 29.7174], "depression": 0.0}, {"name": "Wash U St. Louis", "size": 15045, "coord": [-90.3108, 38.6488], "depression": 0.0}, {"name": "Berkeley", "size": 43204, "coord": [-122.2585, 37.8719], "depression": 0.0}, {"name": "Emory", "size": 15451, "coord": [-84.3222, 33.7971], "depression": 0.0}, {"name": "Georgetown", "size": 19005, "coord": [-77.0723, 38.9076], "depression": 0.0}, {"name": "Carnegie Mellon", "size": 14799, "coord": [-79.9431, 40.4429], "depression": 0.0}, {"name": "UMich", "size": 46002, "coord": [-83.7382, 42.278], "depression": 0.0}, {"name": "Wake Forest", "size": 8116, "coord": [-80.2792, 36.1354], "depression": 0.0}, {"name": "NYU", "size": 51848, "coord": [-73.9965, 40.7295], "depression": 0.0}, {"name": "UNC Chapel Hill", "size": 29847, "coord": [-79.0469, 35.9049], "depression": 0.0}, {"name": "University of Rochester", "size": 12233, "coord": [-77.626, 43.1306], "depression": 0.0}, {"name": "UCLA", "size": 45742, "coord": [-118.4452, 34.0689], "depression": 0.0}, {"name": "University of Florida", "size": 56079, "coord": [-82.3549, 29.6436], "depression": 0.0}, {"name": "UC Irvine", "size": 35220, "coord": [-117.8443, 33.6405], "depression": 0.0}, {"name": "Boston University", "size": 34262, "coord": [-71.1054, 42.3505], "depression": 0.0}, {"name": "Brandeis", "size": 5800, "coord": [-71.2585, 42.3657], "depression": 0.0}]'
var obj = JSON.parse(json);

var coords_name = [];
for (var i = 0; i < obj.length; i++){
    var lst = obj[i].coord
    lst.push(obj[i].name)
    //console.log(lst)
    coords_name.push(lst)
}
//console.log(coords)

aa = [-118.1253, 34.1377];
bb = [-87.6739,42.0549];
    
svg.selectAll("circle")
        .data(coords_name).enter()
		.append("circle")
		.attr("cx", function (d) { return projection(d)[0]; })
		.attr("cy", function (d) { return projection(d)[1]; })
		.attr("r", "2px")
        .attr("fill", "blue")
        /*
        .on("mouseover", function(d) {
            d3.select(this).style("stroke", "black")
                           .style("stroke-width", 2)
        })
        .on("mouseout", function(d) {d3.select(this).style("stroke", "none")});
        */
    svg.selectAll("text")
        .data(coords_name)
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("font-size", "8px")
        .attr("x", function (d) { return projection(d)[0]; })
        .attr("y", function (d) { return projection(d)[1]-2; })
        .style("opacity", 0)
        .on("mouseover", function(d) {d3.select(this).style("opacity", 1)})
        .on("mouseout", function(d) {d3.select(this).style("opacity", 0)})
        .text(function (d) { return d[2]; });

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

    d3.selectAll("text")
    .transition()
    .duration(750)
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")

}