
import Methods from './methodManagers/methods.js';
import ResponseManager from './methodManagers/responseManager.js';

// Handlers
import { handleIndex } from './routeHandlers/indexHandler.js';
import { handleHome } from './routeHandlers/homeHandler.js';
import { handleTides } from './routeHandlers/tidesHandler.js';
import { handleTOS } from './routeHandlers/tosHandler.js';

/**
 * Method responsible of handling routes for HTTP requests. 
 * Directing routes to appropiate handlers based on pathSegments. 
 * Further actions are dependent on proved information and pathSegments.
 *
 * @param {Db} db - MongoDB database object.
 * @param {URL} url - URL.
 * @param {string[]} pathSegments - Array representing the segments of the URL.
 * @param {http.IncomingMessage} request - HTTP request.
 * @param {http.ServerResponse} response - HTTP response.
 * @returns {Promise<void>} Promise that resolves when the routing and handling are complete.
 */
export async function handleRoute (db, url, pathSegments, request, response) {
    try{
        if (pathSegments.length === 0) {
            handleIndex(db, url, pathSegments, request, response);
        }
        else {
            // Handle other routes based on first segment of pathSegments.
            switch (pathSegments[0]) {
                case 'index':
                    handleIndex(db, url, pathSegments, request, response);
                    break;
                case 'home':
                    handleHome(db, url, pathSegments, request, response);
                    break;
                case 'terms-of-service':
                    handleTOS(db, url, pathSegments, request, response);
                    break;
                case 'tides':
                    handleTides(db, url, pathSegments, request, response);
                    break;
                default:
                    // Invalid route.
                    ResponseManager.sendWebPageResponse(response);
                    return;
            }
        }
    } catch (error) {
        ResponseManager.sendError('Handling route', error);
    }

}