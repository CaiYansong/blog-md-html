const path = require("path");
const compressor = require("node-minify");
const mkdirp = require("mkdirp");

const defaultOptions = {};

function minify(input, output, type = "html") {
  const outputDirPath = output.replace(path.basename(output), "");
  mkdirp.sync(outputDirPath);
  let compressorStr = "html-minifier";
  let options = {
    removeComments: true,
    continueOnParseError: true,
  };
  if (type === "js") {
    // babel-minify | gcc
    compressorStr = "gcc";
    options = {};
  }
  if (type === "css") {
    compressorStr = "clean-css";
    options = {};
  }
  return compressor.minify({
    compressor: compressorStr,
    input,
    output,
    options: {
      ...defaultOptions,
      ...options,
    },
  });
}

module.exports = minify;
