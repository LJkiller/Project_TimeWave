
import ResponseManager from '../methodManagers/responseManager.js';
import UserManager from '../methodManagers/userManager.js';

import { handleUser } from './userHandler.js';
import { handleUserContent } from './userContentHandler.js';

// Route

/**
 * Method responsible of handling routes for user requests. 
 * Directing routes to appropiate handlers based on pathSegments. 
 * Further actions are dependent on proved information and pathSegments.
 *
 * @param {Db} db - MongoDB database object.
 * @param {URL} url - URL.
 * @param {string[]} pathSegments - Array representing the segments of the URL.
 * @param {http.IncomingMessage} request - HTTP request.
 * @param {http.ServerResponse} response - HTTP response.
 * @returns {Promise<void>} - A Promise that resolves when the handling is complete.
 */
export async function handleUserRoute(db, url, pathSegments, request, response) {

    // Handle tides index (tide redirectory)
    if (pathSegments.length === 1) {
        handleUser(db, url, pathSegments, request, response);
    } else {
        let result = await db.collection('accounts').find().toArray();
        
        if (UserManager.usersEndPointComparison(result, pathSegments)) {
            handleUserContent(db, url, pathSegments, request, response);
        } else {
            ResponseManager.sendWebPageResponse(response);
        }
        
    }
}