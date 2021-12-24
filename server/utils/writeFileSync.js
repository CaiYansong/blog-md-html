const fs = require("fs");
const path = require("path");
const mkdirp = require('mkdirp');

function writeFileSync(filePath, str) {
  const normalizePath = path.normalize(filePath)
  mkdirp.sync(normalizePath.replace(path.basename(normalizePath), ''));
  try {
    fs.writeFileSync(normalizePath, str);
    return true;
  } catch (error) {
    console.log("writeFileSync: ", error);
  }
}

module.exports = writeFileSync;
