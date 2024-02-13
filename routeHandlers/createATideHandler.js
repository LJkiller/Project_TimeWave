
import fs from 'fs/promises';
import ResponseManager from '../methodManagers/responseManager.js';
import TidesManager from '../methodManagers/tidesManager.js';

/**
 * Method responsible of handling the create a tide page request. 
 * Logging the route, reading create-a-tide template, replacing placeholders with content, 
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
export async function handleCreateATide(db, url, pathSegments, request, response) {
    let route = 'create a tide';
    ResponseManager.sendPageRoute(route);

    try {
        let template = (await fs.readFile('templates/create-a-tide.sawcon')).toString();
        let rightAsideHTML = (await fs.readFile('templates/htmlTemplates/right-aside.sawcon')).toString();
        let leftBottomHTML = (await fs.readFile('templates/htmlTemplates/bottom-left-aside.sawcon')).toString();
        let tidesResult = await db.collection('tides').find().toArray();
        
        // let loggedInUser = ;
        // let userResult = await db.collection('accounts').findeOne({ "": loggedInUser });
        
        template = template
            .replaceAll('DEEZ%rightAsideHTML%NUTS', rightAsideHTML)
            .replaceAll('DEEZ%bottomLeftAside%NUTS', leftBottomHTML)
        ;
        
        ResponseManager.sendWebPageResponse(response, 200, 'text/html', template);
        return;
    } catch (error) {
        ResponseManager.sendError('Reading file', error);
        ResponseManager.sendWebPageResponse(response);
        return;
    }
}