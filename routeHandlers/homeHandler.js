
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
    let balls = '';
    balls +=`
        <div style="height: 50px; width: 100px; background-color: var(--wb-complementary-bg-color); color: blue; margin-top: 10px;">Balls</div>
        <div style="height: 50px; width: 100px; background-color: var(--wb-complementary-bg-color); color: blue; margin-top: 10px;">Balls</div>
        <div style="height: 50px; width: 100px; background-color: var(--wb-complementary-bg-color); color: blue; margin-top: 10px;">Balls</div>
        <div style="height: 50px; width: 100px; background-color: var(--wb-complementary-bg-color); color: blue; margin-top: 10px;">Balls</div>
    `;
    template = template.replaceAll('DEEZ%variables%NUTS', balls);

    ResponseManager.sendWebPageResponse(response, 200, 'text/html', template);
    return;
}