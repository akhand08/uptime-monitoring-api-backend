// dependencies


const url = require("node:url");
const http = require("node:http");
const https = require("node:https");

const dataController = require("../lib/dataController");

//  module wrapper

const worker = {};




worker.updateUserFile = async (userFileName, checkerObject, isWebsiteUp) => {
  try {
    const userData = await new Promise((resolve, reject) => {
      dataController.read("users", userFileName, (userReadError, userData) => {
        if (!userReadError && userData) {
          resolve(JSON.parse(userData));
        } else {
          reject(userReadError);
        }
      });
    });

    const indexOfWebsite = userData.monitorResult.findIndex(obj => obj.website === checkerObject.url);

    if (indexOfWebsite !== -1) {
      userData.monitorResult[indexOfWebsite].state = isWebsiteUp ? "Up" : "down";
    } else {
      userData.monitorResult.push({
        website: checkerObject.url,
        state: isWebsiteUp ? "up" : "down"
      });
    }

    await new Promise((resolve, reject) => {
      dataController.update("users", userFileName, userData, (userUpdateError) => {
        if (!userUpdateError) {
          console.log("Successful update");
          resolve();
        } else {
          reject(userUpdateError);
        }
      });
    });
  } catch (error) {
    console.error(`Error occurred while updating user file ${userFileName}: ${error.message}`);
  }
};


worker.makeRequest = async (checkerData) => {
  let isWebsiteUp = false;

  try {
    const parsedURL = url.parse(`${checkerData.protocol}://${checkerData.url}`, true);

    let options = {
      protocol: parsedURL.protocol,
      hostname: parsedURL.hostname,
      path: parsedURL.path,
      method: checkerData.method.toUpperCase(),
      timeout: checkerData.timeoutSeconds * 1000
    };

    const protocolToUse = checkerData.protocol === 'http' ? http : https;

    return new Promise((resolve, reject) => {
      const req = protocolToUse.request(options, (res) => {
        if (res.statusCode === 200) {
          isWebsiteUp = true;
        }

        // Resolve the promise with the final value of isWebsiteUp
        resolve(isWebsiteUp);
      });

      req.on("error", () => {
        // Set isWebsiteUp to false in case of error
        isWebsiteUp = false;

        // Resolve the promise with the final value of isWebsiteUp
        resolve(isWebsiteUp);
      });

      req.on("timeout", () => {
        // Set isWebsiteUp to false in case of timeout
        isWebsiteUp = false;

        // Resolve the promise with the final value of isWebsiteUp
        resolve(isWebsiteUp);
      });

      req.end(); // End the request
    });
  } catch (error) {
    console.error(`Error occurred while checking website ${checkerData.url}: ${error.message}`);
    return isWebsiteUp;
  }
};




worker.getCheckerData = async (userFileName, userCheckers) =>  {

    try {

        for(const checker of userCheckers) {
            let checkerObject = await new Promise((resolve, reject) => {
                dataController.read("checkers", checker, (checkerReadError, checkerData) => {
                    if(!checkerReadError && checkerData) {
                        resolve(JSON.parse(checkerData));
                    }
                    else {
                        reject(checkerReadError)
                    }
                })
            })

            let isWebsiteUp = await worker.makeRequest(checkerObject);

            await worker.updateUserFile(userFileName, checkerObject, isWebsiteUp);




        }

    } 
    catch (error) {

    }
}

worker.getUserList = async () => {
  try {
    let allUserFiles = await new Promise((resolve, reject) => {
      dataController.getList("users", (userListError, userFiles) => {
        if (!userListError && userFiles) {
          resolve(userFiles);
        } else {
          reject(userListError);
        }
      });
    });

    for (const userFile of allUserFiles) {
      let userFileName = userFile.replace(".json", "");

      let userObject = await new Promise((resolve, reject) => {
        dataController.read(
          "users",
          userFileName,
          (userReadError, userData) => {
            if (!userReadError && userData) {
              resolve(JSON.parse(userData));
            } else {
              reject(userReadError);
            }
          }
        );
      });

      let userCheckers = userObject.checkers ? userObject.checkers : [];
    
      worker.getCheckerData(userFileName,userCheckers);
    }
  } catch (error) {
    if(error === userListError) {
        console.log("User List Error is happening");
    }
    else if (error === userReadError) {
        console.log("User Read Error is happening");
    }
  }
};







worker.init = () => {
  setInterval( worker.getUserList, 60000)
};

//  export

module.exports = worker.init;
