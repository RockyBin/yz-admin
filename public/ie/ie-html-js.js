function getIEhtml(baseUrl) {
  document.writeln(
    "<div data-transfer='true'  class='check-browser v-transfer-dom'>"
  );
  document.writeln("<div class='ivu-modal-mask' style='z-index: 1002;'></div>");
  document.writeln("      <div class='ivu-modal-wrap' style='z-index: 1002;'>");
  document.writeln("        <div class='ivu-modal' style='width: 800px;'>");
  document.writeln("          <div class='ivu-modal-content'>");
  document.writeln("            <div class='ivu-modal-body'>");

  //  下面这部分为真实需要的弹窗部分
  //  修改调试的浏览效果可以在App.vue引入@/components/checkBrowser.vue显示修改
  //  然后复制@/components/checkBrowser.vue的内容弹窗内容到在线转换工具转成这种方式加载，注意，图片的相对路径要先转成基于<%= BASE_URL %>的绝对路径
  document.writeln("              <div class='check-browser-content'>");
  document.writeln("                <div class='check-browser-title'>");
  document.writeln("                  <i class='iconfont icon-ios-close'></i>");
  document.writeln("                  <span>浏览器版本提示</span>");
  document.writeln("                </div>");
  document.writeln("                <div class='check-browser-body'>");
  document.writeln("                  <div class='check-browser-tip'>");
  document.writeln(
    "                    <p><i style='background-image: url(" +
    baseUrl +
    "images/ie/tis.png);'></i>本平台不支持ie浏览器访问</p>"
  );
  document.writeln(
    "                    <p>为了获得最佳体验效果，推荐使用以下浏览器</p>"
  );
  document.writeln("                  </div>");
  document.writeln(
    '                  <div class="check-browser-type"  style="background-image: url(' +
    baseUrl +
    'images/ie/juxing.png);" >'
  );
  document.writeln("                    <div class='check-browser-type-item'>");
  document.writeln("                      <div");
  document.writeln(
    "                        style='background-image: url(" +
    baseUrl +
    "images/ie/diannao.png);'"
  );
  document.writeln("                      ></div>");
  document.writeln("                      <div>浏览器推荐</div>");
  document.writeln("                    </div>");
  document.writeln("                    <div class='check-browser-type-item'>");
  document.writeln("                      <div");
  document.writeln(
    "                        style='background-image: url(" +
    baseUrl +
    "images/ie/google.png);'"
  );
  document.writeln("                      ></div>");
  document.writeln("                      <div>谷歌浏览器</div>");
  document.writeln("                    </div>");
  document.writeln("                    <div class='check-browser-type-item'>");
  document.writeln("                      <div");
  document.writeln(
    "                        style='background-image: url(" +
    baseUrl +
    "images/ie/360liulanq.png);position:relative'"
  );
  document.writeln("              >");
  document.writeln("                <div style='background-image: url(" + baseUrl + "images/ie/speed.png)});position:absolute;top: -29px;right: -37px;width: 54px;height: 54px;'>");
  document.writeln("");
  document.writeln("                </div>");
  document.writeln("                      </div>");
  document.writeln("                      <div>360浏览器</div>");
  document.writeln("                    </div>");
  document.writeln("                    <div class='check-browser-type-item'>");
  document.writeln("<div");
  document.writeln("                style='background-image: url(" + baseUrl + "images/ie/QQliulanq.png)});position:relative'");
  document.writeln("              >");
  document.writeln("                <div style='background-image: url(" + baseUrl + "images/ie/speed.png)});position:absolute;top: -29px;right: -37px;width: 54px;height: 54px;'>");
  document.writeln("");
  document.writeln("                </div>");
  document.writeln("              </div>");
  document.writeln("                      <div>QQ浏览器</div>");
  document.writeln("                    </div>");
  document.writeln("                    <div class='check-browser-type-item'>");
  document.writeln("                      <div");
  document.writeln(
    "                        style='background-image: url(" +
    baseUrl +
    "images/ie/sougouliulanq.png);position:relative'"
  );
  document.writeln("              >");
  document.writeln("                <div style='background-image: url(" + baseUrl + "images/ie/speed.png)});position:absolute;top: -29px;right: -37px;width: 54px;height: 54px;'>");
  document.writeln("");
  document.writeln("                </div>");
  document.writeln("                      </div>");
  document.writeln("                      <div>搜狗浏览器</div>");
  document.writeln("                    </div>");
  document.writeln("                  </div>");
  document.writeln("                </div>");
  document.writeln("              </div>");
  //
  // 内容部分结束

  document.writeln("            </div>");
  document.writeln("          </div>");
  document.writeln("        </div>");
  document.writeln("      </div>");
  document.writeln("    </div>");
}
// 用于App.vue文件判断是否是ie
window.isIE = !!window.ActiveXObject || "ActiveXObject" in window;

window.isIE &&
  setTimeout(function () {
    function getClass(obj, sClass) {
      // 准备一个数组 做为函数调用的结果返回
      var aResult = [];
      // 如果docuemnt对象中有getElementsByClassName这个方法 我们就用浏览器提供的因为浏览器提供的效率更高;
      if ("getElementsByClassName" in document) {
        aResult = obj.getElementsByClassName(sClass);
      }
      // 如果浏览器没有 那么我们自己来实现 总共4步
      else {
        //1.获取obj下所有的元素
        var aEle = obj.getElementsByTagName("*");
        //2.用for循环来检查每个子元素
        for (var i = 0; i < aEle.length; i++) {
          // 3.得到每个子元素className值 这个值是字符串
          var str = aEle[i].className;
          // 4.如果该元素的class属性有我们需要的class 那么把它放进aResult
          if (str.indexOf(sClass) != -1) {
            aResult.push(aEle[i]);
            break;
          }
        }
      }
      return aResult;
    }
    getClass(document.body, "check-browser-title")[0].getElementsByTagName(
      "i"
    )[0].onclick = function () {
      var ele = getClass(document.body, "check-browser")[0];
      ele.parentNode.removeChild(ele);
    };
  }, 0);
