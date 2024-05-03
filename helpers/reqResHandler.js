

const url = require("node:url");
const fs = require("node:fs")
const { StringDecoder } = require("node:string_decoder");

const routes = require("../routes")
const notFoundHandler = require("../routeHandlers/notFound");

const { parseJSON } = require("./utils");

// const homepage = require("../views/index.html")



// module wrapper

const handler = {}


handler.reqResHandler = (req, res) => {

    let method = req.method.toLowerCase();
    let incomingURL = url.parse(req.url, true)
    let path = incomingURL.pathname ;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');
    let queryObject = incomingURL.query;
    let headerObject = req.headers;
    
    

    const reqProps = {
        incomingURL,
        path,
        method,
        trimmedPath,
        queryObject,
        headerObject
    }

  

    
    const decoder = new StringDecoder('utf-8');

    let bodyData = "";



    req.on("data", (chunk) =>  {
        bodyData += decoder.write(chunk)
    })

    req.on("end",  () => {
        bodyData += decoder.end()

        reqProps.bodyData = parseJSON(bodyData);

        const chosenRoute = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;

        chosenRoute(reqProps, (statusCode, bodyData) => {
            statusCode = typeof(statusCode) == 'number'? statusCode: 500;
            bodyData = typeof(bodyData) == "object"? bodyData : {};

            bodyDataString = JSON.stringify(bodyData);

            res.setHeader("Content-Type", "application/json");
            res.writeHead(statusCode);
            res.end(bodyDataString);
            
        })
    

    })
}



module.exports = handler.reqResHandler