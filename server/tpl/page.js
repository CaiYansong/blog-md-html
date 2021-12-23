function getPage(content, title) {
  const page = `
  <!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="UTF-8">
    <title>${title || "蔡延松的博客"}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta property="article:author" content="蔡延松">
    <meta property="article:tag" content="蔡延松 延松 cys YansongCai caiyansong CaiYansong">
    <link rel="icon" href="/imgs/dog.ico">
    <link rel="stylesheet" href="/index.css">
  </head>

  <body>
    <div id="header" class="header">
      <div class="header-wrap">
        <a class="logo" href="/">
          <img src="/imgs/dog_128px.png" />
        </a>
        <div class="nav">
          <a href="/">首页</a>
          <a href="/article-list">文章列表</a>
          <a href="/note.html">记事本</a>
          <a href="/about.html">关于</a>
        </div>
      </div>
    </div>
    <div id="root" class="root">
      ${content}
    </div>
    <div id="footer" class="footer">
      <a href="http://www.beian.miit.gov.cn/" target="_blank">浙ICP备19046722号</a>
    </div>
  </body>

  </html>
  `;
  return page;
}

module.exports = getPage;
