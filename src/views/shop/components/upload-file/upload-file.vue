<template>
  <div class="upload-file">
    <Upload
      ref="upload"
      :show-upload-list="false"
      :multiple="multiple"
      :before-upload="onHandleBeforeUpload"
      type="drag"
      action
    >
      <slot>
        <div class="image-select-dragable-dragable-add-content">
          <i class="iconfont icon-ios-add"></i>
        </div>
      </slot>
    </Upload>
  </div>
</template>
<script>
export default {
  props: {
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
    maxSize: {
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
        this.$Message.error("文件大小不能超过" + this.maxSize + "M！");
      }
    }
  },
  data() {
    return {};
  },
  methods: {
    /**
     *    上传文件之前处理文件
     *    file 本次选择的文件
     */
    onHandleBeforeUpload(file) {
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
      } else if (this.maxSize && this.maxSize * 1024 < file.size) {
        this.onHandleMaxSize();
      } else {
        this.$emit("input", file);
      }
      return false;
    }
  }
};
</script>
<style lang="less" scoped>
.upload-file {
  /deep/.ivu-upload-dragOver {
    border-width: 1px;
  }
  .image-select-dragable-dragable-add-content {
    height: 80px;
    width: 80px;
    line-height: 80px;
    .iconfont {
      font-size: 46px;
    }
  }
}
</style>
