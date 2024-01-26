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
        for (let entryItems = 0; entryItems < tideObject.availableTides; entryItems++) {
            if (tideObject.availableTides) {
                let availableTides = tideObject.availableTides;
                let daughterItems = TidesManager.getAvailableTides(availableTides);
                tidesArray = tidesArray.concat(daughterItems);
            }
        }
        return tidesArray;
    }

}
export default TidesManager;