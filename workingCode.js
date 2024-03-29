
/*
 * Qualtrics Google Map Lat/Long Collector
 * Version 1.4
 *
 * Written by George Walker <george@georgewwalker.com>
 * Get the latest from GitHub: https://github.com/pkmnct/qualtrics-google-map-lat-long/releases
 *
 * This JavaScript allows a Qualtrics user to collect a lat/long from a
 * Google Map in a survey. To use it, create a new "Text Entry" question,
 * then add this JavaScript to the question. You can set variables below.
 * These include the lattitude and longitude to center the map at, the
 * zoom level of the map, and the text to display when hovering over the
 * map's pin. It also includes the width and height of the map.
 */

// Enter your Google Map API key in this variable:

googleMapAPIKey = "Get Your Own";

Qualtrics.SurveyEngine.addOnload(function() {
    // --- User Variables, set these: ---
    var mapCenterLat = 41.763710;
    var mapCenterLng = -72.685097;
    var mapZoom = 9; // See https://developers.google.com/maps/documentation/javascript/tutorial#zoom-levels for help.
    var pinTitle = "Drag this pin to your home location"; // This is displayed when hovering over the pin on the map.


    var mapWidth = "100%";
    var mapHeight = "300px";

    var locationInputWidth = "96%";
    var locationInputMargin = "2%";
    var locationInputPadding = "15px";

    var enableAutocompleteField = true;
    var invalidLocationAlertText = "Please choose a location from the search dropdown. If your location doesn't appear in the search, enter a nearby location and move the pin to the correct location.";

    // --- End of User Variables ---

    // Get the data entry box and store it in a variable
    var dataBox = document.getElementById("QR~" + this.questionId);

    // Get the question container and store it in a variable.
    var questionContainer = this.getQuestionContainer();

    // Need to be able to access the marker to update it later.
    var marker;

    if (enableAutocompleteField) {
        // Create a search box
        try {
            var locationInput = document.createElement('input');
            locationInput.setAttribute("id", this.questionId + "-locationInput");
            locationInput.style.width = locationInputWidth;
            locationInput.style.margin = locationInputMargin;
            locationInput.style.padding = locationInputPadding;
            questionContainer.appendChild(locationInput);
            var locationInputID = this.questionId + "-locationInput";
        } catch (err) {
            console.log("Unable to create places autocomplete field. Details: " + err);
            alert("An error occurred creating the input field.");
        }
    }

    try {
        // Create a map object and append it to the question container.
        var mapObject = document.createElement('div');
        mapObject.setAttribute("id", this.questionId + "-map");
        mapObject.style.width = mapWidth;
        mapObject.style.height = mapHeight;
        questionContainer.appendChild(mapObject);
        var mapID = this.questionId + "-map";
    } catch (err) {
        console.log("Unable to create map object. Details: " + err);
        alert("An error occurred creating the map.");
    }

    // Hide the data box
    try {
        dataBox.style.display = 'none';
    } catch (err) {
        console.log("Unable to hide data box.");
    }

    // This function calls itself once per second until the Google Maps API is loaded, then it displays the map.
    function displayMap() {
        try {

            if (enableAutocompleteField) {
                var locationAutocomplete = new google.maps.places.Autocomplete(locationInput);

                // Whenever the inputs change, set the locationLatLong
                google.maps.event.addListener(locationAutocomplete, 'place_changed', function() {
                    var place = locationAutocomplete.getPlace();

                    if (!place.geometry) {
                        alert(invalidLocationAlertText);
                    } else {
                        var locationLatLong = new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng());
                        marker.setPosition(locationLatLong);
                        map.panTo(locationLatLong);
                        dataBox.value = '{"lat": "' + place.geometry.location.lat() + '", "long": "' + place.geometry.location.lng() + '"}';
                    }
                });
            }

            var map = new google.maps.Map(document.getElementById(mapID), {
                center: {
                    lat: mapCenterLat,
                    lng: mapCenterLng
                },
                zoom: mapZoom
            });

            // Create a new marker in the center of the map.
            marker = new google.maps.Marker({
                draggable: true,
                position: {
                    lat: mapCenterLat,
                    lng: mapCenterLng
                },
                map: map,
                title: pinTitle
            });
			
			google.maps.event.addListener(map, 'center_changed', function(event) {
				window.setTimeout(function() {
					var center = map.getCenter();
					marker.setPosition(center);
				}, 100);
			});
			
			/*// While the map is dragged, the marker stays in the center of the map
            google.maps.event.addListener(map, 'drag', function(event) {
                marker.setPosition(this.getCenter()); // set marker position to map center
				updatePostion(this.getCenter().lat(), this.getCenter().lng()); // update position display
            });
			*/
			
			
			//When the map is dragged, store the pin's lat/Lng where it ends
			google.maps.event.addListener(map, 'drageend', function(event) {
				dataBox.value = '{"lat": "' + marker.getPosition().lat() + '", "long": "' + marker.getPosition().lng() + '"}';
            });
			
/*
            // When the pin is clicked, store the lat/lng
            google.maps.event.addListener(marker, 'click', function(event) {
                dataBox.value = '{"lat": "' + this.getPosition().lat() + '", "long": "' + this.getPosition().lng() + '"}';
            });

            // When the pin is dragged, store the lat/lng where it ends
            google.maps.event.addListener(marker, 'dragend', function(event) {
                dataBox.value = '{"lat": "' + this.getPosition().lat() + '", "long": "' + this.getPosition().lng() + '"}';
            });
			*/
			
        } catch (err) {
            setTimeout(displayMap, 1000);
        }
    }
    displayMap();

});

// Load the Google Maps API if it is not already loaded.
try {
    if (typeof googleMapJS == 'undefined') {
        var googleMapJS;
        if (googleMapJS == null) {
            googleMapJS = document.createElement('script');
            if (googleMapAPIKey == "Your Key" || googleMapAPIKey == null) {
                googleMapJS.src = 'https://maps.googleapis.com/maps/api/js' + "?libraries=places";
            } else {
                googleMapJS.src = 'https://maps.googleapis.com/maps/api/js?libraries=places&key=' + googleMapAPIKey;
            }
            document.head.appendChild(googleMapJS);
        }
    } else {
        console.log("Map already loaded.");
    }
} catch (err) {
    console.log("Unable to load Google Maps API. Details: " + err);
    alert("Unable to load Google Maps API.");
}
