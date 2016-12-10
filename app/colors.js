'use strict';

const settings = require("./colors.json");

var ips = {};               // store (ip: color)
var possibleColors = [];    // all possible colors within specified settings

/**
 * Generates an array with all possible colors with the defined settings
 */
function calculatePossibleColors(){
    var colorSets = settings.randomRanges; // specified color sets

    for (var set = 0; set < colorSets.length; set++) {
        // calculate the range and the amount of possible steps within
        var range = colorSets[set].range[1] - colorSets[set].range[0];
        var maxSteps = Math.floor(range / colorSets[set].steps);

        for (var step = 0; step < maxSteps; step++) {
            // push every possible color
            possibleColors.push([set, step]);
        }
    }
}
calculatePossibleColors();

/**
 * Picks a color within the specified colors
 * @return {object} - The color-object
 */
function generateColor(){
    var result = {
        type: "hsl"
    };

    // check if all colors already are used
    if(possibleColors.length <= 0){
        console.error("no new colors available");
        return {h: 0, s: 0, l: 0, type: "hsl"};
    }

    // calculate random index to pick a color
    var randomIndex = Math.floor(Math.random() * possibleColors.length);
    // get colors
    var usedColor = settings.randomRanges[possibleColors[randomIndex][0]];

    // generate color by picked color settings
    for(var key in usedColor){
        var value = usedColor[key];
        switch (key) {
            case "hue":
                result.h = value;
                break;
            case "saturation":
                result.s = value;
                break;
            case "lightness":
                result.l = value;
                break;
        }
    }

    // calculate the variable value and at to the empty property (saturation or lightness)
    var randomValue = possibleColors[randomIndex][1] * usedColor.steps + usedColor.range[0];
    if(result.s == null){
        result.s = randomValue;
    } else if(result.l == null) {
        result.l = randomValue;
    }

    // remove used color
    possibleColors.splice(randomIndex, 1);

    return result;
}

/**
 * Converts color-object to css color string
 * @param  {object} obj - The color-object
 * @return {string}     - Css color string
 */
function toString(obj){
    if(obj.type == "hsl"){
        return "hsl("+obj.h+","+obj.s+"%,"+obj.l+"%)";
    } else {
        throw new Error("color type not implementet yet");
    }
}

exports.get = function(ip){
    // check if it is the first color, so it's always black
    if(Object.keys(ips).length === 0){
        ips[ip] = {h: 0, s: 0, l: 0, type: "hsl"};
    } else if(!ips[ip]){ // pick a color if specific ip doesn't have a color jet
        ips[ip] = generateColor();
    }

    // return stored color
    return toString(ips[ip]);
}
