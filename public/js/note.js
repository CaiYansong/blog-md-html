// =========== append DOM start ===========
var htmlStr = `
<h4>注意：保存在本地，请勿清除app的数据，否则会导致数据丢失！</h4>
<div class="ipt-wrap">
  <textarea id="text-ipt" class="text-ipt"></textarea>
  <div class="option-wrap">
    <button id="save-btn" class="save-btn">保存</button>
    <button id="edit-btn" class="edit-btn hide">编辑</button>
    <button id="clear-btn" class="clear-btn hide">清除</button>
  </div>
  <span id="tips" class="tips"></span>
</div>
<div id="notes-wrap" class="notes-wrap"></div>
<div id="log-info" class="log-info"></div>
<!-- <div>
  <button id="download-btn">导出</button>

  <textarea type="text" id="upload-ipt"></textarea>
  <button id="upload-btn">导入</button>
</div> -->`;
document.getElementById("note-container").innerHTML = htmlStr;
document.title = "本地记事本";
// =========== append DOM end ===========

// var downloadBtn = document.getElementById("download-btn");
// downloadBtn.addEventListener("click", function () {
//   readNotes(function (list) {
//     var textarea = document.createElement("textarea");
//     textarea.readonly = "readonly";
//     textarea.style.position = "absolute";
//     textarea.style.left = "-9999px";
//     textarea.style.zIndex = "-9999";
//     textarea.value = JSON.stringify(list);
//     document.body.appendChild(textarea);
//     textarea.select();
//     var res = document.execCommand("Copy");
//     if (res) {
//       alert("复制成功");
//     }
//   });
// });

// var uploadIpt = document.getElementById("upload-ipt");
// var uploadBtn = document.getElementById("upload-btn");
// uploadBtn.addEventListener("click", function () {
//   try {
//     if (!uploadIpt.value) {
//       return;
//     }
//     var uploadList = JSON.parse(uploadIpt.value);
//     for (let i = 0; i < uploadList.length; i++) {
//       const item = uploadList[i];
//       addNote("", function () {}, item);
//     }
//     renderNoteList();
//     alert('导入成功');
//     uploadIpt.value = '';
//   } catch (error) {
//     alert("数据有问题，请重试");
//   }
// });

/* 注意。不要使用ES6语法，存在兼容问题！！！ */
// notes
var noteTpl =
  '<div class="note-item"> <div class="note-content">{content}</div> <div class="note-info"> <span class="datetime">{datetime}</span> <div class="note-options"> <button class="edit-btn" data-type="edit" data-id="{id}">编辑</button> <button class="devare-btn" data-type="del" data-id="{id}">删除</button> </div> </div> </div>';

var textAreaEle = document.getElementById("text-ipt");
var noteWrapEle = document.getElementById("notes-wrap");

var saveBtn = document.getElementById("save-btn");
var editBtn = document.getElementById("edit-btn");
var clearBtn = document.getElementById("clear-btn");
var tipsEle = document.getElementById("tips");

var editId = null;
var tempKey = "temp";

init();

function init() {
  setDateFormat();

  saveBtn.addEventListener("click", function () {
    var val = textAreaEle.value;
    if (!val) {
      tipsEle.innerHTML = "不能为空";
      return;
    }
    addNote(escapeHTML(val), function () {
      textAreaEle.value = "";
      tipsEle.innerHTML = "";
      renderNoteList(true);
      localStorage.setItem(tempKey, "");
    });
  });

  editBtn.addEventListener("click", function () {
    updateNote(escapeHTML(textAreaEle.value), function () {
      renderNoteList(true);

      textAreaEle.value = "";
      editBtn.className = editBtn.className + " hide";
      saveBtn.className = saveBtn.className.replace(" hide", "");
      localStorage.setItem(tempKey, "");
    });
  });

  noteWrapEle.addEventListener("click", function (e) {
    var type = e.target.getAttribute("data-type");
    var id = e.target.getAttribute("data-id");
    if (type === "del") {
      removeNote(id, function () {
        renderNoteList();
      });
    }
    if (type === "edit") {
      readNote(id, function (item) {
        editId = id;
        textAreaEle.value = item.val;
        saveBtn.className = saveBtn.className + " hide";
        editBtn.className = editBtn.className.replace(" hide", "");
      });
    }
  });

  clearBtn.addEventListener("click", function () {
    textAreaEle.value = "";
    localStorage.setItem(tempKey, "");
    clearBtn.className = clearBtn.className + " hide";
  });

  textAreaEle.addEventListener("keydown", function () {
    localStorage.setItem(tempKey, escapeHTML(textAreaEle.value));
  });
}

