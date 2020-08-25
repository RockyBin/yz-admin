<template>
  <div class="property-container" v-if="module.module_type == 'ModuleShopwindow'">
    <h3>
      <span>图片组设置</span>
    </h3>
    <Form class="property-form" :label-width="80">
      <FormItem label="选择样式">
        <div class="wrapper">
          <triangle class="arrow" :width="16" :height="8" :border-width="1" />
          <div
            v-for="(name,index) in layoutNames"
            :class="{'layout-style':true,'selected':module.layout==index+1}"
            :key="index"
            @click="changeLayout(index+1)"
          >
            <img class="sample" :src="'images/sample/chuch'+(index+1)+'.png'" alt />
            <span class="name">{{name}}</span>
            <img class="check-mark" src="images/xuanzhong.png" />
          </div>
        </div>
      </FormItem>
      <FormItem label="布局">
        <div :class="['layout-container','layout'+module.layout]">
          <div
            v-for="(item,index) in count"
            :key="index"
            :class="['layout-item',currentItem==index?'selected':'','item'+item]"
            @click="selectItem(index)"
          >推荐宽度{{getImgSuggest(module.layout,index)}}px</div>
        </div>
      </FormItem>
      <FormItem label="添加图片" class="form-pic-select">
        <Button
          :type="module.items[currentItem].image?'default':'dashed'"
          class="icon-btn"
          @click="onShowFilesSelector"
        >
          <Icon
            v-if="module.items[currentItem].image"
            type="md-close-circle"
            size="16"
            @click.stop="deleteImage"
          />
          <img
            class="icon-img"
            v-if="module.items[currentItem]&&module.items[currentItem].image"
            :src="module.items[currentItem].image"
            alt
          />
          <Icon v-else type="md-add" size="20" />
        </Button>
        <span style="color:#999;">建议尺寸：{{getImgSuggest(module.layout,currentItem)}}px宽度，高度不限</span>
      </FormItem>
      <FormItem label="链接地址" class="form-link-select">
        <Tooltip :content="module.items[currentItem].link_desc?module.items[currentItem].link_desc:'请选择链接'" placement="top-start">
          <LinkButton
            :context="module.items[currentItem]"
            :text="module.items[currentItem].link_desc"
            @onSelectLink="onLinkSelected"
          ></LinkButton>
        </Tooltip>
      </FormItem>
      <FormItem label="图片间隙" class="form-slider">
        <Slider v-model="module.item_margin" :min="0" :max="30" :step="1" show-input></Slider>
      </FormItem>
      <FormItem label="上下边距" class="form-slider">
        <Slider v-model="module.padding_top_bottom" :min="0" :max="15" :step="1" show-input></Slider>
      </FormItem>
      <FormItem label="页面边距" class="form-slider">
        <Slider v-model="module.padding_left_right" :min="0" :max="15" :step="1" show-input></Slider>
      </FormItem>
    </Form>
    <FilesSelector v-model="showFilesSelector" @onSelected="onFilesSelected"></FilesSelector>
  </div>
