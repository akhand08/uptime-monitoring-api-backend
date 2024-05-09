// dependencies


const crypto = require("node:crypto");


//  module wrapper

const utilities = {};

utilities.parseJSON = (jsonStr) => {

    let output;

    try {
        output = JSON.parse(jsonStr);
    } catch {
        output = {}
    }
    

    return output;
}


utilities.hashPassword = (password) => {

    let myKey = crypto.createCipheriv('aes-256-cbc', Buffer.from("byz9VFNtbRQM0yBODcCb1lrUtVVH3D3x"), Buffer.from("X05IGQ5qdBnIqAWD"));
    let hashedPassword = myKey.update(password, "utf-8", "hex")
    hashedPassword += myKey.final("hex")

    return hashedPassword;

}


utilities.createToken = (phone) => {

    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    
    let tokenId = "";

    for( let i = 0; i < 10; i++) {

        tokenId += (letters[Math.floor(Math.random() * 51)]);
        tokenId += numbers[Math.floor(Math.random() * 10)];

    }

    return tokenId;

}
module.exports = utilities