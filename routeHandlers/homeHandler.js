
import fs from 'fs/promises';
import Methods from '../methodManagers/methods.js';
import ResponseManager from '../methodManagers/responseManager.js';

/**
 * Method responsible of handling the index page request. 
 * Logging the route, reading index template, replacing placeholders with content, 
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

    let template = (await fs.readFile('templates/home.sawcon')).toString();    
    let result = await db.collection('splashes').find().toArray();
    let posts = '';

    for (let i = 0; i < result.length; i++){
        let splash = result[i];
        splash =
            `
            <article style="margin-left: 350px;">
                <h2>@${splash.author}</h2>
                <span>Made a splash: ${splash.splashDate.year}-${splash.splashDate.month}-${splash.splashDate.day}: ${splash.splashDate.hour}:${splash.splashDate.minute}:${splash.splashDate.second}</span>
                <p>Content: ${splash.splashContent}</p>
                <a href="/post?id=${splash.splashId}">Splash details</a>
            </article>
            <br>
        `;
        posts += splash;
    }
    template = template.replaceAll('DEEZ%variables%NUTS', posts);

    ResponseManager.sendWebPageResponse(response, 200, 'text/html', template);
    return;
}