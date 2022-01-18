const path = require("path");
const getFilesNameSync = require("./utils/getFilesNameSync");
const minify = require("./utils/minify");

const config = require("./config");
const { distPath, publicPath } = config;

const baseFile = getFilesNameSync(distPath, true);

const miniFile = ["html", "js", "css"];
baseFile.forEach((item) => {
  const extname = path.extname(item).slice(1).toLowerCase();
  if (miniFile.includes(extname)) {
    const outputPath = path.join(publicPath, item.replace(distPath, ""));
    minify(item, outputPath, extname).catch((error) => {
      console.log(error);
    });
  }
});
