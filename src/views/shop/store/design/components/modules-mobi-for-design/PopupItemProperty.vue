<template>
  <div class="popup-item-block">
    <h5 class="drag-handle">
      广告位{{ order + 1 }}
      <a class="delete-item" href="javascript:void(0)" @click="$emit('delete')"
        >删除</a
      >
    </h5>
    <div class="body">
      <div class="row">
        <label>类型：</label>
        <RadioGroup v-model="item.type" @on-change="onTypeChange">
          <Radio :label="0">图片</Radio>
          <Radio :label="1">视频</Radio>
        </RadioGroup>
      </div>
      <div class="row row-small" v-if="item.type == 0">
        <label></label>
        <div class="form-pic-select">
          <Button
            type="dashed"
            :class="{ 'img-exist': item.src }"
            class="icon-btn"
            @click="onShowFilesSelector('src')"
          >
            <Icon
              v-if="item.src"
              type="md-close-circle"
              size="16"
              @click.stop="item.src = ''"
            />
            <img class="icon-img" v-if="item.src" :src="item.src" />
            <Icon v-else type="md-add" size="20" />
          </Button>
          <div class="tips">建议尺寸：1080*1920，支持jpg.png.gif</div>
        </div>
      </div>
      <div class="row" v-if="item.type == 1">
        <label>地址：</label>
        <div class="form-video-src">
          <div>
            <Input v-model="item.src" placeholder="http://" />
          </div>
          <div class="tips">仅支持.mp4(AVC(H264))格式的视频源地址</div>
        </div>
      </div>
      <div class="row" v-if="item.type == 1">
        <label>封面：</label>
        <div class="form-pic-select">
          <Button
            type="dashed"
            :class="{ 'img-exist': item.poster }"
            class="icon-btn"
            @click="onShowFilesSelector('poster')"
          >
            <Icon
              v-if="item.poster"
              type="md-close-circle"
              size="16"
              @click.stop="deletePoster(item)"
            />
            <img class="icon-img" v-if="item.poster" :src="item.poster" />
            <Icon v-else type="md-add" size="20" />
          </Button>
          <div class="tips">建议图片比例与播放比例一致，支持jpg.png.gif</div>
        </div>
      </div>
      <div class="row" :class="{ 'item-link-error': itemError.link_url }">
        <label>链接：</label>
        <LinkButton
          class="link-btn"
          :context="item"
          :text="item.link_desc"
          @onSelectLink="onLinkSelected"
        ></LinkButton>
      </div>
    </div>
    <FilesSelector
      v-model="showFilesSelector"
      @onSelected="onFilesSelected"
    ></FilesSelector>
  </div>
</template>
<script>
import LinkButton from "../link-select-button";
import FilesSelector from "@/components/files/files";
export default {
  components: {
    LinkButton,
    FilesSelector
  },
  props: ["order", "item"],
  data() {
    return {
      hover: false,
      showFilesSelector: false,
      select: false,
      oldSrc: "", // 记录原来的src
      itemError: {
        type: false,
        src: false,
        poster: false,
        link_url: false,
        items: false
      }
    };
  },
  watch: {
    item: {
      handler(val) {
        this.initItemError();
        if (!val.src) {
          this.itemError.src = true;
          this.itemError.items = true;
        }
        this.$set(this.item, "error", this.itemError.items);
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    onTypeChange() {
      let oldSrc = this.item.src;
      this.item.src = this.oldSrc;
      this.oldSrc = oldSrc;
    },
    onLinkSelected(linkInfo, item) {
      this.$set(item, "link_desc", linkInfo.desc);
      this.$set(item, "link_type", linkInfo.type);
      this.$set(item, "link_data", linkInfo.data);
      this.$set(item, "link_url", linkInfo.url);
    },
    onShowFilesSelector(prop) {
      this.showFilesSelector = true;
      this.select = prop;
    },
    onFilesSelected(files) {
      if (files.length > 0) {
        this.item[this.select] = files[0];
      }
    },
    initItemError() {
      this.itemError = {
        type: false,
        src: false,
        poster: false,
        link_url: false,
        items: false
      };
    },
    deletePoster(item) {
      item.poster = "";
    }
  }
};
</script>
<style lang="less" scoped>
.popup-item-block {
  border: 1px solid rgba(229, 229, 229, 1);
  border-radius: 5px;
  margin-bottom: 15px;
  overflow: hidden;
  color: #333;
  &:last-child {
    margin-bottom: 0;
  }
  .link-btn {
    width: 200px;
    // height: 74px;
    display: inline-block;
    vertical-align: middle;
  }
  h5 {
    height: 40px;
    line-height: 40px;
    padding: 0 12px;
    font-size: 14px;
    background: #fafbfd;
    cursor: pointer;
    border-bottom: 1px solid #e5e5e5;
    .delete-item {
      float: right;
      font-weight: normal;
      font-size: 12px;
      color: rgba(69, 112, 234, 1);
    }
  }
  & > .body {
    padding: 18px 20px 20px;
  }
  .row {
    margin: 20px 0 0;
    &:first-child {
      margin-top: 0;
    }
    &.row-small {
      margin-top: 10px;
    }
    & > label {
      display: inline-block;
      width: 44px;
      line-height: 32px;
      vertical-align: top;
    }
  }
  .wrapper {
    padding: 10px 0;
    background: rgba(249, 251, 253, 1);
  }
  /deep/.ivu-input-suffix {
    color: #999;
    line-height: 32px;
  }
  /deep/.ivu-radio-wrapper {
    height: 32px;
    line-height: 32px;
    margin-right: 20px;
  }
  .form-video-src {
    display: inline-block;
    align-items: center;
    > label {
      width: 78px;
    }
    > div {
      flex: 1;
    }
  }
  .tips {
    margin-top: 10px;
    line-height: 16px;
    color: #999999;
    font-size: 12px;
  }
  .form-pic-select {
    display: inline-block;
    width: calc(100% - 44px);
    /deep/.ivu-form-item-content {
      line-height: normal;
    }
    .icon-btn {
      width: 44px;
      height: 44px;
      vertical-align: top;
      text-align: center;
      padding: 0;
      position: relative;
      vertical-align: text-bottom;
      &.img-exist {
        border-style: solid;
      }
      /deep/.ivu-icon-md-close-circle {
        display: none;
        position: absolute;
        top: -8px;
        right: -8px;
        color: rgb(100, 100, 100) !important;
      }
      .icon-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        vertical-align: middle;
      }
      &:hover {
        /deep/.ivu-icon-md-close-circle {
          display: block;
        }
      }
    }
  }
}
</style>
