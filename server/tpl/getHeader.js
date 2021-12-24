function getHeader() {
  return `<div id="header" class="header">
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
  </div>`;
}

module.exports = getHeader;
