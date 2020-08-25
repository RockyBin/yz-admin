/* eslint-disable */
// 扩展百度编辑器
UE.registerUI('youzhanimage', function (editor, uiName) {
  // 是否禁用
  if (editor.hideImageSelector) return;
  editor.registerCommand(uiName, {
    execCommand: function () {

    }
  });
  //创建一个button
  var btn = new UE.ui.Button({
    //按钮的名字
    name: uiName,
    //提示
    title: "选择图片",
    //添加额外样式，指定icon图标，这里默认使用一个重复的icon
    cssRules: 'background-position: -380px 0;',
    //点击时执行的命令
    onclick: function () {
      //这里可以不用执行命令,做你自己的操作也可
      editor.execCommand(uiName);
    }
  });
  //因为你是添加button,所以需要返回这个button
  return btn;
}, 56);