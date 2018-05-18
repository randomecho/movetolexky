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
  var marker_count = plotted_markers.length;

  for (var i = 0; i < marker_count; i++)
  {
    plotted_markers[i].setMap(map);
  }
  
}

// Clear the markers off the map
function clearMarkers(plotted_markers) {
  var marker_count = plotted_markers.length;

  for (var i = 0; i < marker_count; i++)
  {
    plotted_markers[i].setMap(null);
  }
  
}

function overlayAmenityLines(amenity, plot_points, button_hit) {
  if (button_hit.attr('data-state') == 'show') {
    if (plot_points.length == 0) {
      $.getJSON("data/" + amenity.replace(/\s/g, '') + ".json", function(data){
        renderCoordsPolyline(data, plot_points);
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

function overlayAmenityPoints(amenity, plot_points, button_hit) {
  if (button_hit.attr('data-state') == 'show') {
    if (plot_points.length == 0) {
      $.getJSON("data/" + amenity + ".json", function(data){
        renderCoordsPoints(data, plot_points, 'images/icon-' + amenity + '.png');
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

function overlayAmenityPolygons(amenity, plot_points, color, button_hit) {
  if (button_hit.attr('data-state') == 'show') {
    if (plot_points.length == 0) {
      $.getJSON("data/" + amenity + ".json", function(data){
        renderCoordsPolygon(data, plot_points, color);
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

  for (var i = 0; i < coord_points.length; i++)
  {
    var longlat = coord_points[i].split(',');
    var coords = new google.maps.LatLng(longlat[1], longlat[0]);
    coords_plotted.push(coords);
  }

  return coords_plotted;
}

function renderCoordsPoints(coordinates, plot_type, icon) {
  var coord_count = coordinates.length;

  for (var i = 0; i < coord_count; i++)
  {
    var longlat = coordinates[i].coordinates.split(',');
    var marker = plotMarker(longlat[1], longlat[0], coordinates[i].name, i, icon);

    plot_type.push(marker);
  }

  addMarkers(plot_type);
}

function renderCoordsPolyline(coordinates, plot_type) {
  var coord_count = coordinates.length;

  for (var i = 0; i < coord_count; i++) {
    var coords_plotted = [];
    var coord_points = coordinates[i].coordinates.split(' ');
    coords_plotted = plotCoordinates(coord_points);
    plot_type.push(plotPolyline(coords_plotted));
  }

  addMarkers(plot_type);
}

function renderCoordsPolygon(coordinates, plot_type, polygon_color) {
  var coord_count = coordinates.length;

  for (var i = 0; i < coord_count; i++)
  {
    var coords_plotted = [];
  
    if (typeof coordinates[i].coordinates === 'object')
    {
      var multi_plot_count = coordinates[i].coordinates.length;
  
      for (var k = 0; k < multi_plot_count; k++) {
        var coord_points = coordinates[i].coordinates[k].split(' ');
        coords_plotted = plotCoordinates(coord_points);
      }
    } else {
      var coord_points = coordinates[i].coordinates.split(' ');
      coords_plotted = plotCoordinates(coord_points);
    }

    plot_type.push(plotPolygon(coords_plotted, polygon_color));
  }

  addMarkers(plot_type);
}

function toggleAmenityChosen(button_id, amenity, new_state = 'show') {
  if (new_state === 'show') {
    button_id.text(new_state + ' ' + amenity).attr('data-state', new_state).removeClass('clicked');
  } else {
    button_id.text(new_state + ' ' + amenity).attr('data-state', new_state).addClass('clicked');
  }
}

$(function(){

  $('#show-library').click(
    function(){
      overlayAmenityPoints('libraries', plot_library, $(this));
    }
  );

  $('#show-hospital').click(
    function(){
      overlayAmenityPoints('hospitals', plot_hospital, $(this));
    }
  );

  $('#show-fault').click(
    function(){
      overlayAmenityLines('fault lines', plot_faultline, $(this));
    }
  );

  $('#show-school').click(
    function(){
      overlayAmenityPolygons('schools', plot_school, '#333333', $(this));
    }
  );

  $('#show-park').click(
    function(){
      overlayAmenityPolygons('parks', plot_park, '#339933', $(this));
    }
  );

  $('#show-flood').click(
    function(){
      overlayAmenityPolygons('floodplains', plot_flood, '#005da9', $(this));
    }
  );
});
