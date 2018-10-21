var filters = {
        "chocolate": "N",
        "candy": "N",
        "food": "N",
        "other": "N",
        "home": "N",
        "king": "N",
        "teal": "N"
    };

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
    applyFilters();
    returnToMap();
}

var lastUpdated;
var markers = [];
var dates = [];
var ids = [];
var information = [];
function initializeMapPoints() {
    var counter = 0;
    var dateInfoPromise = loadDatesAndIDs();
    dateInfoPromise.then(function(response) {
        console.log(response);
        if (response.currentYearData != null) {
            lastUpdated = response.currentYearData.lastUpdated;
            var idToCheck = response.currentYearData.id;
            var dateWithID = response.currentYearData.dateTime;
            for (var i = 0; i < idToCheck.length; i++) {
                // console.log("Loop at " + i);
                if (ids.includes(idToCheck[i])) {
                    // console.log("Skipped " + i);
                    continue;
                } else {
                    // console.log("Else at " + i);
                    ids.push(idToCheck[i]);
                    dates.push(dateWithID[i]);
                    // console.log("LoadData at " + i);
                    var locationDataPromise = getLocationInfo(counter, ids[counter]);
                    locationDataPromise.then(function(locationData) {
                        // console.log("Promise at " + i);
                        promiseIndex = locationData[0];
                        information.push(locationData[1]);
                        markers.push(determineLocationMarker(promiseIndex));
                    }, function(error) {console.log(error);});
                    counter++;
                }
            }
        }
        if (response.pastYearData != null) {
            if (lastUpdated == undefined) {
                lastUpdated = response.pastYearData.lastUpdated;
            }
            var idToCheck = response.pastYearData.id;
            var dateWithID = response.pastYearData.dateTime;
            for (var i = 0; i < idToCheck.length; i++) {
                // console.log("Loop at " + i);
                if (ids.includes(idToCheck[i])) {
                    // console.log("Skipped " + i);
                    continue;
                } else {
                    // console.log("Else at " + i);
                    ids.push(idToCheck[i]);
                    dates.push(dateWithID[i]);
                    // console.log("LoadData at " + i);
                    var locationDataPromise = getLocationInfo(counter, ids[counter]);
                    locationDataPromise.then(function(locationData) {
                        // console.log("Promise at " + i);
                        promiseIndex = locationData[0];
                        information.push(locationData[1]);
                        markers.push(determineLocationMarker(promiseIndex));
                    }, function(error) {console.log(error);});
                    counter++;
                }
            }
        }
    }, function(error) {console.log(error);});
    checkForUpdates();
}

