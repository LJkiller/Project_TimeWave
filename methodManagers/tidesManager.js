import Methods from './methods.js';
import ResponseManager from './responseManager.js';

/**
 * Class responsible of managing tides generation by communicating
 * from a MongoDB database.
 * Functions:
 * Generate HTML structure.
 *
 * @class TidesManager
 */
class TidesManager {

    /**
     * Method responsible of generating links from MongoDB in an HTML format.
     * 
     * @static
     * @param {Array} objResult - Tide objects from MongoDB.
     * @returns {string} - HTML string for generated splashes.
     */
    static generateTides(objResult) {
        try {
            let tides = '';
            for (let i = 0; i < objResult.length; i++) {
                try {
                    let tide = this.generateAvailableTides(objResult[i].availableTides);
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
     * @param {Object} tideObject - Object containing tide information.
     * @returns {string} - HTML structure: tide links.
     */
    static generateAvailableTides(tideObject) {
        let tides = '';
        for (let key in tideObject) {
            if (tideObject.hasOwnProperty(key)) {
                let tide = Methods.capitalizeFirstLetter(tideObject[key]);
                tides += `<a class="tide" href="/tides/${tide.toLowerCase()}">${tide}</a>`;
            }
        }
        return tides;
    }

    /**
     * Method responsible of getting available tides and stores the tides in an array.
     * 
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
     * @param {Object} result - Object containing tides information.
     * @param {string[]} pathSegments - Array representing the segments of the URL.
     * @returns 
     */
    static async tidesEndPointComparison(result, pathSegments) {
        let tidesArray = TidesManager.getAvailableTides(result);

        if (pathSegments[0] === 'tides') {
            return pathSegments[1].includes(tidesArray);
        } else {
            return false;
        }

    }

}
export default TidesManager;