// Add console.log to check to see if our code is working.
console.log("working");


//		--------------------------------  ADD HURRICANE UPDATE  -----------------------------

/*

// Initialize the map
var map = L.map('map').setView([37.8, -96], 4); // Adjust the coordinates and zoom level as needed

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to fetch and display hurricane data
function fetchHurricaneData() {
  fetch('https://api.weather.gov/alerts/active?event=Hurricane')
    .then(response => response.json())
    .then(data => {
      data.features.forEach(function(hurricane) {
        let coordinates = hurricane.geometry.coordinates;
        let properties = hurricane.properties;

        // Add a marker to the map for each hurricane
        L.marker([coordinates[1], coordinates[0]])
          .bindPopup(`<h3>${properties.headline}</h3><p>${properties.description}</p>`)
          .addTo(map);
      });
    })
    .catch(error => console.error('Error fetching hurricane data:', error));
}

// Call the function to fetch and display hurricane data
fetchHurricaneData();

*/
//		--------------------------------  ADD HURRICANE UPDATE -----------------------------






// We create the tile layer that will be the background of our map.
let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

// We create the second tile layer that will be the background of our map.
let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

// MC - DEV3 - TO CREATE ADDITIONAL LAYERS
let dark = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});


// Create the map object with center, zoom level and default layer.
let map = L.map('mapid', {
	center: [1.7, 128.5],
  //center: [40.7, -94.5], --This is stock , replace with Indonesia
	zoom: 3,
	layers: [streets]
});

// Create a base layer that holds all three maps.
let baseMaps = {
  "Streets": streets,
  "Satellite": satelliteStreets,
  "Dark Mode": dark
};

// 1. Add a 2nd layer group for the tectonic plate data.
let allEarthquakes = new L.LayerGroup();
// MC - DEV1 - ADD SECOND LAYER GROUP VARIABLE FOR TEC-PLATES (See 14.6.4)
let tectonicPlates = new L.LayerGroup();
// MC - DEV2 - Add a 3rd layer group for the major earthquake data.
let majorEarthquakes = new L.LayerGroup();

// 2. Add a reference to the tectonic plates group to the overlays object.
// MC - DEV1 - ADD TEC-PLATES REFERENCE TO OVERLAYS (See 14.6.4)
// MC - DEV2 - ADD MAJ_EARQK REFERENCE TO OVERLAYS
let overlays = {
  "Earthquakes": allEarthquakes,
  "Tectonic_Plates": tectonicPlates,
  "Major_Earthquakes": majorEarthquakes
};

// Then we add a control to the map that will allow the user to change which
// layers are visible.
L.control.layers(baseMaps, overlays).addTo(map);

// Retrieve the earthquake GeoJSON data.
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. We pass the magnitude of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // This function determines the color of the marker based on the magnitude of the earthquake.
  function getColor(magnitude) {
    if (magnitude > 5) {
      return "#ea2c2c";
    }
    if (magnitude > 4) {
      return "#ea822c";
    }
    if (magnitude > 3) {
      return "#ee9c00";
    }
    if (magnitude > 2) {
      return "#eecc00";
    }
    if (magnitude > 1) {
      return "#d4ee00";
    }
    return "#98ee00";
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  // Earthquakes with a magnitude of 0 were being plotted with the wrong radius.
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 4;
  }

  // Creating a GeoJSON layer with the retrieved data.
  L.geoJson(data, {
    	// We turn each feature into a circleMarker on the map.
    	pointToLayer: function(feature, latlng) {
      		console.log(data);
      		return L.circleMarker(latlng);
        },
      // We set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
     // We create a popup for each circleMarker to display the magnitude and location of the earthquake
     //  after the marker has been created and styled.
     onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
  }).addTo(allEarthquakes);

  // Then we add the earthquake layer to our map.
  allEarthquakes.addTo(map);

  // 3. Retrieve the major earthquake GeoJSON data >4.5 mag for the week. DEV2
  let major_data = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";

  d3.json(major_data).then(function(data) {
    
    // 4. Use the same style as the earthquake data.
    // MC - DEV2
    function styleInfo(feature) {
      return {
        opacity: 1,
        fillOpacity: 0.8,
        fillColor: getColor(feature.properties.mag),
        color: "#000000",
        radius: getRadius(feature.properties.mag),
        stroke: true,
        weight: 0.9
      };
    }
    
    // 5. Change the color function to use three colors for the major earthquakes based on the magnitude of the earthquake.
    function getColor(magnitude) {
      if (magnitude > 6) {
        return "red";
      }
      if (magnitude > 5) {
        return "orange";
      }
      if (magnitude > 4) {
        return "yellow";
      }
      return "#98ee00";
    }
    // 6. Use the function that determines the radius of the earthquake marker based on its magnitude.
    function getRadius(magnitude) {
      if (magnitude === 0) {
        return 1;
      }
      return magnitude * 4;
    }

    // 7. Creating a GeoJSON layer with the retrieved data that adds a circle to the map 
    // sets the style of the circle, and displays the magnitude and location of the earthquake
    //  after the marker has been created and styled.
    L.geoJSON(data,{
      // We turn each feature into a circleMarker on the map.
      pointToLayer: function(feature, latlng) {
        console.log(data);
        return L.circleMarker(latlng);
      },
    //MC - We set the style for each circleMarker using our styleInfo function.
  style: styleInfo,
      //MC - We create a popup for each circleMarker to display the magnitude and
      //MC-  location of the earthquake after the marker has been created and styled.
      onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
  }
  }).addTo(map);
// 8. Add the major earthquakes layer to the map.
majorEarthquakes.addTo(map);

// 9. Close the braces and parentheses for the major earthquake data.
});



// Here we create a legend control object.
let legend = L.control({
  position: "bottomright"
});

// Then add all the details for the legend
legend.onAdd = function() {
  let div = L.DomUtil.create("div", "info legend");

  const magnitudes = [0, 1, 2, 3, 4, 5];
  const colors = [
    "#98ee00",
    "#d4ee00",
    "#eecc00",
    "#ee9c00",
    "#ea822c",
    "#ea2c2c"
  ];

  // Looping through our intervals to generate a label with a colored square for each interval.
  for (var i = 0; i < magnitudes.length; i++) {
    console.log(colors[i]);
    div.innerHTML +=
      "<i style='background: " + colors[i] + "'></i> " +
      magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Finally, we our legend to the map.
  legend.addTo(map);

  
  // 3. Use d3.json to make a call to get our Tectonic Plate geoJSON data.
  // MC -DEV1 - MAKE A CALL TO PULL techdata geoJSON DATA WITH d3 - (See 14.5.3 - 14.5.4)

  let tech_data = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

  d3.json(tech_data).then(function(data) {
    console.log(data);
  L.geoJSON(data).addTo(map);
  });

  // Use d3.json to make a call to get our Major Earthquake geoJSON data.
  // MC -DEV2 - MAKE A CALL TO PULL MajEarthquake geoJSON DATA WITH d3
  // let major_data = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";

  // d3.json(major_data).then(function(data) {
  //   console.log(data);
  // L.geoJSON(data).addTo(map);
  // });

});

