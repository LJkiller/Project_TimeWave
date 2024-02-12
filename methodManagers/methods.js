
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
     * @async
     * @param {http.IncomingMessage} request - HTTP request.
     * @returns {Promise<string>} Promise that resolves the body content as string.
     * @rejects {Error} If error during request or data retrieval.
     */
    static async getBody(request) {
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
    * In addition encapsulates url with an a-element.
    *
    * @static
    * @param {string} input - Input to be sanitized.
    * @returns {string} Sanitized string with replaced characters.
    */
    static XSSProtectionHandler(input) {
        let sanitizeCharacters = {
            '&': '&amp;',

            '<': '&lt;',
            '>': '&gt;',

            '"': '&quot;',
            '`': '&#96;',

            '\'': '&#39;',
            '/': '&#47;',

            '=': '&#61;',
            '(': '&#40;',
            ')': '&#41;'
        };

        let urlPattern = /(https?:\/\/[^\s<>"'`]+)/g;
        let urls = [];
        let urlPlaceholder = '_DEEZ__URL_PLACEHOLDER__NUTS_';

        // Replacing with urlPlaceholder
        input = input.replace(urlPattern, (url) => {
            urls.push(url);
            return urlPlaceholder;
        });

        // Replacing dangerous characters.
        for (let i = 0; i < input.length; i++) {
            let match = input[i];
            input = input.replace(match, sanitizeCharacters[match] || match);
        }

        for (let i = 0; i < urls.length; i++) {
            input = input.replace(urlPlaceholder, `<a href="${urls[i]}" target="_blank">${urls[i]}</a>`);
        }
        return input;
    }

    /**
     * Method responsible of formating the date from a MongoDB object into
     * a standardized string format.
     *
     * @static
     * @param {Object} splash - MongoDB object containing splash information.
     * @returns {string} - Formatted date string in the "YYYY-MM-DD HH:mm:ss" format.
     */
    static formatDate(object, isSplash = true) {
        let addZero = (time) => (time < 10 ? `0${time}` : time);
        let format = '';

        // Formatting splashes' date.
        if (isSplash) {
            let { year, month, day, hour, minute, second } = object.splashDate;
            // YYYY-MM-DD: HH:MM:SS
            format = `${year}-${addZero(month)}-${addZero(day)}:` +
                ` ${addZero(hour)}:${addZero(minute)}:${addZero(second)}`;
        }
        // Formatting user's join date.
        else {
            if (Array.isArray(object)) {
                format = object.map(item => {
                    // Checks if item and joinDate property is not null.
                    if (item && item.joinDate) {
                        let { year, month, day, ...rest } = item.joinDate;
                        // YYYY-MM-DD
                        return `${year}-${addZero(month)}-${addZero(day)}`;
                    } else {
                        return `Didn't find date.`;
                    }
                });
            } else {
                format = 'Object is not an array.';
            }
        }

        return format;
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
      * @static
      * @param {string} input - Input string to be capitalized first letter. 
      * @returns {string} - Capitalized first letter in each word.
      */
    static capitalizeFirstLetter(input) {
        return input.replace(/(?:^|\s|-|_)\w/g, function (char) {
            return char.toUpperCase();
        });
    }

    /**
     * Method responsible of getting the current UTCDate.
     * 
     * @returns {Object} - The date.
     */
    static getCurrentUTCDate() {
        let currentDate = new Date();
        let year = currentDate.getUTCFullYear();
        let month = currentDate.getUTCMonth() + 1;
        let day = currentDate.getUTCDate();
        let hour = currentDate.getUTCHours();
        let minute = currentDate.getUTCMinutes();
        let second = currentDate.getUTCSeconds();

        let date = { year, month, day, hour, minute, second };
        return date;
    }

}
export default Methods;