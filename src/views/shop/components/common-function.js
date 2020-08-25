import {Message} from "iview";

export default {
  // 监听窗口的高度变化
  watchWindowHeight() {
    let clientHeight = document.documentElement.clientHeight;
    return clientHeight
  },
  // 匹配名称
  matchName(val, data) {
    let name = ''
    data.forEach(item => {
      if (item.id === val) {
        name = item.value
      }
    })
    return name
  },
  // 导出功能
  exportTable(data, http, url) {
    return http({
      url: url,
      method: "POST",
      data: data,
      responseType: "blob"
    }).then(res => {
      if (res.error) {
        Message.error(res.msg);
        return;
      }
      var fileName = res.headers["content-disposition"]
        ? res.headers["content-disposition"]
            .split(";")[1]
            .split("filename=")[1]
            .replace(/"/g, "")
        : url.split("/").pop();
      this.download(res.data, fileName);
    });
  },
  download(data, file_name) {
    if (!data) {
      return;
    }
    let csvData = new Blob([data]);
    // IE
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(csvData, file_name);
      return;
    }
    // 非IE
    let url = window.URL.createObjectURL(csvData);
    let link = document.createElement("a");
    link.style.display = "none";
    link.href = url;
    link.setAttribute("download", file_name);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}