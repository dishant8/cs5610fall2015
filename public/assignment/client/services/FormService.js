﻿(function () {
    'use strict';
    angular
        .module("FormBuilderApp")
        .factory("FormService", FormService);

    function FormService($http, $q) {

        var service = {
            createFormForUser: createFormForUser,
            findAllFormsForUser: findAllFormsForUser,
            deleteFormById: deleteFormById,
            updateFormById: updateFormById,
        };

        return service;

        function createFormForUser(userId, form) {
            var deferred = $q.defer();
            $http.post("/api/assignment/user/" + userId + "/form", form)
                .success(function (forms) {
                    deferred.resolve(forms);
                })
            return deferred.promise;
        }

        function findAllFormsForUser(userId) {
            var deferred = $q.defer();

            $http.get("/api/assignment/form/user/" + userId)
                .success(function (forms) {
                    deferred.resolve(forms);
                })
            return deferred.promise;
        }

        function deleteFormById(formId) {
            var deferred = $q.defer();
            $http.delete("/api/assignment/form/" + formId)
                .success(function (forms) {
                    deferred.resolve(forms)
                })
            return deferred.promise;
        }

        function updateFormById(formId,newForm) {
            var deferred = $q.defer();
            $http.put("/api/assignment/form/" + formId, newForm)
                .success(function (forms) {
                    console.log(forms);
                    for (var i = 0; i < forms.length; i++) {
                        console.log(forms[i].title);
                    }
                    deferred.resolve(forms);
                })
            return deferred.promise;
        }
    }
})();