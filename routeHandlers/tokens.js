
// dependencies


const dataController = require("../helpers/lib/dataController")
const { createToken, hashPassword }  = require("../helpers/utils");
// const { createToken }  = require("../helpers/utils");

//  module wrapper

const handler = {}


handler.tokensRouteHandler = (reqProps, cb) => {

    const acceptableMethod = ["get", "post", "delete", "put"];
    let method = reqProps.method;

    if (acceptableMethod.includes(method)) {
        handler._methods[method](reqProps, cb);
    }
    else {
        cb(405, {
            "Error Message": "Request method is not allowed"
        })
    }

}


handler._methods = {};

handler._methods.post = (reqProps , cb) => {


    let phone = typeof(reqProps.bodyData.phone) === "string" && reqProps.bodyData.phone.trim().length === 11?
    reqProps.bodyData.phone  : false; 

    let password = typeof(reqProps.bodyData.password) === "string" && reqProps.bodyData.password.trim().length > 0?
    reqProps.bodyData.password  : false;



    if (phone && password) {

        dataController.read("users", phone, (err, userData) => {

            if(!err && userData) {

                let hashedPassword = hashPassword(password);

                if (hashedPassword === JSON.parse(userData).password) {

                    
                    let tokenId = createToken(phone);
                    let tokenObject = {
                        tokenId,
                        phone,
                        "password":hashedPassword,
                        "expire": Date.now() + 60 * 60 * 1000,

                    }

                    dataController.create("tokens", tokenId, tokenObject, (err) => {

                        if(!err) {

                            cb(200, {
                                "Success Message": "Token Has been Created Successfull"
                            })

                        }
                        else {

                            cb(404, {
                                "Error Message": "Server Side Error on creating token file"
                            })

                        }
                    })

                }
                else {
                    cb(401, {
                        "Error Message": "Password is not valid"
                    })
                }

            }
            else {
                cb(404, {
                    "Error Message": "User Does not exist"
                })
            }
        })




    }
    else {
        cb(404, {
            "Error Message": "The Data is not valid"
        })
    }

}


handler._methods.get = (reqProps, cb) => {
    
    
    let tokenId =  typeof(reqProps.queryObject.tokenId) === 'string' && reqProps.queryObject.tokenId.trim().length === 20?
    reqProps.queryObject.tokenId : false;

    console.log(tokenId);
    

    if(tokenId) {

        dataController.read("tokens", tokenId, (err, tokenData) => {
            if(!err) {

                tokenData = JSON.parse(tokenData)
                delete tokenData.password
                cb(200, tokenData);
            }
            else {
                cb(404, {
                    "Error Message": "Token cannot be found"
                })

            }
        })

    }
    else {
        cb(404, {
            "Error Message": "Invalid Token"
        })
    }

}



handler._methods.put = (reqProps, cb) => {

    let tokenId = typeof(reqProps.bodyData.tokenId) === 'string' && reqProps.bodyData.tokenId.trim().length == 20?
    reqProps.bodyData.tokenId : false;
    console.log(tokenId);

    let extend = typeof(reqProps.bodyData.extend) === 'boolean' ? reqProps.bodyData.extend  : false;

    if(tokenId && extend) {

        dataController.read("tokens", tokenId, (readErr, tokenData) => {

            if(!readErr && tokenData) {
                tokenData = JSON.parse(tokenData);

                if (tokenData.expire > Date.now()) {

                    tokenData.expire += 60 * 60 * 1000;
                    dataController.update("tokens", tokenId, tokenData, (updateErr) => {

                        if(!updateErr) {

                            cb(200, {
                                "Success Message": "Update Has been done successfully"
                            });

                        } 
                        else {

                            cb(404, {
                                "Error Message": "Sorry cannot update for not finding the file"
                            })

                        }

                    })

                }
                else {
                    cb(401, {
                        "Error Message": "Token has already been expired"
                    })
                }


            }
            else {
                cb(404, {
                    "Error Message": "Server side Error or File not Found"
                })

            }

        })


    }
    else {
        cb(404, {
            "Error Message": "Insufficient or Invalid data is given"
        })
    }

}

handler._methods.delete = (reqProps, cb) => {
    let tokenId =  typeof(reqProps.bodyData.tokenId) === 'string' && reqProps.bodyData.tokenId.trim().length === 20?
    reqProps.bodyData.tokenId : false;

    if(tokenId) {

        dataController.delete("tokens", tokenId, (err) => {
            if(!err) {

                cb(200, {
                    "Success Message": "Token Id Has been deleted successfully"
                })

            }
            else {
                cb(404, { 
                    "Error Message": "Server Side Problem"
                })

            }
        })

    }
    else {
        cb(404, { 
            "Error Message": "Invalid Token Id"
        })
    }

}

handler.verifyToken = (tokenId, phone, cb) => {

    dataController.read("tokens", tokenId, (err, tokenData) => {
        
        if(!err && tokenData) {
            tokenData = JSON.parse(tokenData);
            
            if (tokenData.phone === phone) {
                if(tokenData.expire > Date.now()) {
                    cb(true);

                }
                else {
                    cb(false);
                }
            }
            else {
                cb(false);
            }

        }
        else {
            cb(false);
        }
    })

}

module.exports = handler;
