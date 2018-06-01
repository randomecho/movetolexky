var map;
var plot_library = [];
var plot_hospital = [];
var plot_faultline = [];
var plot_school = [];
var plot_park = [];
var plot_flood = [];
var icons = {
  hospitals: {
    path: 'M0,100V0h20.189v39.349h39.563V0h20.195v100H59.752V56.27H20.189V100H0z',
    fillColor: '#ffffff',
    fillOpacity: 1,
    scale: 0.3,
    strokeColor: '#005da9',
    strokeWeight: 3
  },
  libraries : {
    path: 'M46.834,29.254c7.994,0,14.448-6.569,14.448-14.64C61.282,6.532,54.828,0,46.834,0S32.378,6.532,32.378,14.614 C32.378,22.685,38.84,29.254,46.834,29.254z M60.891,32.813c6.61,0.236,9.392,5.591,9.392,5.591l21.341,29.608c0.883,1.313,1.398,2.92,1.398,4.654 c0,4.604-3.688,8.342-8.243,8.342c-1.09,0-2.081-0.244-3.022-0.604l-12.883-3.638v12.997H24.15V76.767l-12.884,3.636 c-0.908,0.362-1.931,0.606-3.03,0.606C3.68,81.009,0,77.271,0,72.667c0-1.735,0.509-3.343,1.431-4.656l21.327-29.607 c0,0,2.799-5.355,9.386-5.59H60.891L60.891,32.813z M46.517,80.688L46.517,80.688l16.688-5.606l-0.365-0.074 c-11.525-3.416-7.046-18.806,4.453-15.372l1.583,0.557V42.823l-22.358,7.38L24.15,42.822v17.367l1.575-0.556 c11.518-3.435,16.005,11.955,4.48,15.371l-0.375,0.077L46.517,80.688L46.517,80.688z M92.458,100c1.143,0,2.06-0.925,2.06-2.079l0,0c0-1.161-0.917-2.08-2.06-2.08H2.2c-1.118,0-2.058,0.919-2.058,2.08l0,0 c0,1.153,0.94,2.079,2.058,2.079H92.458z',
    fillColor: '#333333',
    fillOpacity: 1,
    scale: 0.3,
    strokeColor: '#000000',
    strokeWeight: 1
  }
};

