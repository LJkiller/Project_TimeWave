
import fs from 'fs/promises';
import ResponseManager from '../methodManagers/responseManager.js';

/**
 * Method responsible of handling the different statuscode-related page request. 
 * Logging the route, reading statuscode templates, replacing placeholders.
 *
 * @async
 * @param {Number} code - StatusCode indicating what error (often 500 or 404).
 * @param {string[]} pathSegments - Array representing the segments of the URL.
 * @param {http.IncomingMessage} request - HTTP request.
 * @param {http.ServerResponse} response - HTTP response.
 * @returns {Promise<void>} - A Promise that resolves when the handling is complete.
 */
export async function handleStatusCode(code, pathSegments, request, response){
    let route = 'status error';
    ResponseManager.sendPageRoute(route);

    try{
        let template = '';
        switch (code){
            case 404: // Not Found.
                template = (await fs.readFile('templates/statusCode/404.sawcon')).toString();
                break;
            default: // 500, Internal Server Error.
                template = (await fs.readFile('templates/statusCode/500.sawcon')).toString();
        }
        
        ResponseManager.sendWebPageResponse(response, 200, 'text/html', template);
        return;
    } catch (error) {
        ResponseManager.sendError('Reading file', error);
        ResponseManager.sendWebPageResponse(response);
        return;
    }
}