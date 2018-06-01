var map;
var plot_library = [];
var plot_hospital = [];
var plot_faultline = [];
var plot_school = [];
var plot_park = [];
var plot_flood = [];

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
    icon: icon
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
            renderCoordsPoints(data, plot_points, 'images/icon-' + amenity + '.png');
            break;
          case 'polygons':
            renderCoordsPolygon(data, plot_points, color);
            break;
        }
      }, function(error) {
        console.error("Overlay fault", error);
      });
    } else {
      addMarkers(plot_points);
    }

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
