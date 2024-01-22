
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
            splash =
                `
            <a class="post" href="/post?id=${splash.splashId}">
                <h3 class="author">@${splash.author}</h3>
                <span class="date">Made a splash: ${PostManager.formatDate(splash)}</span>
                <p class="content">Content: ${splash.splashContent}</p>
                ${PostManager.generateMedia(splash)}
            </a>
        `;
            splashes += splash;
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
     * @returns {string} - HTML structure for media container.
     */
    static generateMedia(splash) {
        if (splash.media.content !== true) {
            return '';
        }

        let mediaType = PostManager.checkMediaType(splash);
        if (mediaType.type === 'image') {
            return `
                <div class="media-container">
                    <img src="${splash.media.source}"
                        alt="${splash.author}'s media for splash: ${splash.splashId}">
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
    }

    /**
     * Method responsible of creating embed path for media, videos.
     * Supports embedding videos of:
     * Youtube.
     *
     * @param {Object} mediaType - Information about media type, source.
     * @param {Object} splash - MongoDB object containing splash information.
     * @returns {string} - Embed path for specified media.
     */
    static embedPath(mediaType, splash) {
        let videoId;
        switch (mediaType.source) {
            case '': // Further website embeds will be supported.
                return '';
            default:
                videoId = PostManager.videoIdExtractor(splash);
                return `https://www.youtube-nocookie.com/embed/${videoId}?start=0&autoplay=1&autohide=1`;
        }
    }

}
export default PostManager;