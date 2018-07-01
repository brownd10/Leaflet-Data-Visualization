// Store mapBox data visualization token
const mapboxToken = "access_token=pk.eyJ1IjoiYnJvd25kMTAiLCJhIjoiY2poeGh5aHNoMGJ5MTN3bzZzNWk2bWs5NiJ9.LUA51zZOq8mp0HMy37AfLg";

// Store our earthquake data API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";

// Store our tectonic plates data API endpoint inside platesUrl
var platesLink = "https://raw.githubusercontent.com/fraxen/tecPlates/master/GeoJSON/PB2002_boundaries.json"

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
        "</h3><hr><p>" + new Duration(feature.properties.dmin) + "</p>");
      },
      pointToLayer: function (feature, latlng) {
        return new L.circle(latlng, {
            radius: getRadius(feature.properties.mag),
            fillColor: getColor(feature.properties.mag),
            fillOpacity: .25,
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
    var streetMap = L.tileLayer("https://http://api.mapbox.com/v4/mapbox.streets.html?" + mapboxToken);
  
    var streetSatelliteMap = L.tileLayer("https://http://api.mapbox.com/v4/mapbox.streets-satellite.html?" + mapboxToken);
  
    var rbhMap = L.tileLayer("https://http://api.mapbox.com/v4/mapbox.run-bike-hike.html?" + mapboxToken);
  
    
  
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Streets Map": streetMap,
      "Streets Satellite Map": streetSatelliteMap,
      "Run Bike Hike Map": rbhMap
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
      center: [0, 0],
      zoom: 4,
      layers: [streetMap, earthquakes, tecPlates]
    });
  
     // Add Fault lines data
     d3.json(platesLink, function(plates) {
       L.geoJson(plates, {
         color: "blue",
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
    var legend = L.control({position: 'topright'});
  
    legend.onAdd = function (myMap) {
  
      var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 1, 2, 3, 4, 5],
                labels = [];
  
    // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
      return div;
    };
  
    legend.addTo(myMap);
  }
  
  function getColor(c) {
    return c > 5 ? '#F30' :
    c > 4  ? '#F60' :
    c > 3  ? '#F90' :
    c > 2  ? '#FC0' :
    c > 1   ? '#FF0' :
              '#9F3';
  }
  
  function getRadius(value){
    return value*40000
  }

