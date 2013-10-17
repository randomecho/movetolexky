var map;
var plot_library = [];
var plot_hospital = [];
var plot_faultline = [];

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

$(function(){

  $('#show-library').click(
    function(){
      var button_hit = $(this);
      if (button_hit.attr('data-state') == 'show')
      {
        $.getJSON("data/library.json", function(data){
          var library_count = data.length;

          for (var i = 0; i < library_count; i++)
          {
            var longlat = data[i].coordinates.split(',');
            var marker = plotMarker(longlat[1], longlat[0], data[i].name, i);

            plot_library.push(marker);
          }

          addMarkers(plot_library);
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
          var hospital_count = data.length;

          for (var i = 0; i < hospital_count; i++)
          {
            var longlat = data[i].coordinates.split(',');
            var marker = plotMarker(longlat[1], longlat[0], data[i].name, i);

            plot_hospital.push(marker);
          }

          addMarkers(plot_hospital);
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
          var faultline_count = data.length;

          for (var i = 0; i < faultline_count; i++)
          {
            var faultline_coords = [];
            var faultline_points = data[i].coordinates.split(' ');
            var polyline_point_count = faultline_points.length;

            for (var j = 0; j < polyline_point_count; j++)
            {
              var polyline_longlat = faultline_points[j].split(',');
              var polyline_coords = new google.maps.LatLng(polyline_longlat[1], polyline_longlat[0]);
              faultline_coords.push(polyline_coords);
            }

            plot_faultline.push(plotPolyline(faultline_coords));
          }

          addMarkers(plot_faultline);
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

});