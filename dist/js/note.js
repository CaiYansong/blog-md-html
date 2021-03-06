var client = getUrlParam("client");
var localClient = localStorage.getItem("client");
if (client && (!localClient || localClient !== client)) {
  localStorage.setItem("client", client);
} else {
  client = localClient;
}

/* ---------- 生成用户标识 start ---------- */
var username = getUsername();
if (!username || username.indexOf(client) < 0) {
  username = (client || "note").toLowerCase() + "_" + Date.now();
  setUsername(username);
}
function setUsername(val) {
  localStorage.setItem("username-key", val);
}
function getUsername() {
  return localStorage.getItem("username-key");
}
/* ---------- 生成用户标识 end ---------- */

// notes
var noteTpl =
  '<div class="note-item"> <div class="note-content">{content}</div> <div class="note-info"> <span class="datetime">{datetime}</span> <div class="note-options"> <button class="edit-btn" data-type="edit" data-id="{id}">编辑</button> <button class="delete-btn" data-type="del" data-id="{id}">删除</button> </div> </div> </div>';

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
      if (window.confirm('确认删除？')) {
        removeNote(id, function () {
          renderNoteList();
        });
      }
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
  renderNoteList();
}

function renderNoteList(remoteSave) {
  readNotes(function (res) {
    var list = (res || []).reverse();
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
    remoteSave && list.length > 0 && postInfoToIframe(JSON.stringify(list));
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
  var item = {
    id: editId,
    val,
    time: date.getTime(),
    datetime: date.format(),
  };
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
    var res = readAll(cb);
    if (res === false) {
      getList(cb);
    }
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

/* ---------- postMessage ---------- */
logInfo("href: " + window.location.href);
var deviceInfo = undefined;
var targetUrl = "https://caiyansong.com";
// message
var noteIframeWindow = document.getElementById("note-iframe").contentWindow;

window.addEventListener("message", function (e) {
  console.log("main listener", e.origin, e, e.data);
  if (e.origin !== targetUrl) {
    // 验证消息来源地址
    return;
  }
});

function postInfoToIframe(str) {
  if (!str) {
    return;
  }
  var title = username;
  postMessageToIframe(str, (client || "unknow") + "_" + Date.now());
}

function postMessageToIframe(str, title) {
  noteIframeWindow.postMessage(
    {
      type: "post",
      str: str,
      title: title,
    },
    targetUrl
  );
  logInfo("postMessage end");
}

function getMessage() {
  noteIframeWindow.postMessage(
    {
      type: "get",
    },
    targetUrl
  );
}

/* ---------- 辅助函数 ---------- */
/**
 * 获取url的参数
 * @param {String} name
 */
function getUrlParam(name) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == name) {
      return pair[1];
    }
  }
  return "";
}

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
  var logEle = document.getElementById("log-info");
  logEle.innerText = logEle.innerText + "\n" + "Log: " + info;
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
  if (db) {
    hasIndexedDB = true;
    logInfo("数据库打开成功");
    onDBLoad();
  } else {
    hasIndexedDB = false;
  }
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
  if (!db) {
    return;
  }
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
  if (!db) {
    return;
  }
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
  if (!db) {
    return;
  }
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
  if (!db) {
    return;
  }
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
  if (!db) {
    return false;
  }
  var objectStore = db.transaction(indexName).objectStore(indexName);

  var arr = [];
  objectStore.openCursor().onsuccess = function (event) {
    var cursor = event.target.result;

    if (cursor) {
      arr.push(cursor.value);
      cursor.continue();
    } else {
      cb && cb(arr);
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
  if (!db) {
    return;
  }
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
