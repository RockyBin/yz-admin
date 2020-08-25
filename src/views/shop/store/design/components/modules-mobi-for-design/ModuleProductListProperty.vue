<template>
  <div class="property-container" v-if="module.module_type == 'ModuleProductList'">
    <h3>
      <span>商品列表设置</span>
    </h3>
    <Form class="property-form" :label-width="80">
      <FormItem label="列表样式" class="form-radio">
        <RadioGroup v-model="module.layout">
          <Radio :label="1">大图单列</Radio>
          <Radio :label="2">一行两个</Radio>
          <Radio :label="3">一行三个</Radio>
          <Radio :label="4">小图单列</Radio>
          <Radio :label="5">横向滑动</Radio>
          <Radio v-show="false" :label="6">瀑布流</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem class="form-radio form-source" label="商品来源">
        <RadioGroup v-model="module.data_source" @on-change="onDataSourceChange">
          <Radio :label="-1">全部商品</Radio>
          <Radio :label="0">商品分类</Radio>
          <Radio :label="1">手动选择商品</Radio>
        </RadioGroup>
      </FormItem>
      <div v-show="module.data_source == 0 || module.data_source == -1" class="source-class">
        <triangle class="arrow" :class="{'source-all' : module.data_source == -1}" :width="16" :height="8" :border-width="1"/>
        <FormItem v-show="module.data_source == 0" label="商品分类：" class="form-class">
          <div class="class-info">
            <div v-if="showSelectClass">
              <a href="#" @click="showClassDialog" style="color:#4a6af5">选择分类</a>
            </div>
            <div v-else>
              <div
                v-for="(item, index) in module.class_name"
                :key="index"
                class="class-name"
              >{{item}}</div>
              <a href="#" @click="showClassDialog" style="color:#4a6af5">修改分类</a>
            </div>
          </div>
        </FormItem>
        <FormItem label="商品排序：">
          <Select v-model="module.sort_rule" style="width:200px;">
            <Option value="sold_count desc">按销量</Option>
            <Option value="hits desc">按浏览量</Option>
            <Option value="updated_at desc">按更新时间</Option>
            <Option value="price asc">按价格由低到高</Option>
            <Option value="price desc">按价格由高到低</Option>
          </Select>
        </FormItem>
        <FormItem label="显示个数：">
          <InputNumber :max="30" :min="1" v-model="module.product_num" style="width: 90px;"></InputNumber>
          <span style="color:#9ea4b1;font-size: 12px;margin-left: 7px;">(最多显示30个)</span>
        </FormItem>
        <ClassDialog
          v-model="showClassDialogState"
          :classIds="module.class_ids"
          @onGetClassInfo="onGetClassInfo"
        ></ClassDialog>
      </div>
      <div v-show="module.data_source == 1" class="source-products">
        <triangle class="arrow" :width="16" :height="8" :border-width="1"/>
        <FormItem label="商品：">
          <draggable
            class="draglist"
            style="width: 240px;"
            v-model="module.product_list2"
            :options="options"
            @update="onSorted"
          >
            <div
              v-for="(item,index) in module.product_list2"
              :key="index"
              class="product-item"
              :style="'background-image:url('+getProductImg(item)+')'"
            >
              <Icon type="md-close-circle" class="btn-del" @click="delItem(index);"/>
            </div>
            <Button type="dashed" @click="showProductDialog">
              <Icon type="md-add" size="12" color="#999"/>
            </Button>
          </draggable>
        </FormItem>
        <p style="color:#9ea4b1;margin-left: 45px;margin-top: 5px;">（可手动拖拽排序）</p>
        <ProductDialog
          v-model="showProductDialogState"
          :productIds="module.product_ids"
          @onGetProductInfo="onGetProductInfo"
        ></ProductDialog>
      </div>
      <FormItem label="商品样式" class="form-radio">
        <RadioGroup v-model="module.product_style">
          <Radio :label="1">无边白底</Radio>
          <Radio :label="2">卡片投影</Radio>
          <Radio :label="3">描边白底</Radio>
          <!--<Radio :label="4">无边透明底</Radio>-->
        </RadioGroup>
      </FormItem>
      <FormItem label="页面边距" class="form-slider">
        <Slider v-model="module.padding_left_right" :min="0" :max="30" :step="1" show-input></Slider>
      </FormItem>
      <FormItem label="商品间距" class="form-slider">
        <!--瀑布流下商品间距无法设置-->
        <Slider v-model="module.product_margin" :min="0" :max="20" :step="1" show-input></Slider>
      </FormItem>
      <FormItem label="商品边角" class="form-radio">
        <RadioGroup v-model="module.border_style">
          <Radio :label="0">直角</Radio>
          <Radio :label="1">圆角</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="文本字体" class="form-radio">
        <RadioGroup v-model="module.font_style">
          <Radio :label="0">常规</Radio>
          <Radio :label="1">加粗</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="显示内容" class="form-checkbox">
        <CheckboxGroup v-model="module.show_params" class="show-params">
          <Checkbox label="name" :disabled="module.layout!=5">名称</Checkbox>
          <Checkbox label="price" disabled>价格</Checkbox>
          <Checkbox
            v-if="module.layout!=1&&module.layout!=3&&module.layout!=5"
            label="sold_count"
          >销量</Checkbox>
          <Checkbox
            v-if="module.layout!=3&&module.layout!=2&&module.layout!=5"
            label="market_price"
          >市场价</Checkbox>
        </CheckboxGroup>
        <Checkbox v-model="showBuyBtn" @on-change="checkChange('btn_buy')">购买按钮</Checkbox>
        <div v-if="showBuyBtn" class="div-buy-btn">
          <RadioGroup v-model="module.btn_buy_style">
            <Radio :label="1">样式1</Radio>
            <Radio :label="2">样式2</Radio>
            <Radio :label="3">样式3</Radio>
            <Radio :label="4">样式4</Radio>
          </RadioGroup>
        </div>
        <br v-if="!showBuyBtn">
        <Checkbox v-model="showCornerMark" @on-change="checkChange('corner_mark')">角标</Checkbox>
        <div v-if="showCornerMark" class="div-corner-mark">
          <RadioGroup v-model="module.corner_mark">
            <Radio :label="1">新品</Radio>
            <Radio :label="2">热卖</Radio>
            <Radio :label="3">NEW</Radio>
            <Radio :label="4">HOT</Radio>
            <Radio :label="9">自定义</Radio>
          </RadioGroup>
          <div v-if="module.corner_mark == 9" class="div-custom-corner-mark">
            <Button class="btn-custom-corner" type="dashed" @click="onShowFilesSelector">
              <Icon
                v-if="module.custom_corner_mark"
                type="md-close-circle"
                size="20"
                @click.stop="deleteImage"
              />
              <img
                class="icon-img"
                v-if="module.custom_corner_mark"
                :src="module.custom_corner_mark"
                alt
              >
              <Icon v-else type="md-add" size="20"/>
            </Button>
            <div class="corner-tips">推荐使用 36x36 像素的 .png 图片</div>
          </div>
        </div>
      </FormItem>
    </Form>
    <FilesSelector v-model="showFilesSelector" @onSelected="onFilesSelected"></FilesSelector>
  </div>
