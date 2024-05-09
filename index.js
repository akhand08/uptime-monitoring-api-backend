/*
    Project Name: Uptime Monitoring API
    Details: A RestAPI to monitor the Ups and Downs of web-link given by user
    Author: Abdullah Al Adib Akhand
    Date: 03 April, 2024


*/


// dependencies

const serverInit = require("./helpers/lib/server");
const workerInit = require("./helpers/lib/worker");


// App object - module scaffolding

const app = {};

app.init = () => {
    serverInit();
    workerInit();
}

app.init();

