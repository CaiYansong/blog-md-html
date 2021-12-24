var exec = require("child_process").exec;

function runCMD(cmd) {
  return new Promise((resolve, rejects) => {
    exec(cmd, function (error, stdout, stderr) {
      if (error) {
        console.log("runCMD Error: ", error);
        rejects(error);
        return;
      }
      resolve(stdout, stderr);
    });
  });
}

module.exports = runCMD;
