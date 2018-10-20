const MapAppId = '66VbQzyFqLUXVb8714W4';
const MapAppCode = 'npkjaY6WYXhr2P7OH6ho7g';

const MapLocationImageUrl = 'https://image.maps.api.here.com/mia/1.6/mapview';

let defaultLayers;
let mapContainerElement;
let map;
let mapUi;

let userMarker;
let followingUser = true;

_iconOptions = {size:{w:53, h:53}};
const MapIcons = {
    User: new H.map.Icon('../images/icons/map-icon-vec.svg', _iconOptions)
}

const initMap = () => {
    createMap();

    window.addEventListener('resize', function () {
        map.getViewPort().resize(); 
    });
    
    getUserLocation(trackUser);
    watchUserLocation(trackUser);
}

const trackUser = (userLoc) => {
    if (userMarker != null) {
        removeMarker(userMarker);
    }
    userMarker = addMarker(userLoc, MapIcons.User, () => {
        followingUser = true;
        map.setCenter(userLoc);
    });

    if (followingUser) {
        map.setCenter(userLoc);
    }
}

let _platform;
const getPlatform = () => {
    if (!_platform) {
        _platform = new H.service.Platform({
            'app_id': MapAppId,
            'app_code': MapAppCode
        });
    }
    
    return _platform;
}

const createMap = () => {
    platform = getPlatform();

    // Obtain the default map types from the platform object:
    defaultLayers = platform.createDefaultLayers();

    mapContainerElement = document.getElementById('mapContainer');

    // Instantiate (and display) a map object:
    map = new H.Map(
        mapContainerElement,
        defaultLayers.normal.map,
        {
            zoom: 15
        }
    );

    // Enable the event system on the map instance (enable click and drag)
    let mapEvents = new H.mapevents.MapEvents(map);

    map.addEventListener('dragstart', () => {
        followingUser = false;
    });

    // Instantiate the default behavior, providing the mapEvents object
    let behavior = new H.mapevents.Behavior(mapEvents);

    mapUi = H.ui.UI.createDefault(map, defaultLayers);
}

const addMarker = (loc, icon, onClick) => {
    const newMarker = new H.map.Marker(loc, {icon: icon, zIndex:100});
    newMarker.addEventListener('tap', onClick);

    map.addObject(newMarker);
    return newMarker;
}

const removeMarker = (marker) => {
    map.removeObject(marker);
}

const getUserLocation = (cb) => {
    if (geolocationServiceIsAvailable()) {
        navigator.geolocation.getCurrentPosition(
            (pos) => cb({lat: pos.coords.latitude, lng: pos.coords.longitude}),
            () => alert('unable to find you!'),
            {enableHighAccuracy: true}
        );
    }
}

const watchUserLocation = (cb) => {
    if (geolocationServiceIsAvailable()) {
        navigator.geolocation.watchPosition(
            (pos) => cb({lat: pos.coords.latitude, lng: pos.coords.longitude}),
            () => alert('Please enable gps services to use this app.'),
            {enableHighAccuracy: true}
        );
    }
}

const geolocationServiceIsAvailable = () => {
    if ('geolocation' in navigator) {
        return true;
    } else {
        alert('Could not find your location! Location services are required to use this app. Please enable location services and re-load the page.');
        return false;
    }
}

const getLocationOfAddress = (address, cb, ce) => {
    if (!ce) {
        ce = (e) => console.error(e);
    }

    // Create the parameters for the geocoding request:
    var geocodingParams = {
        searchText: address
    };

    // Call the geocode method with the geocoding parameters,
    // the callback and an error callback function (called if a communication error occurs)
    const geocoder = getGeocoder();
    geocoder.geocode(geocodingParams, cb, ce);
}

const getAddressOfLocation = (loc, cb, ce) => {
    if (!ce) {
        ce = (e) => console.error(e);
    }

    // Create the parameters for the reverse geocoding request:
    let params = {
        prox: loc.lat + ',' + loc.lng + ',' + '150',
        mode: 'retrieveAddresses',
        maxresults: 1
    };

    // Call the geocode method with the geocoding parameters,
    // the callback and an error callback function (called if a communication error occurs)
    const geocoder = getGeocoder();
    geocoder.reverseGeocode(params, cb, ce);
}

let _geocoder;
const getGeocoder = () => {
    // Get an instance of the geocoding service:
    if (!_geocoder) {
        _geocoder = getPlatform().getGeocodingService();
    }

    return _geocoder;
}