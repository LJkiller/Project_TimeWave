
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
     * @param {Array} tideArray - Array containing tide information.
     * @param {boolean} isCheckList - If function is prioritsed as a checklist.
     * @returns {string} - HTML structure: tide links.
     */
    static generateAvailableTides(tideArray, isCheckList = false) {
        let tides = '';
        for (let i = 0; i < tideArray.length; i++){
            let tide = Methods.capitalizeFirstLetter(tideArray[i]);
            if (isCheckList === false){
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
     * @param {Array} tideArray - Array containing tide information.
     * @returns {string[]} - Array of available tides.
     */
    static getAvailableTides(tideArray) {
        try {
            return tideArray[0].availableTides;
        } catch (error) {
            ResponseManager.sendError('Getting available tides', error);
        }
    }
    
    /**
     * Method responsible of comparing web page's endpoint with viable tides.
     * 
     * @static
     * @async
     * @param {Array} tideArray - Array containing tides information.
     * @param {string[]} pathSegments - Array representing the segments of the URL.
     * @returns 
     */
    static async tidesEndPointComparison(tideArray, pathSegments) {

        for (let i = 0; i < tideArray.length; i++){
            if (pathSegments[1] === tideArray[i]){
                return true;
            } else {
                return false;
            }
        }
    }

}
export default TidesManager;