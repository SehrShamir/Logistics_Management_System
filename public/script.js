let polylines = [];
let infoWindows = [];

const loginModal = document.getElementById("loginModal");
const loginForm = document.getElementById("loginForm");
const dashboardPage = document.getElementById("dashboardPage");
const dashboardContent = document.getElementById("dashboardContent");
const navbar = document.getElementById("navbar");

let isRegistering = false;

// Toggle Login Modal (Show/Hide Login Form)
function toggleLogin() {
    loginModal.classList.toggle("hidden");
}

// Hide All Main Sections
function hideAll() {
    loginModal.classList.add("hidden");
    dashboardPage.classList.add("hidden");
    if (navbar) navbar.style.display = "block";
}

// Toggle Between Sign In & Sign Up Mode
function toggleForm() {
    isRegistering = !isRegistering;

    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.style.display = isRegistering ? 'block' : 'none';
    }

    document.getElementById('formTitle').textContent = isRegistering ? 'SIGN UP' : 'SIGN IN';
    document.getElementById('submitBtn').textContent = isRegistering ? 'Register' : 'Log In';
    document.getElementById('toggleText').textContent = isRegistering ? 'Already have an account?' : "Don't have an account?";
    document.querySelector('.toggle-link').textContent = isRegistering ? 'Sign In' : 'Sign Up';
}

// Handle Form Submit
loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const phoneElement = document.getElementById("phone");
    const phone = phoneElement ? phoneElement.value.trim() : null;
    const msg = document.getElementById("msg");

    // Validate inputs
    if (!username || !password || (isRegistering && !phone)) {
        msg.style.color = "red";
        msg.textContent = "Please fill in all required fields.";
        return;
    }

    const url = isRegistering ? "/register" : "/login";
    const body = isRegistering ? { username, password, phone } : { username, password };

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        // Handle success or failure response
        msg.style.color = data.success ? "green" : "red";
        msg.textContent = data.success
            ? (isRegistering ? "Registration successful! Please log in." : "Login successful!")
            : (data.message || "An error occurred.");

        // If successful login
        if (data.success && !isRegistering) {
            if (loginModal) loginModal.classList.add("hidden");
            if (dashboardPage) dashboardPage.classList.remove("hidden");
            if (navbar) navbar.style.display = "none";
            showHome();
        }

        // If registration is successful, switch forms
        if (data.success && isRegistering) {
            toggleForm();
        }

    } catch (error) {
        console.error("Error during fetch:", error);
        msg.style.color = "red";
        msg.textContent = "Server error. Please try again later.";
    }
});


// Dashboard Functions
function showHome() {
    dashboardContent.innerHTML = `
    <h2>Welcome Back!</h2>
    <p>Track and manage your logistics in real time.</p>
  `;
}

function showProfile() {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) return;

    dashboardContent.innerHTML = `
    <h2>User Profile</h2>
    <p>Name: ${user.name}<br>Email: ${user.email}<br>Phone: ${user.phone}</p>
  `;
}

const user = {
    name: username,
    phone: "9876543210",
    email: "user@email.com"
};

localStorage.setItem("currentUser", JSON.stringify(user));

function logout() {
    localStorage.removeItem("currentUser");
    dashboardPage.classList.add("hidden");
    navbar.style.display = "block";
}

let mapInitialized = false;

function showTracking() {
    const dashboardContent = document.getElementById("dashboardContent");

    dashboardContent.innerHTML = `
    <div class="tracking-wrapper">
      <div class="tracking-box">
        <div class="tracking-header">
          <h3>Current Scenario</h3>
          <input id="search-box" type="text" placeholder="Search destination..." />
        </div>
        <div id="map" style="height:500px;width:100%;margin-top:10px;border-radius:10px;"></div>
      </div>
    </div>
  `;

    if (!mapInitialized) {
        setTimeout(initMap, 100);
        mapInitialized = true;
    }
}

function clearMap() {
    for (let poly of polylines) poly.setMap(null);
    for (let info of infoWindows) info.close();
    polylines = [];
    infoWindows = [];
}

