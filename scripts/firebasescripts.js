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
    console.log(street, town, state, zipcode);
    console.log(chocolate, candy, food, other, none);
    console.log(king, teal);
    
    if (street != "" && town != "" && state != "state" && zipcode > 9999) {
        if (chocolate || candy || food || other || none) {
            var json = {
                "datestamp": dateStamp,
                "address": {
                    "street": street,
                    "town": town,
                    "state": state,
                    "zipcode": zipcode,
                },
                "candy": {
                    "chocolate": chocolate,
                    "candy": candy,
                    "food": food,
                    "other": other,
                },
                "home": !none,
                "king": king,
                "teal":teal,
            }
            console.log(json);
            addGoodMessage("Thank you! Update successful!");
            
            //Clear form for new submission
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
        } else {
            addBadMessage("Error: Please select at least one item from the \"Candy\" section.")
        }
    } else {
        addBadMessage("Error: Please make sure all fields in the address are filled in.")
    }
    
}