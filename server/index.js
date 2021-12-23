const fs = require("fs");
const getFilesSync = require("./utils/getFilesSync");
const mdToHTML = require("./utils/mdToHTML");
const getPage = require("./tpl/page");

const articles = [];
getFilesSync(__dirname + "/article-md", articles);
console.log(articles);

articles.forEach((item) => {
  const mdStr = fs.readFileSync(item).toString();
  const content = mdToHTML(mdStr);
  const matchTitle = content.match(/<h1[^>]*>(.+?)<\/h1>/i);
  const title = matchTitle && matchTitle[1];
  const page = getPage(content, title);
  const path = `${__dirname}/../article-list/${title || Date.now()}.html`;
  fs.writeFileSync(path, page);
});
