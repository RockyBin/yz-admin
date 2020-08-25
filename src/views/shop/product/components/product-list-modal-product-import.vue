<template>
  <div>
    <Modal
      class="modal-import"
      v-model="isShow"
      title="批量导入商品"
      width="495"
      :footer-hide="true"
      :mask-closable="false"
    >
      <div class="modal-import-content">
        <div class="modal-import-header">
          <div :class="{ 'modal-import-header-active': activeIndex === 0 }">
            1、上传商品图片
          </div>
          <div :class="{ 'modal-import-header-active': activeIndex === 1 }">
            2、上传商品信息
          </div>
        </div>
        <div>
          <div
            class="modal-import-select"
            v-if="
              (activeIndex === 0 &&
                !imagesSuccessStatus &&
                imagesFiles.length < 600) ||
                (activeIndex === 1 && !xlsFiles)
            "
          >
            <Button type="primary" @click="onSelectFileClick">{{
              ["选择图片", "选择商品文件"][activeIndex]
            }}</Button>
            <span v-if="activeIndex === 0 && imagesFiles.length && !formatError"
              >（已选择了{{ imagesFiles.length }}张图片）</span
            >
            <span class="modal-import-error" v-if="formatError"
              >上传的文件格式不正确，请重新选择</span
            >
          </div>
          <div
            class="modal-import-success"
            v-if="activeIndex === 0 && imagesSuccessStatus"
          >
            <div class="iconfont icon-md-checkmark-circle"></div>
            <div class="modal-import-success-text">
              <div>已成功上传{{ imagesFiles.length }}张图片！</div>
              <div>
                请点击下一步继续上传商品信息；如需重新选择图片，<br />清空数据重新选择。
              </div>
            </div>
          </div>
          <div class="modal-import-file" v-if="showFiles.length">
            <span>{{ showFiles.map(n => n.name).join(";") }}</span>
            <i
              class="ivu-icon ivu-icon-ios-close-circle ivu-input-icon"
              @click="deleteFile"
            ></i>
          </div>
          <div class="modal-import-file-error" v-if="maxError">
            最多只能选择600张图片。
          </div>
          <div class="modal-import-tip">
            {{
              activeIndex === 0
                ? "*推荐上传尺寸800*800以上的图片，图片格式支持jpg、png，一次最多支持上传600张图片。"
                : "支持xls格式文件，一次最多上传100个SPU商品"
            }}
          </div>
          <div v-if="activeIndex === 1">
            <Form
              :model="formValidate"
              ref="formValidate"
              :rules="ruleValidate"
              :label-width="74"
            >
              <FormItem label="商品类型：" prop="virtual">
                <RadioGroup v-model="formValidate.virtual">
                  <Radio :label="2">实物商品</Radio>
                  <Radio :label="1">虚拟商品</Radio>
                </RadioGroup>
              </FormItem>
              <FormItem label="商品状态：" prop="status">
                <RadioGroup v-model="formValidate.status">
                  <Radio :label="1">上架</Radio>
                  <Radio :label="0">下架</Radio>
                </RadioGroup>
              </FormItem>
              <FormItem label="商品规格：" prop="standard">
                <RadioGroup v-model="formValidate.standard">
                  <Radio :label="1">单规格</Radio>
                  <Radio :label="2">多规格</Radio>
                </RadioGroup>
              </FormItem>
            </Form>
          </div>
          <input
            ref="file"
            type="file"
            :accept="activeIndex === 0 ? 'image/*' : false"
            :multiple="activeIndex === 0"
            style="display: none;"
            @change="onChange"
          />
        </div>
      </div>
      <div
        class="ivu-modal-footer"
        v-if="activeIndex === 1 || imagesFiles.length"
      >
        <Button ghost v-if="activeIndex === 1" @click="activeIndex = 0">
          <Icon type="ios-arrow-round-back" />
          <span>上一步</span>
        </Button>
        <Button
          ghost
          v-if="activeIndex === 0 && imagesSuccessStatus"
          @click="activeIndex = 1"
        >
          <span>下一步</span>
          <Icon type="ios-arrow-round-forward" />
        </Button>
        <Button
          type="primary"
          size="large"
          @click="onConfirmClick"
          v-if="activeIndex === 0 && !imagesSuccessStatus"
          >已选完图，立即上传</Button
        >
        <Button
          v-if="activeIndex === 1 && xlsFiles"
          type="primary"
          size="large"
          @click="onFileConfirmClick"
          >立即上传</Button
        >
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
      <div class="modal-loading-progress">
        <Progress
          v-if="activeIndex === 0"
          :percent="imageProgress"
          :stroke-width="5"
          status="active"
        >
          <span>{{ imageProgress }}%</span>
        </Progress>
        <div style="margin-top:10px;" v-if="activeIndex === 0">
          数据正在处理中，请耐心等候，切勿中断...
        </div>
        <Icon
          v-if="activeIndex === 1"
          type="ios-loading"
          size="32"
          class="demo-spin-icon-load"
        ></Icon>
        <div v-if="activeIndex === 1" style="margin-top:20px;">
          数据正在处理中，大约需要10分钟，请稍等...
        </div>
      </div>
    </Modal>
    <Modal
      width="341"
      class="modal-complete"
      :footer-hide="true"
      v-model="complete"
      :mask-closable="false"
      @on-cancel="onCompleteCloseClick"
    >
      <div :class="{ circle: true, success: success }">
        <i
          class="iconfont"
          :class="success ? 'icon-md-checkmark' : 'icon-md-close'"
        ></i>
      </div>
      <div style="height: 36px;">
        <div v-if="success && !(error_data.count > 100)">
          {{
            right_data_count && !error_data.count ? "全部" : ""
          }}上传成功，已上传{{ right_data_count }}个商品
        </div>
        <div v-else v-html="errorMsg"></div>
        <div
          class="error"
          v-if="success && (!right_data_count || error_data.count)"
          @click="getErrorData"
        >
          部分数据出现异常，点击下载查看
        </div>
      </div>
    </Modal>
  </div>
