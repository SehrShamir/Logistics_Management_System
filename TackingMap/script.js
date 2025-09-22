let map;
let marker;
let route = [];
let step = 0;
let intervalId;

function initMap() {
    const defaultLocation = { lat: 28.6139, lng: 77.2090 }; // Default: Delhi

    map = new google.maps.Map(document.getElementById("map"), {
        center: defaultLocation,
        zoom: 12,
    });

    marker = new google.maps.Marker({
        position: defaultLocation,
        map: map,
        title: "Tracking...",
        icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        }
    });
}

// Track button logic
function trackRoute() {
    const startInput = document.getElementById("startLocation").value;
    const endInput = document.getElementById("endLocation").value;

    const geocoder = new google.maps.Geocoder();

    // Get coordinates for both locations
    geocoder.geocode({ address: startInput }, (startResults, status) => {
        if (status === "OK") {
            const startLatLng = startResults[0].geometry.location;

            geocoder.geocode({ address: endInput }, (endResults, status) => {
                if (status === "OK") {
                    const endLatLng = endResults[0].geometry.location;

                    map.setCenter(startLatLng);
                    marker.setPosition(startLatLng);

                    route = [];
                    step = 0;

                    generateRoute(startLatLng, endLatLng, 200); // Smooth movement
                    startAnimation();
                } else {
                    alert("Destination not found: " + status);
                }
            });
        } else {
            alert("Start location not found: " + status);
        }
    });
}

// Generate a list of intermediate points
function generateRoute(start, end, steps) {
    let latStep = (end.lat() - start.lat()) / steps;
    let lngStep = (end.lng() - start.lng()) / steps;

    for (let i = 0; i <= steps; i++) {
        route.push({
            lat: start.lat() + latStep * i,
            lng: start.lng() + lngStep * i
        });
    }
}

// Move the marker along the route
function startAnimation() {
    clearInterval(intervalId);

    intervalId = setInterval(() => {
        if (step >= route.length) {
            clearInterval(intervalId);
            return;
        }

        const position = route[step];
        marker.setPosition(position);
        map.panTo(position);
        step++;
    }, 100); // speed of tracking
}
