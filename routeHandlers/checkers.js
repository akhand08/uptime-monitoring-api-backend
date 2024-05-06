
// dependencies

const dataController = require("../helpers/lib/dataController")
const {verifyToken} = require("./tokens");

const { createToken }  = require("../helpers/utils");


//  module wrapper

const handler = {} 

handler.checkersRouteHandler = (reqProps, cb) => {

    const acceptableMethod = ["get", "post", "delete", "put"];
    let method = reqProps.method;

    if (acceptableMethod.includes(method)) {
        handler._methods[method](reqProps, cb);
    }
    else {
        cb(405, {
            "Error Message": "Request method is not acceptable"
        })
    }

}

handler._methods = {}

handler._methods.post = (reqProps, cb) => {
    

    const protocol = typeof(reqProps.bodyData.protocol) === 'string' && ["https", "http"].includes(reqProps.bodyData.protocol) ?
    reqProps.bodyData.protocol : false;

    const url = typeof(reqProps.bodyData.url) === 'string' && reqProps.bodyData.url.trim().length > 0 ?
    reqProps.bodyData.url : false;
    
    const method = typeof(reqProps.bodyData.url) == 'string' && ["get", "post", "put", "delete"].includes(reqProps.bodyData.method.trim().toLowerCase())?
    reqProps.bodyData.method.trim().toLowerCase() : false;

    const successCode = typeof(reqProps.bodyData.successCode) === 'object' && reqProps.bodyData.successCode instanceof Array ?
    reqProps.bodyData.successCode : false;

    const timeoutSeconds = typeof(reqProps.bodyData.timeoutSeconds) === 'number' && reqProps.bodyData.timeoutSeconds % 1 === 0 &&
    reqProps.bodyData.timeoutSeconds > 0 && reqProps.bodyData.timeoutSeconds <= 5 ? reqProps.bodyData.timeoutSeconds : false;

    

    if (protocol && url && method && successCode && timeoutSeconds) {

        const token = typeof(reqProps.headerObject.tokenid) === 'string' && reqProps.headerObject.tokenid.length === 20 ?
        reqProps.headerObject.tokenid : false;

        dataController.read("tokens", token, (tokenReadError, tokenData) => {
            if(!tokenReadError && tokenData) {

                tokenData = JSON.parse(tokenData);
                const phone = tokenData.phone;

                verifyToken(token, phone, (validToken) => {
                    if(validToken === true) {

                        dataController.read("users", phone, (userReadError, userData) => {

                            if(!userReadError && userData) {

                                userData = JSON.parse(userData);
                                let userCheckers = typeof(userData.checkers) === 'object' && userData.checkers instanceof Array?
                                userData.checkers : [];
                                
                                
                                if(userCheckers.length < 5) {
                                    let checkerId = createToken(phone);
                                    checkerId = checkerId.substring(0,15);
                                    const checkerObject = {
                                        checkerId,
                                        userPhone : phone,
                                        protocol,
                                        url,
                                        method,
                                        successCode,
                                        timeoutSeconds

                                    }


                                    dataController.create("checkers", checkerId, checkerObject, (createCheckerError) => {

                                        if(!createCheckerError) {

                                            userData.checkers = userCheckers;
                                            userData.checkers.push(checkerId);

                                            dataController.update("users",phone, userData, (userUpdateError) => {
                                                if(!userUpdateError) {

                                                    cb(202, checkerObject);

                                                }
                                                else {
                                                    cb(404, {
                                                        "Error Message" : "Server Side Error on User Update"
                                                    })

                                                }
                                            })

                                            


                                        }
                                        else {

                                            cb(404, {
                                                "Error Message" : "Server Side Error"
                                            })

                                        }

                                    })

                                    
                                }
                                else {
                                    cb(404, {
                                        "Error Message" : "User have already added 5 links"
                                    })
                                }

                                

                                

                                 

                            }
                        })




                    }
                    else {

                        cb(404, {
                            "Error Message": "Invalid Token ID"
                        })

                    }
                })



               

            }
            else {
                cb(404, {
                    "Error Message": "Unidentified Token ID"
                })
            }
        }) 

    }
    else {
        cb(404, {
            "Error Message": "Insufficient Request"
        })
    }

    

}


handler._methods.get = (reqProps, cb) => {

    const checkerId = typeof(reqProps.bodyData.checkerId) === "string" && reqProps.bodyData.checkerId.length === 15?
    reqProps.bodyData.checkerId : false;


    if(checkerId) {

        dataController.read("checkers", checkerId, (checkerReadError, checkerData) => {

            if(!checkerReadError && checkerData) {
                checkerData = JSON.parse(checkerData);
                const userPhone = checkerData.userPhone ;
                const token = typeof(reqProps.headerObject.tokenid) === 'string' && reqProps.headerObject.tokenid.length === 20 ?
                reqProps.headerObject.tokenid : false;

                verifyToken(token, userPhone, (validToken) => {

                    if(validToken === true) {

                        cb(200, checkerData);

                    }
                    else {
                        cb(404, {
                            "Error Message" : "Invalid Token: Authentication Error"
                        })

                    }

                })

            }
            else {
                cb(404, {
                    "Error Message" : "Server Side Error"
                })

            }
            

        })
    }
    else {

        cb(404, {
            "Error Message" : "Invalid Id"
        })

    }
}


