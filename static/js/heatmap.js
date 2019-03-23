//------------------------------------------------------------------------
// Visualizing Data with Leaflet
// - See README.md for description of the application. 

// Initialize global constants
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
const magColors = [[0,'#dac292'], [2,'#ada397'], [4,'#622569'], [6,'#c83349']];
const magScales = [[1,.5], [2,1], [3,1.5], [4,2.5], [5,4], [6,7], [7,10]];

const magStyles = [{mag: 0, style:{radius: 15000, color:'blue', opacity:.25, fillColor:'blue', fillOpacity:.15, weight:1}},
                   {mag: 35, style:{radius: 15000, color:'cyan', opacity:.25, fillColor:'cyan', fillOpacity:.15, weight:1}},
                   {mag: 50, style:{radius: 25000, color:'lime', opacity:.25, fillColor:'lime', fillOpacity:.30, weight:1}},
                   {mag: 65, style:{radius: 30000, color:'yellow', opacity:.25, fillColor:'yellow', fillOpacity:.40, weight:1}},
                   {mag: 75, style:{radius: 40000, color:'red', opacity:.25, fillColor:'red', fillOpacity:.50, weight:1}}]

//------------------------------------------------------------------------
// Application Entry
// - Perform request for current earthquake data. 
// - When received, process the earthquake data and create the map
//
  // Initial layer using street maps
  let streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 5,
  minZoom: 2,
  id: "mapbox.streets",
  accessToken: API_KEY,
  noWrap: true
});

// Secondary layer using "dark" map
let darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 55,
  minZoom: 2,
  id: "mapbox.dark",
  accessToken: API_KEY,
  noWrap: true
});

// Create map object
let myMap = L.map("map", {
  center : [37.09, -95.71],
  zoom   : 3,
  maxBounds : [[-90,-180], [90,180]]
});

// Show the map
streetmap.addTo(myMap);

d3.json('/epdatadb', function(hurdat) {
  let ephurdat = hurdat;
  console.log("Got EP data ...")

  d3.json('/cpdatadb', function(hurdat) {
    let cphurdat = hurdat;
    console.log("Got CP data ...")

    d3.json('/aldatadb', function(hurdat) {
      let alhurdat = hurdat;
      console.log("Got AL data ...")

      // Create the layer control for the map
      //let ovlyCtl = L.control.layers({collapsed: false})
      let baseMaps = {"Street Map" : streetmap, "Dark Map" : darkmap};
      //ovlyCtl.addBaseLayer(darkmap, "Dark Map")

      // Create overlay object to hold our overlay layer
      let overlayMaps = {
        EastPacific    : L.geoJSON(ephurdat, {pointToLayer : magCircle}),
        CentralPacific : L.geoJSON(cphurdat, {pointToLayer : magCircle}),
        Atlantic       : L.geoJSON(alhurdat, {pointToLayer : magCircle})
      };

      // Add primary basemap and earthquake data overlay to the map
      // Create the layer control, and add it to the map
      //myMap.addLayer(baseMaps["Street Map"]).addLayer(earthquakes)
      myMap.addControl(L.control.layers(baseMaps, overlayMaps, {collapsed: false}));


      // Add legend for circle colors / magnitude to the map
      let legend = L.control({position: 'bottomright'});

      legend.onAdd = function (map) {
          var div = L.DomUtil.create('div', 'info legend');
          
          for (i=0; i<magStyles.length-1; i++) {
            div.innerHTML += `<i style="background:${magStyles[i]['style']['color']}"></i>Wind < ${magStyles[i+1]['mag']} <br>`;
          }
          div.innerHTML += `<i style="background:${magStyles[magStyles.length-1]['style']['color']}"></i>Wind >= ${magStyles[magStyles.length-1]['mag']} <br>`;

          return div;
      };
      
      legend.addTo(myMap);

    });
  });
});


//------------------------------------------------------------------------
// Utility functions
// 
function magStyle(mag) {
  for (i=magStyles.length-1; i>0; i--) {if (mag > magStyles[i]['mag']) return magStyles[i]['style'];}
  return magStyles[0]['style'];
}

function magCircle (feature, latlng) {
  return L.circle(latlng, magStyle(feature.properties.windspeed));
}