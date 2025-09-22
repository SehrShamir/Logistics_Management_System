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
  if (navbar) navbar.style.display = "block"; // Show navbar if it was hidden
}

// Toggle Between Sign In & Sign Up Mode
function toggleForm() {
  isRegistering = !isRegistering;

  // Show/hide phone input (for registration)
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.style.display = isRegistering ? 'block' : 'none';
  }

  // Update UI texts
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

    msg.style.color = data.success ? "green" : "red";
    msg.textContent = data.success
      ? (isRegistering ? "Registration successful! Please log in." : "Login successful!")
      : (data.message || "An error occurred.");

    if (data.success && !isRegistering) {
      // Login successful: move to dashboard
      loginModal.classList.add("hidden");
      dashboardPage.classList.remove("hidden");
      if (navbar) navbar.style.display = "none";

      // You can define what showHome() does — here it's assumed to update dashboardContent
      showHome();
    }

    if (data.success && isRegistering) {
      // Registration succeeded — switch to login view
      toggleForm(); // Switch back to login mode
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
  dashboardContent.innerHTML = `
    <h2>User Profile</h2>
    <p>Name: John Doe<br>Email: johndoe@example.com</p>
  `;
}

function logout() {
  dashboardPage.classList.add("hidden");
  navbar.style.display = "block"; // ✅ Show navbar again on logout
}

function showTracking() {
  const dashboardContent = document.getElementById('dashboardContent');

  dashboardContent.innerHTML = `
    <div class="tracking-wrapper">
      <div class="tracking-box">
        <div class="tracking-header">
          <h3>Current Scenario</h3>
          <input id="search-box" type="text" placeholder="Search..." class="tracking-search" />
        </div>
        <div class="tracking-map-container">
          <h4>Delivery Boys</h4>
          <div id="map" style="height: 500px; width: 100%; margin-top: 10px; border-radius: 10px;"></div>
        </div>
      </div>
    </div>
  `;

  initMap(); // Only call after #map div is inserted
}



let currentUser = {}; // Store current user details globally

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const phone = document.getElementById("phone").value;
  const msg = document.getElementById("msg");

  const url = isRegistering ? "/register" : "/login";
  const body = isRegistering ? { username, password, phone } : { username, password };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  msg.style.color = data.success ? "green" : "red";
  msg.textContent = data.success
    ? (isRegistering ? "Registration successful! Please log in." : "Login successful!")
    : (data.message || "An error occurred.");

  if (data.success && !isRegistering) {
    // ✅ Save user info globally (from backend or frontend form)
    currentUser = {
      name: data.name || username,
      phone: data.phone || "N/A",
      email: data.email || `${username}@example.com` // Replace with real logic
    };

    loginModal.classList.add("hidden");
    dashboardPage.classList.remove("hidden");
    navbar.style.display = "none";
    showHome();
  }
});



function clearMap() {
  for (let poly of polylines) poly.setMap(null);
  for (let info of infoWindows) info.close();
  polylines = [];
  infoWindows = [];
}

function getRouteMidpoint(path) {
  if (!Array.isArray(path) || path.length === 0) {
    console.warn("Invalid route path for midpoint calculation");
    return { lat: 28.6139, lng: 77.2090 };
  }

  const midIndex = Math.floor(path.length / 2);
  const midPoint = path[midIndex];

  if (!midPoint || typeof midPoint.lat !== "function" || typeof midPoint.lng !== "function") {
    console.warn("Invalid midpoint data", midPoint);
    return { lat: 28.6139, lng: 77.2090 };
  }

  return {
    lat: midPoint.lat(),
    lng: midPoint.lng(),
  };
}








