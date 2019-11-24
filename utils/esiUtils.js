/**
 * Copyright (c) Max Tsero. All rights reserved.
 * Licensed under the MIT License.
 */
const esiJS = require('esijs');

async function doESISearch(searchTerm, searchEndpoint, searchType) {
    let strict;
    switch (searchType) {
        case "fuzzy":
            strict = false;
            break;
        
        case "strict":
            strict = true;
            break;
        default:
            strict = true
            break;
    }
    let searchResult = await esiJS.search.search(searchTerm, searchEndpoint, strict);
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
            let routePlan;
            if (!avoids) {
                routePlan = esiJS.routes.planRoute(origin, destination, flag)
                    .catch(function(e) {
                        reject(e);
                    });
            } else {
                routePlan = esiJS.routes.planRoute(origin, destination, flag, avoids)
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
