
import TidesManager from '../methodManagers/tidesManager.js';
import ResponseManager from '../methodManagers/responseManager.js';

// Route
import { handleTidesContent } from './tidesContentHandler.js';
import { handleTides } from './tidesHandler.js';

/**
 * Method responsible of handling routes for tides requests. 
 * Directing routes to appropiate handlers based on pathSegments. 
 * Further actions are dependent on proved information and pathSegments.
 *
 * @async
 * @param {Db} db - MongoDB database object.
 * @param {URL} url - URL.
 * @param {string[]} pathSegments - Array representing the segments of the URL.
 * @param {http.IncomingMessage} request - HTTP request.
 * @param {http.ServerResponse} response - HTTP response.
 * @returns {Promise<void>} - A Promise that resolves when the handling is complete.
 */
export async function handleTidesRoute(db, url, pathSegments, request, response) {

    // Handle tides index (tide redirectory)
    if (pathSegments.length === 1) {
        handleTides(db, url, pathSegments, request, response);
    } else {
        let result = await db.collection('tides').find().toArray();
        
        if (TidesManager.tidesEndPointComparison(result, pathSegments)) {
            handleTidesContent(db, url, pathSegments, request, response);
        } else {
            ResponseManager.sendWebPageResponse(response);
        }
    }
}