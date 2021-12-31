class YuqueRequest {
  constructor({ userAgent, token }) {
    this.userAgent = userAgent || "LP";
    this.token = token;
    this.headers = {
      "Content-Type": "application/json",
      "User-Agent": this.userAgent,
      "X-Auth-Token": this.token,
    };
  }
  getApi(api) {
    return `https://www.yuque.com/api/v2/repos/yansong-s4rmt/lp/docs${
      api || ""
    }`;
  }
  get(slug) {
    var _this = this;
    return new Promise(function (resolve, reject) {
      fetch(_this.getApi(slug || "/note?row=1"), {
        method: "GET",
        credentials: "omit", // include, *same-origin, omit
        headers: _this.headers,
        redirect: "follow", // manual, *follow, error
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          resolve(data);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }
  getList() {
    var _this = this;
    return new Promise(function (resolve, reject) {
      fetch(_this.getApi(), {
        method: "GET",
        credentials: "omit", // include, *same-origin, omit
        headers: _this.headers,
        redirect: "follow", // manual, *follow, error
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          resolve(data);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }
  post(data) {
    // title	标题
    // slug	文档 Slug
    // public	0 - 私密，1 - 公开
    // format	支持 markdown、lake、html，默认为 markdown
    // body	format 描述的正文内容，最大允许 5MB
    var _this = this;
    return new Promise(function (resolve, reject) {
      fetch(_this.getApi(), {
        method: "POST",
        credentials: "omit", // include, *same-origin, omit
        headers: _this.headers,
        redirect: "follow", // manual, *follow, error
        body: JSON.stringify(
          Object.assign(
            {
              title: "Note",
              slug: "note",
              public: 0,
              format: "markdown",
              body: "",
            },
            data
          )
        ), // body data type must match "Content-Type" header
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          resolve(data);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }
  put(data, id) {
    // title	标题
    // slug	文档 Slug
    // public	0 - 私密，1 - 公开
    // body	已发布的正文 Markdown，这个字段必传
    // _force_asl	如果在页面编辑过文档，那这时文档会转成 lake 格式，如果再用 markdown 无法进行更新，这是需要添加 _force_asl = 1 来确保内容的正确转换。
    var _this = this;
    return new Promise(function (resolve, reject) {
      fetch(_this.getApi(`/${id}`), {
        method: "PUT",
        credentials: "omit", // include, *same-origin, omit
        headers: _this.headers,
        redirect: "follow", // manual, *follow, error
        body: JSON.stringify(
          Object.assign(
            {
              title: "Note",
              slug: "note",
              public: 0,
              body: "",
              _force_asl: 1,
            },
            data
          )
        ), // body data type must match "Content-Type" header
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          resolve(data);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }
}
