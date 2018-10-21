// Initialize Firebase
function initializeFirebase() {
    var config = {
        apiKey: "AIzaSyA_ByBZzj5yP2leW2QjP1GSu0jukkO-2F0",
        authDomain: "khe2018-gcp.firebaseapp.com",
        databaseURL: "https://khe2018-gcp.firebaseio.com",
        projectId: "khe2018-gcp",
        storageBucket: "khe2018-gcp.appspot.com",
        messagingSenderId: "94310402577"
    };
    firebase.initializeApp(config);
}

// Ensures that firebase is initialized on all pages
initializeFirebase();

var db;
function initializeDatabase() {
    // Initialize Cloud Firestore through Firebase
    db = firebase.firestore();

    // Disable deprecated features
    db.settings({
      timestampsInSnapshots: true
    });
}
initializeDatabase();

function submitData() {
    console.log(Date(Date.now()));
    var dateStamp = new Date(Date.now()).toJSON();
    var street = document.forms["updateHouse"].elements["street"].value;
    var city = document.forms["updateHouse"].elements["city"].value;
    var state = document.forms["updateHouse"].elements["state"].value;
    var zipcode = document.forms["updateHouse"].elements["zipcode"].value;
    var chocolate = document.forms["updateHouse"].elements["chocolate"].checked;
    var candy = document.forms["updateHouse"].elements["candy"].checked;
    var food = document.forms["updateHouse"].elements["food"].checked;
    var other = document.forms["updateHouse"].elements["other"].checked;
    var none = document.forms["updateHouse"].elements["none"].checked;
    var king = document.forms["updateHouse"].elements["king"].checked;
    var teal = document.forms["updateHouse"].elements["teal"].checked;
    
    console.log(dateStamp);
    
    if (street != "" && city != "" && state != "state" && zipcode > 9999 && zipcode < 100000) {
        var addressString = street + " " + city + ", " + state + " " + zipcode;
        var databaseID = zipcode + "-"
        getLocationOfAddress(addressString, function(response)  {
            var HEREPoint = response.Response.View[0].Result[0];
            var HERELevel = HEREPoint.MatchLevel;
            // console.log(HERELevel);
            if (HERELevel == "houseNumber") {
                if (chocolate || candy || food || other || none) {
                    var HEREID = HEREPoint.Location.LocationId;
                    var HEREGeo = HEREPoint.Location.DisplayPosition;
                    var HEREAddress = HEREPoint.Location.Address;
                    var candyJSON = {
                        "chocolate": chocolate,
                        "candy": candy,
                        "food": food,
                        "other": other,
                        "home": !none,
                        "king": king,
                        "teal":teal,
                    };
                    // console.log(HEREID);
                    // console.log(HEREAddress);
                    // console.log(HEREGeo);
                    // console.log(candyJSON);
                    addDataToDatabase(HEREID, dateStamp, HEREAddress, HEREGeo, candyJSON)
                    addGoodMessage("Thank you! Update successful!");
                    returnToMap();
                    clearForm();  
                } else {
                    addBadMessage("Error: Please select at least one item from the \"Candy\" section.");
                }
            } else {
                addBadMessage("Error: Unable to find house. Current match level is " + HERELevel);
            }
        }, function(error) {addBadMessage(error);});
    } else {
        addBadMessage("Error: Please make sure all fields in the address are filled in.");
    }
    
}

function clearForm() {
    document.forms["updateHouse"].elements["street"].value = "";
    document.forms["updateHouse"].elements["city"].value = "";
    document.forms["updateHouse"].elements["state"].value = "state";
    document.forms["updateHouse"].elements["zipcode"].value = "";
    document.forms["updateHouse"].elements["chocolate"].checked = false;
    document.forms["updateHouse"].elements["candy"].checked = false;
    document.forms["updateHouse"].elements["food"].checked = false;
    document.forms["updateHouse"].elements["other"].checked = false;
    document.forms["updateHouse"].elements["none"].checked = false;
    document.forms["updateHouse"].elements["king"].checked = false;
    document.forms["updateHouse"].elements["teal"].checked = false;
}

