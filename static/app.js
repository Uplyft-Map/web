API_URL = "http://localhost:5000/"
SOCKET_ADDR = 'http://localhost:5000/uplyft-msg';

$(function () {
    socket = io.connect(SOCKET_ADDR);
    $('form').submit(function(e){
      e.preventDefault(); // prevents page reloading
      socket.emit('tx-msg', $('#m').val());
      $('#m').val('');
      return false;
    });
    socket.on('rx-msg', function(msg){
      console.log(msg);
      if (msg[1] != socket.io.engine.id) {
        $('#messages').append($('<li>').text(msg[0]));
      } else {
        $('#messages').append($('<li style="background: #b3e6ff;">').text('Me: '+msg[0]));
      }
      var messageBody = document.querySelector('#messages');
      messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
    });
  });

var width = 1000, height = 650, centered;

var path = d3.geoPath();

var projection = d3.geoAlbersUsa();
var scale = projection.scale() * 600 / 500;
projection.scale(scale).translate([960/2,600/2])
var projectedPath = d3.geoPath().projection(projection);
var svg = d3.select("#map_div").append("svg")
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

    // var obj = JSON.parse(json);

    d3.json(API_URL+"getData", function(error, obj) {
    console.log(obj);

    var coords = [];
    for (var i = 0; i < obj.length; i++){
        var lst = obj[i].coord;
        lst.push(obj[i].name);
        lst.push(obj[i].depression);
        lst.push(obj[i].size);
        lst.push(obj[i].top_words)
        //console.log(lst)
        coords.push(lst);
    }
    //console.log(coords)

    svg.selectAll("circle")
            .data(coords).enter()
    		.append("circle")
    		.attr("cx", function (d) { return projection(d)[0]; })
    		.attr("cy", function (d) { return projection(d)[1]; })
    		.attr("r", function (d) { return (d[3]-0.3) * 20; })
            .attr("fill", function (d) { return "rgb(255, " + Math.min(((0.8-d[3]) * 3000).toFixed(0), 255)+ ", 0)"; })
            .style("opacity", function (d) { return d[3] * 2 - 1; })
            /*
            .on("mouseover", function(d) {
                d3.select(this).style("stroke", "black")
                               .style("stroke-width", 2)
            })
            */
        svg.selectAll("text")
            .data(coords)
            .enter()
            .append("text")
            .attr("text-anchor", "middle")
            .attr("font-size", "8px")
            .attr("x", function (d) { return projection(d)[0]; })
            .attr("y", function (d) { return projection(d)[1]; })
            .style("opacity", 0)
            .on("mouseover", function(d) {d3.select(this).style("opacity", 1)})
            .on("mouseout", function(d) {d3.select(this).style("opacity", 0)})
            .text(function (d) { return d[2]+"\n"+(d[3]*10).toFixed(1); })
            .on("click", function(d) {display_modal(d[2], d[3], d[4], d[5]);});

});});

function display_modal(college, depression, population, top_words) {
    $("#exampleModal").find('.modal-title').text(college + " ("+(depression*10).toFixed(1)+" negative)");
    $("#exampleModal").find('.modal-body').html("Loading...");
    $("#exampleModal").modal("show");
    $.getJSON(API_URL+"getConfessions/"+college+"/3", function(data) {
        _display_modal(college, depression, population, top_words, data);
    });
}

function _display_modal(college, depression, population, top_words, confessions) {
    $("#exampleModal").find('.modal-title').text(college + " ("+(depression*10).toFixed(1)+" negative)");
    var basic_link = "https://twitter.com/intent/tweet?url=https://uplyft.world&hashtags="
    var links = ""
    for (var i = 0; i < top_words.length; i++){
        links += ("<a href="+basic_link+top_words[i]+" target==\"blank\">"+top_words[i]+"</a>"+((i != (top_words.length-1))?", ":""))
    }
    var confs = "";
    for (var i = 0; i < confessions.length; i++) {
        confs += ("<li style=\"background: "+confessions[i][1]+";\">"+confessions[i][0]+"</li>");
    }
    html_body = ("<p><strong>Students:</strong> "+population+"</p><p><strong>Common Words: </strong>"+links+"</p><p><strong>Recent Confessions:</strong></p><ul class=\"list-unstyled\">"+confs.replace(/fuck|shit|bitch|cunt|dick|vagina/gi, "****")+"</ul>")
    $("#exampleModal").find('.modal-body').html(html_body);
    $("#exampleModal").modal("show");
}

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
