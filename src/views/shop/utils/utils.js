/**
 *
 * @param {input中图片的数据} file
 * @param {拿到经过处理的图片（base64）数据后的回调} fn
 * 支持多图片
 */
export function getImageData(file, fn) {
  if (typeof FileReader === "undefined") {
    alert("您的浏览器不支持图片上传，请升级您的浏览器");
    return false;
  }
  let images = [];
  let leng = file.length;
  for (let i = 0; i < leng; i++) {
    var reader = new FileReader();
    reader.readAsDataURL && reader.readAsDataURL(file[i]);
    reader.onload = function(e) {
      images.push(e.target.result);
      if (images.length === leng) {
        fn && fn(images);
      }
    };
  }
}
// 由一个组件，向下找到最近的指定组件
export function findComponentDownward(context, componentName) {
  const childrens = context.$children;
  let children = null;

  if (childrens.length) {
    for (const child of childrens) {
      const name = child.$options.name;

      if (name === componentName) {
        children = child;
        break;
      } else {
        children = findComponentDownward(child, componentName);
        if (children) break;
      }
    }
  }
  return children;
}
