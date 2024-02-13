
import Methods from './methods.js';
import ResponseManager from './responseManager.js';
import 'dotenv/config';

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

    // #region Tides Generation

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
                    let tide = this.generateAvailableTidesHTML(objResult[i].availableTides, isCheckList);
                    tides += tide;
                } catch (error) {
                    ResponseManager.sendError('tidesManager.generateTides(), Generating tides HTML', error);
                }
            }
            return tides;
        } catch (error) {
            ResponseManager.sendError('tidesManager.generateTides(), Generating available Tides', error);
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
    static generateAvailableTidesHTML(tideArray, isCheckList = false) {
        let alphabeticalOrder = tideArray.sort((a, b) => a.localeCompare(b));
        let result = alphabeticalOrder;
        let tides = '';
        for (let i = 0; i < result.length; i++){
            let tide = Methods.capitalizeFirstLetter(result[i]);
            if (isCheckList === false){
                tides += `<a class="tide" href="/tides/${tide.toLowerCase()}">${Methods.XSSProtectionHandler(tide)}</a>`;
            } else {
                tides += `<li><input type="checkbox" name="${tide.toLowerCase()}" id="${tide.toLowerCase()}"> ${Methods.XSSProtectionHandler(tide)}</li>`;
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
            ResponseManager.sendError('tidesManager.getAvailabletides(), Getting available tides', error);
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
        for (let i = 0; i < tideArray.length; i++) {
            if (pathSegments[1] === tideArray[i]) {
                return true;
            }
        }
        return false;
    }

    // #endregion
    
    // #region Creating Tides

    /**
     * Method responsible of creating new tides to MongoDB from analyzing url params.
     * 
     * @static
     * @async
     * @param {Db} db - MongoDB database object.
     * @param {http.IncomingMessage} request - HTTP request.
     * @param {http.ServerResponse} response - HTTP response.
     */
    static async createATide(db, request, response) {
        try {
            let data = await Methods.getBody(request);
            let params = new URLSearchParams(data);
            let newTide = params.get('new-tide');
            let tidesConnection = await db.collection('tides').find().toArray();
            let tideObject = tidesConnection[0];

            let spaces = newTide.split(' ');
            if (spaces.length > 1){
                Methods.pageRedirection(response, 'create-tide', 'error', 'tides_400');
                return;
            }
            // Remember if you change MAX_TIDES_CHARS, you need to correct alert.js.
            if (newTide.length > parseInt(process.env.MAX_TIDES_CHARS)){
                Methods.pageRedirection(response, 'create-tide', 'error', 'tides_413');
                return;
            }
            if (Methods.analyzeInputForDanger(newTide)){
                Methods.pageRedirection(response, 'create-tide', 'error', 'tides_403');
                return;
            }
            for (let i = 0; i < tideObject.availableTides.length; i++){
                if (newTide === tideObject.availableTides[i]){
                    Methods.pageRedirection(response, 'create-tide', 'error', 'tides_409');
                    return;
                }
            }

            tideObject.availableTides.push(newTide);
            let newTidesArray = tideObject.availableTides;

            try {
                await db.collection('tides').updateOne(
                    { _id: tideObject._id },
                    {
                        $set: {
                            "availableTides": newTidesArray
                        }
                    }
                );
            } catch (error) {
                ResponseManager.sendError('tidesManager.createATide(), Creating tide', error);
            }
            // User redirection to created splash.
            response.writeHead(302, { 'Location': `/tides/${newTide}` });
            response.end();
            return;
        } catch (error) {
            ResponseManager.sendWebPageResponse(response);
            ResponseManager.sendError('tidesManager.createATide(), Creating splash', error);
        }
    }

    // #endregion

}
export default TidesManager;