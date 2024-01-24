import ResponseManager from './responseManager.js';

/**
 * Class responsible of managing tides generation by communicating
 * from a MongoDB database.
 * Functions:
 * Generate HTML structure.
 *
 * @class PostManager
 */
class TidesManager {

    /**
     * Method responsible of generating links from MongoDB in an HTML format.
     * 
     * @static
     * @param {Array} objResult - Tide objects from MongoDB.
     * @returns {string} - HTML string for generated splashes.
     */
    static generateAvailableTides(objResult) {
        try {
            objResult.sort((a, b) => a.availableTides.localeCompare(b.availableTides));

            let tides = '';
            
            // Step 2: Iterate through the sorted array to generate HTML
            for (let i = 0; i < objResult.length; i++) {
                let tide = objResult[i];
                
                try {
                    // Step 3: Corrected variable names (splash to tide, splashes to tidesHTML)
                    tide = `
                        <a href="/tides/${tide.availableTides}" class="tide">${tide.availableTides}</a>
                    `;
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
}
export default TidesManager;