function initialize() {
  var mapOptions = {
    zoom: 12,
    center: new google.maps.LatLng(38.049037, -84.499766),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
}

google.maps.event.addDomListener(window, 'load', initialize);

function importOpenData(amenity) {
  return new Promise(function(success, reject){
    var jsonData = new XMLHttpRequest();
    jsonData.open('GET', 'data/' + amenity.replace(/\s/g, '') + '.json', false);
    jsonData.onreadystatechange = function() {
      if (jsonData.readyState === XMLHttpRequest.DONE && jsonData.status === 200) {
        success(JSON.parse(jsonData.response));
      }
    };
    jsonData.send();
  });
}

// Mark where on the map the point should go
function plotMarker(latitude, longitude, title, zindex, icon) {
  var map_coords = new google.maps.LatLng(latitude, longitude);
  var marker = new google.maps.Marker({
    position: map_coords,
    title: title,
    zIndex: zindex,
    icon: icons[icon]
  });
  
  return marker;
}

function plotPolyline(polyline_coords) {
  var marker_line = new google.maps.Polyline({
    path: polyline_coords,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 3
  });
  
  return marker_line;
}

function plotPolygon(polygon_coords, polygon_color = '#005da9') {
  var marked_area = new google.maps.Polygon({
    path: polygon_coords,
    strokeColor: polygon_color,
    strokeOpacity: 1.0,
    strokeWeight: 3,
    fillColor: '#005da9',
    fillOpacity: 0.1
  });
  
  return marked_area;
}

// Run through and show the markers that have been plotted
function addMarkers(plotted_markers) {
  for (var i = 0, n = plotted_markers.length; i < n; i++) {
    plotted_markers[i].setMap(map);
  }
}

// Clear the markers off the map
function clearMarkers(plotted_markers) {
  for (var i = 0, n = plotted_markers.length; i < n; i++) {
    plotted_markers[i].setMap(null);
  }
}

function overlayAmenityByType(amenity, plot_points, plotting_type, color = '#005da9') {
  var button_hit =  document.getElementById('show-' + amenity);

  if (button_hit.getAttribute('data-state') == 'show') {
    if (plot_points.length == 0) {
      importOpenData(amenity).then(function(data) {
        switch (plotting_type) {
          case 'lines':
            renderCoordsPolyline(data, plot_points);
            break;
          case 'points':
            renderCoordsPoints(data, plot_points, amenity);
            break;
          case 'polygons':
            renderCoordsPolygon(data, plot_points, color);
            break;
        }
      }, function(error) {
        console.error("Overlay fault", error);
      });
    }

    addMarkers(plot_points);
    toggleAmenityChosen(button_hit, amenity, 'hide');
  } else {
    clearMarkers(plot_points);
    toggleAmenityChosen(button_hit, amenity);
  }
}

function plotCoordinates(coord_points) {
  var coords_plotted = [];

  for (var i = 0, n = coord_points.length; i < n; i++) {
    var longlat = coord_points[i].split(',');
    var coords = new google.maps.LatLng(longlat[1], longlat[0]);
    coords_plotted.push(coords);
  }

  return coords_plotted;
}

function plotMultiPartCoordinates(coordinates) {
  if (typeof coordinates === 'object') {
    for (var i = 0, n = coordinates.length; i < n; i++) {
      return plotCoordinates(coordinates[i].split(' '));
    }
  }

  return plotCoordinates(coordinates.split(' '));
}

function renderCoordsPoints(coordinates, plot_type, icon) {
  for (var i = 0, n = coordinates.length; i < n; i++) {
    var longlat = coordinates[i].coordinates.split(',');
    var marker = plotMarker(longlat[1], longlat[0], coordinates[i].name, i, icon);

    plot_type.push(marker);
  }

  addMarkers(plot_type);
}

function renderCoordsPolyline(coordinates, plot_type) {
  for (var i = 0, n = coordinates.length; i < n; i++) {
    var coords_plotted = plotCoordinates(coordinates[i].coordinates.split(' '));
    plot_type.push(plotPolyline(coords_plotted));
  }

  addMarkers(plot_type);
}

function renderCoordsPolygon(coordinates, plot_type, polygon_color) {
  for (var i = 0, n = coordinates.length; i < n; i++) {
    var coords_plotted = plotMultiPartCoordinates(coordinates[i].coordinates);
    plot_type.push(plotPolygon(coords_plotted, polygon_color));
  }

  addMarkers(plot_type);
}

function toggleAmenityChosen(button, amenity, new_state = 'show') {
  var css_class = (new_state === 'show') ? '' : 'clicked';

  button.setAttribute('class', css_class);
  button.setAttribute('data-state', new_state);
  button.textContent = new_state + ' ' + amenity;
}

document.getElementById('show-libraries').addEventListener('click', function(e){
  overlayAmenityByType('libraries', plot_library, 'points');
});

document.getElementById('show-hospitals').addEventListener('click', function(e){
  overlayAmenityByType('hospitals', plot_hospital, 'points');
});

document.getElementById('show-faultlines').addEventListener('click', function(e){
  overlayAmenityByType('faultlines', plot_faultline, 'lines');
});

document.getElementById('show-schools').addEventListener('click', function(e){
  overlayAmenityByType('schools', plot_school, 'polygons', '#333333');
});

document.getElementById('show-parks').addEventListener('click', function(e){
  overlayAmenityByType('parks', plot_park, 'polygons', '#339933');
});

document.getElementById('show-floodplains').addEventListener('click', function(e){
  overlayAmenityByType('floodplains', plot_flood, 'polygons', '#005da9');
});
