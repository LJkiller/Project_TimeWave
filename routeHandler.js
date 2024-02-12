
import ResponseManager from './methodManagers/responseManager.js';
import PostManager from './methodManagers/postManager.js';

// Handlers
import { handleIndex } from './routeHandlers/indexHandler.js';
import { handleHome } from './routeHandlers/homeHandler.js';
import { handleTidesRoute } from './routeHandlers/tidesRouteHandler.js';
import { handleUserRoute } from './routeHandlers/userRouteHandler.js';
import { handleTOS } from './routeHandlers/tosHandler.js';
import { handleSplash } from './routeHandlers/splashHandler.js';
import { handleMakeASplash } from './routeHandlers/makeASplashHandler.js';

/**
 * Method responsible of handling routes for HTTP requests. 
 * Directing routes to appropiate handlers based on pathSegments. 
 * Further actions are dependent on proved information and pathSegments.
 *
 * @async
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
                case 'splash':
                    handleSplash(db, url, pathSegments, request, response);
                    break;
                case 'terms-of-service':
                    handleTOS(db, url, pathSegments, request, response);
                    break;
                case 'tides':
                    handleTidesRoute(db, url, pathSegments, request, response);
                    break;
                case 'user':
                    handleUserRoute(db, url, pathSegments, request, response);
                    break;
                case 'create-post':
                    if (request.method === 'GET'){
                        handleMakeASplash(db, url, pathSegments, request, response);
                    } else if (request.method === 'POST'){
                        PostManager.makeASplash(db, request, response);
                    }
                    break;
                default:
                    response.writeHead(302, { 'Location': '/home' });
                    response.end();
                    return;
            }
        }
    } catch (error) {
        ResponseManager.sendError('Handling route', error);
    }
}