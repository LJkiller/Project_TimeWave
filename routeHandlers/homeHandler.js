
import fs from 'fs/promises';
import Methods from '../methodManagers/methods.js';
import PostManager from '../methodManagers/postManager.js';
import ResponseManager from '../methodManagers/responseManager.js';

/**
 * Method responsible of handling the home page request. 
 * Logging the route, reading home template, replacing placeholders with content, 
 * and sending web page response.
 *
 * @param {Db} db - MongoDB database object.
 * @param {URL} url - URL.
 * @param {string[]} pathSegments - Array representing the segments of the URL.
 * @param {http.IncomingMessage} request - HTTP request.
 * @param {http.ServerResponse} response - HTTP response.
 * @returns {Promise<void>} - A Promise that resolves when the handling is complete.
 */
export async function handleHome(db, url, pathSegments, request, response){
    let route = 'home';
    ResponseManager.sendPageRoute(route);
    let contentHead = Methods.pageReflection(route);

    try{
        let template = (await fs.readFile('templates/home.sawcon')).toString();    
        let result = await db.collection('splashes').find().toArray();
        let posts = PostManager.generateSplashes(result, db, pathSegments);
    
        template = template
            .replaceAll('DEEZ%splashes%NUTS', posts)
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
