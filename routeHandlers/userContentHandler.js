
import fs from 'fs/promises';
import Methods from '../methodManagers/methods.js';
import UserManager from '../methodManagers/userManager.js';
import ResponseManager from '../methodManagers/responseManager.js';
import PostManager from '../methodManagers/postManager.js';

/**
 * Method responsible of handling the users content page request. 
 * Logging the route, reading tides-content template, replacing placeholders with content, 
 * and sending web page response.
 *
 * @param {Db} db - MongoDB database object.
 * @param {URL} url - URL.
 * @param {string[]} pathSegments - Array representing the segments of the URL.
 * @param {http.IncomingMessage} request - HTTP request.
 * @param {http.ServerResponse} response - HTTP response.
 * @returns {Promise<void>} - A Promise that resolves when the handling is complete.
 */
export async function handleUserContent(db, url, pathSegments, request, response){
    let route = 'user';
    let contentBody = Methods.capitalizeFirstLetter(pathSegments[1]);
    route = `${route} ${pathSegments[1]}`;
    ResponseManager.sendPageRoute(route);

    try{
        let template = (await fs.readFile('templates/user-content.sawcon')).toString();
        let postResult = await db.collection('splashes').find().toArray();
        let posts = await PostManager.generateSplashes(postResult, db, pathSegments);
        let joinDate = await UserManager.generateJoinDate(db, pathSegments);

        template = template
            .replaceAll('DEEZ%splashes%NUTS', posts)
            .replaceAll('DEEZ%joinDate%NUTS', joinDate)
            .replaceAll('DEEZ%username%NUTS', contentBody)
        ;

        ResponseManager.sendWebPageResponse(response, 200, 'text/html', template);       
        return;
    } catch(error){
        ResponseManager.sendError('Reading file', error);
        ResponseManager.sendWebPageResponse(response);
        return;
    }
}