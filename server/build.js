const path = require("path");
const getFilesNameSync = require("./utils/getFilesNameSync");
const getDirsNameSync = require("./utils/getDirsNameSync");
const handleMD = require("./utils/handleMD");
const handleHTML = require("./utils/handleHTML");
const runCMD = require("./utils/runCMD");
const writeFileSync = require("./utils/writeFileSync");

const getPage = require("./tpl/getPage");

const config = require("./config");
const { staticPath, distPath, publicPath } = config;

const assets = ["imgs", "css", "js"];

const dirs = getDirsNameSync(staticPath);
dirs.forEach((baseDir) => {
  const dirName = path.basename(baseDir).replace(path.extname(baseDir), "");
  if (assets.includes(dirName)) {
    return;
  }
  handleArticles(baseDir);
});

const whitelist = [];

const baseFile = getFilesNameSync(staticPath);
baseFile.forEach((filePath) => {
  if (whitelist.includes(filePath.replace(path.join(staticPath, "/"), ""))) {
    return;
  }
  handleArticle(filePath, distPath, true);
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
  let targetPath = path.join(distPath, fileTargetPath);

  if (isBase) {
    targetPath = path.join(
      distPath,
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
    const name = path.basename(item).replace(/.md$/i, ".html");
    const href = item.replace(staticPath, "").replace(/.md$/i, ".html");
    str += `<li><a href="${href}" target="_blank">${name}</a></li>\n`;
  });
  str += "</ul>";
  const targetPath = path.join(distPath, "./article-list.html");
  writeFileSync(targetPath, getPage(str));
}

function handleAssets() {
  assets.forEach((item) => {
    const itemPath = path.join(staticPath, `./${item}`);
    runCMD(`cp -r ${itemPath} ${distPath}`).catch((err) => {});
  });
}

handleArticleMenus();
handleAssets();
