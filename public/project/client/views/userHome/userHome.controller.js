﻿(function () {
    'use strict';
    angular
        .module("FoodOrderApp")
        .controller("UserbuyController", UserbuyController)
        .directive('googleplace', function () {
            return {

                require: 'ngModel',
                link: function (scope, element, attrs, model) {
                    var options = {
                        types: [],
                        componentRestrictions: {}
                    };
                    scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

                    google.maps.event.addListener(scope.gPlace, 'place_changed', function () {
                        scope.$apply(function () {
                            model.$setViewValue(element.val());
                        });
                    });
                }
            };
        });


    function UserbuyController($scope, UserService, $rootScope, $location, $http, NgMap) {
        var model = this;

        model.findSeller = findSeller;
        model.findForDistance = findForDistance;
        model.clickEventInfo = clickEventInfo;
        var myLocationLat = model.lat;
        var myLocationLong = model.lng;
        var userInScope = $rootScope.user;
        model.userInScope = $rootScope.user;

        function findAllOrders() {
            UserService.findUserById(userInScope._id)
                .then(function (user) {
                    model.orderMade = user.buyer;
                })
        }
        findAllOrders();

        function init() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition, showError);
            }
            else {
                model.error = "Geolocation is not supported by this browser.";
            }
        }
        init();

        function showError(error) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    model.error = "User denied the request for Geolocation."
                    break;
                case error.POSITION_UNAVAILABLE:
                    model.error = "Location information is unavailable."
                    break;
                case error.TIMEOUT:
                    model.error = "The request to get user location timed out."
                    break;
                case error.UNKNOWN_ERROR:
                    model.error = "An unknown error occurred."
                    break;
            }
        }

        function showPosition(position) {
            model.lat = position.coords.latitude;
            model.lng = position.coords.longitude;
            model.where = model.lat + "," + model.lng;
        }

        NgMap.getMap()
            .then(function (map) {
                model.map = map;
            });

        function clickEventInfo(event, e) {
            model.mapEvent = e;
            model.map.showInfoWindow('map-event');
        };

        model.hideDetail = function () {
            model.map.hideInfoWindow('map-event');
        };

        function findForDistance  () {
            if (model.distance) {
                findUsersUsingLocation();
                model.enterDistance = "";
            } else {
                model.enterDistance = "Enter a distance for Search";
            }
        }

        function findSeller() {
            if (model.searchQuery != "") {
                $http.get('http://maps.google.com/maps/api/geocode/json?address=' + model.searchQuery).success(function (mapData) {
                    if (mapData.results.length != 0) {
                        //                        console.log(mapData.results[0].geometry.location.lat, mapData.results[0].geometry.location.lng);
                        // showPosition(mapData.results[0].geometry.location.lat, mapData.results[0].geometry.location.lng);
                        model.where = mapData.results[0].geometry.location.lat + "," + mapData.results[0].geometry.location.lng;

                        model.location = mapData.results[0].geometry.location.lat + "," + mapData.results[0].geometry.location.lng;
                        model.lat = mapData.results[0].geometry.location.lat;
                        model.lng = mapData.results[0].geometry.location.lng;
                        findUsersUsingLocation();
                    }
                    else {
                        model.error = "Could not find entered location";
                        model.showErr = true;
                    }

                }).error(function (error) {
                    model.error = "Could not find entered location";
                    model.showErr = true;
                });
            }
            else {
                model.where = model.lat + "," + model.lng;
                //               model.show();
            }

        }

        function findUsersUsingLocation() {
            UserService.findAllUsers()
                .then(function (users) {
                    var usersNearMe = [];
                    for (var i = 0; i < users.length; i++) {
                        if (users[i]._id != userInScope._id) {
                            if (users[i].location != undefined) {
                                var location = users[i].location;



                                var distance = getDistanceFromLatLonInKm(model.lat, model.lng, location.lat, location.lng);


                                var distanceForSearch;
                                if (model.distance == undefined) {
                                    distanceForSearch = 5;
                                } else {
                                    distanceForSearch = model.distance;
                                }
                                if (distance < distanceForSearch) {

                                    usersNearMe.push(users[i]);
                                }
                            }
                        }
                    }
                    model.users = usersNearMe;
                })
        }
        findUsersUsingLocation();

        function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
            var R = 6371; // Radius of the earth in km
            var dLat = deg2rad(lat2 - lat1);  // deg2rad below
            var dLon = deg2rad(lon2 - lon1);
            var a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c; // Distance in km

            var distanceInMiles = d * 0.621371; 

            return distanceInMiles;
        }

        function deg2rad(deg) {
            return deg * (Math.PI / 180)
        }

    }

})();