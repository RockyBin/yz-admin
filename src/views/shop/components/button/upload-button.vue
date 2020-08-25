<template>
  <div :class="type == 'picture' && 'upload-wrapper'">
    <span v-if="type != 'picture' && (file || url)" class="file-name">{{ file ? file.name : url }}</span>
    <Button class="upload-btn" :type="btnType" @click="$refs.upload.click()">
      <template v-if="type == 'picture'">
        <img v-if="preview || url" :src="preview || url" alt />
        <Icon v-else type="md-add" size="16" />
      </template>
      <span v-else>{{file || url ? '重新上传' : '上传'}}</span>
    </Button>
    <input ref="upload" type="file" hidden @change="fileSelected" />
    <Icon
      v-if="type == 'picture' && (preview || url)"
      type="md-close-circle"
      size="18"
      @click="deleteImg"
    />
  </div>
</template>
<script>
export default {
  props: ["type", "url"],
  data() {
    return {
      preview: "",
      file: null
    };
  },
  computed: {
    btnType() {
      if (this.type == "picture") {
        if (this.preview || this.url) {
          return "default";
        } else {
          return "dashed";
        }
      } else {
        return "primary";
      }
    }
  },
  watch: {
    url(value) {
      if (!value) this.file = "";
    }
  },
  methods: {
    fileSelected() {
      if (this.$refs.upload.files[0]) {
        this.file = this.$refs.upload.files[0];
        if (this.type == "picture") {
          this.preview = URL.createObjectURL(this.file);
        }
        this.$emit("fileSelected", this.file);
      }
    },
    deleteImg() {
      this.preview = "";
      this.$emit("fileSelected", null);
    }
  }
};
</script>
<style lang="less" scoped>
.upload-wrapper {
  width: 44px;
  height: 44px;
  position: relative;
  .upload-btn {
    width: 44px;
    height: 44px;
    padding: 0;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  /deep/.ivu-icon-md-close-circle {
    display: none;
    position: absolute;
    right: -9px;
    top: -9px;
    cursor: pointer;
    background: white;
    border-radius: 50%;
  }
  &:hover {
    /deep/.ivu-icon-md-close-circle {
      display: inline-block;
    }
  }
}
.file-name {
  margin-right: 10px;
}
</style>