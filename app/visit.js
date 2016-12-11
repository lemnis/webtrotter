window.nodeRequire = require;
delete window.require;
delete window.exports;
delete window.module;

const {ipcRenderer} = nodeRequire('electron')
var whois = nodeRequire('whois');
var parser = nodeRequire("parse-whois");
var colors = nodeRequire("./colors.js");
var angular = nodeRequire("angular");

const db = nodeRequire("./db.js");
const DB_CONSTANTS = nodeRequire("../shared/db_constants.json");

// Define the `app` module
var app = angular.module('app', [nodeRequire('angular-route'), nodeRequire('ngmap')])
    .config(function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/map/:uuid', {
                templateUrl: 'maps.html',
                controller: 'maps'
            })
            .when('/', {
                templateUrl: 'home.html',
                controller: 'home'
            });

        $routeProvider.otherwise({
            redirectTo: '/'
        });

        $locationProvider.html5Mode({enabled: false, requireBase: false});
    });

// Define the `PhoneListController` controller on the `app` module
app.controller('home', ['$scope', function($scope) {
    $scope.websites = db.getRequests();

    ipcRenderer.on('databaseUpdated', (event, arg) => {
        $scope.$apply(function(){
            $scope.websites.push(arg);
        });
    })

    $scope.getKey = function(obj){
        for (var key in obj) {
            break;
        }
        return key;
    }

    $scope.getCustomColor = function(obj){
        for(var ip in obj){break;}

        return colors.get(ip);
    }

    $scope.getDate = (timestamp) => {
        var date = new Date(timestamp);
        return (date.getHours()<10?'0':'') + date.getHours() + ":" + (date.getMinutes()<10?'0':'') + date.getMinutes()
    }

    $scope.viewBox = (traceroute, $event) => {
        var offset = 20;
        var result = [
            (traceroute.length-1)*offset*-1,
            0,
            89.6 + (traceroute.length-1)*offset,
            37.5
        ].join(" ");
        return result;
    }

    /**
    * get the hostname of a full url
    * @param  {string} url - full url of resource
    * @return {string}     - hostname e.g. www.google.com
    */
    $scope.getHostname = function(url){
        return new URL(url).hostname;
    }
}]);

app.controller('maps', nodeRequire("./renderer/maps.js"));

app.run(['$rootScope', '$route', function($rootScope, $route) {
    $rootScope.$on('$routeChangeSuccess', function() {
        if($route.current.loadedTemplateUrl == "maps.html"){
            document.title = "Traceroute";
        } else {
            document.title = "Visited sites last day";
        }
    });
}]);

var offset = 40;
app.directive('visualCable', function() {
    return {
        template: function(element, attr){
            return "";
        },
        link: function(scope, element, attrs, controllers) {
            for(var i = 0; i <  scope.website.traceroute.length; i++){
                for(var ip in scope.website.traceroute[i]){break;}

                var piece = document.createElementNS("http://www.w3.org/2000/svg","path");
                piece.setAttributeNS(null,"fill",colors.get(ip));
                piece.setAttributeNS(null,"style","transform: translateX(-"+offset*i+"px)");
                piece.setAttributeNS(null,"d","M5.9 0.2c-8.1 9.9-7.3 24.5-0.4 35.6 0.3 0.5 1.4 1 1.4 1.4h43.1v-37H5.9z");

                element[0].insertBefore(piece, element[0].querySelector("*"));
            }
        }
    };
});

app.controller('MainController', function($scope, $route, $routeParams, $location, $rootScope) {
     $scope.$route = $route;
     $scope.$location = $location;
     $scope.$routeParams = $routeParams;

    $rootScope.$on('$routeChangeSuccess', function() {
        if($route.current.loadedTemplateUrl == "maps.html"){
            $scope.mapIsShown = true;
            $scope.title = "Traceroute";
        } else {
            $scope.mapIsShown = false;
            $scope.title = "Visited sites last day";
        }
    });
 })
