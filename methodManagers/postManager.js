import ResponseManager from './responseManager.js';
import TidesManager from './tidesManager.js';
import UserManager from './userManager.js';
import Methods from './methods.js';

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
    static async generateSplashes(objResult, db, pathSegments) {
        try {
            let splashes = '';
            let splashHTML;

            let tidesComparison = await db.collection('tides').find().toArray();
            let usersComparison = await db.collection('accounts').find().toArray();
            let isFilteringTidesContent = await TidesManager.tidesEndPointComparison(TidesManager.getAvailableTides(tidesComparison), pathSegments);
            let isFilteringUsersContent = await UserManager.usersEndPointComparison(usersComparison, pathSegments);

            // Sorting.
            let latestSplash = objResult.sort((last, first) => first.splashId - last.splashId);
            let result = latestSplash;
            result = this.splashFiltering(result, pathSegments, isFilteringTidesContent, isFilteringUsersContent);

            // Splash generation.
            for (let i = 0; i < result.length; i++) {
                let splash = result[i];
                try {
                    splashHTML = this.getSplashHTML(splash);
                    splashes += splashHTML;
                } catch (error) {
                    ResponseManager.sendError('Generating splash HTML', error);
                }
            }
            return splashes;
        } catch (error) {
            ResponseManager.sendError('Generating Splashes', error);
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
    static splashFiltering(result, pathSegments, isFilteringTidesContent, isFilteringUsersContent){
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
                result = result.filter(splash => {
                    if (splash.author.toLowerCase() === pathSegments[1]){
                        return true;
                    } else{
                        return false;
                    }
                });
            }
            return result;
        } catch(error){
            ResponseManager.sendError('Filtering', error);
        }
    }

    /**
     * Method responsible of getting splash HTML.
     * 
     * @static
     * @param {Object} splash - The splash object containing information about the splash.
     * @returns {string} - HTML string for generated splashe.
     */
    static getSplashHTML(splash) {
        try {
            let linkedContent = this.checkForLinkedContent(splash.splashContent);
            let content = `<p class="content">${linkedContent}</p>`;
            return `
                <article class="post">
                    <h3>
                        <a class="author" href="/user/${splash.author.toLowerCase()}">@${Methods.capitalizeFirstLetter(splash.author)}</a>
                        <div class="subject-container">${this.generatePostSubject(splash.splashSubject)}<span>Tide</span></div>
                    </h3>
                    <a class="id-display" href="/splash?post=${splash.splashId}">SplashID-${splash.splashId}</a>
                    <span class="date">Made a splash: ${Methods.formatDate(splash)}</span>
                    ${content}
                    ${this.generateMedia(splash)}
                </article>
            `;
        } catch (error) {
            ResponseManager.sendError('Generating splash HTML', error);
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
            ResponseManager.sendError('Generating media HTML', error);
            return '';
        }
    }

    /**
     * Method responsible for generating subject links for posts.
     * 
     * @static
     * @param {Object} subjectObject - Object containing subject information.
     * @returns {string} - HTML structure: subject links.
     */
    static generatePostSubject(subjectObject) {
        let subjects = '';
        for (let key in subjectObject) {
            if (subjectObject.hasOwnProperty(key)) {
                let subject = subjectObject[key];
                subject = `
                    <a class="subject" href="/tides/${subject.toLowerCase()}">${subject}</a>
                `;

                subjects += subject;
            }
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
            ResponseManager.sendError('Embedding media source', error);
            return '';
        }
    }

}
export default PostManager;