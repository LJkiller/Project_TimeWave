
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
    let posts = await generateSplashes(result);

    template = template.replaceAll('DEEZ%splashes%NUTS', posts);

    ResponseManager.sendWebPageResponse(response, 200, 'text/html', template);
    return;
}

/**
 * Method responsible of generating posts from MongoDB in an HTML format.
 * Returns the generated splashes as string.
 * 
 * @param {Array} objResult - Splash objects from MongoDB.
 * @returns {string} - HTML string for generated splashes.
 */
async function generateSplashes(objResult){
    let splashes = '';
    for (let i = 0; i < objResult.length; i++){
        let splash = objResult[i];
        splash =
        `
            <a class="post" href="/post?id=${splash.splashId}">
                <h3 class="author">@${splash.author}</h3>
                <span class="date">Made a splash: ${await formatDate(splash)}</span>
                <p class="content">Content: ${splash.splashContent}</p>
            </a>
        `;
        splashes += splash;
    }
    return splashes;
}

/**
 * Method responsible of formating the date from a MongoDB object into
 * a standardized string format.
 *
 * @param {Object} splash - MongoDB object containing splash information.
 * @returns {string} - Formatted date string in the "YYYY-MM-DD HH:mm:ss" format.
 */
async function formatDate(splash) {
    let addZero = (time) => (time < 10 ? `0${time}` : time);

    let { year, month, day, hour, minute, second } = splash.splashDate;

    // YYYY-MM-DD: HH:MM:SS
    let format = `${year}-${addZero(month)}-${addZero(day)}:`+
    `${addZero(hour)}:${addZero(minute)}:${addZero(second)}`;

    return format;
}