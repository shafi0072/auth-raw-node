const fs = require("fs");
const path = require("path");

const lib = {};

// base dir of the data folder
lib.basedir = path.join(__dirname, "/../.data/");

// write data to file
lib.create = (dir, file, data, callback) => {
  // open file for write data
  fs.open(
    lib.basedir + dir + "/" + file + ".json",
    "wx",
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        // convert data to string
        const stringData = JSON.stringify(data);

        // write data to file and close
        fs.writeFile(fileDescriptor, stringData, (err) => {
          if (!err) {
            fs.close(fileDescriptor, (err) => {
              if (!err) {
                callback(false);
              } else {
                callback("error closing the new file");
              }
            });
          } else {
            callback("writing to new File");
          }
        });
      } else {
        callback("could not create new file. it may already exist");
      }
    }
  );
};

// read data from file
lib.read = (dir, file, callback) => {
  fs.readFile(
    lib.basedir + dir + "/" + file + ".json",
    "utf-8",
    (err, data) => {
      callback(err, data);
    }
  );
};

// update existing file
lib.update = (dir, file, data, callback) => {
  // file open for writing
  fs.open(
    lib.basedir + dir + "/" + file + ".json",
    "r+",
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        // conver data to string
        const stringData = JSON.stringify(data);

        // truncate the file
        fs.ftruncate(fileDescriptor, (err) => {
          if (!err) {
            // write to the file and close it
            fs.writeFile(fileDescriptor, stringData, (err) => {
              if (!err) {
                // close
                fs.close(fileDescriptor, (err) => {
                  if (!err) {
                    callback(false);
                  } else {
                    callback("error close file");
                  }
                });
              } else {
                callback("error to write file");
              }
            });
          } else {
            callback("faild to truncate file");
          }
        });
      } else {
        callback("error to update file");
      }
    }
  );
};

// delete
lib.delete = (dir, file, callback) => {
  // unlink
  fs.unlink(lib.basedir + dir + "/" + file + ".json", (err) => {
    if(!err){
      callback(false)
    }else{
      callback('failed to delete')
    }
  })
}

module.exports = lib;
