// dependencies

const http = require("node:http");
const reqResHandler = require("../../helpers/reqResHandler")




// module wrapper

const server = {};

// configuration

server.config = {
    "port": 3000
}


// server

server.createNewServer = http.createServer(reqResHandler);

server.init = () => {

    server.createNewServer.listen(server.config.port, () => console.log("The server is running well on Port 3000"));

}

module.exports = server.init;