function getRouteMidpoint(path) {
    if (!Array.isArray(path) || path.length === 0) {
        return { lat: 28.6139, lng: 77.2090 };  // Default to New Delhi
    }

    const midIndex = Math.floor(path.length / 2);
    const midPoint = path[midIndex];

    // Check if midPoint has lat and lng properties
    if (midPoint && typeof midPoint.lat === 'number' && typeof midPoint.lng === 'number') {
        return { lat: midPoint.lat, lng: midPoint.lng };
    }

    // Fallback in case lat/lng are not defined
    return { lat: 28.6139, lng: 77.2090 }; // Default to New Delhi
}

function generateReceipt() {
    // ✅ define FIRST
    const orderStatus = "Delivered";
    const deliveryId = "DLV-" + Math.floor(Math.random() * 100000);
    const unitCost = 500;
    const total = unitCost;

    const userData = localStorage.getItem("currentUser");
    if (!userData) {
        alert("User not logged in");
        return;
    }

    const { name, phone, email } = JSON.parse(userData);

    dashboardContent.innerHTML = `
    <div style="display:flex;justify-content:flex-end;padding:20px;">
      <div style="background:#1f2b37;color:white;width:55%;padding:30px;border-radius:12px;">
        
        <div style="display:flex;justify-content:space-between;">
          <h2 style="color:#41d1b9;">OM<span style="color:white;">Logistics</span></h2>
          <div><strong>Invoice #</strong> ${Date.now()}</div>
        </div>

        <hr style="border-color:#444"/>

        <p><strong>Company ABC</strong><br>Paschim Vihar<br>📞 ${phone}</p>

        <div style="text-align:right">
          <p><strong>Status:</strong>
            <span style="background:#e91e63;padding:4px 8px;border-radius:4px;">
              ${orderStatus}
            </span>
          </p>
          <p><strong>Delivery ID:</strong> ${deliveryId}</p>
        </div>

        <table style="width:100%;margin-top:20px;background:#2d3a4a;border-radius:8px;">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Cost</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>${name}</td>
              <td>${phone}</td>
              <td>${email}</td>
              <td>${unitCost}</td>
              <td>${total}</td>
            </tr>
          </tbody>
        </table>

        <h2 style="text-align:right;margin-top:20px;">₹ ${total}</h2>

    <div style="text-align:right;margin-top:20px;">
        <button onclick="showHome()">Done</button>
        <button onclick="showDataSummary()">Data</button>
    </div>
`;
}



