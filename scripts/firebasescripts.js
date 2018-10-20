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
    var town = document.forms["updateHouse"].elements["town"].value;
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
    
    if (street != "" && town != "" && state != "state" && zipcode > 9999 && zipcode < 100000) {
        var addressString = street + " " + town + ", " + state + " " + zipcode;
        var databaseID = zipcode + "-"
        getLocationOfAddress(addressString, function(response)  {
            var HEREPoint = response.Response.View[0].Result[0];
            var HERELevel = HEREPoint.MatchLevel;
            console.log(HERELevel);
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
                    console.log(HEREID);
                    console.log(HEREAddress);
                    console.log(HEREGeo);
                    console.log(candyJSON);
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
        }, function(error) {addBadMessage(error); return null;});
    } else {
        addBadMessage("Error: Please make sure all fields in the address are filled in.");
    }
    
}

function clearForm() {
    document.forms["updateHouse"].elements["street"].value = "";
    document.forms["updateHouse"].elements["town"].value = "";
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

function addDataToDatabase(id, dateTime, address, geopoint, candy) {
    var location = db.collection("Locations").doc(id);
    var one = location.get().then(function(doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            var locationData = doc.data();
            locationData.dateTime.unshift(dateTime);
            locationData.candy.unshift(candy);
            location.set({
                "address": locationData.address,
                "geopoint": locationData.geopoint,
                "dateTime": locationData.dateTime,
                "candy": locationData.candy
            })
            .then(function() {
                console.log("Document successfully written!");
            })
            .catch(function(error) {
                console.error("Error writing document: ", error);
            });
        } else {
            location.set({
                "address": address,
                "geopoint": geopoint,
                "dateTime": [dateTime],
                "candy": [candy]
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
            console.log("Document data:", doc.data());
            var yearData = doc.data();
            yearData.dateTime.unshift(dateTime);
            yearData.id.unshift(id);
            year.set({
                "lastUpdated": dateTime,
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
                "lastUpdated": dateTime,
                "dateTime": [dateTime],
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