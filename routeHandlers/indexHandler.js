
import fs from 'fs/promises';
import Methods from '../methodManagers/methods.js';
import ResponseManager from '../methodManagers/responseManager.js';

/**
 * Method responsible of handling the index page request. 
 * Logging the route, reading index template, replacing placeholders with content, 
 * and sending web page response.
 *
 * @async
 * @param {Db} db - MongoDB database object.
 * @param {URL} url - URL.
 * @param {string[]} pathSegments - Array representing the segments of the URL.
 * @param {http.IncomingMessage} request - HTTP request.
 * @param {http.ServerResponse} response - HTTP response.
 * @returns {Promise<void>} - A Promise that resolves when the handling is complete.
 */
export async function handleIndex(db, url, pathSegments, request, response){
    let route = 'index';
    ResponseManager.sendPageRoute(route);

    try{
        let template = (await fs.readFile('templates/index.sawcon')).toString();
        ResponseManager.sendWebPageResponse(response, 200, 'text/html', template);
        return;
    } catch (error) {
        ResponseManager.sendError('Reading file', error);
        ResponseManager.sendWebPageResponse(response);
        return;
    }
}