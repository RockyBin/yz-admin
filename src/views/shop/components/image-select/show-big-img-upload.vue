<template>
  <div class="show-big-img-upload">
    <div v-if="!imgURLs.length">
      <input ref="upload" type="file" hidden :multiple="multiple" @change="fileSelected" />
      <Button
        :style="{width: imgSize, height: imgSize}"
        type="dashed"
        @click="selectFileClick"
        class="newbutton"
      >
        <Icon type="md-add" color="#999" size="26" />
      </Button>
    </div>
    <div
      v-else
      class="img-wrapper"
      :style="getImgWrapperStyle()"
      v-for="(url, index) in imgURLs"
      :key="index"
    >
      <img :src="formatURL(url)" alt />
      <div @click="showBigImg(index)" class="mask">
        <Icon type="ios-eye-outline" class="eyes" color="white" size="16"></Icon>
      </div>
      <div class="delete" @click="deleteImg(index)">
        <i
            class="iconfont icon-md-close"
            style="color:#fff;"
        ></i>
      </div>
      <!--<Icon type="md-close-circle" size="16" color="#333" class="delete" @click="deleteImg(index)" />-->
    </div>
    <Modal class="big-img-modal" v-model="isShowBigImg" fullscreen footer-hide>
      <img :style="{width: bigImgSize}" :src="formatURL(currentImg)" alt />
    </Modal>
    <FilesSelector v-model="showFilesSelector" @onSelected="onFilesSelected"></FilesSelector>
  </div>
</template>
<script>
import FilesSelector from "@/components/files/files";
export default {
  components: { FilesSelector },
  props: {
    value: {
      type: [Array, String],
      default() {
        return [];
      }
    },
    multiple: {
      type: Boolean,
      default: false
    },
    format: {
      type: Array,
      default() {
        return ["jpg", "png", "jpeg"];
      }
    },
    maxFileSize: {
      type: Number,
      default: 0
    },
    onHandleFormatError: {
      type: Function,
      default() {
        this.$Message.error("文件格式不正确！");
      }
    },
    onHandleMaxSize: {
      type: Function,
      default() {
        this.$Message.error("文件大小不能超过" + this.maxFileSize + "M！");
      }
    },
    InitImgURLs: {
      type: [Array, String],
      default() {
        return [];
      }
    },
    imgSize: {
      type: String,
      default: "30px"
    },
    imgHeight: {
      type: String,
      default: ""
    },
    bigImgSize: {
      type: String,
      default: "auto"
    },
    useFilesSelector: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isShowBigImg: false,
      currentImg: "",
      imgURLs: [],
      files: [],
      showFilesSelector: false
    };
  },
  watch: {
    InitImgURLs: {
      handler(val) {
        if (Array.isArray(val)) {
          this.imgURLs = [...val];
        } else if (val) {
          this.imgURLs = [val];
        }
        this.$emit("input", this.imgURLs);
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    getImgWrapperStyle() {
      let height = this.imgHeight ? this.imgHeight : this.imgSize;
      return {
        width:
          Number(this.imgSize.substring(0, this.imgSize.length - 2)) + 2 + "px",
        height: Number(height.substring(0, height.length - 2)) + 2 + "px"
      };
    },
    getImageStyle() {
      let height = this.imgHeight ? this.imgHeight : this.imgSize;
      return { width: this.imgSize, height: height };
    },
    formatURL(url) {
      if (url=="images/zhiying_logo.png") {
        return url;
      }
      var prefix = this.$store.state.siteComdataPath;
      return /^(http|blob)/.test(url) || url.indexOf(prefix) == 0
        ? url
        : prefix + url;
    },
    selectFileClick() {
      if (this.useFilesSelector) this.showFilesSelector = true;
      else this.$refs.upload.click();
    },
    fileSelected() {
      this.$refs.upload.blur();
      if (this.$refs.upload.files.length) {
        this.files = [...this.$refs.upload.files].filter(file => {
          return this.checkFile(file);
        });
        this.imgURLs = this.files.map(file => {
          return URL.createObjectURL(file);
        });
        this.$emit("input", this.files);
      }
    },
    onFilesSelected(files) {
      if (files.length > 0) {
        this.imgURLs = files;
        this.$emit("input", files);
      }
    },
    showBigImg(index) {
      this.currentImg = this.imgURLs[index];
      this.isShowBigImg = true;
    },
    deleteImg(index) {
      if (/^blob/.test(this.imgURLs[index])) {
        URL.revokeObjectURL(this.imgURLs[index]);
      }
      this.imgURLs.splice(index, 1);
      this.files.splice(index, 1);
      this.$emit("input", this.files.length ? this.files : this.imgURLs);
    },
    /**
     *    上传文件之前处理文件
     *    file 本次选择的文件
     */
    checkFile(file) {
      // 获取文件类型
      let index = file.name.lastIndexOf(".");
      if (index === -1 || index + 1 === file.name.length) {
        this.$Message.error("文件格式不正确！");
        return false;
      }

      let fileType = file.name.substring(index + 1);
      // 判断是否是该类型文件或文件超出大小
      if (
        !this.format.filter(
          item => fileType.toLowerCase() === item.toLowerCase()
        ).length
      ) {
        this.onHandleFormatError();
      } else if (this.maxFileSize && this.maxFileSize * 1024 < file.size) {
        this.onHandleMaxSize();
      } else {
        return true;
      }
      return false;
    }
  }
};
</script>
<style lang="less">
.show-big-img-upload {
  line-height: 0;
  /deep/.ivu-btn-dashed {
    padding: 0;
    &:focus {
      box-shadow: none;
    }
  }
  &.has-error {
    /deep/.ivu-btn-dashed {
      border-color: #ed4014;
    }
  }
  .newbutton {
    margin-right: 16px;
  }
  .img-wrapper {
    display: inline-block;
    position: relative;
    margin-right: 16px;
    border: 1px solid #dcdee2;
    border-radius: 4px;
    &:hover {
      .delete,
      .mask {
        display: block;
      }
    }
    .delete {
      display: none;
      position: absolute;
      z-index: 2;
      top: -8px;
      right: -8px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background-color: #333;
      .icon-md-close{
        margin-top: 5px;
        position: absolute;
        top: 2px;
        font-size: 12px;
        left: 1px;
      }
    }
    .mask {
      display: none;
      position: absolute;
      height: 100%;
      width: 100%;
      line-height: 100%;
      z-index: 1;
      left: 0;
      top: 0;
      text-align: center;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.5);
      .eyes {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
    img {
      position: absolute;
      left: 50%;
      top: 50%;
      max-width: 100%;
      max-height: 100%;
      -webkit-transform: translate(-50%, -50%);
      transform: translate(-50%, -50%);
    }
  }
}
//点击查看大图弹窗样式
.big-img-modal {
  .ivu-modal-content {
    background: black;
    .ivu-modal-body {
      display: flex;
      justify-content: center;
      align-items: center;
      max-height: 100%;
      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }
  }
  .ivu-icon-ios-close:hover {
    color: white;
  }
}
</style>