function generateReceipt() {
  const timestamp = new Date().toLocaleString();

  const deliveryId = "9fd05cbecad5afca_51";
  const orderStatus = "In Process";
  const unitCost = 12.5;
  const total = unitCost * 1.125;

  // Use logged-in user's info
  const { name, phone, email } = currentUser;

  dashboardContent.innerHTML = `
    <div style="display: flex; justify-content: flex-end; padding: 20px;">
      <div style="background-color: #1f2b37; color: white; width: 50%; padding: 30px; border-radius: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="color: #41d1b9;">OM<span style="color: white;">Logistics</span></h2>
          <div><strong>Invoice #</strong> 17897</div>
        </div>

        <hr style="border-color: #444;" />

        <div style="margin-top: 20px;">
          <p><strong>Company ABC</strong><br>Paschim Vihar<br>Near Metor<br>📞 ${phone}</p>
        </div>

        <div style="text-align: right;">
          <p><strong>Order Status:</strong> <span style="background-color: #e91e63; padding: 2px 6px; border-radius: 4px;">${orderStatus}</span></p>
          <p><strong>Delivery Man’s Id:</strong> ${deliveryId}</p>
        </div>

        <table style="width: 100%; margin-top: 20px; background-color: #2d3a4a; border-radius: 8px; padding: 10px;">
          <thead>
            <tr style="text-align: left;">
              <th>#</th>
              <th>Delivery Man’s Name</th>
              <th>Phone Number</th>
              <th>Email</th>
              <th>Unit Cost</th>
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
              <td>${total.toFixed(6)}</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 20px;">
          <p><strong>Sub-total:</strong> ${total.toFixed(6)}</p>
          <p>Discount: 12.5%</p>
          <p>VAT: 12.5%</p>
          <hr />
          <h2 style="text-align: right;">${total.toFixed(6)}</h2>
        </div>

        <div style="margin-top: 20px; font-size: 12px; color: #ccc;">
          <p><strong>PAYMENT TERMS AND POLICIES</strong></p>
          <p>All accounts are to be paid within 1 day from receipt of invoice. To be paid by cash at the time of pick up.</p>
        </div>

        <div style="text-align: right; margin-top: 20px;">
        <button style="padding: 8px 16px; background-color: #2196f3; border: none; border-radius: 4px; color: white;" onclick="showHome()">Done</button>
         <button style="padding: 8px 16px; background-color: #41d1b9; border: none; border-radius: 4px; color: white; margin-left: 10px;" onclick="showReceiptSummary()">Data</button>  
        </div>
      </div>
    </div>
  `;

  // Store in database
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    })
    .then((data) => {
      // Handle data
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      msg.style.color = "red";
      msg.textContent = "An error occurred. Please try again later.";
    });
  
}

function showDataSummary() {
  const user = JSON.parse(localStorage.getItem("user"));

  fetch(`/receipt-summary?phone=${user.phone}`)
    .then(res => res.json())
    .then(data => {
      const rows = data.map(r => `
        <tr>
          <td>${r.id}</td>
          <td>${r.delivery_id}</td>
          <td>${r.name}</td>
          <td>${r.phone}</td>
        </tr>
      `).join("");

      dashboardContent.innerHTML = `
        <div style="width: 90%; margin: auto; background-color: #2a2f4a; color: white; padding: 20px; border-radius: 10px;">
          <h3>Receipts | Summary</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; color: white;">
            <thead>
              <tr style="background-color: #394060;">
                <th>Receipt Number</th>
                <th>Delivery Man’s Id</th>
                <th>Delivery Man’s Name</th>
                <th>Delivery Man’s Phone Number</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      `;
    })
    .catch(err => console.error('Error loading summary:', err));
}



