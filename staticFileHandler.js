
import fs from 'fs/promises';
import Methods from './methodManagers/methods.js';
import ResponseManager from './methodManagers/responseManager.js';

export async function handleStaticFileRoute (pathSegments, response) {

    pathSegments[0] = 'public'
    let path = pathSegments.join('/');

    let fileContents;
    try {
        fileContents = await fs.readFile(path);
    } catch (err) {
        if (err.code === 'ENOENT') {
            ResponseManager.sendWebPageResponse(response, 404, 'text/plain', '404 Not Found');
        } else {
            ResponseManager.sendWebPageResponse(response);
        }
        return;
    }

    let dotIndex = path.lastIndexOf('.');
    if (dotIndex === -1) {
        ResponseManager.sendWebPageResponse(response, 400, 'text/plain', '400 Bad Request');
        return;
    }
    let type = path.substring(dotIndex + 1);

    let contentType;
    switch (type) {
        case 'html':
            contentType = 'text/html';
            break;
        case 'css':
            contentType = 'text/css';
            break;
        case 'js':
            contentType = 'text/javascript';
            break;
        case 'jpg':
        case 'jpeg':
            contentType = 'image/jpeg';
            break;
        default:
            ResponseManager.sendWebPageResponse(response);
            return;
    }
    ResponseManager.sendWebPageResponse(response, 200, contentType, fileContents);
}