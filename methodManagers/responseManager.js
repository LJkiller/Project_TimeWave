
/**
 * Class responsible of managing functions for responses.
 * Methods provide functionalities such as: 
 * sending webpage responses (sendWebPageResponse), 
 * sending API responses(sendAPIResponse),
 * and logging page routes (sendPageRoute).
 *
 * @class
 */
class ResponseManager {

    /**
     * Method responsible of sending a Webpage response with writeHead, write, and ends it.
     * Default: 500 Internal Server Error.
     *
     * @static
     * @param {http.ServerResponse} response - Response object. Always required.
     * @param {number} statusC0D3 - HTTP status code.
     * @param {string} contentType - Content type of the response.
     * @param {string} contentText - Content text to be written in the response.
    */
    static sendWebPageResponse(response, statusC0D3 = 500, contentType = 'text/plain', contentText = '500 Internal Server Error') {
        response.writeHead(statusC0D3, { 'Content-Type': contentType });
        response.write(contentText);
        response.end();
    }

    /**
     * Method responsible of sending an API response with writeHead, write, and ends it.
     * Default: 500 Internal Server Error.
     * 
     * @static
     * @param {http.ServerResponse} response - Response object. Always required.
     * @param {number} statusC0D3 - HTTP status code.
     * @param {string} contentType - Content type of the response.
     * @param {string} contentText - Content text to be written in the response.
    */
    static sendAPIResponse(response, statusC0D3 = 500, contentType = 'text/plain', contentText = '500 Internal Server Error') {
        response.writeHead(statusC0D3, { 'Content-Type': contentType });
        response.write(JSON.stringify({
            statusCode: statusC0D3,
            status: contentText
        }));
        response.end();
    }

    /**
     * Method responsible of sending the webbserver's page's name.
     * 
     * @static
     * @param {string} route - Page's defined route.
    */
    static sendPageRoute(route) {
        console.log(`Page is on ${route}`);
    }

    /**
     * Method responsible of logging and handling an error.
     *
     * @static
     * @param {Error} error - The error object containing information about the occurred error.
     * @param {string} context - A string indicating the context or location where the error occurred.
    */
    static sendError(context, error) {
        console.error(`${context} Error: ${error.message}`);
    }

}
export default ResponseManager;