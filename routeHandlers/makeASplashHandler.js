
import fs from 'fs/promises';
import Methods from '../methodManagers/methods.js';
import PostManager from '../methodManagers/postManager.js';
import ResponseManager from '../methodManagers/responseManager.js';

/**
 * Method responsible of handling the make a splash page request. 
 * Logging the route, reading make-a-splash template, replacing placeholders with content, 
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
export async function handleMakeASplash(db, url, pathSegments, request, response){
    let route = 'make a splash';
    ResponseManager.sendPageRoute(route);

    try{
        let template = (await fs.readFile('templates/make-a-splash.sawcon')).toString();
        
        // let loggedInUser = ;
        // let userResult = await db.collection('accounts').findeOne({ "": loggedInUser });
    
        template = template
            //.replaceAll('DEEZ%specificSplash%NUTS', post)
        ;
    
        ResponseManager.sendWebPageResponse(response, 200, 'text/html', template);
        return;

    } catch(error){
        ResponseManager.sendError('Reading file', error);
        ResponseManager.sendWebPageResponse(response);
        return;
    }
}