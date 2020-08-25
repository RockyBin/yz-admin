<template>
  <div class="simple-image-select">
    <upload-file @input="onHandleBeforeUpload" :format="format" :maxSize="maxSize">
      <img v-if="valueCopy" :src="valueCopy" alt>
    </upload-file>
  </div>
</template>
<script>
import { getImageData } from "@/views/shop/utils/utils.js";
import UploadFile from "@/views/shop/components/upload-file/upload-file.vue";
export default {
  props: {
    value: {
      default() {
        return "";
      }
    },
    // 文件类型，空数组表示不限定类型
    format: {
      default: () => ["png", "jpg", "jpeg"],
      type: Array
    },
    // 最大文件大小，0表示不限制大小
    maxSize: {
      default: 0,
      type: Number
    }
  },
  watch: {
    value() {
      this.changeImageShowList();
    }
  },
  components: {
    UploadFile
  },
  data() {
    return {
      valueCopy: ""
    };
  },
  mounted() {
    this.value && this.changeImageShowList();
  },
  methods: {
    async changeImageShowList() {
      let item = this.value;
      if (typeof item === "string") {
        this.valueCopy =
          (item.substring(0, 10) !== "data:image" &&
          item.substring(0, 4) !== "http"
            ? this.$store.state.siteComdataPath + "/"
            : "") + item;
      } else {
        getImageData([item], file => {
          this.valueCopy = file[0];
        });
      }
    },
    /**
     *    上传文件之前处理文件
     *    file 本次选择的文件
     */
    onHandleBeforeUpload(file) {
      this.$emit("input", file);
    }
  }
};
</script>
<style lang="less" scoped>
</style>