window.onload = function onPageLoad() {
  var val = localStorage.getItem(tempKey);
  if (val) {
    logInfo("load temp val");
    clearBtn.className = clearBtn.className.replace(" hide", "");
    textAreaEle.value = descapeHTML(val);
  }
};

function onDBLoad() {
  renderNoteList(true);
}

function renderNoteList(remoteSave) {
  readNotes(function (list) {
    var html = "";
    list &&
      list.forEach &&
      list.forEach(function (it) {
        var item = noteTpl;
        item = item.replace(/\{id\}/g, it.id);
        item = item.replace(/\{content\}/g, it.val);
        item = item.replace(/\{datetime\}/g, it.datetime);
        item = item.replace(/\{time\}/g, it.time);
        html += item;
      });
    noteWrapEle.innerHTML = html;
    remoteSave &&
      list.length > 0 &&
      checkAPostStr(JSON.stringify(list), "note_" + Date.now());
  });
}

/* ---------- note 操作 ---------- */
var hasIndexedDB = indexedDB || webkitIndexedDB || mozIndexedDB || null;
// var hasIndexedDB = false;

function addNote(val, cb) {
  var date = new Date();
  var time = date.getTime();
  var item = { id: "" + time, val, time, datetime: date.format() };
  if (hasIndexedDB) {
    add(item, cb);
    return;
  }
  addItem(item, cb);
}

function updateNote(val, cb) {
  var date = new Date();
  var item = { id: editId, val, time: date.getTime(), datetime: date.format() };
  if (hasIndexedDB) {
    update(item, cb);
    return;
  }
  updateItem(item, cb);
}

function removeNote(id, cb) {
  if (hasIndexedDB) {
    remove(id, cb);
    return;
  }
  removeItem(id, cb);
}

function readNotes(cb) {
  if (hasIndexedDB) {
    readAll(cb);
    return;
  }
  getList(cb);
}

function readNote(id, cb) {
  if (hasIndexedDB) {
    read(id, cb);
    return;
  }
  getItem(id, cb);
}

/* ---------- 辅助函数 ---------- */
/**
 * 设置时间日期格式转换
 * 有周几的版本
 * new Date().format("yyyy-MM-dd 星期w hh:mm:ss");
 */
function setDateFormat() {
  Date.prototype.format = function (formatStr) {
    var str = formatStr || "yyyy-MM-dd 星期w hh:mm:ss";
    var Week = ["日", "一", "二", "三", "四", "五", "六"];
    str = str.replace(/yyyy|YYYY/, this.getFullYear());
    str = str.replace(
      /yy|YY/,
      this.getYear() % 100 > 9
        ? (this.getYear() % 100).toString()
        : "0" + (this.getYear() % 100)
    );
    str = str.replace(
      /MM/,
      this.getMonth() + 1 > 9
        ? (this.getMonth() + 1).toString()
        : "0" + (this.getMonth() + 1)
    );
    str = str.replace(/M/g, this.getMonth() + 1);
    str = str.replace(/w|W/g, Week[this.getDay()]);
    str = str.replace(
      /dd|DD/,
      this.getDate() > 9 ? this.getDate().toString() : "0" + this.getDate()
    );
    str = str.replace(/d|D/g, this.getDate());
    str = str.replace(
      /hh|HH/,
      this.getHours() > 9 ? this.getHours().toString() : "0" + this.getHours()
    );
    str = str.replace(/h|H/g, this.getHours());
    str = str.replace(
      /mm/,
      this.getMinutes() > 9
        ? this.getMinutes().toString()
        : "0" + this.getMinutes()
    );
    str = str.replace(/m/g, this.getMinutes());
    str = str.replace(
      /ss|SS/,
      this.getSeconds() > 9
        ? this.getSeconds().toString()
        : "0" + this.getSeconds()
    );
    str = str.replace(/s|S/g, this.getSeconds());
    return str;
  };
}

/**
 * 转义 html 字符串
 * @param {string} s
 */
function escapeHTML(s) {
  if (typeof s !== "string") {
    return "";
  }
  var REG_HTML_ENCODE = /"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g;
  return s.replace(REG_HTML_ENCODE, function ($0) {
    var c = $0.charCodeAt(0);
    var r = ["&#"];
    c = c === 0x20 ? 0xa0 : c;
    r.push(c);
    r.push(";");
    return r.join("");
  });
}

/**
 * 转义 html 字符串
 * @param {string} s
 */