handler._methods.put = (reqProps, cb) => {

    const protocol = typeof(reqProps.bodyData.protocol) === 'string' && ["https", "http"].includes(reqProps.bodyData.protocol) ?
    reqProps.bodyData.protocol : false;

    const url =  typeof(reqProps.bodyData.url) === 'string' && reqProps.bodyData.url.trim().length > 0 ?
    reqProps.bodyData.url : false;
    
    
    const method =  typeof(reqProps.bodyData.method) == 'string' && ["get", "post", "put", "delete"].includes(reqProps.bodyData.method.trim().toLowerCase())?
    reqProps.bodyData.method.trim().toLowerCase() : false;
    

    const successCode = reqProps.bodyData.successCode && typeof(reqProps.bodyData.successCode) === 'object' && reqProps.bodyData.successCode instanceof Array ?
    reqProps.bodyData.successCode : false;

    const timeoutSeconds = reqProps.bodyData.timeoutSeconds && typeof(reqProps.bodyData.timeoutSeconds) === 'number' && reqProps.bodyData.timeoutSeconds % 1 === 0 &&
    reqProps.bodyData.timeoutSeconds > 0 && reqProps.bodyData.timeoutSeconds <= 5 ? reqProps.bodyData.timeoutSeconds : false;

    const checkerId = typeof(reqProps.bodyData.checkerId) === "string" && reqProps.bodyData.checkerId.length === 15?
    reqProps.bodyData.checkerId : false;
    

    if(checkerId) {

        dataController.read("checkers", checkerId, (checkerReadError, checkerData) => {
            if(!checkerReadError && checkerData) {
                checkerData = JSON.parse(checkerData);
                const userPhone = checkerData.userPhone ;
                const token = typeof(reqProps.headerObject.tokenid) === 'string' && reqProps.headerObject.tokenid.length === 20 ?
                reqProps.headerObject.tokenid : false;

                verifyToken(token, userPhone, (validToken) => {

                    if(validToken === true) {


                        if(protocol) {
                            checkerData.protocol = protocol;
                        }

                        if(url) {
                            checkerData.url = url;
                        }

                        if(method) {
                            checkerData.method = url;
                        }

                        if(successCode) {
                            checkerData = successCode;
                        }

                        if(timeoutSeconds) {
                            checkerData.timeoutSeconds = timeoutSeconds
                        }


                        dataController.update("checkers", checkerId, checkerData, (checkerUpdateError) => {
                            if(!checkerUpdateError) {
                                cb(200, {
                                    "Success Message": "Checker Data Has been Updated Successfuly"
                                })
                            }
                            else {
                                cb(404, {
                                    "Error Message" : "Server side Error on Updating file"
                                })

                            }
                        })

                    }
                    else {
                        cb(404, {
                            "Error Message" : "Invalid Token: Authentication Error"
                        })

                    }

                })



            }
            else {
                cb(404,  {
                    "Error Message": "Server Side error: On Read file"
                })

            }
        })

    }
    else {
        cb(404,  {
            "Error Message": "Invalid Checker Id"
        })
    }


}

handler._methods.delete = (reqProps, cb) => {

    const checkerId = typeof(reqProps.bodyData.checkerId) === "string" && reqProps.bodyData.checkerId.length === 15?
    reqProps.bodyData.checkerId : false;
    

    if(checkerId) {

        dataController.read("checkers", checkerId, (checkerReadError, checkerData) => {
            if(!checkerReadError && checkerData) {
                checkerData = JSON.parse(checkerData);
                const userPhone = checkerData.userPhone ;
                const token = typeof(reqProps.headerObject.tokenid) === 'string' && reqProps.headerObject.tokenid.length === 20 ?
                reqProps.headerObject.tokenid : false;

                verifyToken(token, userPhone, (validToken) => {

                    if(validToken === true) {

                        dataController.delete("checkers", checkerId, (checkerDeleteError) => {
                            if(!checkerDeleteError) {

                                dataController.read("users", userPhone, (userReadError, userData) => {

                                    if(!userReadError) {

                                        let userObject = JSON.parse(userData);
                                        let userCheckers = typeof(userObject.checkers) === 'object' && userObject.checkers instanceof Array ?
                                        userObject.checkers : [];
                                        let indexOfDeletedItem = userCheckers.indexOf(checkerId);
                                        if (indexOfDeletedItem !== -1) {
                                            userCheckers.splice(indexOfDeletedItem,1);
                                            userObject.checkers = userCheckers;
                                           

                                            

                                            dataController.update("users", userPhone, userObject, (userUpdateError) => {

                                                if(!userUpdateError) {

                                                    cb(200, {

                                                        "Success Message": "Checker ID successfully Deleted"

                                                    })

                                                }
                                                else {
                                                    cb(404, {
                                                        "Error Message" : "Server Side Error on User Update"
                                                    })
                                                }
                                            })
                                            
                                        }
                                        else {
                                            cb(404, {
                                                "Error Message" : "Server Side Error on Deleting file from user file"
                                            })

                                        }


                                    }
                                    else {

                                        cb(404, {
                                            "Error Message" : "Server Side Error on Deleting file from user file"
                                        })

                                    }
                                })

                            }
                            else {
                                cb(404, {
                                    "Error Message" : "Server Side Error on Deleting File"
                                })

                            }
                        })

                    }
                    else {
                        cb(404, {
                            "Error Message" : "Invalid Token: Authentication Error"
                        })

                    }

                })



            }
            else {
                cb(404,  {
                    "Error Message": "Server Side error: On Read file"
                })

            }
        })

    }
    else {
        cb(404,  {
            "Error Message": "Invalid Checker Id"
        })
    }
    
}

module.exports = handler;