
import fs from 'fs/promises';
import Methods from '../methodManagers/methods.js';
import PostManager from '../methodManagers/postManager.js';
import ResponseManager from '../methodManagers/responseManager.js';

/**
 * Method responsible of handling the splash page request. 
 * Logging the route, reading splash template, replacing placeholders with content, 
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
export async function handleSplash(db, url, pathSegments, request, response){
    let route = 'splash';
    ResponseManager.sendPageRoute(`${route} id-${url.searchParams.get('post')}`);
    let contentHead = Methods.pageReflection(route);

    try{
        let template = (await fs.readFile('templates/splash.sawcon')).toString();
        let splashId = parseInt(url.searchParams.get('post'));
        let rightAsideHTML = (await fs.readFile('templates/htmlTemplates/right-aside.sawcon')).toString();
        let result = await db.collection('splashes').findOne({ "splashId": splashId });
        let post = await PostManager.generateSplashes(result, db, pathSegments, url, true);
    
        template = template
            .replaceAll('DEEZ%specificSplash%NUTS', post)
            .replaceAll('DEEZ%pageReflector%NUTS', contentHead)
            .replaceAll('DEEZ%splashId%NUTS', `Splash-${splashId}`)
            .replaceAll('DEEZ%rightAsideHTML%NUTS', rightAsideHTML)
        ;
    
        if (Methods.locationRedirection(db, pathSegments) === true){
            response.writeHead(302, { 'Location': '/home' });
            response.end();
        } else {
            ResponseManager.sendWebPageResponse(response, 200, 'text/html', template);
        }
        return;
    } catch(error){
        ResponseManager.sendError('Reading file', error);
        ResponseManager.sendWebPageResponse(response);
        return;
    }
}