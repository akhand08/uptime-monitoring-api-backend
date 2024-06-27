

// dependencies

const usersRouteHandler = require("./routeHandlers/users");
const {tokensRouteHandler} = require("./routeHandlers/tokens");
const {checkersRouteHandler} = require("./routeHandlers/checkers");


//  module wrapper

const routes = {
    
    "users": usersRouteHandler,
    "tokens": tokensRouteHandler,
    "checkers": checkersRouteHandler
    
}

module.exports = routes;