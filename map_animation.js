var map;
var markers = [];

// load map
function init() {
  console.log("in init()");
  var myOptions = {
    zoom: 14,
    center: { lat: 42.35335, lng: -71.091525 },
    mapTypeId: google.maps.MapTypeId.terrain,
  };
  var element = document.getElementById("map");
  map = new google.maps.Map(element, myOptions);
  addMarkers();
}

// Add bus markers to map
async function addMarkers() {
  // get bus data
  var locations = await getBusLocations();

  // loop through data, add bus markers
  locations.forEach(function (bus) {
    var marker = getMarker(bus.id);
    if (marker) {
      moveMarker(marker, bus);
    } else {
      addMarker(bus);
    }
  });

  // timer
  console.log(new Date());
  setTimeout(addMarkers, 30000);
}

// Request bus data from MBTA
async function getBusLocations() {
  var url =
    "https://api-v3.mbta.com/vehicles?api_key=ca34f7b7ac8a445287cab52fb451030a&filter[route]=1&include=trip";
  var response = await fetch(url);
  var json = await response.json();
  return json.data;
}

// Request bus data from MBTA

function addMarker(bus) {
  var icon = getIcon(bus);
  var marker = new google.maps.Marker({
    position: {
      lat: bus.attributes.latitude,
      lng: bus.attributes.longitude,
    },
    map: map,
    icon: icon,
    id: bus.id,
  });

  const infoWindow = new google.maps.InfoWindow({
    content: `<div id="content" >
                Bearing:  ${bus.attributes.bearing}\u00B0 <br/>
                Lat:  ${bus.attributes.latitude}\u00B0<br/>
                Long:  ${bus.attributes.longitude}\u00B0<br/><br/>
                Status:  ${bus.attributes.current_status}<br/>
                Occupancy:  ${bus.attributes.occupancy_status}`,
    arialabel: "BUS " + bus.attributes.label,
    maxWidth: 300,
  });

  marker.addListener("click", () => {
    infoWindow.open({
      anchor: marker,
      map,
    });
  });

  markers.push(marker);
}

function getIcon(bus) {
  // select icon based on bus direction
  if (bus.attributes.direction_id === 0) {
    return "images/red.png";
  }
  return "images/blue.png";
}

function moveMarker(marker, bus) {
  // change icon if bus has changed direction
  var icon = getIcon(bus);
  marker.setIcon(icon);

  // move icon to new lat/lon
  marker.setPosition({
    lat: bus.attributes.latitude,
    lng: bus.attributes.longitude,
  });
}

function getMarker(id) {
  var marker = markers.find(function (item) {
    return item.id === id;
  });
  return marker;
}