function addDataToDatabase(id, newDateTime, address, geopoint, newCandy) {
    var location = db.collection("Locations").doc(id);
    var one = location.get().then(function(doc) {
        if (doc.exists) {
            // console.log(id + " exists");
            // console.log("Document data:", doc.data());
            var locationData = doc.data();
            locationData.dateTime.unshift(newDateTime);
            locationData.candy.unshift(newCandy);
            location.set({
                "address": locationData.address,
                "geopoint": locationData.geopoint,
                "dateTime": locationData.dateTime,
                "candy": locationData.candy,
                "highest": determineNewHighest(newCandy, locationData.highest)
            })
            .then(function() {
                console.log("Document successfully written!");
            })
            .catch(function(error) {
                console.error("Error writing document: ", error);
            });
        } else {
            // console.log(id + " does not exist");
            location.set({
                "address": address,
                "geopoint": geopoint,
                "dateTime": [newDateTime],
                "candy": [newCandy],
                "highest": determineFirstHighest(newCandy)
            })
            .then(function() {
                console.log("Document successfully written!");
            })
            .catch(function(error) {
                console.error("Error writing document: ", error);
            });
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
    
    var year = db.collection("Dates").doc("year" + (new Date().getFullYear()));
    var two = year.get().then(function(doc) {
        if (doc.exists) {
            // console.log("Document data:", doc.data());
            var yearData = doc.data();
            yearData.dateTime.unshift(newDateTime);
            yearData.id.unshift(id);
            year.set({
                "lastUpdated": newDateTime,
                "dateTime": yearData.dateTime,
                "id": yearData.id
            })
            .then(function() {
                console.log("Document successfully written!");
            })
            .catch(function(error) {
                console.error("Error writing document: ", error);
            });
        } else {
            year.set({
                "lastUpdated": newDateTime,
                "dateTime": [newDateTime],
                "id": [id]
            })
            .then(function() {
                console.log("Document successfully written!");
            })
            .catch(function(error) {
                console.error("Error writing document: ", error);
            });
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
    
    
    return Promise.all([one, two]).then(function() { console.log("All complete!"); });
}

function loadDatesAndIDs() {
    var currentYearData;
    var pastYearData;
    
    var yearNew = db.collection("Dates").doc("year" + (new Date().getFullYear()));
    var currentYear = yearNew.get().then(function(doc) {
        if (doc.exists) {
            // console.log("Document data:", doc.data());
            currentYearData = doc.data();
        } else {
            currentYearData = null;
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
    
    var yearOld = db.collection("Dates").doc("year" + (new Date().getFullYear() - 1));
    var pastYear = yearOld.get().then(function(doc) {
        if (doc.exists) {
            // console.log("Document data:", doc.data());
            pastYearData = doc.data();
        } else {
            pastYearData = null;
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
    
    return Promise.all([currentYear, pastYear]).then(function() { return {"currentYearData": currentYearData, "pastYearData": pastYearData}; });
}

function determineFirstHighest(candy) {
    var highest = {
        "level": "void",
        "king": candy.king,
        "teal": candy.teal
    }
    if (candy.chocolate == true) {
        highest.level = 4;
    } else if (candy.candy == true) {
        highest.level = 3;
    } else if (candy.food == true) {
        highest.level = 2;
    } else if (candy.other == true) {
        highest.level = 1;
    } else {
        highest.level = 0;
    }
    return highest;
}

function determineNewHighest(candy, lastHighest) {
    var highest = {
        "level": lastHighest.level,
        "king": candy.king || lastHighest.king,
        "teal": candy.teal || lastHighest.teal,
    }
    if (candy.chocolate == true) {
        highest.level = 4;
    } else if (candy.candy == true) {
        if (lastHighest.level < 3) {
            highest.level = 3;
        }
    } else if (candy.food == true) {
        if (lastHighest.level < 2) {
            highest.level = 2;
        }
    } else if (candy.other == true) {
         if (lastHighest.level < 1) {
            highest.level = 1;
        }
    }
    return highest;
}

function getLocationInfo(index, id) {
    // console.log(id);
    var location = db.collection("Locations").doc(id);
    var locationData;
    var gotInfo = location.get().then(function(doc) {
        if (doc.exists) {
            // console.log("Document data:", doc.data());
            locationData = doc.data();
        } else {
            console.log("Cannot access data from " + id);
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
    
    return Promise.all([gotInfo]).then(function() { return [index, locationData]; });
}