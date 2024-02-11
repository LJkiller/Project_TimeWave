
import ResponseManager from './responseManager.js';
import TidesManager from './tidesManager.js';
import UserManager from './userManager.js';
import Methods from './methods.js';
import { Db } from 'mongodb';

/**
 * Class responsible of managing post generation by communicating
 * from a MongoDB database.
 * Functions:
 * Generate HTML structure,
 * Format date for HTML structure,
 * Check what kind of media,
 * Extract the video's id,
 * Generate Image or video if it exists,
 * Generate the embed path if it is a video.
 *
 * @class PostManager
 */
class PostManager {

    /**
     * Method responsible of generating posts from MongoDB in an HTML format.
     * Filters the content if necessary (pathSegments).
     * Returns the generated splashes as string.
     * 
     * @static
     * @async
     * @param {Array} objResult - Splash objects from MongoDB.
     * @param {Db} db - MongoDB database object.
     * @param {string[]} pathSegments - Array representing the segments of the URL.
     * @returns {string} - HTML string for generated splashes.
     */
    static async generateSplashes(objResult, db, pathSegments, url, singular = false) {
        try {
            let splashes = '';
            let splashHTML;

            let tidesComparison = await db.collection('tides').find().toArray();
            let usersComparison = await db.collection('accounts').find().toArray();
            let isFilteringTidesContent = await TidesManager.tidesEndPointComparison(TidesManager.getAvailableTides(tidesComparison), pathSegments);
            let isFilteringUsersContent = await UserManager.usersEndPointComparison(usersComparison, pathSegments);

            let generatedPost = 0;
            if (singular === true) {
                splashHTML = this.getSplashHTML(objResult, true);
                generatedPost++;
                splashes += splashHTML;
            } else {
                // Sorting.
                let latestSplash = objResult.sort((last, first) => first.splashId - last.splashId);
                let result = latestSplash;
                result = this.splashFiltering(result, pathSegments, isFilteringTidesContent, isFilteringUsersContent);

                // Splash generation.
                for (let i = 0; i < result.length; i++) {
                    let splash = result[i];
                    try {
                        splashHTML = this.getSplashHTML(splash, singular);
                        generatedPost++;
                        splashes += splashHTML;
                    } catch (error) {
                        ResponseManager.sendError('postManager.generateSplashes(), Generating splash HTML', error);
                    }
                }
            }
            console.log('Posts generated:', generatedPost);
            return splashes;
        } catch (error) {
            ResponseManager.sendError('postManager.generateSplashes(), Generating splashes', error);
        }
    }

    /**
     * Method responsible of sorting splashes depending on different criterias.
     * 
     * @static
     * @param {Array} result - Splash objects from MongoDB.
     * @param {string[]} pathSegments - Array representing the segments of the URL.
     * @param {boolean} isFilteringTidesContent - Criteria bool for tides for further logic.
     * @param {boolean} isFilteringUsersContent - Criteria bool for users for further logic.
     * @returns {Array} - Sorted splashes.
     */
    static splashFiltering(result, pathSegments, isFilteringTidesContent, isFilteringUsersContent) {
        try {
            // Returning true: if object's subjects || object's author is pathSegments[1].
            // Returning false: if it does not match.
            // Tide specific filtering.
            if (pathSegments[0] === 'tides' && isFilteringTidesContent) {
                result = result.filter(splash => {
                    for (let key in splash.splashSubject) {
                        if (splash.splashSubject[key].toLowerCase() === pathSegments[1]) {
                            return true;
                        }
                    }
                    return false;
                });
            }
            // User specific filtering.
            else if (pathSegments[0] === 'user' && isFilteringUsersContent) {
                if (pathSegments[1] === 'N/A'){
                    return true;
                }
                result = result.filter(splash => {
                    if (splash.author.toLowerCase() === pathSegments[1]) {
                        return true;
                    } else {
                        return false;
                    }
                });
            }
            return result;
        } catch (error) {
            ResponseManager.sendError('postManager.splashFiltering(), Filtering', error);
        }
    }

