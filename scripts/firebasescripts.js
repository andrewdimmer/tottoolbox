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
    
    if (street != "" && town != "" && state != "state" && zipcode > 9999) {
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
                    var candy = {
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
                    console.log(candy);
                    addGoodMessage("Thank you! Update successful!");
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

function addDataToDatabase(payload) {
    var user = db.collection("users").doc(firebase.auth().currentUser.uid);
    
    var one = user.get().then(function(doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            var userData = doc.data();
            userData.dateTime.unshift(dateTime);
            userData.keyword.unshift(keyword);
            db.collection("users").doc(firebase.auth().currentUser.uid).set({
                dateTime: userData.dateTime,
                keyword: userData.keyword
            })
            .then(function() {
                console.log("Document successfully written!");
            })
            .catch(function(error) {
                console.error("Error writing document: ", error);
            });
        } else {
            db.collection("users").doc(firebase.auth().currentUser.uid).set({
                dateTime: [dateTime],
                keyword: [keyword]
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
    
    var dataID = firebase.auth().currentUser.uid + "-" + dateTime;
    var two = db.collection("results").doc(dataID).set({
        graphData: graphResponse,
        searchData: searchResponse
    }).then(function() { console.log("wrote to results"); });
    
    
    return Promise.all([one, two]).then(function() { return dataID; });
}