import Methods from './methods.js';
import ResponseManager from './responseManager.js';

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
     * Returns the generated splashes as string.
     * 
     * @static
     * @param {Array} objResult - Splash objects from MongoDB.
     * @returns {string} - HTML string for generated splashes.
     */
    static generateSplashes(objResult) {
        try{
            // Orders the objects for biggest splashId to lower splashId.
            let latestSplash = objResult.sort((last, first) => first.splashId - last.splashId);
            let result = latestSplash;
            let splashes = '';
            for (let i = 0; i < result.length; i++) {
                let splash = result[i];
                try {
                    let linkedContent = this.checkForLinkedContent(splash.splashContent);
                    let content = `<p class="content">${linkedContent}</p>`;
                    splash =
                        `
                        <article class="post">
                            <h3>
                                <a class="author" href="/user/${splash.author}">@${splash.author}</a>
                                <div class="subject-container">${this.generatePostSubject(splash.splashSubject)}<span>Tide</span></div>
                            </h3>
                            <a class="id-display" href="/post?id=${splash.splashId}">SplashID-${splash.splashId}</a>
                            <span class="date">Made a splash: ${this.formatDate(splash)}</span>
                            ${content}
                            ${this.generateMedia(splash)}
                        </article>
                    `;
                    splashes += splash;
                } catch (error) {
                    ResponseManager.sendError('Generating splash HTML', error);
                }
            }
            return splashes;

        } catch (error){
            ResponseManager.sendError('Generating Splashes', error);
        }
    }

    /**
    * Method responsible of formating the date from a MongoDB object into
    * a standardized string format.
    *
    * @static
    * @param {Object} splash - MongoDB object containing splash information.
    * @returns {string} - Formatted date string in the "YYYY-MM-DD HH:mm:ss" format.
    */
    static formatDate(splash) {
        let addZero = (time) => (time < 10 ? `0${time}` : time);

        let { year, month, day, hour, minute, second } = splash.splashDate;

        // YYYY-MM-DD: HH:MM:SS
        let format = `${year}-${addZero(month)}-${addZero(day)}:` +
            `${addZero(hour)}:${addZero(minute)}:${addZero(second)}`;

        return format;
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
        let watchPattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        let shortPattern = /https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/;
        let embedPattern = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)([a-zA-Z0-9_-]{11})/;

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
                            Image is not supported by your browser>
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
                    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?start=0&autoplay=1&autohide=1`;
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