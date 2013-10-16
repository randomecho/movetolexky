var map;
var plot_library = [];

function initialize() {
  var mapOptions = {
    zoom: 12,
    center: new google.maps.LatLng(38.049037,-84.499766),
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
            var marker = plotMarker(longlat[1],longlat[0], data[i].name, i);

            plot_library.push(marker);
          }

          addMarkers(plot_library);
        });
				
        button_hit.text('Hide libraries');
        button_hit.attr('data-state', 'hide');
      }
      else
      {
        clearMarkers(plot_library);

        button_hit.text('Show libraries');
        button_hit.attr('data-state', 'show');
      }
    }
  );

});