function descapeHTML(s) {
  if (typeof s !== "string") {
    return "";
  }

  var ele = document.getElementById("temp-descape-html");
  if (!ele) {
    ele = document.createElement("div");
    ele.id = "temp-descape-html";
  }
  ele.innerHTML = s;
  return ele.innerText;
}

function logInfo(val) {
  var info = typeof val === "string" ? val : val.toString();
  console.log("Log: " + val);
  document.getElementById("log-info").innerHTML = "Log: " + info;
}

/* ---------- local storage ---------- */
var key = "notes";

function addItem(item, cb) {
  var list = getList();
  list.push(item);
  localStorage.setItem(key, JSON.stringify(list));
  cb && cb();
}

function updateItem(item, cb) {
  var list = getList();
  for (var i = 0; i < list.length; i++) {
    var it = list[i];
    if (it.id == item.id) {
      var date = new Date();
      list[i] = {
        id: item.id,
        val: item.val,
        time: date.getTime(),
        datetime: date.format(),
      };
      break;
    }
  }
  localStorage.setItem(key, JSON.stringify(list));
  cb && cb();
}

function removeItem(id, cb) {
  var list = getList();
  var index = -1;
  for (var i = 0; i < list.length; i++) {
    var it = list[i];
    if (it.id == id) {
      index = i;
      break;
    }
  }
  list.splice(index, 1);
  localStorage.setItem(key, JSON.stringify(list));
  cb && cb();
}

function getList(cb) {
  var list = JSON.parse(localStorage.getItem(key)) || [];
  cb && cb(list);
  return list;
}

function getItem(id, cb) {
  var list = getList();
  for (var i = 0; i < list.length; i++) {
    var it = list[i];
    if (it.id == id) {
      cb && cb(it);
      break;
    }
  }
}

/* ---------- 数据库 ---------- */
var indexedDBObj = indexedDB || webkitIndexedDB || mozIndexedDB || null;
// if (indexedDBObj) {
//   alert('支持');
// } else {
//   alert('不支持');
// }

var databaseName = "notesDB";
var indexName = "notesIndex";

var request = indexedDBObj.open(databaseName, 1);
var db;

request.onsuccess = function () {
  db = request.result;
  logInfo("数据库打开成功");
  onDBLoad();
};

request.onerror = function (err) {
  logInfo("数据库打开报错: " + err);
};

// 创建 表
request.onupgradeneeded = function (event) {
  db = event.target.result;
  var objectStore;
  if (!db.objectStoreNames.contains(indexName)) {
    objectStore = db.createObjectStore(indexName, { keyPath: "id" });
    objectStore.createIndex("val", "val", { unique: false });
    objectStore.createIndex("time", "time", { unique: false });
    objectStore.createIndex("datetime", "datetime", { unique: false });
  }
  // { id: 1, val: 1, time: Date.now(), datetime: 'datetime' }
};

/**
 * 数据库增加项
 * @param item
 * @param cb
 */
function add(item, cb) {
  var request = db
    .transaction([indexName], "readwrite")
    .objectStore(indexName)
    // .add({ id: 1, name: '张三', age: 24, email: 'zhangsan@example.com' })
    .add(item);

  request.onsuccess = function () {
    cb && cb();
  };

  request.onerror = function () {
    logInfo("数据写入失败");
  };
}

/**
 * 删除数据
 */
function remove(id, cb) {
  var request = db
    .transaction([indexName], "readwrite")
    .objectStore(indexName)
    .delete(id);

  request.onsuccess = function () {
    cb && cb();
  };
}

/**
 * 更新数据
 * @param item
 * @param cb
 */
function update(item, cb) {
  var request = db
    .transaction([indexName], "readwrite")
    .objectStore(indexName)
    .put(item);

  request.onsuccess = function () {
    cb && cb();
  };

  request.onerror = function () {
    logInfo("数据更新失败");
  };
}

/**
 * 数据库 读取单个数据
 * @param id
 * @param cb
 */
function read(id, cb) {
  var objectStore = db.transaction(indexName).objectStore(indexName);
  var request = objectStore.get(id);

  request.onerror = function () {
    logInfo("事务失败");
  };

  request.onsuccess = function () {
    if (request.result) {
      cb && cb(request.result);
    } else {
      logInfo("未获得数据记录");
    }
  };
}

/**
 * 读取所有数据
 * @param cb
 */
function readAll(cb) {
  var objectStore = db.transaction(indexName).objectStore(indexName);

  var arr = [];
  objectStore.openCursor().onsuccess = function (event) {
    var cursor = event.target.result;

    if (cursor) {
      arr.push(cursor.value);
      cursor.continue();
    } else {
      cb && cb(arr);
      // logInfo('没有更多数据了！');
    }
  };
}

