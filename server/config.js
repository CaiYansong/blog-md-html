const path = require("path");

const assets = ["imgs"];

const staticPath = path.normalize(`${__dirname}/../static`);
const distPath = path.normalize(`${__dirname}/../dist`);
const publicPath = path.normalize(`${__dirname}/../public`);

module.exports = {
  assets,
  staticPath,
  distPath,
  publicPath,
};
