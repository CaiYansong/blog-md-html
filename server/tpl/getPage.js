const getHead = require("./getHead");
const getHeader = require("./getHeader");
const getFooter = require("./getFooter");

function getPage(content, title) {
  const page = `<!DOCTYPE html>
<html lang="en">
<head>
  ${getHead(title)}
</head>
<body>
  ${getHeader()}
  <div id="root" class="root">
${content}
  </div>
  ${getFooter()}
</body>
</html>`;
  return page;
}

module.exports = getPage;
