
import Methods from './methods.js';
import ResponseManager from './responseManager.js';

/**
 * Class responsible of managing tides generation by communicating
 * from a MongoDB database.
 * Functions:
 * Generate HTML structure,
 * Get available tides,
 * End point comparison.
 *
 * @class UserManager
 */
class UserManager {

    /**
     * Method responsible of generating links from MongoDB in an HTML format.
     * 
     * @static
     * @param {Array} objResult - Tide objects from MongoDB.
     * @returns {string} - HTML string for generated splashes.
     */
    static generateUsers(objResult, isOption = false) {
        try {
            let alphabeticalOrder = objResult.sort((a, b) => a.username.toLowerCase().localeCompare(b.username.toLowerCase()));
            let result = alphabeticalOrder;
            let users = '';
            for (let i = 0; i < result.length; i++) {
                try {
                    let user = this.generateAvailableUsersHTML(result[i].username, isOption);
                    users += user;
                } catch (error) {
                    ResponseManager.sendError('userManager.generateUsers(), Generating users HTML', error);
                }
            }
            return users;
        } catch (error) {
            ResponseManager.sendError('userManager.generateUsers(), Generating available Users', error);
        }
    }

    /**
     * Method responsible for generating available users.
     * 
     * @static
     * @param {Object} userObject - Object containing user information.
     * @returns {string} - HTML structure: tide links.
     */
    static generateAvailableUsersHTML(userObject, isOption) {
        try {
            let users = '';
            let user = Methods.capitalizeFirstLetter(userObject);
            if (isOption === false){
                users += `<a class="user" href="/user/${user.toLowerCase()}">${user}</a>`;
            } else{
                users += `<option value="${user.toLowerCase()}">${user}</option>`;
            }
            return users;            
        } catch (error) {
            ResponseManager.sendError('userManager.generateAvailableUsersHTML(), Generating user HTML', error);
        }
    }

    /**
     * Method responsible of getting available users and stores the users in an array.
     * 
     * @param {Object} userObject - Object containing tide information.
     * @returns {string[]} - Array of available tides.
     */
    static getAvailableUsers(userObject) {
        let usersArray = [];
        for (let i = 0; i < userObject.length; i++) {
            try {
                let entry = userObject[i].username;
                usersArray.push(entry);
            } catch (error) {
                ResponseManager.sendError('userManager.getAvailableUsers(), Getting available users', error);
            }
        }
        return usersArray;
    }

    /**
     * Method responsible of finding a user's join date and then format the date.
     * 
     * @static
     * @async
     * @param {Db} db - MongoDB database object.
     * @param {string[]} pathSegments - Array representing the segments of the URL.
     * @returns 
     */
    static async generateJoinDate(db, pathSegments) {
        try{
            let user = await db.collection('accounts').find({ "username": pathSegments[1] }).toArray();
            let joinDate = Methods.formatDate(user, false);
            return joinDate[0];
        } catch(error){
            ResponseManager.sendError('userManager.generateJoinDate(), Finding user MongoDB', error);
        }
    }

    /**
     * Method responsible of comparing web page's endpoint with viable users.
     * 
     * @static
     * @async
     * @param {Object} result - Object containing tides information.
     * @param {string[]} pathSegments - Array representing the segments of the URL.
     * @returns 
     */
    static async usersEndPointComparison(result, pathSegments) {
        let usersArray = this.getAvailableUsers(result);
        let lowerCasedArray = [];

        for (let i = 0; i < usersArray.length; i++) {
            let object = usersArray[i];
            lowerCasedArray.push(object.toLowerCase());
        }

        if (pathSegments[0] === 'user') {
            for (let i = 0; i < lowerCasedArray.length; i++) {
                if (pathSegments[1].includes(lowerCasedArray[i])) {
                    return true;
                }
            }
            return false; // If none of the elements were found.
        } else {
            return false;
        }

    }

}
export default UserManager;