
import ResponseManager from "./responseManager.js";
import 'dotenv/config';

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

    // Absolute horse shit.
    // /**
    //  * Method responsible of analyzing input for alerts.
    //  * 
    //  * @static
    //  * @async
    //  * @param {http.ServerResponse} response - HTTP response.
    //  * @param {string} input - Input to be analyzed.
    //  * @param {string} page - Which page function is calling upon.
    //  * @param {Array} analyticalArray - Array for tides.
    //  */
    // static async analyzeForRedirection(response, input, page, analyticalArray) {
    //     let containSpaces = false;
    //     let containDanger = false;
    //     let containDoubles = false;
    //     let inputTooBig = false;
    //     let spaces = input.split(' ');

    //     if (spaces.length > 1) {
    //         containSpaces = true;
    //     }
    //     if (Methods.analyzeInputForDanger(input)) {
    //         containDanger = true;
    //     }
    //     for (let i = 0; i < analyticalArray.length; i++) {
    //         if (input !== analyticalArray[i]) {
    //             containDoubles = false;
    //             break;
    //         }
    //     }

    //     if (page === 'create-tide') {
    //         if (input.length > parseInt(process.env.MAX_TIDES_CHARS)) {
    //             inputTooBig = true;
    //         }
    //     } else if (page === 'sign-up') {
    //         if (input.length > parseInt(process.env.MAX_USERNAME_CHARS)) {
    //             inputTooBig = true;
    //         }
    //     }

    //     switch (page) {
    //         case 'create-tide':
    //             if (containSpaces) {
    //                 await this.pageRedirection(response, 'create-tide', 'error', 'tides_400');
    //             } else if (containDanger) {
    //                 await this.pageRedirection(response, 'create-tide', 'error', 'tides_403');
    //             } else if (containDoubles) {
    //                 await this.pageRedirection(response, 'create-tide', 'error', 'tides_409');
    //             } else if (inputTooBig) {
    //                 await this.pageRedirection(response, 'create-tide', 'error', 'tides_413');
    //             }
    //             break;
    //         case 'sign-up':
    //             if (containSpaces) {
    //                 await this.pageRedirection(response, 'sign-up', 'error', 'username_400');
    //             } else if (containDanger) {
    //                 await this.pageRedirection(response, 'sign-up', 'error', 'username_403');
    //             } else if (containDoubles) {
    //                 await this.pageRedirection(response, 'sign-up', 'error', 'username_409');
    //             } else if (inputTooBig) {
    //                 await this.pageRedirection(response, 'sign-up', 'error', 'username_413');
    //             }
    //             return true;
    //         default:
    //             break;
    //     }
    //     return false;
    // }

    /**
     * Method responsible of redirecting user to different pages depending on information.
     * 
     * @static
     * @async
     * @param {http.ServerResponse} response - HTTP response.
     * @param {string} location - Page redirection.
     * @param {string} query - Terms for additional redirection. (query & typeOfError.
     * @param {string} value - Value for query string.
     */
    static async pageRedirection(response, location, query = '', value = '') {
        try {
            let queryString = '';
            if (query !== '' && value !== '') {
                queryString = `?${query}=${value}`;
            }
            response.writeHead(302, { 'Location': `/${location}${queryString}` });
            response.end();
            return;
        } catch (error) {
            ResponseManager.sendError('methods.pageRedirection(), Sending location', error);
        }
    }

    /**
     * Method responsible of analyzing a string for dangerous characters, returns true or false.
     * 
     * @param {string} input - String to be analyzed. 
     * @returns {boolean} - True or false depending if dangerousCharacter found.
     */
    static analyzeInputForDanger(input) {
        let dangerousCharacters = [
            '&', '<', '>', '"', '`', '\\', '/', '=', '(', ')',
            '!', '?', '§', '*', '+', '-', '[', ']', '{', '}',
            '|', ';', ':', ',', '.', '~', '@', '#', '$', '%',
            '^', '_', '\''
        ];

        for (let i = 0; i < input.length; i++) {
            if (dangerousCharacters.includes(input[i])) {
                return true;
            }
        }
        return false;
    }

}
export default Methods;