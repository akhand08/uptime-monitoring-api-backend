

const path = require("node:path");
const fs = require("node:fs");



// module wrapper


const dataHandler = {}
dataHandler.basedir = path.join(__dirname, "../../.database/");


console.log(dataHandler.basedir);



dataHandler.create = (dir, file, content, cb) => {

    fs.open(path.join(dataHandler.basedir, dir, file + ".json"), 'wx', (err, fd) => {

        if (!err && fd) {

            content = JSON.stringify(content)
            fs.writeFile(fd, content, (err) => {
                if(!err && fd) {
                    fs.close(fd, (err) => {
                        if(!err) {
                            cb(null);

                        }
                        else {
                            cb(err)
                        }
                    })

                }
                else {
                    cb(err);
                }
            })
        }
        else {
            cb(err);
        }
    })

}

dataHandler.read = (dir, file, cb) => {
    fs.readFile(path.join(dataHandler.basedir, dir, file + ".json"), "utf-8", (err, data) => {
        if(!err) {
            cb(err, data);
        }
        else {
            cb(err);
        }
    })
}



dataHandler.update = (dir, file, content, cb) => {
    const filePath = path.join(dataHandler.basedir, dir, file + ".json");

    // Convert content to JSON string
    const jsonContent = JSON.stringify(content);

    // Write new content to the file
    fs.writeFile(filePath, jsonContent, (err) => {
        if (err) {
            cb(err);
        } else {
            cb(null);
        }
    });
};



dataHandler.delete = (dir, file, cb) => {
    fs.unlink(path.join(dataHandler.basedir, dir, file + ".json") , (err) => {
        if(!err) {
            cb(null);
        }
        else {

            cb(err);
        }
    })
    
}



dataHandler.getList = (dir,  cb) => {
    fs.readdir(path.join(dataHandler.basedir, dir), (err, files) => {
        if(!err && files) {
            cb(null, files);
            
        }
        else {
            cb(true)
            
        }
    })
}




// export 

module.exports = dataHandler;