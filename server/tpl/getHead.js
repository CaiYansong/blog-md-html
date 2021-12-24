function getHead(title) {
  return `<meta charset="UTF-8">
  <title>${title || "蔡延松的博客"}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <meta property="article:author" content="蔡延松">
  <meta property="article:tag" content="蔡延松 延松 cys YansongCai caiyansong CaiYansong">
  <link rel="icon" href="/imgs/dog.ico">
  <link rel="stylesheet" href="/css/index.css">`;
}

module.exports = getHead;