</template>
<script type="text/ecmascript-6">
import triangle from "../triangle";
import draggable from "vuedraggable";
import BaseModuleProperty from "./BaseModuleProperty";
import FilesSelector from "@/components/files/files";
import ClassDialog from "@/views/shop/store/design/components/class-list.vue";
import ProductDialog from "@/views/shop/store/design/components/product-list.vue";
import ModuleProductList from "./ModuleProductList";
export default {
  extends: BaseModuleProperty,
  components: {
    FilesSelector,
    ClassDialog,
    ProductDialog,
    draggable,
    triangle
  },
  props: ["module"],
  data() {
    return {
      showBuyBtn: false,
      showCornerMark: false,
      showFilesSelector: false,
      showClassDialogState: false,
      showProductDialogState: false,
      options: {
        emptyInsertThreshold: 5,
        direction: "vertical",
        forceFallback: true,
        fallbackClass: "drag-class",
        fallbackOnBody: false,
        animation: 150,
        cursor: "move",
        draggable: ".product-item"
      }
    };
  },
  created() {
    if (this.module) {
      //将数据复制一下，以免在切换商品数据来源是两个列表互相影响
      if (this.module.data_source == 1) {
        this.module.product_list2 = Object.assign([], this.module.product_list); //用于手动选择商品的
        this.module.class_ids = [];
        this.module.class_name = [];
      } else {
        this.module.product_ids = [];
        this.module.product_list = this.createClassDemoList();
      }
      if (this.module.show_params.indexOf("corner_mark") > -1)
        this.showCornerMark = true;
      else this.showCornerMark = false;
      if (this.module.show_params.indexOf("btn_buy") > -1)
        this.showBuyBtn = true;
      else this.showBuyBtn = false;
    }
  },
  watch: {
    "module.layout": {
      handler(val) {
        // this.module.product_list = this.createClassDemoList(val);
        this.module.show_params = ["name", "price"];
        if (this.showBuyBtn == true) {
          this.module.show_params.push("btn_buy");
        }
        if (this.showCornerMark == true) {
          this.module.show_params.push("corner_mark");
        }
      }
    }
  },
  computed: {
    canShowCornerMark() {
      return this.module.show_params.indexOf("corner_mark") > -1;
    },
    // custom_corner_mark(){
    //   var bg = "";
    //   if (this.module.custom_corner_mark){
    //     bg += "background-image:url(" + this.module.custom_corner_mark + ");";
    //   }
    //   return bg;
    // },
    showSelectClass() {
      if (!this.module.class_ids) return true;
      if (this.module.class_ids.length == 0) return true;
      return false;
    }
  },
  methods: {
    checkChange(item) {
      var index = this.module.show_params.indexOf(item);
      if (index > -1) {
        this.module.show_params.splice(index, 1);
      } else {
        this.module.show_params.push(item);
      }
    },
    onShowFilesSelector() {
      this.showFilesSelector = true;
    },
    onFilesSelected(files) {
      if (files.length > 0) {
        this.module.custom_corner_mark = files[0];
      }
    },
    showClassDialog() {
      this.showClassDialogState = true;
    },
    onGetClassInfo(classInfo) {
      this.module.class_ids = [classInfo[0].id];
      this.module.class_name = [classInfo[0].name];
    },
    showProductDialog() {
      this.showProductDialogState = true;
    },
    onGetProductInfo(products) {
      if (!this.module.product_list2) this.module.product_list2 = [];
      products.forEach(element => {
        if (this.module.product_ids.indexOf(element.id) == -1) {
          this.module.product_ids.push(element.id);
          this.module.product_list2.push(element);
        }
      });
      this.module.product_list = this.module.product_list2;
    },
    onDataSourceChange(value) {
      if (value == 1) this.module.product_list = this.module.product_list2;
      else this.module.product_list = this.createClassDemoList();
    },
    getProductImg(pinfo) {
      if (pinfo.id > 0)
        return (
          this.$store.state.siteComdataPath + pinfo.small_images.split(",")[0]
        );
      else return pinfo.small_images.split(",")[0];
    },
    onSorted() {
      this.module.product_list = this.module.product_list2;
      //更新ID的顺序
      this.module.product_ids = [];
      this.module.product_list2.forEach(element => {
        if (this.module.product_ids.indexOf(element.id) == -1) {
          this.module.product_ids.push(element.id);
        }
      });
    },
    createClassDemoList() {
      return ModuleProductList.createClassDemoList(this.module.layout);
    },
    delItem(index) {
      this.module.product_ids.splice(index, 1);
      this.module.product_list2.splice(index, 1);
      this.module.product_list.splice(index, 1);
    },
    deleteImage() {
      this.module.custom_corner_mark = "";
    }
  }
};
</script>
<style lang="less" scoped>
.show-params .ivu-checkbox-wrapper {
  display: block;
}
.form-source {
  margin-bottom: 10px;
}
.source-products {
  border: 1px solid #e5e5e5;
  background: #f9fbfd;
  margin-bottom: 24px;
  padding: 15px;
  position: relative;
  .arrow {
    position: absolute;
    top: -8px;
    left: 170px;
  }
  /deep/.ivu-btn {
    width: 44px;
    height: 44px;
    padding: 0;
    margin: 5px;
  }
  /deep/ .ivu-form-item {
    margin-bottom: 0;
  }
  /deep/.ivu-form-item-label {
    width: 39px !important;
    margin-top: 5px;
    color: #464c5b;
  }
  /deep/.ivu-form-item-content {
    display: inline-block;
    vertical-align: top;
  }
}
/deep/.source-class {
  border: 1px solid #e5e5e5;
  background: #f9fbfd;
  padding: 12px 15px 0px 15px;
  margin-top: -10px;
  margin-bottom: 24px;
  position: relative;
  .arrow {
    position: absolute;
    top: -8px;
    left: 90px;
    &.source-all {
      left: 10px;
    }
  }
  /deep/.ivu-form-item-content {
    display: inline-block;
  }
  .ivu-form-item-label {
    color: #464c5b;
    width: 65px !important;
    margin-bottom: 0 !important;
  }
  /deep/ .ivu-form-item {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0px;
    }
  }
  /deep/.form-class.ivu-form-item {
    margin-bottom: 7px;
  }
}
.class-info {
  display: flex;
  flex-grow: 0;
}
.class-name {
  display: inline-block;
  margin-right: 10px;
  line-height: 25px;
  border: 1px solid #c2ccf7;
  border-radius: 5px;
  padding: 0 10px;
  background: #ebeef7;
}
.div-buy-btn,
.div-corner-mark {
  padding-left: 10px;
}
.div-custom-corner-mark {
  display: flex;
  align-items: flex-end;
}
.btn-custom-corner {
  width: 44px;
  height: 44px;
  vertical-align: top;
  text-align: center;
  padding: 0;
  position: relative;
  vertical-align: text-bottom;
  /deep/.ivu-icon-md-close-circle {
    display: none;
    position: absolute;
    top: -10px;
    right: -10px;
    color: rgb(100, 100, 100) !important;
    &:hover {
      color: rgb(130, 130, 130) !important;
    }
  }
  &:hover {
    /deep/.ivu-icon-md-close-circle {
      display: inline-block;
    }
  }
  .icon-img {
    width: 44px;
    height: 44px;
    object-fit: cover;
    vertical-align: middle;
  }
}
.corner-tips {
  color: #9ea4b1;
  margin-left: 10px;
  display: inline-block;
}
.product-item {
  width: 44px;
  height: 44px;
  position: relative;
  border: 1px solid #ccc;
  border-radius: 2px;
  margin: 5px;
  float: left;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  cursor: move;
  &:hover {
    .btn-del {
      display: inline-block;
    }
  }
}
.btn-add-product {
  width: 60px;
  height: 60px;
  position: relative;
  border: 1px solid #ccc;
  margin: 5px;
  text-align: center;
  line-height: 60px;
  font-size: 30px;
  font-weight: bold;
  float: left;
  cursor: pointer;
}
.btn-del {
  display: none;
  position: absolute;
  font-size: 16px;
  top: -8px;
  right: -8px;
  cursor: pointer;
}
</style>
