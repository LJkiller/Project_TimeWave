
import fs from 'fs/promises';
import Methods from '../methodManagers/methods.js';
import TidesManager from '../methodManagers/tidesManager.js';
import ResponseManager from '../methodManagers/responseManager.js';

/**
 * Method responsible of handling the tides page request. 
 * Logging the route, reading tides template, replacing placeholders with content, 
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
export async function handleTides(db, url, pathSegments, request, response){
    let route = 'tides';
    ResponseManager.sendPageRoute(route);
    let contentHead = Methods.pageReflection(route);
       
    try{
        let template = (await fs.readFile('templates/tides.sawcon')).toString();
        let rightAsideHTML = (await fs.readFile('templates/htmlTemplates/right-aside.sawcon')).toString();
        let leftBottomHTML = (await fs.readFile('templates/htmlTemplates/bottom-left-aside.sawcon')).toString();
        let result = await db.collection('tides').find().toArray();
        let tides = TidesManager.generateTides(result);
        
        template = template
            .replaceAll('DEEZ%tides%NUTS', tides)
            .replaceAll('DEEZ%pageReflector%NUTS', contentHead)
            .replaceAll('DEEZ%rightAsideHTML%NUTS', rightAsideHTML)
            .replaceAll('DEEZ%bottomLeftAside%NUTS', leftBottomHTML)
        ;  

        
        ResponseManager.sendWebPageResponse(response, 200, 'text/html', template);
        return;
    } catch(error){
        ResponseManager.sendError('Reading file', error);
        ResponseManager.sendWebPageResponse(response);
        return;
    }
}