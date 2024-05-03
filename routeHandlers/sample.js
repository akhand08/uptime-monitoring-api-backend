



//  module wrapper


const handler = {}

handler.sampleRouteHandler = (reqProps, cb) => {

    cb(200, {
        "name": "Abdullah Al Adib Akhand"
    })
}


module.exports = handler.sampleRouteHandler;