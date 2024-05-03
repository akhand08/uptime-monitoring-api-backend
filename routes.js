

// dependencies
const sampleRouteHandler = require("./routeHandlers/sample");
const usersRouteHandler = require("./routeHandlers/users");
const {tokensRouteHandler} = require("./routeHandlers/tokens");


//  module wrapper

const routes = {
    "sample": sampleRouteHandler,
    "users": usersRouteHandler,
    "tokens": tokensRouteHandler
    
}

module.exports = routes;