    /**
     * Method responsible of getting splash HTML.
     * 
     * @static
     * @param {Object} splash - The splash object containing information about the splash.
     * @returns {string} - HTML string for generated splashe.
     */
    static getSplashHTML(splash, singular = false) {
        try {
            let author = `<a class="author" href="/user/${splash.author.toLowerCase()}">@${Methods.capitalizeFirstLetter(splash.author)}</a>`;
            let subjects = `<div class="subject-container">${this.generatePostSubject(splash.splashSubject)}<span>Tide</span></div>`;
            let date = `<span class="date">Made a splash: ${Methods.formatDate(splash)}</span>`;
            let content = `<p class="content">${this.checkForLinkedContent(splash.splashContent)}</p>`;
            let ifSingular = singular ? 'singular' : '';

            let splashId = !singular ? `<a class="id-display" href="/splash?post=${splash.splashId}">SplashID-${splash.splashId}</a>` : '';
            let post = `
                <article class="post ${ifSingular}">
                    <h3>
                        ${author}
                        ${subjects}
                    </h3>
                    ${splashId}
                    ${date}
                    ${content}
                    ${this.generateMedia(splash)}
                </article>
            `;
            return post;
        } catch (error) {
            ResponseManager.sendError('postManager.getSplashHTML(), Generating splash HTML', error);
            return '';
        }
    }

    /**
     * Method responsible of checking media type and return type,
     * dependent of information.
     * 
     * @static
     * @param {Object} splash - MongoDB object containing splash information.
     * @returns {Object} - Information object containing type or with source.
     */
    static checkMediaType(splash) {
        if (splash.media.image) {
            return { type: 'image' };
        } else if (splash.media.video) {
            let information = {
                type: 'video',
                source: splash.media.videoSource
            };
            return information;
        }
    }

    /**
     * Method responsible for checking splash content for links and
     * act accordingly.
     * 
     * @static
     * @param {string} content - String of the MongoDB object splash.splashContent.
     * @returns {string} - Updated content with encapsulated links.
     */
    static checkForLinkedContent(content) {
        let urlPattern = /(https?:\/\/[^\s]+)/g;

        let contentLink = content.replace(urlPattern, (url) => {
            return `<a href="${url}" target="_blank">${url}</a>`;
        });
        return contentLink;
    }

