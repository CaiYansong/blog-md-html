const fs = require("fs");
const path = require("path");
const getFilesNameSync = require("./utils/getFilesNameSync");
const getDirsNameSync = require("./utils/getDirsNameSync");
const handleMD = require("./utils/handleMD");
const handleHTML = require("./utils/handleHTML");
const runCMD = require("./utils/runCMD");
const writeFileSync = require("./utils/writeFileSync");

const getPage = require("./tpl/getPage");

const config = require("./config");

const { publicPath, staticPath } = config;

const assets = ["css", "js", "imgs"];

const dirs = getDirsNameSync(staticPath);
dirs.forEach((baseDir) => {
  const dirName = path.basename(baseDir).replace(path.extname(baseDir), "");
  if (assets.includes(dirName)) {
    return;
  }
  handleArticles(baseDir);
});

const baseFile = getFilesNameSync(staticPath);
baseFile.forEach((filePath) => {
  handleArticle(filePath, publicPath, true);
});

function handleArticles(baseDirPath) {
  const mdPathFiles = getFilesNameSync(baseDirPath, true);
  mdPathFiles.forEach((filePath) => {
    handleArticle(filePath, baseDirPath);
  });
}

function handleArticle(filePath, baseDirPath, isBase) {
  const extnameLowCase = path.extname(filePath).toLowerCase();

  const dirName = path.basename(baseDirPath);
  const basePath = baseDirPath.replace(dirName, "");

  const extname = path.extname(filePath);
  const fileTargetPath = filePath
    .replace(basePath, "")
    .replace(extname, ".html");
  let targetPath = path.join(publicPath, fileTargetPath);

  if (isBase) {
    targetPath = path.join(
      publicPath,
      fileTargetPath.replace(/^static[\\\/]/, "")
    );
  }
  if (extnameLowCase === ".html") {
    handleHTML(filePath, targetPath);
  } else if (extnameLowCase === ".md") {
    handleMD(filePath, targetPath);
  }
}

function handleArticleMenus() {
  const articlePath = path.join(staticPath, "./articles");
  const articles = getFilesNameSync(articlePath, true);
  let str = "<ul>";
  articles.forEach((item) => {
    const name = path.basename(item);
    const href = item.replace(staticPath, '').replace(/.md$/i, '.html');
    str += `<li><a href="${href}" target="_blank">${name}</a></li>\n`;
  });
  str += "</ul>";
  const targetPath = path.join(publicPath, "./article-list.html");
  console.log(targetPath);
  writeFileSync(targetPath, getPage(str));
}

function handleAssets() {
  assets.forEach((item) => {
    const itemPath = path.join(staticPath, `./${item}`);
    runCMD(`cp -r ${itemPath} ${publicPath}`).catch((err) => {});
  });
}

handleArticleMenus();
handleAssets();
