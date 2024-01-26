import TidesManager from './tidesManager.js';

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
  * @static
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
  * Also repsonsible for decoding the saniitized content.
  * Preventing cross-site scripting (XSS) vulnerabilities.
  *
  * @static
  * @param {string} input - Input to be sanitized.
  * @param {boolean} [encode=true] - To encode or to decode, that is the question.
  * @returns {string} Sanitized string with replaced characters.
  */
  static XSSProtectionHandler(input, encode = true) {
    let output;
    switch (encode) {
      case false:
        output = input
          .replaceAll('&', '&amp;')

          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')

          .replaceAll('"', '&quot;')
          .replaceAll('`', '&#96;')

          .replaceAll('\'', '&#39;')
          .replaceAll('/', '&#47;')

          .replaceAll('=', '&#61;')

          .replaceAll('(', '&#40;')
          .replaceAll(')', '&#41;');
        break;
      default:
        output = input
          .replaceAll('&amp;', '&')

          .replaceAll('&lt;', '<')
          .replaceAll('&gt;', '>')

          .replaceAll('&quot;', '"')
          .replaceAll('&#96;', '`')

          .replaceAll('&#39;', '\'')
          .replaceAll('&#47;', '/')

          .replaceAll('&#61;', '=')

          .replaceAll('&#40;', '(')
          .replaceAll('&#41;', ')');
        break;
    }
    return output;
  }

  /**
  * Method responsible of analyzing which page you are on
  * to reflect what appropiate page header.
  * 
  * @static
  * @param {string} route - Page route of current page.
  * @returns {string} - Corresponding page header depending on page route.
  */
  static pageReflection(route) {
    // TOS is unnecessary, no pageReflection for that route
    switch (route) {
      case 'home':
        return 'Global';
      case 'user':
        return 'Profile';
      case 'tides':
        return 'Tides';
      case 'tide':
        return 'Tide'
      default:
        return 'UnknownPage';
    }
  }

  /**
    * Method responsible of capitalizing first letters of words.
    * 
    * @param {string} input - Input string to be capitalized first letter. 
    * @returns {string} - Capitalized first letter in each word.
    */
  static capitalizeFirstLetter(input) {
    return input.replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });
  }

}
export default Methods;