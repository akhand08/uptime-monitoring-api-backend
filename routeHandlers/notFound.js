
//  module wrapper


const handler = {}

handler.notFoundHandler = (reqProps, cb) => {

    cb(404, {
        "message": "Page not found"
    });
}

module.exports = handler.notFoundHandler;