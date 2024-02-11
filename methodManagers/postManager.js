
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

    // #region Splash Generation

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
            console.log('Posts generated:', generatedPost, '| Total posts:', objResult.length || 1);
            return splashes;
        } catch (error) {
            ResponseManager.sendError('postManager.generateSplashes(), Generating splashes', error);
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
            let subjects = `<div class="subject-container">${this.generatePostSubjectHTML(splash.splashSubject)}<span>Tide</span></div>`;
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
                    ${this.generateMediaHTML(splash)}
                </article>
            `;
            return post;
        } catch (error) {
            ResponseManager.sendError('postManager.getSplashHTML(), Generating splash HTML', error);
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
    static generatePostSubjectHTML(subjectArray) {
        let subjects = '';
        for (let i = 0; i < subjectArray.length; i++) {
            subjects += `<a class="subject" href="/tides/${subjectArray[i].toLowerCase()}">${Methods.capitalizeFirstLetter(subjectArray[i])}</a>`
        }
        return subjects;
    }

    /**
     * Method responsible of creating media container based of 
     * MongoDB information.
     * 
     * @static
     * @param {Object} splash - MongoDB object containing splash information.
     * @returns {string} - HTML structure: media container, or empty string for error.
     */
    static generateMediaHTML(splash) {
        if (splash.media.content !== true) {
            return '';
        }
        try {
            let media = splash.media;
            let mediaInfo = this.mediaInfoExtractor(media);
            if (media.mime === 'image') {
                return `
                    <div class="media-container">
                        <img src="${this.embedPath(media)}" class="${mediaInfo.page}"
                            alt="${splash.author}'s media for splash: ${splash.splashId}"
                            Image is not supported by your browser
                        >
                    </div>`
                    ;
            } else if (media.mime === 'video') {
                return `
                    <div class="media-container"> 
                        <iframe class="mediaPlayer ${mediaInfo.page}"
                            src="${this.embedPath(media)}"
                            title="Media Viewer" allowfullscreen frameborder="0"
                            allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture; web-share">
                        </iframe>
                    </div>`
                    ;
            }
        } catch (error) {
            ResponseManager.sendError('postManager.generateMediaHTML(), Generating media HTML', error);
            return '';
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
     * Method responsible of creating embed path for media, videos.
     * Supports embedding videos of:
     * Youtube.
     *
     * @static
     * @param {Object} media - Information about media object.
     * @returns {string} - Embed path for specified media, or empty string for error.
     */
    static embedPath(media) {
        try {
            let mediaInfo = this.mediaInfoExtractor(media);
            if (media.mime === 'video') {
                switch (media.page) {
                    case 'youtube':
                        return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(mediaInfo.id)}?start=0&autoplay=0&autohide=1`;
                    case 'instagram':
                        return `https://www.instagram.com/p/${mediaInfo.id}/embed/`;
                    case 'twitter':
                        return `https://twitter.com/i/status/${mediaInfo.id}`;
                    case 'facebook':
                        return `https://www.facebook.com/video/embed?video_id=${mediaInfo.id}`;
                    case 'tiktok':
                        return `https://www.tiktok.com/embed/v2/${mediaInfo.id}?muted=1`;
                    default: // Default to avoid problems.
                        return '';
                }
            } else if (media.mime === 'image') {
                switch (media.page) {
                    case 'reddit':
                        return `https://i.redd.it/${mediaInfo.id}.${mediaInfo.format}`;
                    case 'imgflip':
                        return `https://i.imgflip.com/${mediaInfo.id}.${mediaInfo.format}`;
                    case 'instagram':
                        return `https://www.instagram.com/p/${mediaInfo.id}/embed/`;
                    case 'twitter':
                        return `https://twitter.com/i/status/${mediaInfo.id}`;
                    default: // Default to avoid problems.
                        return '';
                }
            } else {
                return '';
            }
        } catch (error) {
            ResponseManager.sendError('postManager.embedPath(), Embedding media source', error);
            return '';
        }
    }

    /**
     * Method responsible of extracting video id from provided sources from MongoDB.
     * Supports URL formats of:
     * Youtube.
     *
     * @static
     * @param {Object} media - Media object containing media information.
     * @returns {string} - Extracted video ID.
     */
    static mediaInfoExtractor(media) {
        try {
            let source;
            if (typeof media === 'object') { 
                source = media.source;
            } else if (typeof media === 'string') {
                source = media;
            }
            
            let mediaInfo = { id: 0, format: '', page: '' };
    
            let patternsForInfo = [
                {
                    page: 'youtube',
                    regex: [
                        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v(?:ideos)?|embed)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
                        /https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/,
                        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v(?:ideos)?|embed)\/|\S*?[?&]v=)([a-zA-Z0-9_-]{11})/
                    ]
                },
                {
                    page: 'reddit',
                    regex: [
                        /(?:https?:\/\/(?:www\.)?reddit\.com\/(?:media\?url=)?|https?:\/\/(?:preview\.)?redd\.it\/)([^\/?&]+)\.([a-zA-Z0-9]+)/,
                        /https:\/\/i\.redd\.it\/(\w+)\.([a-zA-Z0-9]+)/
                    ]
                },
                {
                    page: 'imgflip',
                    regex: [
                        /https:\/\/i\.imgflip\.com\/(\w+)\.([a-zA-Z0-9]+)/
                    ]
                },
                {
                    page: 'instagram',
                    regex: [
                        /https?:\/\/(?:www\.)?instagram\.com\/p\/([^\/?#&]+)/,
                        /https?:\/\/(?:www\.)?instagr\.am\/p\/([^\/?#&]+)/
                    ]
                },
                {
                    page: 'twitter',
                    regex: [
                        /https?:\/\/(?:www\.)?twitter\.com\/[^\/]+\/status\/([0-9]+)/
                    ]
                },
                {
                    page: 'facebook',
                    regex: [
                        /https?:\/\/(?:www\.)?facebook\.com\/[^\/]+\/videos\/([0-9]+)/
                    ]
                },
                {
                    page: 'tiktok',
                    regex: [
                        /https?:\/\/(?:www\.)?tiktok\.com\/@[\w.]+\/video\/(\d+)/
                    ]
                }
            ];
            
            for (let i = 0; i < patternsForInfo.length; i++) {
                for (let j = 0; j < patternsForInfo[i].regex.length; j++) {
                    if (source === null) {
                        return mediaInfo;
                    } else {
                        let match = source.match(patternsForInfo[i].regex[j]);
                        if (match && match[1]) {
                            mediaInfo.id = match[1];
                            mediaInfo.format = match[2];
                            mediaInfo.page = patternsForInfo[i].page;
                            return mediaInfo;
                        }
                    }
                }
            }
        } catch (error) {
            ResponseManager.sendError('postManager.mediaInfoExtractor, Analyzing media', error);
            return 0;
        }
    }
    
    // #endregion
    
    // #region Posting

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
            let post = await this.getPostObject(db, params);

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
     * Method responsible of getting post object to be posted into MongoDB.
     * 
     * @static
     * @async
     * @param {Db} db - MongoDB database object.
     * @param {*} params - Parameters to construct the object.
     * @returns {Object} - Post object.
     */
    static async getPostObject(db, params) {
        try {
            let tidesResult = await db.collection('tides').find().toArray();
            let tidesArray = await TidesManager.getAvailableTides(tidesResult);
    
            let splashSubjects = [];
            for (let [keyParam, value] of params) {
                if (tidesArray.includes(keyParam)) {
                    splashSubjects.push(keyParam);
                }
            }
            let mediaResult = await this.mediaAnalyzer(params);
    
            let post = {
                author: params.get('author'),
                splashDate: Methods.getCurrentUTCDate(),
                splashContent: params.get('content'),
                splashSubject: splashSubjects,
                splashId: (await this.getActualSplashId(db, parseInt(params.get('post')))),
                media: mediaResult
            }
            return post;
        } catch (error) {
            ResponseManager.sendError('postManager.getPostObject(), Constructing post object', error);
        }
    }

    /**
     * Method responsible of constructing media object to be saved in a MongoDB object.
     * 
     * @static
     * @async
     * @param {*} params - Parameters to construct the object.
     * @returns {Object} - Media object.
     */
    static async mediaAnalyzer(params) {
        try {
            let media = {
                content: 'none',
                mime: 'none',
                fileSource: null,
                source: null,
                page: 'none'
            }
            let mediaExists = {};

            for (let [keyParam, value] of params) {
                let content = false;
    
                if (keyParam.includes('media-file') && value !== '') {
                    let mediaFileMime = await this.mimeMediaAnalyzer(value);
                    content = true;
                    mediaExists = {
                        content: content,
                        mime: `${mediaFileMime}`,
                        fileSource: value,
                        source: null,
                        page: 'none'
                    }                
                } else if (keyParam.includes('media-link') && value !== '') {
                    let mediaLinkMime = await this.mimeMediaAnalyzer(value);
                    let mediaInfo = this.mediaInfoExtractor(value);
                    content = true;
                    mediaExists = {
                        content: content,
                        mime: `${mediaLinkMime}`,
                        fileSource: null,
                        source: value,
                        page: `${mediaInfo.page}`
                    }
                }
            }
            media = { ...media, ...mediaExists };
            return media;
        } catch (error) {
            ResponseManager.sendError('postManager.mediaAnalyzer(), Constructing media', error);
        }
    }

    /**
     * Method responsible of analyzing the file's or link mime-type.
     * 
     * @static
     * @async
     * @param {string} input - Input value from params to be analyzed.
     * @returns {string} - Wheter it's an image or video.
     */
    static async mimeMediaAnalyzer(input) {
        let patterns = [
            { pattern: /\.jpg$|\.jpeg$/, mimeType: 'image/jpeg' },
            { pattern: /\.png$/, mimeType: 'image/png' },
            { pattern: /\.gif$/, mimeType: 'image/gif' },
            { pattern: /\.bmp$/, mimeType: 'image/bmp' },
            { pattern: /\.webp$/, mimeType: 'image/webp' },
            { pattern: /\.svg$/, mimeType: 'image/svg+xml' },
            { pattern: /\.tiff$/, mimeType: 'image/tiff' },
            { pattern: /\.ico$/, mimeType: 'image/x-icon' },
            { pattern: /\.psd$/, mimeType: 'image/vnd.adobe.photoshop' },
            { pattern: /\.mp4$/, mimeType: 'video/mp4' },
            { pattern: /\.webm$/, mimeType: 'video/webm' }
        ];

        let analyzeInput = this.mediaInfoExtractor(input);
        if (typeof analyzeInput === 'object') {
            return 'video';
        }
        for (let i = 0; i < patterns.length; i++) {
            if (patterns[i].pattern.test(input.toLowerCase())) {
                let mimeType = patterns[i].mimeType.split('/');
                return mimeType[0];
            }
        }

        return 'text/plain';
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
     * Method responsible of actually getting latest id to avoid multiple of same id.
     * Working recursively.
     * 
     * @static
     * @async
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

    // #endregion

}
export default PostManager;