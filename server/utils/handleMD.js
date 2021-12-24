const fs = require("fs");
const path = require("path");
const writeFileSync = require("./writeFileSync");
const mdToHTML = require("./mdToHTML");
const getPage = require("../tpl/getPage");

function handleMD(staticPath, publicPath) {
  const mdStr = fs.readFileSync(staticPath).toString();
  const content = mdToHTML(mdStr);
  const matchTitle = content.match(/<h1[^>]*>(.+?)<\/h1>/i);
  const title = (matchTitle && matchTitle[1]) || "";
  const page = getPage(content, title);

  writeFileSync(publicPath, page);
}

module.exports = handleMD;
