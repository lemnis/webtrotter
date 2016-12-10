window.nodeRequire = require;
delete window.require;
delete window.exports;
delete window.module;

const {ipcRenderer} = nodeRequire('electron')
const traceroute = nodeRequire('traceroute');
var whois = nodeRequire('whois');
var parser = nodeRequire("parse-whois");
var angular = nodeRequire("angular");
var colors = nodeRequire("./colors.js");

// Define the `app` module
var app = angular.module('app', [nodeRequire('angular-route')]);

app.factory('trace', ['$rootScope', '$q', '$log',
function($rootScope, $q, $log) {
    // console.log($rootScope);
    return {
        traceroute: function(obj) {
            var deferred = $q.defer();
            var url = new URL(obj.url).hostname;

            traceroute.trace(url, function (err,hops) {
                obj.hops = hops;
                // callback(hops);
                // $rootScope.settings = data;
                deferred.resolve(hops);
                console.log(deferred, hops);
                $log.error("234",2);
                // return hops;
            });
            $log.error("234",2);
            return deferred.promise;
        },
        items: [],
        add: function(item) {
            this.items.push(item);
        }
    };
}
]);

app.service('alerts', function($q, $window) {
    this.confirm = function(message, title, buttonLabels) {
        var defer = $q.defer();

        if (navigator.notification && navigator.notification.confirm) {
            var onConfirm = function(idx) {
                idx === 1 ? defer.resolve() : defer.reject()
            }

            navigator.notification.confirm(message, onConfirm, title, buttonLabels)
        } else {
            $window.confirm(message) ? defer.resolve() : defer.reject()
        }

        return defer.promise
    }
    this.whois = function(obj) {
        var deferred = $q.defer();

        whois.lookup('facebook.com', function(err, data) {
            if(err){
                deferred.reject(err);
                return;
            }
            var arr = parser.parseWhoIsData(data);

            var obj = arr.filter(function ( key ) {
                return key.attribute == "Name Server";
            });
            deferred.resolve(arr);
        })

        return deferred.promise;
    }
})

ipcRenderer.on('console', function (event, arg) {
    console.log(arg);
});

// Define the `PhoneListController` controller on the `app` module
app.controller('home', ['$scope', 'trace', "alerts", function PhoneListController($scope, trace, alerts) {
    $scope.websites = [];

    ipcRenderer.on('angular.websites', function (event, arg) {
        console.log(arg);
        $scope.websites = arg; // add website
        $scope.$apply(); // update controller
    });

    ipcRenderer.on('angular.website', function (event, arg) {
        console.log(arg);
        $scope.websites.push(arg); // add website
        $scope.$apply(); // update controller
    });

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
        return date.getHours() + ":" + date.getMinutes()
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

app.controller('maps', function($scope, $route, $routeParams) {
     $scope.$route = $route;
     $scope.$routeParams = $routeParams;
});

app.controller('MainController', function($scope, $route, $routeParams, $location) {
     $scope.$route = $route;
     $scope.$location = $location;
     $scope.$routeParams = $routeParams;
 })


app.config(function($routeProvider, $locationProvider) {
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