function checkForUpdates() {
    setTimeout(function() {
        console.log("Update Map!");
        var dateInfoPromise = loadDatesAndIDs();
        dateInfoPromise.then(function(response) {
            if (response.currentYearData != null) {
                if (new Date(lastUpdated).getTime() < new Date(response.currentYearData.lastUpdated).getTime()) {
                    var idToCheck = response.currentYearData.id;
                    var dateWithID = response.currentYearData.dateTime;
                    for (var i = 0; i < idToCheck.length; i++) {
                        // console.log("Loop at " + i);
                        if (new Date(lastUpdated).getTime() < new Date(dateWithID[i]).getTime()) {
                            if (ids.includes(idToCheck[i])) {
                                for (var j = 0; j < ids.length; j++) {
                                    if (ids[j].indexOf(idToCheck[i]) > -1) {
                                        dates[j] = dateWithID[i];
                                        var locationDataPromise = getLocationInfo(j, ids[j]);
                                        locationDataPromise.then(function(locationData) {
                                            // console.log("Promise at " + i);
                                            promiseIndex = locationData[0];
                                            information[promiseIndex] = locationData[1];
                                            removeMarker(markers[promiseIndex]);
                                            markers[promiseIndex] = determineLocationMarker(promiseIndex);
                                            if(!checkFilter(promiseIndex)) {
                                                removeMarker(markers[promiseIndex]);
                                            }
                                        }, function(error) {console.log(error);})
                                    }
                                }
                            } else {
                                // console.log("Else at " + i);
                                ids.push(idToCheck[i]);
                                dates.push(dateWithID[i]);
                                // console.log("LoadData at " + i);
                                var locationDataPromise = getLocationInfo(ids.length-1, ids[ids.length-1]);
                                locationDataPromise.then(function(locationData) {
                                    // console.log("Promise at " + i);
                                    promiseIndex = locationData[0];
                                    information.push(locationData[1]);
                                    markers.push(determineLocationMarker(promiseIndex));
                                    if(!checkFilter(promiseIndex)) {
                                        removeMarker(markers[promiseIndex]);
                                    }
                                }, function(error) {console.log(error);});
                            }
                        } else {
                            lastUpdated = response.currentYearData.lastUpdated;
                            break;
                        }
                    }
                }
            }
        }, function(error) {console.log(error);});
        
        // Recurse
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
        var newCandy = information[staticIndex].candy[0];
        // console.log(newCandy);
        if (!newCandy.home) {
            icon = icon.EmptyHouse;
        } else {
            if (newCandy.teal) {
                icon = icon.Teal;
            } else if (newCandy.king) {
                icon = icon.King;
            } else {
                icon = icon.Regular;
            }
            if (newCandy.chocolate) {
                icon = icon.Chocolate;
            } else if (newCandy.candy) {
                icon = icon.Candy;
            } else if (newCandy.food) {
                icon = icon.Food;
            } else if (newCandy.other) {
                icon = icon.Other;
            }
        }
    } else {
        if (information[staticIndex].highest.level == 0) {
            icon = icon.EmptyHouse_f;
        } else {
            if (information[staticIndex].highest.teal) {
                icon = icon.Teal_f;
            } else if (information[staticIndex].highest.king) {
                icon = icon.King_f;
            } else {
                icon = icon.Regular_f;
            }
            if (information[staticIndex].highest.level == 4) {
                icon = icon.Chocolate;
            } else if (information[staticIndex].highest.level == 3) {
                icon = icon.Candy;
            } else if (information[staticIndex].highest.level == 2) {
                icon = icon.Food;
            } else if (information[staticIndex].highest.level == 1) {
                icon = icon.Other;
            }
        }
    }
    // console.log(formattedGeoPoint);
    return addMarker(formattedGeoPoint, icon, callback);
}

function displayPointInfo(index) {
    console.log("To be added: displayPointInfo");
    // Implement Here
}

function applyFilters() {
    for (var i = 0; i < markers.length; i++) {
        try {
            removeMarker(markers[i]);
        } catch (err) {
            console.log(err);
        }
    }
    for (var i= 0; i < markers.length; i++) {
        var allTrue = checkFilter(i);
        
        if (allTrue) {
            addExistingMarker(markers[i]);
        }
    }
}

function checkFilter(i) {
    var testTable = [];
    var info = information[i].candy[0];
    // console.log(info);

    // chocolate
    if (filters.chocolate.indexOf("N") > -1) {
        testTable.push(true);
    } else {
        if (filters.chocolate.indexOf("T") > -1) {
            testTable.push(info.chocolate);
        } else {
            testTable.push(!info.chocolate);
        }
    }

    // candy
    if (filters.candy.indexOf("N") > -1) {
        testTable.push(true);
    } else {
        if (filters.candy.indexOf("T") > -1) {
            testTable.push(info.candy);
        } else {
            testTable.push(!info.candy);
        }
    }

    // food
    if (filters.food.indexOf("N") > -1) {
        testTable.push(true);
    } else {
        if (filters.food.indexOf("T") > -1) {
            testTable.push(info.food);
        } else {
            testTable.push(!info.food);
        }
    }

    // other
    if (filters.other.indexOf("N") > -1) {
        testTable.push(true);
    } else {
        if (filters.other.indexOf("T") > -1) {
            testTable.push(info.other);
        } else {
            testTable.push(!info.other);
        }
    }

    // home
    if (filters.home.indexOf("N") > -1) {
        testTable.push(true);
    } else {
        if (filters.home.indexOf("T") > -1) {
            testTable.push(info.home);
        } else {
            testTable.push(!info.home);
        }
    }

    // king
    if (filters.king.indexOf("N") > -1) {
        testTable.push(true);
    } else {
        if (filters.king.indexOf("T") > -1) {
            testTable.push(info.king);
        } else {
            testTable.push(!info.king);
        }
    }

    // teal
    if (filters.teal.indexOf("N") > -1) {
        testTable.push(true);
    } else {
        if (filters.teal.indexOf("T") > -1) {
            testTable.push(info.teal);
        } else {
            testTable.push(!info.teal);
        }
    }

    // console.log(testTable);
    var allTrue = true;
    for (var t = 0; t < testTable.length; t++) {
        if (!testTable[t]) {
            allTrue = false;
            break;
        }
    }
    return allTrue;
}