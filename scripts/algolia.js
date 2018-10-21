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

function searchAddress() {
    // only query string
    index.search({
        query: 'Risman'
    },
    function searchDone(err, content) {
        if (err) throw err;

        console.log("Results:", content.hits);
    });
}