/**
 * 查找某个值
 * @param key
 * @param val
 * @param cb
 */
function findOne(key, val, cb) {
  var transaction = db.transaction([indexName], "readonly");
  var store = transaction.objectStore(indexName);
  var index = store.index(key);
  var request = index.get(val);

  request.onsuccess = function (e) {
    var result = e.target.result;
    if (result) {
      cb && cb(result);
    }
  };
}

// 语雀
function YuqueRequest({ userAgent, token }) {
  this.userAgent = userAgent || "LP";
  this.token = token;
  this.headers = {
    "Content-Type": "application/json",
    "User-Agent": this.userAgent,
    "X-Auth-Token": this.token,
  };
}
YuqueRequest.prototype.getApi = function (api) {
  if (api && !api.startsWith("/")) {
    api = "/" + api;
  }
  return (
    "https://caiyansong.com/api/v2/repos/yansong-s4rmt/lp/docs" + (api || "")
  );
};
YuqueRequest.prototype.request = function (api, type, data, cb) {
  var xhr = new XMLHttpRequest();
  // 请求类型
  xhr.open(type || "post", this.getApi(api));
  // 设置请求头
  xhr.setRequestHeader("Content-Type", this.headers["Content-Type"]);
  xhr.setRequestHeader("User-Agent", this.headers["User-Agent"]);
  xhr.setRequestHeader("X-Auth-Token", this.headers["X-Auth-Token"]);
  // 发起请求
  xhr.send(JSON.stringify(data)); // form 不需要再修改格式
  // 监听状态
  xhr.onreadystatechange = function () {
    // 数据加载成功
    if (xhr.readyState === 4) {
      // 响应
      cb(JSON.parse(xhr.response));
    }
  };
};
YuqueRequest.prototype.get = function (slug, cb) {
  this.request(slug || "/note?row=1", "GET", null, function (res) {
    cb(res);
  });
};
YuqueRequest.prototype.getList = function (cb) {
  this.request(null, "GET", null, function (res) {
    cb(res);
  });
};
YuqueRequest.prototype.post = function (data, cb) {
  // title	标题
  // slug	文档 Slug
  // public	0 - 私密，1 - 公开
  // format	支持 markdown、lake、html，默认为 markdown
  // body	format 描述的正文内容，最大允许 5MB
  this.request(
    null,
    "POST",
    Object.assign(
      {
        title: "Note",
        slug: "note",
        public: 0,
        format: "markdown",
        body: "",
      },
      data
    ),
    function (res) {
      cb(res);
    }
  );
};
YuqueRequest.prototype.put = function (data, id) {
  // title	标题
  // slug	文档 Slug
  // public	0 - 私密，1 - 公开
  // body	已发布的正文 Markdown，这个字段必传
  // _force_asl	如果在页面编辑过文档，那这时文档会转成 lake 格式，如果再用 markdown 无法进行更新，这是需要添加 _force_asl = 1 来确保内容的正确转换。
  this.request(
    "/" + id,
    "PUT",
    Object.assign(
      {
        title: "Note",
        slug: "note",
        public: 0,
        body: "",
        _force_asl: 1,
      },
      data
    ),
    function (res) {
      cb(res);
    }
  );
};

var token = "jUrEGFwQzxypup0uDJRK2LyJOQcMeLVktQpCHpWm";
var defaultId = 63815700;
var request = new YuqueRequest({
  token: token,
});

function getList() {
  request.getList(function (res) {
    console.log("get: ", res);
  });
}

function putStr(val, title, id, slug) {
  request.get(slug, function (res) {
    if (!res) {
      return;
    }
    var data = res.data;
    var body = data.body;
    request.put(
      {
        body: body + "\n\n" + val,
        title: title,
        slug: slug || title.toLowerCase().replace(/ /g, ""),
      },
      id || defaultId,
      function (res) {
        console.log("put end: ", res);
      }
    );
  });
}

function postStr(val, title) {
  request.post(
    {
      body: val,
      title: title,
      slug: title.toLowerCase().replace(/ /g, ""),
    },
    function (res) {
      console.log("post end: ", res);
    }
  );
}

function checkAPostStr(val, title) {
  request.getList(function (res) {
    if (res && res.data && res.data.length > 0) {
      var list = res.data;
      var lastItem = list[0];
      request.get(lastItem.slug, function (res) {
        if (!(res && res.data)) {
          return;
        }
        var body = res.data.body;
        if (val === body) {
          return;
        }
        request.postStr(val, title);
      });
    }
  });
}
