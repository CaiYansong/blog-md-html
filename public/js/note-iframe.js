var noteContainer=document.getElementById("note-container");function logInfo(a){noteContainer.innerText=noteContainer.innerText+"\nLog: "+a}logInfo("note-iframe init");// message start
var targetUrl="https://caiyansong.gitee.io";window.addEventListener("message",function(a){return logInfo("message",a.data.type+"---"+a.data.str),a.origin===targetUrl?a.data&&"post"===a.data.type?void checkAPostYuqueStr(a.data.str,a.data.title||""+Date.now()):a.data&&"get"===a.data.type?void getYuque(a.data.slug,function(a){postMessageToMain(a)}):a.data&&"getList"===a.data.type?void getYuqueList(function(a){postMessageToMain(a)}):void 0:void 0});function postMessageToMain(a){!a||window.parent&&window.parent.postMessage&&window.parent.postMessage(a,targetUrl)}// message end
// 语雀
function YuqueRequest({userAgent:a,token:b}){this.userAgent=a||"LP",this.token=b,this.headers={"Content-Type":"application/json","User-Agent":this.userAgent,"X-Auth-Token":this.token}}YuqueRequest.prototype.getApi=function(a){return a&&!a.startsWith("/")&&(a="/"+a),"https://caiyansong.com/api/v2/repos/yansong-s4rmt/lp/docs"+(a||"")},YuqueRequest.prototype.request=function(a,b,c,d){var e=new XMLHttpRequest;// 请求类型
// 设置请求头
// 发起请求
// form 不需要再修改格式
// 监听状态
e.open(b||"post",this.getApi(a)),e.setRequestHeader("Content-Type",this.headers["Content-Type"]),e.setRequestHeader("User-Agent",this.headers["User-Agent"]),e.setRequestHeader("X-Auth-Token",this.headers["X-Auth-Token"]),e.send(JSON.stringify(c)),e.onreadystatechange=function(){4===e.readyState&&d&&d(JSON.parse(e.response))}},YuqueRequest.prototype.get=function(a,b){this.request(a||"/note?row=1","GET",null,function(a){b&&b(a)})},YuqueRequest.prototype.getList=function(a){this.request(null,"GET",null,function(b){a&&a(b)})},YuqueRequest.prototype.post=function(a,b){// title	标题
// slug	文档 Slug
// public	0 - 私密，1 - 公开
// format	支持 markdown、lake、html，默认为 markdown
// body	format 描述的正文内容，最大允许 5MB
this.request(null,"POST",Object.assign({title:"Note",slug:"note",public:0,format:"markdown",body:""},a),function(a){b&&b(a)})},YuqueRequest.prototype.put=function(a,b){// title	标题
// slug	文档 Slug
// public	0 - 私密，1 - 公开
// body	已发布的正文 Markdown，这个字段必传
// _force_asl	如果在页面编辑过文档，那这时文档会转成 lake 格式，如果再用 markdown 无法进行更新，这是需要添加 _force_asl = 1 来确保内容的正确转换。
this.request("/"+b,"PUT",Object.assign({title:"Note",slug:"note",public:0,body:"",_force_asl:1},a),function(a){cb&&cb(a)})};var token="jUrEGFwQzxypup0uDJRK2LyJOQcMeLVktQpCHpWm",defaultId=63815700,request=new YuqueRequest({token:"jUrEGFwQzxypup0uDJRK2LyJOQcMeLVktQpCHpWm"});function getYuque(a,b){return b?void request.get(b,function(b){a&&a(b)}):void request.getList(function(b){b&&0<b.length?request.get(b[0].slug,function(b){a&&a(b)}):a&&a("")})}function getYuqueList(a){request.getList(function(b){a&&a(b)})}function putYuqueStr(a,b,c,d){request.get(d,function(e){if(e){var f=e.data,g=f.body;request.put({body:g+"\n\n"+a,title:b,slug:d||b.toLowerCase().replace(/ /g,"")},c||defaultId,function(a){console.log("put end: ",a)})}})}function postYuqueStr(a,b){request.post({body:a,title:b,slug:b.toLowerCase().replace(/ /g,"")},function(a){console.log("post end: ",a)})}function checkAPostYuqueStr(a,b){getYuqueList(function(c){if(console.log("getList end: ",c),c&&c.data&&0<c.data.length){var d=null,e=c.data;for(let a=0;a<e.length;a++){var f=e[a];f&&f.slug===b.toLowerCase().replace(/ /g,"")&&(d=e[a])}d?putYuqueStr(a,b,d.id,d.slug):postYuqueStr(a,b)}})}