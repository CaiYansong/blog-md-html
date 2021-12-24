const fs = require("fs");
const path = require("path");
const writeFileSync = require("./writeFileSync");
const getPage = require("../tpl/getPage");

function handleHTML(staticPath, publicPath) {
  const content = fs.readFileSync(staticPath).toString();
  const matchTitle = content.match(/<title[^>]*>(.+?)<\/title>/i);
  const title = (matchTitle && matchTitle[1]) || "";
  const page = getPage(content, title);

  writeFileSync(publicPath, page);
}

module.exports = handleHTML;
