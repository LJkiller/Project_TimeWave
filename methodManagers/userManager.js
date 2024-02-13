
import Methods from './methods.js';
import ResponseManager from './responseManager.js';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import cookie from 'cookie';


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

    // #region Generation

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
            if (isOption === false) {
                users += `<a class="user" href="/user/${user.toLowerCase()}">${Methods.XSSProtectionHandler(user)}</a>`;
            } else {
                users += `<option value="${user.toLowerCase()}">${Methods.XSSProtectionHandler(user)}</option>`;
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
        try {
            let user = await db.collection('accounts').find({ "username": pathSegments[1] }).toArray();
            let joinDate = Methods.formatDate(user, false);
            return joinDate[0];
        } catch (error) {
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

    // #endregion

    // #region User handling

    /**
     * Method responsible of creating or logging users in comparing MongoDB with params.
     * 
     * @static
     * @async
     * @param {Db} db - MongoDB database object.
     * @param {string} INUP - In or up, that is cum question.
     * @param {http.IncomingMessage} request - HTTP request.
     * @param {http.ServerResponse} response - HTTP response.
     */
    static async signINUP(db, INUP, request, response) {
        try {
            let data = await Methods.getBody(request);
            let params = new URLSearchParams(data);
            let accountConnection = await db.collection('accounts');
            let userObject = await this.getUserObject(params);
            let username = userObject.username;

            // Also horse shit.
            // let account = await accountConnection.find().toArray();
            // let accountArray = [];
            // for (let i = 0; i < account.length; i++) {
            //     accountArray.push(account[i].username);
            // }
            // if (Methods.analyzeForRedirection(response, username, 'sign-up', accountArray)){
            //     return;
            // }

            let spaces = username.split(' ');
            if (spaces.length > 1){
                Methods.pageRedirection(response, 'sign-up', 'error', 'username_400');
                return;
            }
            // Remember if you change MAX_USERNAME_CHARS, you need to correct alert.js.
            if (username.length > parseInt(process.env.MAX_USERNAME_CHARS)){
                Methods.pageRedirection(response, 'sign-up', 'error', 'username_413');
                return;
            }
            if (Methods.analyzeInputForDanger(username)){
                Methods.pageRedirection(response, 'sign-up', 'error', 'username_403');
                return;
            }

            try {
                let existingUser = await accountConnection.findOne({ "username": username });
                switch (INUP){
                    case 'sign-in':
                        await this.handleSignInOutcome(existingUser, userObject, accountConnection, params, response);
                        break;
                    default: 
                        await this.handleSignUpOutcome(existingUser, userObject, accountConnection, response);
                        break;
                }
            } catch (error) {
                ResponseManager.sendWebPageResponse(response);
                ResponseManager.sendError('userManager.signINUP(), MongoDB connection', error);
            }
            return;
        } catch (error) {
            ResponseManager.sendWebPageResponse(response);
            ResponseManager.sendError('postManager.signINUP(), Object', error);
        }
    }

    /**
     * Method responsible of constructing userObject.
     * 
     * @static
     * @async
     * @param {URLSearchParams} params - Parameter to construct user object.
     * @returns {Object} - Constructed user object.
     */
    static async getUserObject(params){
        try {
            let userObject = {};
            let username = params.get('username');
            let password = params.get('password');

            let snortingRounds = parseInt(process.env.HASHING_ROUNDS);
            let hashedPassword = await bcrypt.hash(password, snortingRounds);
            let userJoinDate = Methods.getCurrentUTCDate();
            let uuid = crypto.randomUUID();

            userObject = {
                "username": username,
                "password": hashedPassword,
                joinDate : userJoinDate,
                "userUuid": uuid
            };
            return userObject;
        } catch (error) {
            ResponseManager.sendError('userManager.getUserObject(), Constructing user object', error);
        }
    }

    /**
     * Method responsible of handling sign in outcome.
     * 
     * @param {Object} existingUser - Found MongoDB user object.
     * @param {Object} userObject - User object to compare with existing one.
     * @param {mongodb.Collection} accountConnection - The MongoDB connection to account collection.
     * @param {URLSearchParams} params - Parameter to construct user object.
     * @param {http.ServerResponse} response - HTTP response.
     */
    static async handleSignInOutcome(existingUser, userObject, accountConnection, params, response){
        try{
            if (!existingUser){
                await Methods.pageRedirection(response, 'sign-in', 'error', 'username_404');
            } else {
                let passwordMatching = await bcrypt.compare((params.get('password')), existingUser.password);
                if (passwordMatching){
                    let newHash = userObject.password;
                    let newUuid = userObject.userUuid;
                    let existingJoinDate = existingUser.joinDate;
                    let username = existingUser.username;
                    try {
                        await accountConnection.updateOne(
                            { "username": username},
                            {
                                $set: {
                                    "username": username,
                                    "password": newHash,
                                    joinDate: existingJoinDate,
                                    "userUuid": newUuid
                                }
                            }
                        );
                        await Methods.pageRedirection(response, 'login');
                    } catch (error) {
                        // This should not be publicaly declared to users, because of safety concern.
                        ResponseManager.sendError('userManager.handleSignInOutcome(), Updating information', error);
                        await Methods.pageRedirection(response, 'sign-in', 'error', 'password_500');
                    }
                } else {
                    await Methods.pageRedirection(response, 'sign-in', 'error', 'password_404');
                }
            }
        } catch (error){
            ResponseManager.sendWebPageResponse(response);
            ResponseManager.sendError('userManager.handleSignInOutcome(), MongoDB connection', error);
        }
    }

    /**
     * Method responsible of handling sign up outcome.
     * 
     * @param {Object} existingUser - Found MongoDB user object.
     * @param {Object} userObject - User object to compare with existing one.
     * @param {mongodb.Collection} accountConnection - The MongoDB connection to account collection.
     * @param {http.ServerResponse} response - HTTP response.
     */
    static async handleSignUpOutcome(existingUser, userObject, accountConnection, response){
        try{
            if (!existingUser){
                await accountConnection.insertOne(userObject);
                await Methods.pageRedirection(response, 'sign-in');
            } else {
                await Methods.pageRedirection(response, 'sign-up', 'error', 'username_409');
            }
        } catch (error){
            ResponseManager.sendWebPageResponse(response);
            ResponseManager.sendError('userManager.handleSignUpOutcome(), MongoDB connection', error);
        }
    }

    // #endregion

}
export default UserManager;