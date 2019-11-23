/**
 * Copyright (c) Max Tsero. All rights reserved.
 * Licensed under the MIT License.
 */
const esiJS = require('esijs');

async function doESISearch(searchTerm, searchEndpoint, searchType) {
    switch (searchType) {
        case "fuzzy":
            var searchType = false;
            break;
        
        case "strict":
            var searchType = true;
            break;
        
    }
    let searchResult = await esiJS.search.search(searchTerm, searchEndpoint, searchType);
    console.log("Search Result", searchResult);
    return searchResult;
};

var getSearchResults = doESISearch;

module.exports = {
    getConstellationInfo (constellationID) {
        return new Promise((resolve, reject) => {
            let constellationInfo = esiJS.universe.constellations.constellationInfo(constellationID)
                .catch(function(e) {
                    reject(e);
                });
            resolve(constellationInfo);
        });
    },
    getRegionInfo (regionID) {
        return new Promise((resolve, reject) => {
            let regionInfo = esiJS.universe.regions.regionInfo(regionID)
                .catch(function(e) {
                    reject(e);
                });
            resolve(regionInfo);
        });
    },
    getRoutePlan (origin, destination, flag, avoids) {
        return new Promise((resolve, reject) => {
            if (!avoids) {
                var routePlan = esiJS.routes.planRoute(origin, destination, flag)
                    .catch(function(e) {
                        reject(e);
                    });
            } else {
                var routePlan = esiJS.routes.planRoute(originID, destinationID, flag)
                    .catch(function(e) {
                        reject(e);
                    });
            }
            resolve(routePlan);
        });
    },
    getSystemInfo (systemID) {
        return new Promise((resolve, reject) => {
            let systemInfo = esiJS.universe.systems.systemInfo(systemID)
                .catch(function(e) {
                    reject(e);
                });
            resolve(systemInfo);
        });
    },
    getSystemKills (systemID) {
        return new Promise((resolve, reject) => {
            let systemKills = esiJS.universe.systems.systemKills(systemID)
                .catch(function(e) {
                    reject(e);
                });
            resolve(systemKills);
        });
    },
    getSearchResults,
}