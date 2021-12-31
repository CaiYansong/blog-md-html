const token = "jUrEGFwQzxypup0uDJRK2LyJOQcMeLVktQpCHpWm";

function getList() {
  var request = new YuqueRequest({
    token: token,
  });
  request.getList().then(function (res) {
    console.log("get: ", res);
  });
}

function putStr(val, title, id, slug) {
  var request = new YuqueRequest({
    token: token,
  });
  request.get(slug).then(function (res) {
    console.log("get: ", res);
    var data = res.data;
    var body = data.body;
    console.log({ body: `${body}\n\n${val}` });
    request
      .put(
        {
          body: `${body}\n\n${val}`,
          title: title,
          slug: slug || title.toLowerCase().replace(/ /g, ""),
        },
        id
      )
      .then(function (res) {
        console.log("put end: ", res);
      });
  });
}

function postStr(val, title) {
  var request = new YuqueRequest({
    token: token,
  });
  request
    .post({
      body: val,
      title: title,
      slug: title.toLowerCase().replace(/ /g, ""),
    })
    .then(function (res) {
      console.log("post end: ", res);
    });
}
