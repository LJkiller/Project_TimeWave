
/**
 * Utility class, containing static methods for various tasks in the web server.
 * and retrieving request body content (getBody).
 *
 * @class
 */
class Methods {

  /**
   * Method responsible of retrieving body content from HTTP request.
   *
   * @param {http.IncomingMessage} request - HTTP request.
   * @returns {Promise<string>} Promise that resolves the body content as string.
   * @rejects {Error} If error during request or data retrieval.
   */
  static getBody(request) {
    return new Promise(function (resolve, reject) {
      let chunks = [];

      request.on('data', function (chunk) {
        chunks.push(chunk);
      });

      request.on('error', function (err) {
        reject(err);
      });

      request.on('end', async function () {
        let data = Buffer.concat(chunks).toString();
        resolve(data);
      });
    });
  }

  /**
   * Method responsible of replacing potentially dangerous charaters in a string with corresponding HTML entities.
   * Preventing cross-site scripting (XSS) vulnerabilities.
   *
   * @param {string} input - Input to be sanitized.
   * @returns {string} Sanitized string with replaced characters.
   */
  static replaceDangerousCharacters(input) {
    let output = input
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll('\'', '&#39;');
    return output;
  }

}
export default Methods;