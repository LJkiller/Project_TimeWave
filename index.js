
// Setup
import 'dotenv/config';
import http from 'http';
import mongoDB from 'mongodb';
const port = 3000;

// Routing
import { handleRoute } from './routeHandler.js';
import { handleStaticFileRoute } from './staticFileHandler.js';

// Establishing MongoDB Connection.
const mongoConn = await mongoDB.MongoClient.connect(process.env.MONGODB_CONNECTIONSTING);
const db = mongoConn.db('timeWave');

/**
 * Method responsible of handling HTTP requests. 
 * Makes appropiate responses depending on requests.
 * Further routes requests to different handlers based on url.
 * 
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