function showDataSummary() {
    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (!user) {
        alert("User not logged in");
        return;
    }

    // Ensure dashboardContent is defined
    const dashboardContent = document.getElementById("dashboardContent");
    if (!dashboardContent) {
        console.error("Dashboard content element not found");
        return;
    }

    fetch(`/receipt-summary?phone=${user.phone}`)
        .then(res => res.json())
        .then(data => {
            // If there is no data, show a "No receipts found" message
            const rows = data.length > 0 ? data.map((r, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td>${r.delivery_id}</td>
                    <td>${r.name}</td>
                    <td>${r.phone}</td>
                </tr>
            `).join("") : `<tr><td colspan="4">No receipts found</td></tr>`;

            // Populate the dashboard content
            dashboardContent.innerHTML = `
                <div style="width:90%; margin:auto; background:#2a2f4a; color:white; padding:20px; border-radius:10px;">
                    <h3>Receipts | Summary</h3>
                    <table style="width:100%; margin-top:20px;">
                        <thead>
                            <tr style="background:#394060;">
                                <th>#</th>
                                <th>Delivery ID</th>
                                <th>Name</th>
                                <th>Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                </div>
            `;
        })
        .catch(err => {
            console.error("Error loading summary:", err);
            dashboardContent.innerHTML = `<p style="color: red;">Error loading receipt summary. Please try again later.</p>`;
        });
}



function showAbout() {
    hideAll();
    document.getElementById("publicContent").classList.remove("hidden");
    document.getElementById("publicText").innerHTML = `
        <h2>About OM Logistics</h2>
        <p>OM Logistics, with more than three decades of expertise, proudly stands as the premier supply chain and logistics management company in India. 
        We have meticulously developed a state-of-the-art infrastructure, committed to delivering unparalleled services to all our stakeholders. 
        Our core philosophy, "Making Business Simple," drives us to provide exceptional solutions. We cater to large commercial enterprises as well as 
        mid and small-scale businesses. Embark on a journey of innovation, reliability, and excellence with our team at OM Logistics as we redefine 
        the standards of the supply chain and logistics industry. Our progressive mindset generates trust through work, embodying our mantra, 
        "YOU TRUST US, WE CARE." Providing services for businesses of all sizes, our team meets every need with a modern approach, ensuring things keep moving smoothly 
        under our expertise.</p>
    `;
}

function showContact() {
    hideAll();
    document.getElementById("publicContent").classList.remove("hidden");
    document.getElementById("publicText").innerHTML = `
        <h2>Contact Us</h2>
        <p>Email: omgroup@omlogistics.co.in<br>Phone: +91-9876543210</p>
    `;
}



let map, geocoder, directionsService, userLocation = { lat: 28.6139, lng: 77.2090 }; // Default to New Delhi if geolocation fails

function initMap() {
    const mapDiv = document.getElementById("map");
    if (!mapDiv) {
        console.error("Map container not found!");
        return;
    }

    // Initialize the map
    map = new google.maps.Map(mapDiv, {
        zoom: 14,
        center: userLocation,  // Set the center to the default userLocation
    });

    // Initialize Geocoder and DirectionsService
    geocoder = new google.maps.Geocoder();
    directionsService = new google.maps.DirectionsService();

    // Get the user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userLocation = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                };
                map.setCenter(userLocation); // Set the map's center to the user's current location
            },
            () => {
                console.warn("Geolocation failed or denied, using default location.");
                // Handle geolocation failure (using default location)
                map.setCenter(userLocation);
            }
        );
    } else {
        console.warn("Geolocation is not supported by this browser, using default location.");
        // Fallback in case geolocation is not supported
        map.setCenter(userLocation);
    }

    // Setup search listener for the map (assuming you have a function `setupSearchListener`)
    setupSearchListener();
}


function setupSearchListener() {
    const input = document.getElementById("search-box");
    if (!input) return;

    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo("bounds", map);

    // Listener for when a user selects a place
    autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return; // If no geometry exists, return early
        calculateAndDisplayRoutes(place.geometry.location);
    });
}

function calculateAndDisplayRoutes(destination) {
    clearMap(); // Ensure this function is defined to clear previous routes, polylines, etc.

    directionsService.route(
        {
            origin: userLocation,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
            provideRouteAlternatives: true, // This will give multiple route options
        },
        (response, status) => {
            if (status === "OK") {
                response.routes.forEach((route, index) => {
                    const leg = route.legs[0]; // Use the first leg of the route

                    // Create a polyline for each route
                    const polyline = new google.maps.Polyline({
                        path: route.overview_path,
                        map: map,
                    });

                    polylines.push(polyline); // Store polyline for potential future use

                    // Get the midpoint of the route for InfoWindow placement
                    const midpoint = getRouteMidpoint(route.overview_path);

                    // Create an InfoWindow for each route with its details
                    const infoWindow = new google.maps.InfoWindow({
                        content: `
                            <div>
                                Route ${index + 1}<br>
                                Distance: ${leg.distance.text}<br>
                                ETA: ${leg.duration.text}
                            </div>
                        `,
                        position: midpoint, // Position the InfoWindow at the midpoint of the route
                    });

                    infoWindow.open(map); // Open the InfoWindow on the map
                    infoWindows.push(infoWindow); // Store infoWindow for future reference
                });
            } else {
                console.error("Directions request failed due to " + status); // Handle any errors
            }
        }
    );
}


function getRouteMidpoint(path) {
    if (!Array.isArray(path) || path.length === 0) {
        return { lat: 28.6139, lng: 77.2090 }; // Default midpoint (e.g., New Delhi)
    }
    const midIndex = Math.floor(path.length / 2);
    const midPoint = path[midIndex];
    return { lat: midPoint.lat(), lng: midPoint.lng() };
}


function clearMap() {
    // Remove existing polylines
    polylines.forEach(polyline => polyline.setMap(null));
    polylines = []; // Reset the polyline array


    infoWindows.forEach(infoWindow => infoWindow.close());
    infoWindows = []; // Reset the infoWindows array
}