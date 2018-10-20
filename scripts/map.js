const MapAppId = '66VbQzyFqLUXVb8714W4';
const MapAppCode = 'npkjaY6WYXhr2P7OH6ho7g';

const MapLocationImageUrl = 'https://image.maps.api.here.com/mia/1.6/mapview';

let platform;
let defaultLayers;
let mapContainerElement;
let map;
let mapUi;

window.onload = () => {
    getUserLocation((userLoc) => {
        initMap(userLoc);
        addMarker(userLoc);
    });
}

const initMap = (center) => {
    platform = new H.service.Platform({
        'app_id': MapAppId,
        'app_code': MapAppCode
    });

    // Obtain the default map types from the platform object:
    defaultLayers = platform.createDefaultLayers();

    mapContainerElement = document.getElementById('mapContainer');

    // Instantiate (and display) a map object:
    map = new H.Map(
        mapContainerElement,
        defaultLayers.normal.map,
        {
            zoom: 10,
            center: center
        }
    );

    mapUi = H.ui.UI.createDefault(map, defaultLayers);
}

const addMarker = (loc) => {
    map.addObject(new H.map.Marker(loc));
}

const getUserLocation = (cb) => {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => cb({lat: pos.coords.latitude, lng: pos.coords.longitude}),
            () => alert('unable to find you!'),
            {enableHighAccuracy: true}
        );
    } else {
        cb(null);
    }
}

let geocoder;
const getLocationOfAddress = (address, cb, ce) => {
    // Get an instance of the geocoding service:
    if (!geocoder) {
        geocoder = platform.getGeocodingService();
    }

    if (!ce) {
        ce = (e) => console.error(e);
    }

    // Create the parameters for the geocoding request:
    var geocodingParams = {
        searchText: address
    };

    // Call the geocode method with the geocoding parameters,
    // the callback and an error callback function (called if a
    // communication error occurs):
    geocoder.geocode(geocodingParams, cb, ce);
}