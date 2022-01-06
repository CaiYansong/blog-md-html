var noteContainer = document.getElementById("note-container");
function logInfo(str) {
  noteContainer.innerText = noteContainer.innerText + "\n" + "Log: " + str;
}

logInfo("note-iframe init");

// message start
var targetUrl = "https://caiyansong.gitee.io";
window.addEventListener("message", function (e) {
  console.log(e.data);
  logInfo("message", e.data.type + "---" + e.data.str);
  if (e.origin !== targetUrl) {
    // 验证消息来源地址
    return;
  }
  if (e.data && e.data.type === "post") {
    checkAPostYuqueStr(e.data.str, e.data.title || "" + Date.now());
    return;
  }
  if (e.data && e.data.type === "get") {
    getYuque(e.data.slug, function (res) {
      postMessageToMain(res);
    });
    return;
  }
  if (e.data && e.data.type === "getList") {
    getYuqueList(function (res) {
      postMessageToMain(res);
    });
    return;
  }
});

function postMessageToMain(data) {
  if (!data) {
    return;
  }
  if (window.parent && window.parent.postMessage) {
    window.parent.postMessage(data, targetUrl);
  }
}

window.onload = function () {
  postMessageToMain({
    type: "saveList",
  });
};
// message end

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
      cb && cb(JSON.parse(xhr.response));
    }
  };
};
YuqueRequest.prototype.get = function (slug, cb) {
  this.request(slug || "/note?row=1", "GET", null, function (res) {
    cb && cb(res);
  });
};
YuqueRequest.prototype.getList = function (cb) {
  this.request(null, "GET", null, function (res) {
    cb && cb(res);
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
      cb && cb(res);
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
      cb && cb(res);
    }
  );
};

var token = "jUrEGFwQzxypup0uDJRK2LyJOQcMeLVktQpCHpWm";
var defaultId = 63815700;
var request = new YuqueRequest({
  token: token,
});

function getYuque(cb, slug) {
  if (slug) {
    request.get(slug, function (res) {
      cb && cb(res);
    });
    return;
  }
  request.getList(function (res) {
    if (res && res.length > 0) {
      request.get(res[0].slug, function (res) {
        cb && cb(res);
      });
    } else {
      cb && cb("");
    }
  });
}

function getYuqueList(cb) {
  request.getList(function (res) {
    cb && cb(res);
  });
}

function putYuqueStr(val, title, id, slug) {
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

function postYuqueStr(val, title) {
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

function checkAPostYuqueStr(val, title) {
  request.getList(function (res) {
    console.log("getList end: ", res);
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
        postYuqueStr(val, title);
      });
    }
  });
}
