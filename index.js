/*
    Project Name: Uptime Monitoring API
    Details: A RestAPI to monitor the Ups and Downs of web-link given by user
    Author: Abdullah Al Adib Akhand
    Date: 03 April, 2024


*/


// dependencies

const http = require("node:http");
const reqResHandler = require("./helpers/reqResHandler");

//  testing Data handler
// const dataHandler = require("./helpers/lib/dataController");

// dataHandler.create("test", "test", "My name is Adib", (err) => {
//     console.log("The error in create: ", err);
// })

// dataHandler.read("test", "test", (err, data) => {
//     console.log(data);
// })

// dataHandler.update("test", "test", "I am 23 years old", (err) => {
//     if (err) {
//         throw err;
//     }
//     console.log("Update is done");
// } )



// App object - module scaffolding

const app = {};

// configuration

app.config = {
    "port": 3000
}


// server

app.server = http.createServer(reqResHandler);

app.server.listen(app.config.port, () => console.log("The server is running well on Port 3000"));