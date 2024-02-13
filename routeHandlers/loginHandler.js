
import fs from 'fs/promises';
import ResponseManager from '../methodManagers/responseManager.js';

/**
 * Method responsible of handling the login page request. 
 * Logging the route, reading login template, replacing placeholders with content, 
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
export async function handleLogin(db, url, pathSegments, request, response){
    let route = 'login';
    ResponseManager.sendPageRoute(route);

    try{
        let template = (await fs.readFile('templates/login.sawcon')).toString();
        ResponseManager.sendWebPageResponse(response, 200, 'text/html', template);
        return;
    } catch (error) {
        ResponseManager.sendError('Reading file', error);
        ResponseManager.sendWebPageResponse(response);
        return;
    }
}