<template>
  <div class="nav-item-block">
    <h5 class="drag-handle">
      导航{{order+1}}
      <a class="delete-item" href="javascript:void(0)" @click="$emit('delete')">删除</a>
    </h5>
    <div class="body">
      <div class="row">
        <label></label>名称：
        <Input
          style="width:200px"
          v-model="item.name"
          placeholder="请输入导航文本"
          :maxlength="4"
          :class11="{'ivu-form-item-error': itemError.name}"
        >
          <span slot="suffix">{{item.name ? item.name.length : 0}}/4</span>
        </Input>
      </div>
      <div class="row" :class11="{'item-link-error': itemError.link_url}">
        <label></label>链接：
        <LinkButton
          class="link-btn"
          :context="item"
          :text="item.link_desc"
          @onSelectLink="onLinkSelected"
        ></LinkButton>
      </div>
      <div class="row">
        <label class="item-required"></label>导航图标：
        <RadioGroup v-model="item.icon_type">
          <Radio :label="0">图标</Radio>
          <Radio :label="1">自定义</Radio>
        </RadioGroup>
      </div>
      <div class="row icon-select">
        <div v-if="item.icon_type==0" :class="{'item-icon-error': itemError.icon}">
          <Button
            class="icon-btn"
            type="dashed"
            style="margin-left:70px;"
            @click="btnClicked('icon')"
            @mouseenter.stop.native="hover=true"
            @mouseleave.stop.native="hover=false"
          >
            <Icon
              v-if="item.icon"
              type="md-close-circle"
              size="16"
              @click.stop="deleteIcon('icon')"
            />
            <myIcon v-if="item.icon" color="#515a6e" :type="item.icon" size="20"/>
            <Icon v-else type="md-add" size="20"/>
          </Button>
        </div>
        <div
          v-else
          class="wrapper"
          :class="{'item-image-error': itemError.image, 'item-image-active-error': itemError.image_active}"
        >
          <Row>
            <i-col span="10" style="padding-left:15px;border-right:1px solid rgba(204,204,204,1)">
              <span>默认：</span>
              <Button type="dashed" class="icon-btn" @click="btnClicked('image')">
                <Icon
                  v-if="item.image"
                  type="md-close-circle"
                  size="16"
                  @click.stop="deleteIcon('image')"
                />
                <img class="icon-img" v-if="item.image" :src="item.image" alt>
                <Icon v-else type="md-add" size="20"/>
              </Button>
            </i-col>
            <i-col span="10" style="padding-left:15px">
              <span>选中：</span>
              <Button type="dashed" class="icon-btn" @click="btnClicked('image_active')">
                <Icon
                  v-if="item.image_active"
                  type="md-close-circle"
                  size="16"
                  @click.stop="deleteIcon('image_active')"
                />
                <img class="icon-img" v-if="item.image_active" :src="item.image_active" alt>
                <Icon v-else type="md-add" size="20"/>
              </Button>
            </i-col>
          </Row>
          <p class="tip">（建议上传88x88像素的png图片）</p>
        </div>
      </div>
    </div>
    <FilesSelector v-model="showFilesSelector" @onSelected="onFilesSelected"></FilesSelector>
    <IconSelector :show="showIconSelector" @iconSelected="saveSelectedIcon"/>
  </div>
</template>
<script>
import LinkButton from "../link-select-button";
import FilesSelector from "@/components/files/files";
import IconSelector from "@/views/shop/components/icons/icon-selector";
import myIcon from "@/views/shop/components/icons/icon.vue";
export default {
  components: {
    LinkButton,
    FilesSelector,
    IconSelector,
    myIcon
  },
  props: ["order", "item", "normalColor", "activeColor"],
  data() {
    return {
      hover: false,
      showFilesSelector: false,
      showIconSelector: false,
      select: "", //选择icon或image或image_active
      itemError: {
        name: false,
        icon: false,
        link_url: false,
        image: false,
        image_active: false,
        items: false
      }
    };
  },
  watch: {
    item: {
      handler(val) {
        this.initItemError();
        // 验证是否为空
        /*if (!val.name) {
          this.itemError.name = true;
          this.itemError.items = true;
        }
        if (!val.link_url) {
          this.itemError.link_url = true;
          this.itemError.items = true;
        }*/
        if (val.icon_type === 0) {
          if (!val.icon) {
            this.itemError.icon = true;
            this.itemError.items = true;
          }
        } else {
          if (!val.image) {
            this.itemError.image = true;
            this.itemError.items = true;
          }
          if (!val.image_active) {
            this.itemError.image_active = true;
            this.itemError.items = true;
          }
        }
        this.$set(this.item, "error", this.itemError.items);
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    onLinkSelected(linkInfo, item) {
      this.$set(item, "link_desc", linkInfo.desc);
      this.$set(item, "link_type", linkInfo.type);
      this.$set(item, "link_data", linkInfo.data);
      this.$set(item, "link_url", linkInfo.url);
    },
    btnClicked(p) {
      this.select = p;
      if (this.select == "icon") {
        this.showIconSelector = true;
      } else {
        this.showFilesSelector = true;
      }
    },
    deleteIcon(p) {
      this.item[p] = "";
    },
    saveSelectedIcon(icon) {
      if (icon) this.item.icon = icon;
      this.showIconSelector = false;
    },
    onFilesSelected(files) {
      if (files.length > 0) {
        this.item[this.select] = files[0];
      }
    },
    initItemError() {
      this.itemError = {
        name: false,
        icon: false,
        link_url: false,
        image: false,
        image_active: false,
        items: false
      };
    }
  }
};
</script>
<style lang="less" scoped>
.nav-item-block {
  border: 1px solid rgba(229, 229, 229, 1);
  border-radius: 5px;
  margin-bottom: 15px;
  overflow: hidden;
  &:last-child{
    margin-bottom:0;
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
    padding: 0 10px;
    background: #fafbfd;
    cursor: pointer;
    .delete-item {
      float: right;
      font-weight: normal;
      color: rgba(69, 112, 234, 1);
    }
  }
  & > .body {
    padding: 0 20px;
  }
  .row {
    margin: 10px 0;
  }
  .wrapper {
    padding: 10px 0;
    background: rgba(249, 251, 253, 1);
  }
  .icon-btn {
    width: 44px;
    height: 44px;
    vertical-align: top;
    text-align: center;
    padding: 0;
    position: relative;
    &:hover{
      /deep/.ivu-icon-md-close-circle{
        display:inline-block;
      }
    }
  }
  .tip {
    font-size: 12px;
    color: rgba(153, 153, 153, 1);
    text-align: center;
  }
  .icon-select/deep/.ivu-icon-md-close-circle {
    display:none;
    position: absolute;
    top: -8px;
    right: -8px;
    background:white;
    border-radius:50%;
    color: rgb(100, 100, 100) !important;
    &:hover {
      color: rgb(130, 130, 130) !important;
    }
  }
  /deep/.ivu-input-suffix {
    color: #999;
    line-height: 32px;
  }
  .icon-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .item-link-error .link-btn /deep/.layout-1-container,
  .item-icon-error /deep/.icon-btn,
  .item-image-error /deep/.icon-btn,
  .item-image-active-error /deep/.icon-btn {
    border-color: #ed4014 !important;
  }
  .item-required:before {
    content: "*";
    display: inline-block;
    margin-right: 4px;
    line-height: 1;
    font-family: SimSun;
    font-size: 13px;
    color: #ed4014;
    font-weight: initial;
  }
}
</style>