    /**
     * Method responsible of extracting video id from provided sources from MongoDB.
     * Supports URL formats of:
     * Youtube.
     *
     * @static
     * @param {Object} splash - MongoDB object containing splash information.
     * @returns {string} - Extracted video ID.
     */
    static videoIdExtractor(splash) {
        let path = splash.media.source;
        let watchPattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v(?:ideos)?|embed)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        let shortPattern = /https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/
        let embedPattern = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v(?:ideos)?|embed)\/|\S*?[?&]v=)([a-zA-Z0-9_-]{11})/

        let watchMatch = path.match(watchPattern);
        let shortMatch = path.match(shortPattern);
        let embedMatch = path.match(embedPattern);

        let videoId = watchMatch ? watchMatch[1] : (shortMatch ? shortMatch[1] : embedMatch ? embedMatch[1] : null);

        return videoId;
    }

    /**
     * Method responsible of creating media container based of 
     * MongoDB information.
     * 
     * @static
     * @param {Object} splash - MongoDB object containing splash information.
     * @returns {string} - HTML structure: media container, or empty string for error.
     */
    static generateMedia(splash) {
        if (splash.media.content !== true) {
            return '';
        }

        try {
            let mediaType = this.checkMediaType(splash);
            if (mediaType.type === 'image') {
                return `
                    <div class="media-container">
                        <img src="${splash.media.source}"
                            alt="${splash.author}'s media for splash: ${splash.splashId}"
                            Image is not supported by your browser
                        >
                    </div>`
                    ;
            } else if (mediaType.type === 'video') {
                return `
                    <div class="media-container">
                        <iframe class="mediaPlayer"
                            src="${this.embedPath(mediaType, splash)}"
                            title="Media Viewer" allowfullscreen frameborder="0"
                            allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture; web-share">
                        </iframe>
                    </div>`
                    ;
            }
        } catch (error) {
            ResponseManager.sendError('postManager.generateMedia(), Generating media HTML', error);
            return '';
        }
    }

    /**
     * Method responsible for generating subject links for posts.
     * 
     * @static
     * @param {Array} subjectArray - Array containing subject information.
     * @returns {string} - HTML structure: subject links.
     */
    static generatePostSubject(subjectArray) {
        let subjects = '';
        for (let i = 0; i < subjectArray.length; i++){
            subjects += `<a class="subject" href="/tides/${subjectArray[i].toLowerCase()}">${Methods.capitalizeFirstLetter(subjectArray[i])}</a>` 
        }
        return subjects;
    }

    /**
     * Method responsible of creating embed path for media, videos.
     * Supports embedding videos of:
     * Youtube.
     *
     * @static
     * @param {Object} mediaType - Information about media type, source.
     * @param {Object} splash - MongoDB object containing splash information.
     * @returns {string} - Embed path for specified media, or empty string for error.
     */
    static embedPath(mediaType, splash) {
        let videoId;
        try {
            videoId = this.videoIdExtractor(splash);
            switch (mediaType.source) {
                case 'youtube':
                    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?start=0&autoplay=0&autohide=1`;
                default: // Default to avoid problems.
                    return '';
            }
        } catch (error) {
            ResponseManager.sendError('postManager.embedPath(), Embedding media source', error);
            return '';
        }
    }
    
    /**
     * Method responsible of getting the latest splash's id.
     * 
     * @static
     * @async
     * @param {Db} db - MongoDB database object.
     * @returns {number} - Number of the latest splash.
     */
    static async getLatestSplash(db) {
        try {
            let latestSplash = await db.collection('splashes').find().sort({ splashId: -1 }).limit(1).toArray();
            if (latestSplash.length > 0) {
                return latestSplash;
            } else {
                return null; // Or any appropriate default value if there are no splashes
            }
        } catch (error) {
            PostManager.sendError('postManager.getLatestSplash(), Getting latest splash', error);
        }
    }

    /**
     * Method responsible of posting new splash to MongoDB from analyzing url params.
     * 
     * @static
     * @async
     * @param {Db} db - MongoDB database object.
     * @param {http.IncomingMessage} request - HTTP request.
     * @param {http.ServerResponse} response - HTTP response.
     * @returns Noting.
     */
    static async makeASplash(db, request, response) {
        try {
            let data = await Methods.getBody(request);
            let params = new URLSearchParams(data);

            let tidesResult = await db.collection('tides').find().toArray();
            let tidesArray = await TidesManager.getAvailableTides(tidesResult);
            
            let splashSubjects = [];
            for (let [keyParam, value] of params) {
                if (tidesArray.includes(keyParam)){
                    splashSubjects.push(keyParam);
                }
            }
    
            let post = {
                author: params.get('author'),
                splashDate: Methods.getCurrentUTCDate(),
                splashContent: params.get('content'),
                splashSubject: splashSubjects,
                splashId: (await this.getActualSplashId(db, parseInt(params.get('post')))),
                media: {
                    content: false,
                    image: false,
                    video: false,
                    source: "none",
                    videoSourc: "none"
                }
            }

            try {
                await db.collection('splashes').insertOne(post);
            } catch (error) {
                ResponseManager.sendError('postManager.makeASplash(), Posting splash', error);
            }
            // User redirection to created splash.
            response.writeHead(302, { 'Location': `/splash?post=${post.splashId}` });
            response.end();
            return;
        } catch (error) {
            ResponseManager.sendWebPageResponse(response);
            ResponseManager.sendError('postManager.makeASplash(), Making splash', error);
        }
    }

    /**
     * Method responsible of actually getting latest id to avoid multiple of same id.
     * Working recursively.
     * 
     * @param {Db} db - MongoDB database object. 
     * @param {Number} splashId - Splash id, to be handled and set a proper value.
     * @returns {Number} - The actual available id.
     */
    static async getActualSplashId(db, splashId) {
        if (await db.collection('splashes').findOne({ "splashId": splashId })) {
            return this.getActualSplashId(db, splashId + 1);
        } else {
            return splashId;
        }
    }
    
}
export default PostManager;