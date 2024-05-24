
//  dependencies

const dataController = require("../helpers/lib/dataController")
const { hashPassword } = require("../helpers/utils")

const {verifyToken} = require("./tokens");


//  module wrapper


const handler = {}

handler.usersRouteHandler = (reqProps, cb) => {

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

handler._methods = {};

handler._methods.get = (reqProps, cb) => {

    let phone = typeof(reqProps.queryObject.phone) === "string" && reqProps.queryObject.phone.length === 11 ?
    reqProps.queryObject.phone : false;

    let tokenId = typeof(reqProps.headerObject.tokenid) === 'string' && reqProps.headerObject.tokenid.length === 20 ?
    reqProps.headerObject.tokenid : false;

    verifyToken(tokenId, phone, (isVerified) => {
        if(isVerified) {
            if (phone) {
                dataController.read("users", phone, (err, userData) => {
                    if(!err && userData) {
        
                        let userDataforOutput = JSON.parse(userData);
                        delete userDataforOutput.password;
                        cb(200, userDataforOutput);
        
                    }
                    else {
                        cb(404, {
                            "Error Message": "User does not exist. Please Try again"
                        })
                    }
                })
        
            }
            else {
                cb(404, {
                    "Error Message": "Insufficient Data"
                })
            }
            
        }
        else {

            cb(404, {
                "Error Message": "User is not authenticated"
            })

        }
    }) 

  

}

handler._methods.post = (reqProps, cb) => {

    let firstName = typeof(reqProps.bodyData.firstName) === "string" && reqProps.bodyData.firstName.trim().length > 0?
    reqProps.bodyData.firstName  : false;

    let lastName = typeof(reqProps.bodyData.lastName) === "string" && reqProps.bodyData.lastName.trim().length > 0?
    reqProps.bodyData.lastName  : false;

    let phone = typeof(reqProps.bodyData.phone) === "string" && reqProps.bodyData.phone.trim().length === 11?
    reqProps.bodyData.phone  : false; 

    let password = typeof(reqProps.bodyData.password) === "string" && reqProps.bodyData.password.trim().length > 0?
    reqProps.bodyData.password  : false;

    if (firstName && lastName && phone && password) {

        dataController.read("users", phone, (err, userData) => {
            if(err) {
                let newUserData = {
                    firstName,
                    lastName,
                    phone,
                    "password": hashPassword(password),
                    "checkers": [],
                    "monitorResult": []

                }

                dataController.create("users", phone, newUserData, (err) => {
                    if(!err) {
                        cb(200, {
                            "Success Message": "The account is created successfully"
                        })
                    }
                    else {
                        cb(400, {
                            "Error Message": "Sorry cannot create account for server side problem on creating file"
                        })
                    }
                })


            }
            else {
                cb(400, {
                    "Error Message": "User Already Exist"
                })
            }
        } )


    }
    else {
        cb(400, {
            "Error Message": "The data is not sufficient"
        })
    }

    


   

}

handler._methods.put = (reqProps, cb) => {

    let firstName = typeof(reqProps.bodyData.firstName) === 'string' && reqProps.bodyData.firstName.trim().length > 0?
    reqProps.bodyData.firstName  : false;

    let lastName = typeof(reqProps.bodyData.lastName) === 'string' && reqProps.bodyData.lastName.trim().length > 0?
    reqProps.bodyData.lastName  : false;

    let phone = typeof(reqProps.bodyData.phone) === 'string' && reqProps.bodyData.phone.trim().length === 11?
    reqProps.bodyData.phone  : false; 

    let password = typeof(reqProps.bodyData.password) === 'string' && reqProps.bodyData.password.trim().length > 0?
    reqProps.bodyData.password  : false;

    let tokenId = typeof(reqProps.headerObject.tokenid) === 'string' && reqProps.headerObject.tokenid.length === 20 ?
    reqProps.headerObject.tokenid : false;
    

    verifyToken(tokenId, phone ,(isVerified) => {
        
        if(isVerified) {

            if(phone) {

                let updatedUserData = {
                    firstName,
                    lastName,
                    phone,
                    "password": hashPassword(password)
                }

                dataController.read("users", phone, (userReadError, userData) => {

                    if(!userReadError && userData) {
                        
                        userData = JSON.parse(userData);
                        let userCheckers = typeof(userData.checkers) === 'object' && userData.checkers instanceof Array ?
                        userData.checkers : [];

                        updatedUserData.checkers = userCheckers;
                        console.log(updatedUserData);

                        dataController.update("users", phone, updatedUserData, (err) => {
                            if(!err) {
                                cb(200, {
                                    "Success Message": "User Info Updated Successfully"
                                })
                            }
                            else {
                                cb(404, {
                                    "Error Message": "No user found"
                                })
                            }
                        } )

                    }
                    else {
                        cb(404, {
                            "Error Message": "Server side error on reading User File"
                        })
                    }
                })
        
            }
            else {
                cb(404, {
                    "Error Message": "Insufficient Data"
                })
            }

        }
        else {

            cb(404, {
                "Error Message": "User is not authenticated"
            })



        }
    })

    

    

}

handler._methods.delete = (reqProps, cb) => {

    let phone = typeof(reqProps.queryObject.phone) === "string" && reqProps.queryObject.phone.length === 11 ?
    reqProps.queryObject.phone : false;

    let tokenId = typeof(reqProps.headerObject.tokenid) === 'string' && reqProps.headerObject.tokenid.length === 20 ?
    reqProps.headerObject.tokenid : false;

    verifyToken(tokenId, phone, (isVerified) => {
        if(isVerified) {

            if(phone) {

                dataController.delete("users", phone, (err) => {
                    if(!err) {
                        cb(200, {
                            "Success Message": "User Has Been Deleted"
                        })
                    }
                    else {
                        cb(404, {
                            "Error Message": "Cannot Find the User"
                        })
                    }
                })
        
            }
            else {
                cb(404, {
        
                    "Error Message": "User does not exist"
                })
            }

        }
        else {
            cb(404, {
        
                "Error Message": "User is not authenticated"
            })
            

        }
    })

    



}


module.exports = handler.usersRouteHandler;