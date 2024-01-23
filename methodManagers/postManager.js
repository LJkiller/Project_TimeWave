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
     * Returns the generated splashes as string.
     * 
     * @param {Array} objResult - Splash objects from MongoDB.
     * @returns {string} - HTML string for generated splashes.
     */
    static generateSplashes(objResult) {
        let splashes = '';
        for (let i = 0; i < objResult.length; i++) {
            let splash = objResult[i];
            try{
                let linkedContent = PostManager.checkForLinkedContent(splash.splashContent);
                let content = `<p class="content">${linkedContent}</p>`;
                splash =
                    `
                    <div class="post">
                        <h3>
                            <a class="author" href="/user/${splash.author}">@${splash.author}</a>
                            <div class="subject-container">Tide: ${PostManager.generatePostSubject(splash.splashSubject)}</div>
                        </h3>
                        <a class="id-display" href="/post?id=${splash.splashId}">SplashID-${splash.splashId}</a>
                        <span class="date">Made a splash: ${PostManager.formatDate(splash)}</span>
                        ${content}
                        ${PostManager.generateMedia(splash)}
                    </div>
                `;
                splashes += splash;
            } catch (error){
                console.error(`Error generating splash HTML: ${error.message}`);
            }
        }
        return splashes;
    }

    /**
    * Method responsible of formating the date from a MongoDB object into
    * a standardized string format.
    *
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
     * @param {Object} splash - MongoDB object containing splash information.
     * @returns {Object} - Information object containing type or with source.
     */
    static checkMediaType(splash) {
        if (splash.media.image) {
            return {type: 'image'};
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
     * @param {string} content - String of the MongoDB object splash.splashContent.
     * @returns {string} - Updated content with encapsulated links.
     */
    static checkForLinkedContent(content){
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
     * @param {Object} splash - MongoDB object containing splash information.
     * @returns {string} - HTML structure: media container, or empty string for error.
     */
    static generateMedia(splash) {
        if (splash.media.content !== true) {
            return '';
        }

        try{
            let mediaType = PostManager.checkMediaType(splash);
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
                            src="${PostManager.embedPath(mediaType, splash)}"
                            title="Media Viewer" allowfullscreen frameborder="0"
                            allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture; web-share">
                        </iframe>
                    </div>`
                ;
            }
        } catch(error){
            console.error(`Error generating media HTML: ${error.message}`);
            return '';
        }
    }

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
     * @param {Object} mediaType - Information about media type, source.
     * @param {Object} splash - MongoDB object containing splash information.
     * @returns {string} - Embed path for specified media, or empty string for error.
     */
    static embedPath(mediaType, splash) {
        let videoId;
        try{
            videoId = PostManager.videoIdExtractor(splash);
            switch (mediaType.source) {
                case 'youtube':
                    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?start=0&autoplay=1&autohide=1`;
                default: // Default to avoid problems.
                    return '';
            }
        } catch(error){
            console.error(`Error embeding media source: ${error.message}`);
            return '';
        }
    }

}
export default PostManager;