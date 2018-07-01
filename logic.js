// Store mapBox data visualization token
const mapboxToken = "access_token=pk.eyJ1IjoiYnJvd25kMTAiLCJhIjoiY2poeGh5aHNoMGJ5MTN3bzZzNWk2bWs5NiJ9.LUA51zZOq8mp0HMy37AfLg";

// Store our earthquake data API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";

// Store our tectonic plates data API endpoint inside platesUrl
var platesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/b53c3b7d82afd764650ebdc4565b9666795b9d83/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the Earthquake query URL
d3.json(queryUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {       

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJson(earthquakeData, {
      onEachFeature: function (feature, layer){
        layer.bindPopup("<h3>" + feature.properties.title + "<br> Magnitude: " + feature.properties.mag +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
      },
      pointToLayer: function (feature, latlng) {
        return new L.circle(latlng, {
            radius: getRadius(feature.properties.mag),
            fillColor: getColor(feature.properties.mag),
            fillOpacity: 1,
            stroke: true,
            color: "black",
            weight: .5
            })
      }
    });
  
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes)
  }
  
  function createMap(earthquakes) {
  
    // Define map layers
    var streetMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?" + mapboxToken);
  
    var streetSatelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?" + mapboxToken);
  
    var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" + mapboxToken);
  
    
  
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Street Map": streetMap,
      "Satellite Streets Map": streetSatelliteMap,
      "Light Map": lightMap
    };
  
    // Add a tectonic plate layer
    var tecPlates = new L.LayerGroup();
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes,
      "Tectonic Plates": tecPlates
    };
  
    // Create our map, with layers to display on load
    var myMap = L.map("map", {
      center: [39.8283, -98.5795], //falls in the middle of America
      zoom: 1.5,
      layers: [streetMap, earthquakes, tecPlates]
    });
  
     // Add Fault lines data
     d3.json(platesLink, function(plates) {
       L.geoJson(plates, {
         color: "green",
         weight: 2
       })
       .addTo(tecPlates);
     });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  
    // Create legend
    var legend = L.control({position: 'topleft'});
  
    legend.onAdd = function (myMap) {
  
      var div = L.DomUtil.create('div', 'info legend'),
                grades = [4.5, 5],
                labels = [];
  
    // loop through our density intervals and generate the color labels
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + .1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
      return div;
    };
  
    legend.addTo(myMap);
  }
  
  function getColor(c) {
    return c >= 5 ? '#FF0000' :
           '#FFFF00';
  }
  
  function getRadius(value){
    return value*50000
  }