try {
  if (api && api.require && api.require("currentApp")) {
    function getDeviceInfo(cb) {
      var currentApp = api.require("currentApp");
      currentApp.deviceInfo(function (ret) {
        cb(ret);
      });
    }
  }
  /*
  {
    userPhoneName:,     // 字符串类型；用户设置的系统名
    systemName:,        // 字符串类型；系统名
    systemVersion:,     // 字符串类型；系统版本
    phoneModel:         // 字符串类型；设备类型
  }
  */
} catch (error) {}
