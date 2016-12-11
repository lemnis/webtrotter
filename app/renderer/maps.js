var maxmind = require("maxmind");
var colors = require("./../colors.js");
const db = require("./../db.js");

var elements = [];

module.exports = function($scope, $route, $routeParams, NgMap) {
    $scope.request = db.getRequest($routeParams.uuid);

    // use ngmaps to show a google map with the trace
    NgMap.getMap().then(function(map) {
        var latlngTraceroute = []; // store the complete trace
        var bounds = new google.maps.LatLngBounds(); // store the bounds of the total traceroute

        // remove all previous elements from map
        for(var i = 0; i < elements.length; i++){
            console.log(elements[i]);
            elements[i].setMap(null);
        }

        // open the geo database to match the ip-adresses with a location
        maxmind.open('./app/GeoLite2-City.mmdb', (err, cityLookup) => {
            var traceroute = $scope.request.traceroute;
            for(var key in traceroute){
                if(traceroute[key]){
                    (function(){
                        for(var ip in traceroute[key]){ break; } // get ip
                        var city = cityLookup.get(ip); // get city

                        var latLng = {
                            lat: city.location.latitude,
                            lng: city.location.longitude
                        };

                        latlngTraceroute.push(latLng); // add to array for polyline
                        bounds.extend(latLng); // add to track bounds

                        // create a custom circle with random color to pinpoint server location
                        var icon = {
                            path: "M-10,0a10,10 0 1,0 20,0a10,10 0 1,0 -20,0",
                            fillColor: colors.get(ip),
                            fillOpacity: 1,
                            anchor: new google.maps.Point(0,0),
                            strokeWeight: 0,
                            scale: 1
                        }

                        // place marker (ip location) on the map
                        var marker = new google.maps.Marker({
                            position: {
                                lat: city.location.latitude,
                                lng: city.location.longitude
                            },
                            icon: icon,
                            map: map,
                            title: ip
                        });

                        // create a window to show extra information
                        var infowindow = new google.maps.InfoWindow({
                            content: ip
                        });

                        elements.push(marker); // stored for make it later removable

                        // open the infowindow when clicked on a marker
                        marker.addListener('click', function() {
                            infowindow.open(map, marker);
                        });
                    })();
                }
            }

            // place traceroute on map
            var polyline = new google.maps.Polyline({
                path: latlngTraceroute,
                geodesic: false,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2,
                map: map
            });

            elements.push(polyline); // stored for make it later removable

            // show map within bounds
            map.fitBounds(bounds);
        });
    });
};