</template>
<script>
import commonFunction from "@/views/shop/components/common-function.js";
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      activeIndex: 0,
      isShow: false,
      imagesFiles: [],
      xlsFiles: null,
      formatError: false,
      maxError: false,
      sizeError: false,
      processing: false,
      imageProgress: 0,
      imagesSuccessStatus: false,
      complete: false,
      success: false,
      errorMsg: "",
      error_data: null,
      right_data_count: 0,
      formValidate: {
        virtual: null,
        status: null,
        standard: null
      },
      ruleValidate: {
        virtual: [
          {
            validator: (rule, value, callback) => {
              if (value !== null) {
                return callback();
              }
              return callback(new Error("请选择商品类型"));
            }
          }
        ],
        status: [
          {
            validator: (rule, value, callback) => {
              if (value !== null) {
                return callback();
              }
              return callback(new Error("请选择商品状态"));
            }
          }
        ],
        standard: [
          {
            validator: (rule, value, callback) => {
              if (value !== null) {
                return callback();
              }
              return callback(new Error("请选择商品规格"));
            }
          }
        ]
      }
    };
  },
  watch: {
    value(val) {
      if (this.isShow != val) {
        this.isShow = val;
      }
      if (val) {
        this.activeIndex = 0;
        this.formatError = false;
        this.maxError = false;
        this.sizeError = false;
        this.processing = false;
        this.imageProgress = 0;
        this.complete = false;
        this.success = false;
        this.error_data = null;
        this.right_data_count = 0;
        this.imagesSuccessStatus = false;
        this.xlsFiles = null;
        this.imagesFiles = [];
        this.formValidate = {
          virtual: null,
          status: null,
          standard: null
        };
      }
    },
    isShow(val) {
      if (this.value != val) {
        this.$emit("input", val);
      }
    }
  },
  computed: {
    showFiles() {
      if (this.activeIndex === 0) {
        return this.imagesFiles;
      }
      return this.xlsFiles ? [this.xlsFiles] : [];
    }
  },
  methods: {
    onCompleteCloseClick() { 
      this.isShow = false;
      if (this.right_data_count) {
        this.$emit("refresh");
      }
    },
    /**
     * 确定上传
     */
    onConfirmClick() {
      this.processing = true;
      this.formatError = false;
      this.maxError = false;
      this.imageProgress = 0;
      let totalSize = 0;
      let uploadSize = 0;
      this.imagesFiles.forEach(n => {
        totalSize += n.size;
      });
      this.uploadImagesFile(0, uploadSize, totalSize);
    },
    uploadImagesFile(index, uploadSize, totalSize) {
      let file = this.imagesFiles[index];
      let formData = new FormData();
      formData.append("myimage", file);
      formData.append("name", file.name);
      this.$httpUpload(
        "/shop/admin/product/import/uploadImg",
        formData,
        res => {
          if (res.code === 200) {
            index++;
            uploadSize += file.size;
            if (index < this.imagesFiles.length) {
              this.uploadImagesFile(index, uploadSize, totalSize);
            } else {
              this.imagesSuccessStatus = true;
              this.processing = false;
            }
          } else {
            this.processing = false;
            this.$Message.error(res.msg);
          }
        },
        {
          onUploadProgress: progressEvent => {
            let progress = Math.floor(
              (((progressEvent.loaded / progressEvent.total) * file.size +
                uploadSize) /
                totalSize) *
                100
            );
            this.imageProgress = progress;
          }
        }
      );
    },
    /**
     * 最终上传确定
     */
    onFileConfirmClick() {
      this.$refs.formValidate.validate(valid => {
        if (valid) {
          this.uploadXslFiles();
        }
      })
    },
    uploadXslFiles() {
      this.processing = true;
      let formData = new FormData();
      formData.append("myfile", this.xlsFiles);
      formData.append("standard", this.formValidate.standard);
      formData.append("status", this.formValidate.status);
      formData.append("virtual", this.formValidate.virtual);
      this.$httpUpload("/shop/admin/product/import/xlsx", formData, res => {
        this.processing = false;
        if (res.code === 200) {
          this.success = true;
          this.right_data_count = res.data.success.num;
          this.error_data = res.data.fail || {};
          this.complete = true;
        } else if (res.code === 500) {
          this.errorMsg = res.msg;
          this.success = false;
          this.complete = true;
        } else {
          this.$Message.error(res.msg);
        }
      });
    },
    /**
     * 删除文件
     */
    deleteFile() {
      if (this.activeIndex === 0) {
        this.maxError = false;
        this.formatError = false;
        this.imagesSuccessStatus = false;
        this.imagesFiles = [];
      } else {
        this.xlsFiles = null;
      }
    },
    /**
     * 点击选择文件
     */
    onSelectFileClick() {
      this.$refs.file.click();
    },
    /**
     * 选择文件
     */
    onChange(event) {
      let files = [].slice.call(event.target.files);
      this.formatError = false;
      event.target.value = "";
      // 验证文件格式
      files.forEach(n => {
        if (
          !(this.activeIndex === 0 ? /(.png|.jpg|.jpeg)/ : /\.xls(x)?$/).test(
            n.name.substring(n.name.lastIndexOf(".")).toLocaleLowerCase()
          )
        ) {
          this.formatError = true;
        }
      });
      // 所有正确才允许加进列表
      if (this.formatError) {
        return;
      }
      if (this.activeIndex === 0) {
        // 截取超出的部分
        let filesLength = files.length + this.imagesFiles.length - 600;
        this.maxError = filesLength > 0;
        if (this.maxError) {
          files = files.slice(0, files.length - filesLength);
        }
        this.imagesFiles.push(...files);
      } else {
        this.xlsFiles = files[0];
      }
    },
    /**
     * 获取格式错误的表格
     */
    getErrorData() {
      commonFunction.exportTable({}, this.http, this.error_data.url);
    },
  },
};
</script>
<style lang="less" scoped>
.modal-import {
  /deep/.ivu-modal-body {
    line-height: 1;
    padding: 0;
    .modal-import-content {
      padding: 24px;
      .modal-import-header {
        display: flex;
        height: 32px;
        margin-bottom: 20px;
        div {
          position: relative;
          width: calc(50% - 12px);
          margin-right: 12px;
          line-height: 32px;
          text-align: center;
          background-color: #f8f8f9;
          &::after {
            content: "";
            display: block;
            position: absolute;
            top: 0;
            right: -12px;
            border-style: solid;
            border-left-width: 12px;
            border-top-width: 16px;
            border-right-width: 0;
            border-bottom-width: 16px;
            border-color: transparent transparent transparent #f8f8f9;
          }
          &:last-child {
            &::before {
              content: "";
              display: block;
              position: absolute;
              top: 0;
              left: 0;
              border-style: solid;
              border-left-width: 12px;
              border-top-width: 16px;
              border-right-width: 0;
              border-bottom-width: 16px;
              border-color: transparent transparent transparent #fff;
            }
          }
          &.modal-import-header-active {
            color: #fff;
            background-color: #4a6af5;
            &::after {
              border-color: transparent transparent transparent #4a6af5;
            }
          }
        }
      }
      .modal-import-select {
        .modal-import-error {
          color: #ed4014;
        }
        & > span {
          display: inline-block;
          height: 32px;
          line-height: 32px;
          vertical-align: top;
        }
        button {
          margin-right: 10px;
          height: 32px;
          line-height: 1;
        }
      }
      .modal-import-file-error {
        font-size: 13px;
        line-height: 17px;
        margin: 10px 0;
        color: #ed4014;
      }
      .modal-import-success {
        display: flex;
        margin-bottom: 20px;
        .iconfont {
          width: 48px;
          height: 48px;
          line-height: 48px;
          font-size: 48px;
          color: #19be6b;
        }
        .modal-import-success-text {
          margin-left: 16px;
          div {
            &:first-child {
              padding: 8px 0 6px;
              line-height: 17px;
              font-size: 13px;
              font-weight: bold;
              color: #19be6b;
            }
            &:last-child {
              line-height: 16px;
            }
          }
        }
      }
      .modal-import-file {
        margin-top: 14px;
        height: 32px;
        line-height: 32px;
        border-radius: 4px;
        color: #657180;
        background-color: #f5f6f7;
        position: relative;
        vertical-align: middle;
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
      .modal-import-tip {
        margin-top: 10px;
        color: #9ea7b4;
        line-height: 16px;
      }
    }
    .ivu-form {
      margin-top: 20px;
      .ivu-form-item {
        margin-bottom: 0 !important;
        .ivu-form-item-content {
          font-size: 0 !important;
          .ivu-radio-group {
            display: inline-block;
            font-size: 0;
            .ivu-radio-wrapper {
              margin-right: 20px;
            }
          }
          .ivu-form-item-error-tip {
            display: inline-block;
            top: auto;
            left: auto;
            padding: 0;
            line-height: 32px;
            margin-left: -4px;
          }
        }
      }
    }
    .ivu-modal-footer {
      .ivu-btn-ghost {
        padding: 0 8px;
        color: #4a6af5;
        border-color: #4a6af5;
        .ivu-icon {
          font-size: 24px;
          transform: scaleX(1.5);
          line-height: 32px;
          vertical-align: top;
          &.ivu-icon-ios-arrow-round-back {
            margin-right: 4px;
          }
          &.ivu-icon-ios-arrow-round-forward {
            margin-left: 4px;
          }
        }
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
      .modal-loading-progress {
        width: 100%;
        .ivu-progress {
          font-size: 0;
          .ivu-progress-text {
            font-size: 12px;
          }
        }
        .ivu-icon {
          color: #4a6af5;
          animation: ani-demo-spin 1s linear infinite;
        }
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
        color: #ed4014;
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
