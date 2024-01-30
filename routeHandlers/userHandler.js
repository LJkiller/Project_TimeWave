
import fs from 'fs/promises';
import Methods from '../methodManagers/methods.js';
import UserManager from '../methodManagers/userManager.js';
import ResponseManager from '../methodManagers/responseManager.js';

/**
 * Method responsible of handling the user page request. 
 * Logging the route, reading tides template, replacing placeholders with content, 
 * and sending web page response.
 *
 * @param {Db} db - MongoDB database object.
 * @param {URL} url - URL.
 * @param {string[]} pathSegments - Array representing the segments of the URL.
 * @param {http.IncomingMessage} request - HTTP request.
 * @param {http.ServerResponse} response - HTTP response.
 * @returns {Promise<void>} - A Promise that resolves when the handling is complete.
 */
export async function handleUser(db, url, pathSegments, request, response){
    let route = 'user';
    ResponseManager.sendPageRoute(route);
    let contentHead = Methods.pageReflection(route);
       
    try{
        let template = (await fs.readFile('templates/user.sawcon')).toString();
        let result = await db.collection('accounts').find().toArray();
        let users = UserManager.generateUsers(result);
    
        template = template
            .replaceAll('DEEZ%users%NUTS', users)
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