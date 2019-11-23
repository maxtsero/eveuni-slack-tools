/**
 * Copyright (c) Max Tsero. All rights reserved.
 * Licensed under the MIT License.
 */
// Load the BotBuilder Slack adapter's SlackDialog function as 'SlackDialog'.
const { SlackDialog } = require('botbuilder-adapter-slack');
// Load the ESI JS module as 'esiJS'.
const esiJS = require('esijs');
// Load our custom ESI abstraction functions from '../utils/esiUtils.js'.
const { getConstellationInfo, getRegionInfo, getRoutePlan, getSearchResults, getSystemInfo, getSystemKills } = require('../utils/esiUtils');
// Load our custom Math functions from '../utils/math.js',
const { round } = require('../utils/math');

module.exports = function(controller) {
    // Respond to our various slash commands.
    controller.on('slash_command', async(bot, message) => {
        switch (message.command) {
            // Respond to the '/jumps' command.
            case "/jumps":
                var route = message.text;
                // We need to act on the different parts of the route command separately so we'll split the string into an array.
                var routeParts = route.split(" ");
                // console.log("Route Parts:", routeParts);
                
                // Origin is always the first item in the array, let's shift it out.
                var origin = routeParts.shift();
                // console.log("Origin System Part:", origin);

                // Destination is the second item in the array, shifting it out.
                var destination = routeParts.shift();
                // console.log("Destination System Part:", destination);

                // Flag is the third item in the array, shifting it out.
                var flag = routeParts.shift();
                //console.log("Flag Part:", flag);

                // If we don't have a flag at this point we'll assume "safest".
                if (!flag) {
                    var flag = "safest";
                    console.log("Flag Changed:", flag);
                }

                // We're gonna throw an error here if we're missing any of the three parts.
                if (!origin || !destination || !flag) {
                    await bot.replyPrivate(message, 'Whoops, you mangled it. You need to pass an origin, destination and routing flag.');
                } else {
                    // Search ESI for the origin system using our "fuzzy" search type which lets us use terms like 'Amy'.
                    // TODO: Handle multiple results.
                    var originSearch = await getSearchResults(origin, "solar_system", "fuzzy");
                    console.log("Origin Search:", originSearch);

                    // Grab the Origin ID from the array of search results.
                    var originID = originSearch['solar_system'].shift();
                    console.log("Origin ID:", originID);

                    // Grab the full system info from ESI.
                    var originSystem = await getSystemInfo(originID);
                    // console.log("Origin System:", originSystem);

                    // For now we just want the name.
                    var originName = originSystem.name;
                    // console.log("Origin System Name:", originName);

                    // Search ESI for the destination system using our "fuzzy" search type which lets us use terms like 'Amy'.
                    // TODO: Handle multiple results.
                    var destinationSearch = await getSearchResults(destination, "solar_system", "fuzzy");
                    console.log("Destination Search:", destinationSearch);

                    // Grab the Destination ID from the array of search results.
                    var destinationID = destinationSearch['solar_system'].shift();
                    console.log("Destination ID:", destinationID);

                    // Grab the full system info from ESI.
                    var destinationSystem = await getSystemInfo(destinationID);
                    // console.log("Destination System:", destinationSystem);

                    // For now we just want the name.
                    var destinationName = destinationSystem.name;
                    // console.log("Destination System Name:", destinationName);

                    // "Synonyms" for a "prefer safer" route search.
                    if (flag === 'safer' || flag === 'safe' || flag === 'highonly' || flag === 'high' || flag === 'prefersafer' || flag === 'secure') {
                        var flag = 'secure';
                        var flagDesc = 'More secure:';
                    // "Synonyms" for a "prefer less secure" route search.
                    } else if (flag === 'unsafe' || flag === 'dangerous' || flag === 'lowonly' || flag === 'nohigh' || flag === 'preferlesssecure' || flag === 'insecure') {
                        var flag = 'insecure';
                        var flagDesc = 'Less secure:';
                    // "synonyms" for a "prefer shorter" route search.
                    } else if (flag === 'all' || flag === 'short' || flag === 'shortest' || flag === 'shorter') {
                        var flag = 'shortest';
                        var flagDesc = 'Shortest:';
                    }

                    // We're gonna throw an error here if we're missing any of the three parts.
                    if (!originID || !destinationID || !flag) {
                        await bot.replyPrivate(message, "Whoops, you mangled it. I didn't understand your origin, destination or routing flag.");
                    } else {
                        // Lookup a route plan from ESI using the selected options.
                        var routePlan = await getRoutePlan(originID, destinationID, flag);
                        //console.log("Route Plan:", routePlan);

                        // Count the number of system IDs in the route and remove the origin system ID to get a jumps count.
                        var jumps = routePlan.length - 1;
                        //console.log("Number of Jumps:", jumps);
                    }
                }
                // Construct our final output message.
                // TODO: Improve this to work in light of multiple system options.
                var messageText = `*${flagDesc}* _${originName}_ to _${destinationName}_ - _${jumps} jump(s)_.`;
                await bot.replyPublic(message, messageText);
                break;
                
            case "/info":
                var system = message.text;
                if (!system) {
                    await bot.replyPrivate(message, 'Whoops, you mangled it. You need to pass a system name.');
                } else {
                    var systemSearch = await getSearchResults(system, "solar_system", "fuzzy");
                    var systemID = systemSearch['solar_system'].shift();
                    var systemInfo = await getSystemInfo(systemID);
                    //console.log("System Information:", systemInfo);
                    var systemName = systemInfo.name;
                    //console.log("System Name:", systemName);
                    var systemConstellationID = systemInfo.constellation_id;
                    var systemConstellationInfo = await getConstellationInfo(systemConstellationID);
                    //console.log("System Constellation Info", systemConstellationInfo);
                    var systemConstellationName = systemConstellationInfo.name;
                    //console.log("System Constellation Name:", systemConstellationName);
                    var systemConstellationRegionID = systemConstellationInfo.region_id;
                    var systemRegionInfo = await getRegionInfo(systemConstellationRegionID);
                    //console.log("System Region Info:", systemRegionInfo);
                    var systemRegionName = systemRegionInfo.name;
                    //console.log("System Region Name:", systemRegionName);
                    var dotlanUrl = "https://evemaps.dotlan.net";
                    var systemPage = `system/${systemName}`;
                    var systemLink = `${dotlanUrl}/${systemPage}`;
                    var messageSystemAsLink = `<${systemLink}|${systemName}>`;
                    //console.log(messageSystemAsLink);
                    systemSecurity = round(systemInfo['security_status'],1);
                    //console.log("Security Status:", systemSecurity);
                    systemKills = await getSystemKills(systemID);
                    console.log("System Kills:", systemKills);
                }
                break;
        }

        // set http status
        // bot.httpBody({text:'You can send an immediate response using bot.httpBody()'});
    });
}