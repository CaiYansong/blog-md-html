const path = require("path");
const runCMD = require("./utils/runCMD");

const config = require("./config");
const { assets, staticPath, publicPath } = config;

require("./build");
require("./mini-file");

handleAssets();

function handleAssets() {
  assets.forEach((item) => {
    const itemPath = path.join(staticPath, `./${item}`);
    runCMD(`cp -r ${itemPath} ${publicPath}`).catch((err) => {});
  });
}
