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