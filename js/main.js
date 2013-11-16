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
function plotMarker(latitude, longitude, title, zindex) {
  var map_coords = new google.maps.LatLng(latitude, longitude);
  var marker = new google.maps.Marker({
    position: map_coords,
    title: title,
    zIndex: zindex
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

function plotPolygon(polygon_coords) {
  var marked_area = new google.maps.Polygon({
    path: polygon_coords,
    strokeColor: '#005DA9',
    strokeOpacity: 1.0,
    strokeWeight: 3,
    fillColor: '#005DA9',
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

function renderCoordsPoints(coordinates, plot_type) {
  var coord_count = coordinates.length;

  for (var i = 0; i < coord_count; i++)
  {
    var longlat = coordinates[i].coordinates.split(',');
    var marker = plotMarker(longlat[1], longlat[0], coordinates[i].name, i);

    plot_type.push(marker);
  }

  addMarkers(plot_type);
}

function renderCoordsPolyline(coordinates, plot_type) {
  var coord_count = coordinates.length;

  for (var i = 0; i < coord_count; i++)
  {
    var coords_plotted = [];
    var coord_points = coordinates[i].coordinates.split(' ');
    var polyline_point_count = coord_points.length;

    for (var j = 0; j < polyline_point_count; j++)
    {
      var polyline_longlat = coord_points[j].split(',');
      var polyline_coords = new google.maps.LatLng(polyline_longlat[1], polyline_longlat[0]);
      coords_plotted.push(polyline_coords);
    }

    plot_type.push(plotPolyline(coords_plotted));
  }

  addMarkers(plot_type);
}

function renderCoordsPolygon(coordinates, plot_type) {
  var coord_count = coordinates.length;

  for (var i = 0; i < coord_count; i++)
  {
    var coords_plotted = [];
  
    if (typeof coordinates[i].coordinates === 'object')
    {
      var multi_plot_count = coordinates[i].coordinates.length;
  
      for (var k = 0; k < multi_plot_count; k++)
      {
        var coord_points = coordinates[i].coordinates[k].split(' ');
        var polyline_point_count = coord_points.length;
  
        for (var j = 0; j < polyline_point_count; j++)
        {
          var polygon_longlat = coord_points[j].split(',');
          var polygon_coords = new google.maps.LatLng(polygon_longlat[1], polygon_longlat[0]);
          coords_plotted.push(polygon_coords);
        }
      }
    }
    else
    {
      var coord_points = coordinates[i].coordinates.split(' ');
      var polyline_point_count = coord_points.length;

      for (var j = 0; j < polyline_point_count; j++)
      {
        var polygon_longlat = coord_points[j].split(',');
        var polygon_coords = new google.maps.LatLng(polygon_longlat[1], polygon_longlat[0]);
        coords_plotted.push(polygon_coords);
      }
    }

    plot_type.push(plotPolygon(coords_plotted));
  }

  addMarkers(plot_type);
}


$(function(){

  $('#show-library').click(
    function(){
      var button_hit = $(this);
      if (button_hit.attr('data-state') == 'show')
      {
        $.getJSON("data/library.json", function(data){
          renderCoordsPoints(data, plot_library);
        });

        button_hit.text('Hide libraries').attr('data-state', 'hide').addClass('clicked');
      }
      else
      {
        clearMarkers(plot_library);
        button_hit.text('Show libraries').attr('data-state', 'show').removeClass('clicked');
      }
    }
  );

  $('#show-hospital').click(
    function(){
      var button_hit = $(this);
      if (button_hit.attr('data-state') == 'show')
      {
        $.getJSON("data/hospital.json", function(data){
          renderCoordsPoints(data, plot_hospital);
        });

        button_hit.text('Hide hospitals').attr('data-state', 'hide').addClass('clicked');
      }
      else
      {
        clearMarkers(plot_hospital);
        button_hit.text('Show hospitals').attr('data-state', 'show').removeClass('clicked');
      }
    }
  );

  $('#show-fault').click(
    function(){
      var button_hit = $(this);
      if (button_hit.attr('data-state') == 'show')
      {
        $.getJSON("data/faultline.json", function(data){
          renderCoordsPolyline(data, plot_faultline);
        });

        button_hit.text('Hide fault lines').attr('data-state', 'hide').addClass('clicked');
      }
      else
      {
        clearMarkers(plot_faultline);

        button_hit.text('Show fault lines').attr('data-state', 'show').removeClass('clicked');
      }
    }
  );

  $('#show-school').click(
    function(){
      var button_hit = $(this);
      if (button_hit.attr('data-state') == 'show')
      {
        $.getJSON("data/school.json", function(data){
          renderCoordsPolygon(data, plot_school);
        });

        button_hit.text('Hide schools').attr('data-state', 'hide').addClass('clicked');
      }
      else
      {
        clearMarkers(plot_school);

        button_hit.text('Show schools').attr('data-state', 'show').removeClass('clicked');
      }
    }
  );

  $('#show-park').click(
    function(){
      var button_hit = $(this);
      if (button_hit.attr('data-state') == 'show')
      {
        $.getJSON("data/park.json", function(data){
          renderCoordsPolygon(data, plot_park);
        });

        button_hit.text('Hide parks').attr('data-state', 'hide').addClass('clicked');
      }
      else
      {
        clearMarkers(plot_park);

        button_hit.text('Show parks').attr('data-state', 'show').removeClass('clicked');
      }
    }
  );

  $('#show-flood').click(
    function(){
      var button_hit = $(this);
      if (button_hit.attr('data-state') == 'show')
      {
        $.getJSON("data/floodplain.json", function(data){
          renderCoordsPolygon(data, plot_flood);
        });

        button_hit.text('Hide floodplains').attr('data-state', 'hide').addClass('clicked');
      }
      else
      {
        clearMarkers(plot_flood);

        button_hit.text('Show floodplains').attr('data-state', 'show').removeClass('clicked');
      }
    }
  );

});