let map;
let markers = [];
let userLocation = null;
let routingControl = null;

const cafeIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/924/924514.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -30]
});

function initMap() {
  map = L.map('map').setView([28.6139, 77.2090], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Get user location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      userLocation = [latitude, longitude];
      map.setView(userLocation, 15);
      L.marker(userLocation).addTo(map).bindPopup("You are here").openPopup();
      loadCafes(latitude, longitude);
    });
  }
}

// Fetch cafes from Overpass API
function loadCafes(lat, lon) {
  clearMarkers();
  document.getElementById("cafe-list").innerHTML = "<p>Loading cafes...</p>";

  const query = `
    [out:json];
    node["amenity"="cafe"](around:2000,${lat},${lon});
    out;
  `;

  fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      const cafes = data.elements;
      document.getElementById("cafe-list").innerHTML = "";
      if (!cafes.length) {
        document.getElementById("cafe-list").innerHTML = "<p>No cafes found nearby.</p>";
        return;
      }
      cafes.forEach((cafe, i) => addCafe(cafe, i));
    });
}

function addCafe(cafe, i) {
  const marker = L.marker([cafe.lat, cafe.lon], { icon: cafeIcon })
    .addTo(map)
    .bindPopup(`<b>${cafe.tags.name || "Unnamed Cafe"}</b><br><button onclick="navigateToCafe(${cafe.lat}, ${cafe.lon})">Get Directions</button>`);

  markers.push(marker);

  const div = document.createElement("div");
  div.className = "cafe-item";
  div.innerHTML = `<strong>${i + 1}. ${cafe.tags.name || "Unnamed Cafe"}</strong>`;
  div.addEventListener("click", () => {
    map.setView([cafe.lat, cafe.lon], 18, { animate: true });
    marker.openPopup();
  });
  document.getElementById("cafe-list").appendChild(div);
}

function clearMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }
}

function navigateToCafe(lat, lon) {
  if (!userLocation) {
    alert("We couldn’t get your location.");
    return;
  }
  if (routingControl) map.removeControl(routingControl);

  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(userLocation[0], userLocation[1]),
      L.latLng(lat, lon)
    ],
    routeWhileDragging: false,
    showAlternatives: false,
    createMarker: () => null, // Hide extra markers
  }).addTo(map);
}
function navigateToCafe(lat, lon) {
  // Open Google Maps with directions
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
}

function findLocation() {
  const query = document.getElementById("location-input").value;
  if (!query) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(results => {
      if (!results.length) return alert("Location not found");
      const { lat, lon } = results[0];
      map.setView([lat, lon], 15, { animate: true });
      loadCafes(lat, lon);
    });
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar.classList.contains('-translate-y-full')) {
    sidebar.classList.remove('-translate-y-full');
  } else {
    sidebar.classList.add('-translate-y-full');
  }
}

}

initMap();
