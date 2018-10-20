const MapAppId = '66VbQzyFqLUXVb8714W4';
const MapAppCode = 'npkjaY6WYXhr2P7OH6ho7g';

const MapLocationImageUrl = 'https://image.maps.api.here.com/mia/1.6/mapview';

let platform;
let defaultLayers;
let mapContainerElement;
let map;
let mapUi;

window.onload = () => {
    initMap();
    addMarker(52.60, 13.50);
}

const initMap = () => {
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
            center: { lat: 52.5, lng: 13.4 }
        }
    );

    mapUi = H.ui.UI.createDefault(map, defaultLayers);
}

const addMarker = (lat, lng) => {
    map.addObject(new H.map.Marker({
        lat: lat,
        lng: lng
    }));
}