<template>
  <div>
    <Modal
      class="modal-import"
      v-model="isShow"
      title="批量导入库存"
      width="495"
      :footer-hide="true"
      :mask-closable="false"
    >
      <div class="item">
        <div class="line">1、先下载【库存导入】模板</div>
        <div class="line indent tip">
          模板表格使用说明：商品编码不能为空，否则导入不能成功
        </div>
        <div class="line indent">
          <!-- <a class="line ivu-btn ivu-btn-primary" href="/shop/admin/product/import/mb" download="库存导入模板.xlsx"
            >下载模版</a> -->
          <Button type="primary" @click="getTemplate">下载模版</Button>
        </div>
      </div>
      <div class="item">
        <div class="line">2、上传数据</div>
        <div class="line indent">
          <div class="file-name" v-if="file">
            <span>{{ file.name }}</span>
            <i class="ivu-icon ivu-icon-ios-close-circle ivu-input-icon" @click="deleteFile"></i>
          </div>
          <Button type="primary" :loading="processing" @click="upload"
            >{{ file ? "上传" : "选择" }}文件</Button
          >
          <span class="error-text" style="margin-left:10px" v-if="formatError"
            >文件格式不正确</span
          >
          <div class="error-text" style="margin-top:5px;" v-if="sizeError"
            >上传的数据不能多于3000条</div
          >
          <input ref="file" type="file" @change="onChange" />
        </div>
        <div class="line indent tip">
          * 支持xls或xlsx格式文件，一次只能上传3000个数据
        </div>
      </div>
    </Modal>
    <Modal
      width="341"
      class="modal-loading"
      :footer-hide="true"
      v-model="processing"
      :closable="false"
      :mask-closable="false"
    >
      <Icon type="ios-loading" size="32" class="demo-spin-icon-load"></Icon>
      <div style="margin-top:20px;">数据正在处理中，大约需要3分钟</div>
      <div>请耐心等候，切勿中断...</div>
    </Modal>
    <Modal
      width="341"
      class="modal-complete"
      :footer-hide="true"
      v-model="complete"
      :mask-closable="false"
    >
      <div :class="{circle: true, success: success}">
        <i class="iconfont" :class="success?'icon-md-checkmark':'icon-md-close'"></i>
      </div>
      <div v-if="success">
        <div>上传成功，已上传{{right_data_count}}条数据</div>
        <div class="error" v-if="error_data.length" @click="getErrorData">部分数据出现异常，点击下载查看</div>
      </div>
      <div v-else>
        <div>上传失败，最多只能上传3000条数据</div>
        <div>请重新上传文件</div>
      </div>
    </Modal>
  </div>
</template>
<script>
import axios from "axios";
const CancelToken = axios.CancelToken;
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isShow: false,
      file: null,
      formatError: false,
      sizeError: false,
      processing: false,
      complete: false,
      success: false,
      error_data: [],
      right_data_count: 0
    };
  },
  watch: {
    value(val) {
      if (this.isShow != val) {
        this.isShow = val;
      }
    },
    isShow(val) {
      if (this.value != val) {
        this.$emit("input", val);
        this.resetData(1);
      }
    },
    complete(val) {
      if(!val) {
        this.resetData();
      }
    }
  },
  methods: {
    resetData(all) {
      if(all) {
        this.file = null;
        this.formatError = false;
        this.sizeError = false;
      }
      this.success = false;
      this.error_data = [];
      this.right_data_count = 0;
    },
    deleteFile() {
      this.file = null;
    },
    upload() {
      if (this.file) {
        this.processing = true;
        let formData = new FormData();
        formData.append("import_file", this.file);
        axios.post("/shop/admin/product/import", formData).then(res => {
          this.processing = false;
          this.complete = true;
          if (res.code == 200) {
            this.success = true;
            this.error_data = res.data.error_data;
            this.right_data_count = res.data.right_data_count
            if(this.right_data_count) {
              this.$emit("refresh")
            }
          } else {
            this.success = false;
            // this.$Message.error(res.msg);
            this.sizeError = true;
          }
        }).catch(err => {
          this.$Message.error(err);
        })
      } else {
        this.$refs.file.click();
      }
    },
    onChange(event) {
      console.dir(event.target)
      var file = null;
      if (event.target.files.length) {
        file = event.target.files[0];
        event.target.value = ""
      }
      if (file && /\.xls(x)?$/.test(file.name)) {
        this.file = file;
        this.formatError = false;
      } else if (file) {
        this.formatError = true;
      } else {
        this.formatError = false;
      }
    },
    getTemplate() {
      this.http({
        url: "/shop/admin/product/import/mb",
        method: "POST",
        responseType: "blob"
      }).then(res => {
        var fileName = res.headers["content-disposition"]
          .split(";")[1]
          .split("filename=")[1]
          .replace(/"/g, "");
        this.download(res.data, fileName);
      });
    },
    getErrorData() {
      this.http({
        url: "/shop/admin/product/import/error",
        method: "POST",
        data: {
          error_data: this.error_data
        },
        responseType: "blob"
      }).then(res => {
        var fileName = res.headers["content-disposition"]
          .split(";")[1]
          .split("filename=")[1]
          .replace(/"/g, "");
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
};
</script>
<style lang="less" scoped>
.modal-import {
  /deep/.ivu-modal-body {
    line-height: 1;
    padding: 17px 26px 40px;
    .item {
      color: #464c5b;
      font-size: 12px;
      &:first-child {
        margin-bottom: 20px;
      }
      .line:not(:last-child) {
        margin-bottom: 10px;
      }
      .tip {
        color: #9ea7b4;
      }
      .indent {
        padding: 0 18px;
      }
      .error-text {
        color: #ed4014;
      }
      .file-name {
        display: inline-block;
        width: 290px;
        height: 32px;
        line-height: 32px;
        border-radius: 4px;
        color: #657180;
        background-color: #f5f6f7;
        position: relative;
        vertical-align: middle;
        margin-right: 8px;
        padding-left: 10px;
        padding-right: 32px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        &:hover {
          .ivu-input-icon {
            display: block;
          }
        }
        .ivu-input-icon {
          display: none;
          top: 0;
          color: #000;
        }
      }
      a.ivu-btn {
        display: inline-block;
      }
      input[type="file"] {
        display: none;
      }
    }
  }
}
.modal-loading {
  /deep/.ivu-modal-content {
    color: #657180;
    width: 341px;
    height: 157px;
    text-align: center;
    .ivu-modal-body {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .ivu-icon {
        color: #4a6af5;
        animation: ani-demo-spin 1s linear infinite;
      }
    }
  }
}
@keyframes ani-demo-spin {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  50% {
    -webkit-transform: rotate(180deg);
    transform: rotate(180deg);
  }
  to {
    -webkit-transform: rotate(1turn);
    transform: rotate(1turn);
  }
}
.modal-complete {
  /deep/.ivu-modal-content {
    color: #657180;
    width: 341px;
    height: 186px;
    text-align: center;
    .ivu-modal-body {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .error {
        color: #ED4014;
        margin-top: 5px;
        cursor: pointer;
      }
      .circle {
        width: 54px;
        height: 54px;
        line-height: 50px;
        text-align: center;
        border: 3px solid #ed4014;
        border-radius: 50%;
        margin-bottom: 13px;
        .iconfont {
          color: #ed4014;
          font-size: 30px;
        }
        &.success {
          border: 3px solid #5cb85c;
          .iconfont {
            color: #5cb85c;
          }
        }
      }
    }
  }
}
</style>
