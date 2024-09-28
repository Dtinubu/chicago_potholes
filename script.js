let map;
let userLocation = { lat: 0, lng: 0 };  // Default location

// Initialize the Google Map
function initMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                map = new google.maps.Map(document.getElementById('map'), {
                    center: userLocation,
                    zoom: 14,
                });

                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: 'Your Location',
                });

                document.getElementById('location-coordinates').textContent = `${userLocation.lat}, ${userLocation.lng}`;
            },
            function () {
                handleLocationError(true);
            }
        );
    } else {
        handleLocationError(false);
    }
}

function handleLocationError(browserHasGeolocation) {
    const errorMessage = browserHasGeolocation
        ? "Error: Geolocation service failed."
        : "Error: Your browser doesn't support geolocation.";
    console.error(errorMessage);
}

function reportPothole() {
    if (userLocation.lat !== 0 && userLocation.lng !== 0) {
        new google.maps.Marker({
            position: userLocation,
            map: map,
            title: 'Pothole Reported!',
            icon: 'https://maps.google.com/mapfiles/ms/icons/warning.png',
        });

        alert('Pothole reported at your current location!');
    } else {
        alert('Unable to retrieve your location. Try again.');
    }
}

// Get user's current location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
} else {
    alert("Geolocation is not supported by this browser.");
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    console.log(`User's current position: Latitude: ${lat}, Longitude: ${lon}`);

    // Fetch nearby potholes from the server
    fetch(`/api/potholes?lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            const { nearbyPotholes } = data;
            console.log('Nearby Potholes:', nearbyPotholes);

            if (nearbyPotholes.length > 0) {
                // Show notification if potholes are nearby
                showNotification();
            }
        })
        .catch(error => {
            console.error('Error fetching potholes:', error);
        });
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}
