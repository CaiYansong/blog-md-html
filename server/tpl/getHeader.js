function getHeader() {
  return `<div id="header" class="header">
    <div class="header-wrap">
      <a class="logo" href="/">
        <img src="/imgs/dog_128px.png" />
      </a>
      <div id="header-nav" class="nav">
        <a href="/">首页</a>
        <a href="/article-list">文章</a>
        <a href="/lp">LP</a>
        <a id="hreader-note-link" href="/note.html">Note</a>
        <a href="/about.html">关于</a>
      </div>
    </div>
    <script>
      // href query
      var nav = document.getElementById('header-nav');
      var arr = nav && nav.children;
      for (var i=0;i<arr.length;i++) {
        var noteLink = arr[i];
        noteLink.href = noteLink.href + window.location.search;
      }
    </script>
  </div>`;
}

module.exports = getHeader;
