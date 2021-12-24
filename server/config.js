const path = require("path");

const publicPath = path.normalize(`${__dirname}/../public`);
const staticPath = path.normalize(`${__dirname}/../static`);

module.exports = {
  publicPath,
  staticPath,
};
