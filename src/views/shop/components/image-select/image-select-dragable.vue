<template>
  <div class="image-select-dragable">
    <div class="image-select-dragable-content" ref="imageSelectDragable" v-if="domReshow">
      <div class="image-select-dragable-list" v-for="(item, index) in imageList" :key="index">
        <div class="image-select-dragable-item" @click="onImageItemClick(index)">
          <upload-file :disabled="disabled" @input="onHandleBeforeUpload" :format="format" :maxSize="maxSize">
            <img :src="item.url">
            <span class="image-dragable-delete" v-if="!disabled" @click.stop="onDeleteImage(index)">
              <!-- <i class="iconfont icon-ios-close"></i> -->
              <Icon type="md-close-circle" size="16" color="#333"/>
            </span>
          </upload-file>
        </div>
      </div>
      <div
        class="image-select-dragable-dragable-add"
        @click="onImageItemClick(imageList.length)"
        v-if="imageAddShow && !disabled"
      >
        <upload-file
          @input="onHandleBeforeUpload"
          :format="format"
          :disabled="disabled"
          :multiple="multiple"
          :maxSize="maxSize"
        ></upload-file>
      </div>
    </div>
  </div>
</template>
<script>
import { getImageData } from "@/views/shop/utils/utils.js";
import UploadFile from "@/views/shop/components/upload-file/upload-file.vue";
import Sortable from "sortablejs";
export default {
  props: {
    value: {
      default() {
        return [];
      },
      type: [Array,String]
    },
    disabled: { // iview 3.30版本才可用
      default: false,
      type: Boolean
    },
    pictureNumber: {
      default: 0,
      type: Number
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
    },
    multiple: {
      default: true,
      type: Boolean
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
  computed: {
    /**
     * 计算是否应该显示添加按钮
     */
    imageAddShow() {
      return this.multiple
        ? this.pictureNumber
          ? this.pictureNumber > this.valueCopy.length
          : true
        : this.valueCopy.length < 1;
    },
    /**
     * 计算是否应该添加或更换图片
     */
    imageAddSuccess() {
      return this.multiple
        ? this.pictureNumber
          ? this.pictureNumber > this.imageChangeIndex
          : true
        : this.valueCopy.length < 1;
    }
  },
  data() {
    return {
      imageList: [],
      domReshow: true,
      imageChangeIndex: 0,
      valueCopy: []
    };
  },
  mounted() {
    this.value.length && this.changeImageShowList();
  },
  methods: {
    async changeImageShowList() {
      this.valueCopy = this.value.concat();
      let statusArray = [];
      let promiseAll = [];
      this.valueCopy.forEach((item, index) => {
        if (typeof item === "string") {
          statusArray.push({
            url: item
          });
        } else {
          // 先在数组占位，再加入异步执行替换
          statusArray.push({ url: "" });
          promiseAll.push(
            new Promise(resolve => {
              getImageData([item], file => {
                statusArray[index] = {
                  url: file[0],
                  name: item.name
                };
                resolve();
              });
            })
          );
        }
      });
      await Promise.all(promiseAll);
      // 触发重新渲染列表
      this.domReshow = false;
      this.imageList = statusArray;
      this.imageChangeIndex = this.valueCopy.length;
      this.$nextTick(() => {
        this.domReshow = true;
        this.$nextTick(() => {
          this.resetSort();
        });
      });
    },
    /**
     *  初始化列表拖拽排序
     */
    resetSort() {
      var el = this.$refs.imageSelectDragable;
      let _this = this;
      Sortable.create(el, {
        onEnd: _this.onDragableEnd,
        sort: true,
        filter: ".image-select-dragable-dragable-add",
        onMove: function(evt) {
          if (evt.related) {
            return !evt.related.classList.contains(
              "image-select-dragable-dragable-add"
            );
          }
        }
      });
    },
    /**
     *  删除当前选中的图片
     *  index 第几张图片
     */
    onDeleteImage(index) {
      this.valueCopy.splice(index, 1);
      this.$emit("input", this.valueCopy);
    },
    /**
     *  新的数据位置
     */
    onDragableEnd(e) {
      let deleteObject = this.valueCopy.splice(e.oldIndex, 1);
      this.valueCopy.splice(e.newIndex, 0, deleteObject[0]);
      this.$emit("input", this.valueCopy);
    },
    /**
     *  点击选择更换选择图片
     *  index 标记是添加还是新增图片
     */
    onImageItemClick(index) {
      this.imageChangeIndex = index;
    },
    /**
     *    上传文件之前处理文件
     *    file 本次选择的文件
     */
    onHandleBeforeUpload(file) {
      if (this.imageAddSuccess) {
        this.valueCopy.splice(this.imageChangeIndex, 1, file);
        this.$emit("input", this.valueCopy);
      }
      // 需要重新赋值，保证能够添加多个文件选择
      this.imageChangeIndex = this.valueCopy.length;
    }
  }
};
</script>
<style lang="less" scoped>
.image-select-dragable {
  padding-bottom: 2px;
  .image-select-dragable-content {
    margin-bottom: -12px;
    margin-right: -16px;
    .image-select-dragable-list {
      display: inline-block;
      width: 80px;
      height: 80px;
      border: 1px solid #dcdee2;
      border-radius: 2px;
      margin-right: 16px;
      margin-bottom: 10px;
      vertical-align: top;
      cursor: pointer;
      .image-select-dragable-item {
        height: 78px;
        width: 78px;
        position: relative;
        /deep/.ivu-upload-drag {
          height: 78px;
          overflow: unset;
          border: none;
        }
        img {
          position: absolute;
          left: 50%;
          top: 50%;
          max-width: 100%;
          max-height: 100%;
          transform: translate(-50%, -50%);
        }
        .image-dragable-delete {
          display:none;
          position: absolute;
          right: -1px;
          top: -1px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: #fff;
          transform: translate(50%, -50%);
          line-height: 1;
        }
        &:hover{
          .image-dragable-delete{
            display:inline-block;
          }
        }
      }
    }
    .image-select-dragable-dragable-add {
      display: inline-block;
      vertical-align: top;
      margin-bottom: 10px;
      margin-right: 16px;
      /deep/.icon-ios-add{
        color:#c0c2c9;
      }
    }
  }
}
</style>
