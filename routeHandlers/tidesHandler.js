
import fs from 'fs/promises';
import Methods from '../methodManagers/methods.js';
import TidesManager from '../methodManagers/tidesManager.js';
import ResponseManager from '../methodManagers/responseManager.js';

// Route
import { handleTidesContent } from './tidesContentHandler.js';

/**
 * Method responsible of handling the tides page request. 
 * Logging the route, reading tides template, replacing placeholders with content, 
 * and sending web page response.
 * Forwards the user to further handling of routes.
 *
 * @param {Db} db - MongoDB database object.
 * @param {URL} url - URL.
 * @param {string[]} pathSegments - Array representing the segments of the URL.
 * @param {http.IncomingMessage} request - HTTP request.
 * @param {http.ServerResponse} response - HTTP response.
 * @returns {Promise<void>} - A Promise that resolves when the handling is complete.
 */
export async function handleTides(db, url, pathSegments, request, response){
    let route = 'tides';
    ResponseManager.sendPageRoute(route);
    let contentHead = Methods.pageReflection(route);

    // Handle endpoints further from just tides
    if (pathSegments.length > 1){
        pathSegments.shift();
        let seg = pathSegments[0];
        console.log('Should be here: ' + seg);
        handleTidesContent(db, url, pathSegments, request, response);
    } else{
        // Fail Safe here
    }

    try{
        let template = (await fs.readFile('templates/tides.sawcon')).toString();    
        let result = await db.collection('tides').find().toArray();
        let tides = TidesManager.generateTides(result);
    
        template = template
            .replaceAll('DEEZ%tides%NUTS', tides)
            .replaceAll('DEEZ%pageReflector%NUTS', contentHead)
        ;      

        

        ResponseManager.sendWebPageResponse(response, 200, 'text/html', template);       
        return;

    } catch(error){
        ResponseManager.sendError('Reading file', error);
        ResponseManager.sendWebPageResponse(response);
        return;
    }
}