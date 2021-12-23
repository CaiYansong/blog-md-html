var fs = require('fs');
var path = require('path');

/**
 * 获取文件列表的名称
 * @param {String} filePath 需要遍历的文件路径
 * @param {Array} arr 存储文件名的数组
 */
function getFilesSync(filePath, arr) {
    // 根据文件路径读取文件，返回文件列表
    try {
        var fileNames = fs.readdirSync(filePath);
    } catch (err) {
        console.log(err);
    }
    if (typeof fileNames !== 'object') {
        console.warn('err')
    } else {
        // 遍历读取到的文件列表
        fileNames.forEach(function (filename) {
            // 获取当前文件的绝对路径
            var filedir = path.join(filePath, filename);
            // 根据文件路径获取文件信息，返回一个 fs.Stats 对象
            var stats = fs.statSync(filedir);
            if (typeof stats !== 'object') {
                console.warn('获取文件stats失败');
            } else {
                var isFile = stats.isFile(); // 是文件
                var isDir = stats.isDirectory(); // 是文件夹
                if (isFile) {
                    arr.push(filedir);
                }
                if (isDir) {
                    getArticlesSync(filedir, arr); // 递归，如果是文件夹，就继续遍历该文件夹下面的文件
                }
            }
        });
    }
}

module.exports = getFilesSync;