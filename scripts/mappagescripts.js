var filters;

function toggleFilterPane() {
    document.getElementById("filterContainerSuper").style.display = "block";
    document.getElementById("mapContainerSuper").style.display = "none";
}

function toggleInputPane() {
    document.getElementById("inputContainerSuper").style.display = "block";
    document.getElementById("mapContainerSuper").style.display = "none";
}

function returnToMap() {
    document.getElementById("filterContainerSuper").style.display = "none";
    document.getElementById("inputContainerSuper").style.display = "none";
    document.getElementById("mapContainerSuper").style.display = "block";
}

function prepopulateAddress() {
    console.log("starting");
    getUserLocation(function(userLocation) {
        getAddressOfLocation(userLocation, function(response) {
            // console.log(response);
            var address = response.Response.View[0].Result[0].Location.Address;
            console.log(address);
            document.getElementById("city").value = address.City;
            document.getElementById("state").value = address.AdditionalData[1].value;
            document.getElementById("zipcode").value = address.PostalCode;
        }, function(error) {addBadMessage(error);});
    });
}

function updateFilters() {
    filters = {
        "chocolate": document.forms["filter"].elements["chocolate"].value,
        "candy": document.forms["filter"].elements["candy"].value,
        "food": document.forms["filter"].elements["food"].value,
        "other": document.forms["filter"].elements["other"].value,
        "home": document.forms["filter"].elements["home"].value,
        "king": document.forms["filter"].elements["king"].value,
        "teal": document.forms["filter"].elements["teal"].value
    }
    console.log(filters);
}

var lastUpdated;
var markers = [];
var dates = [];
var ids = [];
var information = [];
function initializeMapPoints() {
    var dateInfoPromise = loadDatesAndIDs();
    dateInfoPromise.then(function(response) {
        lastUpdated = response.lastUpdated;
        var idToCheck = response.currentYearData.id;
        var dateWithID = response.currentYearData.dateTime;
        for (var i = 0; i < idToCheck.length; i++) {
            // console.log("Loop at " + i);
            if (ids.includes(idToCheck[i])) {
                continue;
            } else {
                // console.log("Else at " + i);
                ids.push(idToCheck[i]);
                dates.push(dateWithID[i]);
                // console.log("LoadData at " + i);
                var locationDataPromise = getLocationInfo(i, ids[i]);
                locationDataPromise.then(function(locationData) {
                    // console.log("Promise at " + i);
                    promiseIndex = locationData[0];
                    information.push(locationData[1]);
                    markers.push(determineLocationMarker(promiseIndex));
                }, function(error) {console.log(error);});
            }
        }
    }, function(error) {console.log(error);});
    // checkForUpdates();
}

function checkForUpdates() {
    setTimeout(function() {
        console.log("Update Map!");
        // To be implemented here!
        checkForUpdates()
    }, 30000);
}

function determineLocationMarker(index) {
    var staticIndex = index;
    var geoPoint = information[staticIndex].geopoint;
    var formattedGeoPoint = {
        "lat": geoPoint.Latitude,
        "lng": geoPoint.Longitude
    }
    var callback = function() {
        var i = staticIndex;
        displayPointInfo(i);
    };
    var icon = MapIcons;
    // console.log(staticIndex);
    // console.log(dates);
    // console.log(dates[staticIndex]);
    if(parseInt(dates[staticIndex].substring(0,4)) == (new Date().getFullYear())) {
        if (!information[staticIndex].candy[information[staticIndex].candy.length-1].home) {
            icon = icon.EmptyHouse;
        } else {
            if (information[staticIndex].candy[information[staticIndex].candy.length-1].teal) {
                icon = icon.Teal;
            } else if (information[staticIndex].candy[information[staticIndex].candy.length-1].king) {
                icon = icon.King;
            } else {
                icon = icon.Regular;
            }
            if (information[staticIndex].candy[information[staticIndex].candy.length-1].chocolate) {
                icon = icon.Chocolate;
            } else if (information[staticIndex].candy[information[staticIndex].candy.length-1].candy) {
                icon = icon.Candy;
            } else if (information[staticIndex].candy[information[staticIndex].candy.length-1].food) {
                icon = icon.Food;
            } else if (information[staticIndex].candy[information[staticIndex].candy.length-1].other) {
                icon = icon.Other;
            }
        }
    } else {
        if (information[staticIndex].highest.teal == 0) {
            icon = icon.EmptyHouse_f;
        } else {
            if (information[staticIndex].highest.teal) {
                icon = icon.Teal_f;
            } else if (information[staticIndex].highest.king) {
                icon = icon.King_f;
            } else {
                icon = icon.Regular_f;
            }
            if (information[staticIndex].highest.teal == 4) {
                icon = icon.Chocolate;
            } else if (information[staticIndex].highest.teal == 3) {
                icon = icon.Candy;
            } else if (information[staticIndex].highest.teal == 2) {
                icon = icon.Food;
            } else if (information[staticIndex].highest.teal == 1) {
                icon = icon.Other;
            }
        }
    }
    console.log(formattedGeoPoint);
    return addMarker(formattedGeoPoint, icon, callback);
}

function displayPointInfo(index) {
    console.log("To be added: displayPointInfo");
    // Implement Here
}