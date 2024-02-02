
// Setup
import 'dotenv/config';
import http from 'http';
import mongoDB from 'mongodb';
import ResponseManager from './methodManagers/responseManager.js';
const port = process.env.PORT;

// Routing
import { handleRoute } from './routeHandler.js';
import { handleStaticFileRoute } from './staticFileHandler.js';

// Establishing MongoDB Connection.
let mongoConn;
try{
    mongoConn = await mongoDB.MongoClient.connect(process.env.MONGODB_CONNECTIONSTING);
} catch (error){
    ResponseManager.sendError('MongoDB connection', error);
    console.log('Further uses of application will be downgraded.');
    process.exit(1);
}
let db = mongoConn.db('timeWave');

/**
 * Method responsible of handling HTTP requests. 
 * Makes appropiate responses depending on requests.
 * Further routes requests to different handlers based on url.
 * 
 * @async
 * @param {http.IncomingMessage} request - HTTP request.
 * @param {http.ServerResponse} response - HTTP response.
 * @returns {Promise<void>} Promise that resolves when the request handling is complete.
 */
async function handleRequest(request, response) {
    // Information extraction.
    let url = new URL(request.url, 'http://' + request.headers.host);
    let path = url.pathname;
    let pathSegments = path.split('/').filter(function (element) {
        return element !== '';
    });

    // Handle file requests.
    if (pathSegments.length > 0 && pathSegments[0] === 'public' && request.method === 'GET') {
        handleStaticFileRoute(pathSegments, response);
        return;
    }
    handleRoute(db, url, pathSegments, request, response);
}

/**
 * Method responsible of creating HTTP server using handleRequest method to handle requests.
 *
 * @type {http.Server} HTTP server instance.
 */
const app = http.createServer(handleRequest);

/**
 * Method responsible of starting a server.
 * Listening on specified port, and log message to console.
 *
 * @param {number} port - Port, server listens on.
 */
app.listen(port, function () {
    console.log(`Server listening on ${port}`);
});