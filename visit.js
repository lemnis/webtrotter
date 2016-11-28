const {ipcRenderer} = require('electron')
const traceroute = require('traceroute');
var whois = require('whois');
var parser = require("parse-whois");
var angular = require("angular");

// whois.lookup('facebook.com', function(err, data) {
//     var obj = parser.parseWhoIsData(data);
//     console.log(data);
//
//     var obj2 = obj.filter(function ( test ) {
//     return test.attribute == "Name Server";
//     });
//
//     console.log(obj, obj2);
// })

// Define the `phonecatApp` module
var phonecatApp = angular.module('phonecatApp', []);

phonecatApp.factory('trace', ['$rootScope', '$q', '$log',
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

phonecatApp.service('alerts', function($q, $window) {
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
  this.traceroute = function(obj) {
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
  }
})

// Define the `PhoneListController` controller on the `phonecatApp` module
phonecatApp.controller('PhoneListController', ['$scope', 'trace', "alerts", function PhoneListController($scope, trace, alerts) {
    $scope.websites = [];

    ipcRenderer.on('store-data', function (event, arg) {
        console.log(arg);
        $scope.websites = arg; // add website
        // $scope.$apply(); // update controller
    });

    $scope.getKey = function(obj){
        for (var key in obj) {
            break;
        }
        return key;
    }

    $scope.getRandomC = function(){
        return Math.floor(Math.random()*255);
    }

    /**
     * get only the hostname
     * @param  {string} url - full url of resource
     * @return {string}     - hostname e.g. www.google.com
     */
    $scope.getHostname = function(url){
        return new URL(url).hostname;
    }
}]);