</template>
<script type="text/ecmascript-6">
import BaseModuleProperty from "./BaseModuleProperty";
import LinkButton from "../link-select-button";
import FilesSelector from "@/components/files/files";
import ModuleShopwindow from "./ModuleShopwindow";
import triangle from "../triangle.vue";
export default {
  extends: BaseModuleProperty,
  components: { LinkButton, FilesSelector, triangle },
  props: ["module"],
  data() {
    return {
      layoutNames: [
        "单图模式",
        "一行2个",
        "一行3个",
        "1左2右",
        "2左1右",
        "1上2下",
        "1上3下",
        "2左2右",
        "2上4下"
      ],
      currentItem: 0,
      showLinkSelector: false,
      showFilesSelector: false,
      curEditItem: null
    };
  },
  computed: {
    count() {
      if (this.module.layout <= 2) return this.module.layout;
      else if (this.module.layout >= 3 && this.module.layout <= 6) return 3;
      else if (this.module.layout >= 7 && this.module.layout <= 8) return 4;
      else return 6;
    }
  },
  methods: {
    changeLayout(layout) {
      this.module.layout = layout;
      // ModuleShopwindow.switchLayout(this.module, layout);
      if (this.count <= this.currentItem) this.currentItem = 0;
    },
    selectItem(index) {
      this.currentItem = index;
      while (this.currentItem >= this.module.items.length) {
        this.module.items.push({
          image: "",
          link_desc: "",
          link_type: "none",
          link_data: "",
          link_url: ""
        });
      }
    },
    deleteImage() {
      this.module.items[this.currentItem].image = "";
    },
    onShowFilesSelector() {
      this.showFilesSelector = true;
    },
    onLinkSelected(linkInfo, item) {
      this.module.items[this.currentItem].link_desc = linkInfo.desc;
      this.module.items[this.currentItem].link_type = linkInfo.type;
      this.module.items[this.currentItem].link_data = linkInfo.data;
      this.module.items[this.currentItem].link_url = linkInfo.url;
    },
    onFilesSelected(files) {
      if (files.length > 0) {
        this.module.items[this.currentItem].image = files[0];
      }
    },
    // getImgWidth(layout, index) {
    //   return ModuleShopwindow.getLayoutImageSize(layout, index).width;
    // },
    // getImgHeight(layout, index) {
    //   return ModuleShopwindow.getLayoutImageSize(layout, index).height;
    // },
    getImgSuggest(layout, index) {
      // return ModuleShopwindow.getLayoutImageSize(layout, index).suggest;
      if (layout == 1) {
        return 750;
      } else if (layout == 2 || layout == 4 || layout == 5 || layout == 8) {
        return 375;
      } else if (layout == 3) {
        return 250;
      } else if (layout == 6) {
        if (index == 0) {
          return 750;
        } else {
          return 375;
        }
      } else if (layout == 7) {
        if (index == 0) {
          return 750;
        } else {
          return 250;
        }
      } else if (layout == 9) {
        if (index < 2) {
          return 375;
        } else {
          return 188;
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
.wrapper {
  position: relative;
  width: 337px;
  height: 344px;
  background-color: #f9fbfd;
  border: solid 1px #eff0f6;
  margin: 0 -7px;
  padding: 10px 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-content: space-around;
  .arrow {
    position: absolute;
    top: -8px;
    left: 20px;
  }
  .layout-style {
    position: relative;
    width: 102px;
    height: 100px;
    background-color: #ffffff;
    border: solid 1px transparent;
    text-align: center;
    cursor: pointer;
    .sample {
      width: 96px;
      height: 61px;
      object-fit: contain;
      object-position: 50% 50%;
      margin-bottom: -10px;
    }
    .check-mark {
      display: none;
      position: absolute;
      top: 0;
      right: 0;
    }
    &.selected {
      border: 1px solid #fd8b26;
      .check-mark {
        display: block;
      }
    }
  }
}
.form-pic-select {
  /deep/.ivu-form-item-content {
    line-height: normal;
  }
}

.form-link-select {
  /deep/.ivu-form-item-content {
    /deep/.ivu-tooltip {
      width: 100%;
    }
  }
}
.layout-container {
  width: 320px;
  height: 246px;
  background: white;
  .layout-item {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1.5;
    text-align: center;
    background: #f9fbfd;
    color: #999;
    cursor: pointer;
    width: 100%;
    height: 100%;
    outline: 1px solid #dde0e1;
    &.selected {
      color: #6e88f7;
      background-color: #e4ebfe;
      outline: solid 1px #6e88f7;
      z-index: 1;
    }
  }
}
.layout1 {
  height: 140px;
}
.layout2 {
  height: 164px;
  display: flex;
  .layout-item {
    flex: 1;
  }
}
.layout3 {
  height: 107px;
  display: flex;
  .layout-item {
    flex: 1;
  }
}
.layout4 {
  position: relative;
  .layout-item {
    position: absolute;
    width: calc(50%);
  }
  .item1 {
    height: 100%;
    top: 0;
    left: 0;
  }
  .item2 {
    height: calc(50%);
    top: 0;
    right: 0;
  }
  .item3 {
    height: calc(50%);
    right: 0;
    bottom: 0;
  }
}
.layout5 {
  position: relative;
  .layout-item {
    position: absolute;
    width: calc(50%);
  }
  .item1 {
    height: calc(50%);
    top: 0;
    left: 0;
  }
  .item2 {
    height: calc(50%);
    left: 0;
    bottom: 0;
  }
  .item3 {
    height: 100%;
    right: 0;
    top: 0;
  }
}
.layout6 {
  position: relative;
  .layout-item {
    position: absolute;
    height: calc(50%);
  }
  .item1 {
    width: 100%;
    left: 0;
    top: 0;
  }
  .item2 {
    width: calc(50%);
    left: 0;
    bottom: 0;
  }
  .item3 {
    width: calc(50%);
    right: 0;
    bottom: 0;
  }
}
.layout7 {
  position: relative;
  .layout-item {
    position: absolute;
    height: calc(50%);
  }
  .item1 {
    width: 100%;
    left: 0;
    top: 0;
  }
  .item2 {
    width: calc(33.333%);
    left: 0;
    bottom: 0;
  }
  .item3 {
    width: calc(33.333%);
    left: calc(33.333%);
    bottom: 0;
  }
  .item4 {
    width: calc(33.333%);
    right: 0;
    bottom: 0;
  }
}
.layout8 {
  position: relative;
  .layout-item {
    width: calc(50%);
    height: calc(50%);
    position: absolute;
  }
  .item1 {
    top: 0;
    left: 0;
  }
  .item2 {
    top: 0;
    right: 0;
  }
  .item3 {
    left: 0;
    bottom: 0;
  }
  .item4 {
    right: 0;
    bottom: 0;
  }
}
.layout9 {
  position: relative;
  .layout-item {
    position: absolute;
    height: calc(50%);
  }
  .item1 {
    width: calc(50%);
    left: 0;
    top: 0;
  }
  .item2 {
    width: calc(50%);
    right: 0;
    top: 0;
  }
  .item3 {
    width: calc(25%);
    left: 0;
    bottom: 0;
  }
  .item4 {
    width: calc(25%);
    left: calc(25%);
    bottom: 0;
  }
  .item5 {
    width: calc(25%);
    left: calc(50%);
    bottom: 0;
  }
  .item6 {
    width: calc(25%);
    right: 0;
    bottom: 0;
  }
}
.icon-btn {
  width: 44px;
  height: 44px;
  vertical-align: top;
  text-align: center;
  padding: 0;
  position: relative;
  vertical-align: text-bottom;
  margin-right: 17px;
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

// .selected {
//   border: 1px solid red !important;
// }
// .layout {
//   display: inline-block;
//   width: 102px;
//   height: 100px;
//   border: 1px solid transparent;
//   margin-left: 10px;
// }
// .layout:nth-child(1),
// .layout:nth-child(4),
// .layout:nth-child(7) {
//   margin-left: 0px;
// }
// .layout:nth-child(n + 3) {
//   margin-top: 10px;
// }
// .item1 {
//   display: flex;
//   height: 120px;
// }
// .item .imgcontainer {
//   position: relative;
//   width: 120px;
//   height: 120px;
//   padding: 10px;
// }
// .item .imgcontainer .img {
//   position: relative;
//   top: 50%;
//   left: 50%;
//   max-width: 100%;
//   max-height: 100%;
//   transform: translate(-50%, -50%);
//   border: 1px solid #ccc;
//   background-color: #eee;
// }
// .img .plus {
//   font-size: 30px;
//   position: relative;
//   top: 50%;
//   left: 50%;
//   transform: translate(-50%, -50%);
// }
// .img img {
//   position: relative;
//   top: 50%;
//   left: 50%;
//   transform: translate(-50%, -50%);
//   width: 100%;
// }
// .item .linkcontainer {
//   position: relative;
//   flex: 1;
//   display: flex;
//   align-items: center;
// }
</style>
