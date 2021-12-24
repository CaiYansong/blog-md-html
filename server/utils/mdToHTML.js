const marked = require("marked");

marked.setOptions({
  renderer: new marked.Renderer(),
  highlight: function(code, lang) {
    const hljs = require('highlight.js');
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-', // highlight.js css expects a top-level 'hljs' class.
  breaks: true,
});

function mdToHTML(mdStr) {
  let html =  marked.parse(mdStr);
  // a target
  html = html.replace(/(<a)([^>]+>)/g, '$1 target="_blank"$2');
  return html;
}

module.exports = mdToHTML;
