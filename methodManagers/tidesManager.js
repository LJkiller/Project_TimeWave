
import Methods from './methods.js';
import PostManager from './postManager.js';
import ResponseManager from './responseManager.js';

/**
 * Class responsible of managing tides generation by communicating
 * from a MongoDB database.
 * Functions:
 * Generate HTML structure,
 * Get available tides,
 * End point comparison.
 *
 * @class TidesManager
 */
class TidesManager {

    /**
     * Method responsible of generating links from MongoDB in an HTML format.
     * 
     * @static
     * @param {Array} objResult - Tide objects from MongoDB.
     * @param {boolean} isCheckList - If the operation in question is a check list.
     * @returns {string} - HTML string for generated splashes or checklist.
     */
    static generateTides(objResult, isCheckList = false) {
        try {
            let tides = '';
            for (let i = 0; i < objResult.length; i++) {
                try {
                    let tide = this.generateAvailableTides(objResult[i].availableTides, isCheckList);
                    tides += tide;
                } catch (error) {
                    ResponseManager.sendError('Generating tides HTML', error);
                }
            }
            return tides;
        } catch (error) {
            ResponseManager.sendError('Generating available Tides', error);
        }
    }

    /**
     * Method responsible for generating available tides.
     * 
     * @static
     * @param {Object} tideObject - Object containing tide information.
     * @param {boolean} isCheckList - If function is prioritsed as a checklist.
     * @returns {string} - HTML structure: tide links.
     */
    static generateAvailableTides(tideObject, isCheckList = false) {
        let tides = '';
        for (let key in tideObject) {
            let tide = Methods.capitalizeFirstLetter(tideObject[key]);

            if (tideObject.hasOwnProperty(key) && isCheckList === false) {
                tides += `<a class="tide" href="/tides/${tide.toLowerCase()}">${tide}</a>`;
            } else {
                tides += `<li><input type="checkbox" name="${tide.toLowerCase()}" id="${tide.toLowerCase()}"> ${tide}</li>`;
            }
        }
        return tides;
    }

    /**
     * Method responsible of getting available tides and stores the tides in an array.
     * 
     * @static
     * @param {Object} tideObject - Object containing tide information.
     * @returns {string[]} - Array of available tides.
     */
    static getAvailableTides(tideObject) {
        let tidesArray = [];
        for (let i = 0; i < tideObject.length; i++) {
            try {
                let entry = tideObject[i].availableTides;
                tidesArray = tidesArray.concat(entry);
            } catch (error) {
                ResponseManager.sendError('Getting available tides', error);
            }
        }
        return tidesArray;
    }
    
    /**
     * Method responsible of comparing web page's endpoint with viable tides.
     * 
     * @static
     * @async
     * @param {Object} result - Object containing tides information.
     * @param {string[]} pathSegments - Array representing the segments of the URL.
     * @returns 
     */
    static async tidesEndPointComparison(result, pathSegments) {
        let tidesArray = this.getAvailableTides(result);

        if (pathSegments[0] === 'tides') {
            return pathSegments[1].includes(tidesArray);
        } else {
            return false;
        }

    }

}
export default TidesManager;