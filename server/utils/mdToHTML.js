const marked = require("marked");

function mdToHTML(mdStr) {
  return marked.parse(mdStr);
}

module.exports = mdToHTML;