function showAbout() {
  hideAll();
  document.getElementById("publicContent").classList.remove("hidden");
  document.getElementById("publicText").innerHTML = `
    <h2>About OM Logistics</h2>
    <p>OM Logistics, with more than three decades of expertise, proudly stands as the premier supply chain and logistics management company in India. We have meticulously developed a state-of-the-art infrastructure, committed to delivering unparalleled services to all our stakeholders. Our core philosophy, “Making Business Simple,” drives us to provide exceptional solutions.

 

We cater to large commercial enterprises as well as mid and small-scale businesses. Embark on a journey of innovation, reliability and excellence with our team at OM Logistics as we redefine the standards of the supply chain and logistics industry.

 

Our progressive mindset generates trust through work, embodying our mantra, “YOU TRUST US, WE CARE.” Providing services for businesses of all sizes, our team meets every need with a modern approach, ensuring things keep moving smoothly under our expertise.</p>
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

function toggleLogin() {
  hideAll();
  document.getElementById("loginModal").classList.remove("hidden");
}

function hideAll() {
  document.getElementById("loginModal").classList.add("hidden");
  document.getElementById("dashboardPage").classList.add("hidden");
  document.getElementById("publicContent").classList.add("hidden");
}



let map;
let geocoder;
let directionsService;
let userLocation = { lat: 28.6139, lng: 77.2090 }; // Default to Delhi


// Initialize the Map
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: userLocation, // Start at the default location (Delhi)
  });

  geocoder = new google.maps.Geocoder();
  directionsService = new google.maps.DirectionsService();

  // Try to get user's location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map.setCenter(userLocation);

        new google.maps.Marker({
          position: userLocation,
          map: map,
          title: "You are here",
        });
      },
      () => {
        alert("Geolocation failed. Showing default location.");
        // If geolocation fails, default to Delhi (already set)
      }
    );
  } else {
    alert("Geolocation not supported by your browser.");
  }

  // Set up the search box after map is initialized
  setupSearchListener();
}

// Set up the search box listener
function setupSearchListener() {
  const input = document.getElementById("search-box");
  if (!input) return;

  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo("bounds", map); // Restrict results to the current map area

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) {
      alert("Invalid location. Try selecting one from the suggestions.");
      return;
    }

    // Proceed to show route after selecting a place
    calculateAndDisplayRoutes(place.geometry.location);
  });

  // Handle the Enter key fallback
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();

      const query = input.value.trim();
      if (!query) return;

      const service = new google.maps.places.PlacesService(map);
      service.textSearch({ query }, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
          calculateAndDisplayRoutes(results[0].geometry.location);
        } else {
          alert(`No location found for "${query}". Try using a nearby landmark or pick from suggestions.`);
        }
      });
    }
  });
}

// Calculate and display the routes
function calculateAndDisplayRoutes(destination) {
  clearMap(); // ✅ Clear previous routes

  if (!userLocation) {
    alert("User location not available.");
    return;
  }

  directionsService.route(
    {
      origin: userLocation,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true,
    },
    (response, status) => {
      if (status === "OK") {
        const routes = response.routes.slice(0, 3); // Limit to top 3 routes
        const colors = ["#3366cc", "#009933", "#cc3300"];

        routes.forEach((route, index) => {
          const leg = route.legs[0]; // Each route has one leg in point-to-point direction

          // ✅ Draw polyline for route
          const polyline = new google.maps.Polyline({
            path: route.overview_path,
            strokeColor: colors[index % colors.length],
            strokeOpacity: 0.7,
            strokeWeight: 5,
            map: map,
          });
          polylines.push(polyline);

          // ✅ Get midpoint of the route path
          const midpoint = getRouteMidpoint(route.overview_path);
          const distanceText = leg.distance ? leg.distance.text : "N/A";
          const durationText = leg.duration ? leg.duration.text : "N/A";
          console.log(`Route ${index + 1} — Distance: ${distanceText}, Duration: ${durationText}`);
          


          // ✅ Show distance and ETA in an info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
  <div style="font-size: 14px; font-weight: 500; color: black;">
    🛣️ Route ${index + 1}<br>
    📏 ${leg.distance.text}<br>
    🕒 ETA: ${leg.duration.text}
  </div>
`,

            position: midpoint,
          });
          

          infoWindow.open(map);
          infoWindows.push(infoWindow);
        });
      } else {
        alert("Failed to fetch directions: " + status);
      }
    }
  );
}



  // Fallback: handle Enter key when user does not pick suggestion
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();

      const query = input.value.trim();
      if (!query) return;

      const service = new google.maps.places.PlacesService(map);
      service.textSearch({ query }, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
          calculateAndDisplayRoutes(results[0].geometry.location);
        } else {
          alert(`No location found for "${query}". Try using a nearby landmark or pick from suggestions.`);
        }
      });
    }
  }); // ← This closing parenthesis was missing


  
    


// Manual fallback
window.onload = function() {
  initMap();
};
