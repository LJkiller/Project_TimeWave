
import fs from 'fs/promises';
import Methods from './methodManagers/methods.js';
import ResponseManager from './methodManagers/responseManager.js';

// import someHandler from './routeHandlers/somethingsHandler.js';
// const someHandler = require('./routeHandlers/somethingsHandler');

/**
 * Method responsible of handling routes for HTTP requests. 
 * Directing routes to appropiate handlers based on pathSegments. 
 * Further actions are dependent on proved information and pathSegments.
 *
 * @param {Db} db - MongoDB database.
 * @param {URL} url - URL.
 * @param {string[]} pathSegments - Array representing the segments of the URL.
 * @param {http.IncomingMessage} request - HTTP request.
 * @param {http.ServerResponse} response - HTTP response.
 * @returns {Promise<void>} Promise that resolves when the routing and handling are complete.
 */
export async function handleRoute (db, url, pathSegments, request, response) {
    let template;
    let result;
    let route;

    // Handle Index.
    if (pathSegments.length === 0) {
        route = 'index';
        ResponseManager.sendPageRoute(route);

        template = (await fs.readFile('templates/index.sawcon')).toString();
        let balls = '';
        balls +=`
            <div style="height: 50px; width: 100px; background-color: red; color: blue; margin-top: 10px;">Balls</div>
            <div style="height: 50px; width: 100px; background-color: red; color: blue; margin-top: 10px;">Balls</div>
            <div style="height: 50px; width: 100px; background-color: red; color: blue; margin-top: 10px;">Balls</div>
            <div style="height: 50px; width: 100px; background-color: red; color: blue; margin-top: 10px;">Balls</div>
        `;
        template = template.replaceAll('DEEZ%variables%NUTS', balls);

        ResponseManager.sendWebPageResponse(response, 200, 'text/html', template);
        return;
    }
    else {
        // Handle other routes based on first segment of pathSegments.
        switch (pathSegments[0]) {
            case 'something':
                // handleSomethingsRoute(db, url, pathSegments, request, response);
                break;
            default:
                // Invalid route.
                ResponseManager.sendWebPageResponse(response);
                return;
        }
    }

}