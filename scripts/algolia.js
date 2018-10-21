function prepopulateAddress() {
    console.log("starting");
    getUserLocation(function(userLocation) {
        getAddressOfLocation(userLocation, function(response) {
            // console.log(response);
            var address = response.Response.View[0].Result[0].Location.Address;
            // console.log(address);
            document.getElementById("city").value = address.City;
            document.getElementById("state").value = address.AdditionalData[1].value;
            document.getElementById("zipcode").value = address.PostalCode;
        }, function(error) {addBadMessage(error);});
    });
}

// var algoliasearch = require('algoliasearch');
// var algoliasearch = require('algoliasearch/reactnative');
// var algoliasearch = require('algoliasearch/lite');
// import * as algoliasearch from 'algoliasearch'; // When using TypeScript

// or just use algoliasearch if you are using a <script> tag
// if you are using AMD module loader, algoliasearch will not be defined in window,
// but in the AMD modules of the page

var client = algoliasearch('9NH9FPR4Z6', 'c21b7c2f7849099b34015d7a04f9eac8');
var index = client.initIndex("tottoolbox");
// console.log(index);

function indexData() {
    index.deleteBy({"filters": "deleteGroup:ssopsvyijslmpbayayvc"});
    var counter = 0;
    var ids = [];
    var dateInfoPromise = loadDatesAndIDs();
    dateInfoPromise.then(function(response) {
        // console.log(response);
        if (response.currentYearData != null) {
            var idToCheck = response.currentYearData.id;
            for (var i = 0; i < idToCheck.length; i++) {
                if (ids.includes(idToCheck[i])) {
                    continue;
                } else {
                    ids.push(idToCheck[i]);
                    var locationDataPromise = getLocationInfo(counter, idToCheck[i]);
                    locationDataPromise.then(function(locationData) {
                        var improvedLocationData = locationData[1];
                        improvedLocationData.objectID = ids[locationData[0]];
                        improvedLocationData.deleteGroup = "ssopsvyijslmpbayayvc";
                        // console.log(improvedLocationData);
                        index.addObject(improvedLocationData);
                    }, function(error) {console.log(error);});
                    counter++;
                }
            }
        }
        if (response.pastYearData != null) {
            var idToCheck = response.pastYearData.id;
            for (var i = 0; i < idToCheck.length; i++) {
                if (ids.includes(idToCheck[i])) {
                    continue;
                } else {
                    ids.push(idToCheck[i]);
                    var locationDataPromise = getLocationInfo(counter, idToCheck[i]);
                    locationDataPromise.then(function(locationData) {
                        var improvedLocationData = locationData[1];
                        improvedLocationData.objectID = ids[locationData[0]];
                        improvedLocationData.deleteGroup = "ssopsvyijslmpbayayvc";
                        // console.log(improvedLocationData);
                        index.addObject(improvedLocationData);
                    }, function(error) {console.log(error);});
                    counter++;
                }
            }
        }
    }, function(error) {console.log(error);});
}

function searchWithAlgolia() {
    // only query string
    var queryString = document.forms["AlgoliaSearch"].elements["street"].value + " ";
    queryString += document.forms["AlgoliaSearch"].elements["city"].value + " ";
    queryString += document.forms["AlgoliaSearch"].elements["state"].value + " ";
    queryString += document.forms["AlgoliaSearch"].elements["zipcode"].value + " ";
    queryString += document.forms["AlgoliaSearch"].elements["other"].value;
    console.log(queryString);
    index.search({
        query: queryString
    },
    function searchDone(err, content) {
        if (err) throw err;

        console.log("Results:", content.hits);
        
        var results = content.hits;
        document.getElementById("AlgoliaSearchResults").innerHTML = "";
        for (var i = 0; i < results.length; i++) {
            document.getElementById("AlgoliaSearchResults").innerHTML += getResultsPannel(results[i]);
        }
        if (results.length == 0) {
            document.getElementById("AlgoliaSearchResults").innerHTML = "<p>No results found.</p>"
        }
    });
}

function getResultsPannel(data) {
    var searchResults = '<div class="AlgoliaResults">';
    searchResults += "<h3>" + data.address.Label + "</h3>";
    searchResults += "<h4>Best Treats</h4><p>" + getBestInfo(data) + "</p>";
    searchResults += "<h4>Current Treats</h4><p>" + getCurrentInfo(data) + "</p>";
    return searchResults;
}

function getBestInfo(best) {
    var returnString = "";
    if (best.highest.level == 0) {
        returnString = "Nobody was home!";
    } else {
        if (best.highest.level == 4) {
            returnString = "Offered Chocolate";
        } else if (best.highest.level == 3) {
            returnString = "Offered Candy";
        } else if (best.highest.level == 2) {
            returnString = "Offered Food";
        } else if (best.highest.level == 1) {
            returnString = "Offered Other Treats";
        }
        if (best.highest.king) {
            returnString += " (King Sized)";
        } else if (best.highest.teal) {
            returnString += "<br />Was a Teal Pumkin House";
        }
    }
    return returnString;
}

function getCurrentInfo(current) {
    var returnString = "";
    if (!current.candy[0].home) {
        returnString = "Nobody is currently home!";
    } else {
        var count = 0;
        returnString += "Is Offering: "
        if (current.candy[0].chocolate) {
            returnString += "Chocolate";
            count++;
        } else if (current.candy[0].candy) {
            if (count > 0) {
                returnString += "; ";
            }
            returnString += "Candy";
            count++;
        } else if (current.candy[0].food) {
            if (count > 0) {
                returnString += "; ";
            }
            returnString += "Food";
            count++;
        } else if (current.candy[0].other) {
            if (count > 0) {
                returnString += "; ";
            }
            returnString += "Other Treats";
        }
        if (current.candy[0].king) {
            returnString += " (King Sized)";
        } else if (current.candy[0].teal) {
            returnString += "<br />Is a Teal Pumkin House";
        }
    }
    return returnString;
}