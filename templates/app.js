var mapTypeSelect = document.getElementById('mapType');
var map = document.getElementById('map')
mapTypeSelect.addEventListener('change', function () {
  var type = mapTypeSelect[mapTypeSelect.selectedIndex].value
  console.log(mapTypeSelect[mapTypeSelect.selectedIndex].value)
  map.innerHTML = ''
  if (type === 'ratio') {
    affordabilityMap()
  }
  else if (type === 'price') {
    cannabisPriceMap()
  }
  else if (type === 'income') {
    medianIncomeMap()
  }

})

var width = 960, height = 500;

function affordabilityMap() {

  var svg = d3.select('#map').append('svg')
    .attr('width', width)
    .attr('height', height);

  var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

  var path = d3.geo.path()
    .projection(projection);
  d3.json('./templates/us.json', function (error, us) {
    svg.selectAll('.states')
      .data(topojson.feature(us, us.objects.usStates).features)
      .enter()
      .append('path')
      .style('fill', (d, i) => {
        return intensityToGreen(d.properties.MEDIAN_INCOME / (d.properties.CANABIS_PRICE * 300) * 220);
      })
      .attr('class', (d, i) => {
        return 'states';
      })
      .attr('d', path)
      .on('mouseover', generateInfoText)
      .on('mouseleave', resetInfoText);
  });
}

function resetInfoText() {
  document.getElementById('title').innerHTML = 'N/A';
  document.getElementById('income').innerHTML = '<b>Median Income:</b> N/A';
  document.getElementById('price').innerHTML = '<b>Average Price of High Quality Cannabis:</b> N/A';
  document.getElementById('affordability').innerHTML = '<b>Cannabis Affordability Factor:</b> N/A';

  document.getElementById('gini').innerHTML = '<b>Gini Coefficient:</b> N/A';
}

function cannabisPriceMap() {
  var svg = d3.select('#map').append('svg')
    .attr('width', width)
    .attr('height', height);

  var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

  var path = d3.geo.path()
    .projection(projection);
  d3.json('./templates/us.json', function (error, us) {
    svg.selectAll('.states')
      .data(topojson.feature(us, us.objects.usStates).features)
      .enter()
      .append('path')
      .style('fill', (d, i) => {
        return intensityToGreen(d.properties.CANABIS_PRICE / 300 * 160);
      })
      .attr('class', (d, i) => {
        return 'states';
      })
      .attr('d', path)
      .on('mouseover', generateInfoText)
      .on('mouseleave', resetInfoText);
  });
}

function medianIncomeMap() {
  var svg = d3.select('#map').append('svg')
    .attr('width', width)
    .attr('height', height);

  var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

  var path = d3.geo.path()
    .projection(projection);
  d3.json('./templates/us.json', function (error, us) {
    svg.selectAll('.states')
      .data(topojson.feature(us, us.objects.usStates).features)
      .enter()
      .append('path')
      .style('fill', (d, i) => {
        return intensityToGreen(160 * (d.properties.MEDIAN_INCOME / 60000));
      })
      .attr('class', (d, i) => {
        return 'states';
      })
      .attr('d', path)
      .on('mouseover', generateInfoText)
      .on('mouseleave', resetInfoText);
  });
}

var generateInfoText = (d) => {
  var name = d.properties.STATE_ABBR;
  const weedPrice = d.properties.CANABIS_PRICE;
  //console.log(weedPrice)
  const medianIncome = d.properties.MEDIAN_INCOME;
  const gini = d.properties.GINI;
  document.getElementById('title').innerHTML = name;
  document.getElementById('income').innerHTML = '<b>Median Income:</b> $' + medianIncome;
  document.getElementById('price').innerHTML = '<b>Average Price of High Quality Cannabis:</b> $' + weedPrice;
  document.getElementById('gini').innerHTML = '<b>Gini Coefficient:</b>' + gini;
  document.getElementById('affordability').innerHTML = '<b>Cannabis Affordability Factor:</b> ' + medianIncome / (weedPrice * 300) * 100;
  return
}

var intensityToGreen = (intensity) => {
  return rgbToHex(0, Math.round(255 - intensity), 0);
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

affordabilityMap()