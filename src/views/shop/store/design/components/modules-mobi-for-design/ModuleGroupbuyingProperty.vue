<template>
  <div
    class="property-container"
    v-if="module.module_type == 'ModuleGroupBuying'"
  >
    <h3>
      <span>多人拼团设置</span>
    </h3>
    <Form class="property-form" :label-width="80">
      <FormItem label="选择样式" class="form-styleselect">
        <triangle class="arrow" :width="16" :height="8" :border-width="1" />
        <div
          @click="module.layout = item.layout"
          :class="['layout-item', module.layout == item.layout ? 'active' : '']"
          v-for="(item, index) in layouts"
          :key="index"
        >
          <div class="img">
            <img :src="item.image" />
          </div>
          <div class="text">{{ item.name }}</div>
        </div>
      </FormItem>
      <FormItem label="活动状态演示">
        <div class="product-activity-show">
          <Tag
            v-for="(item, index) in activityArray"
            :name="index"
            type="border"
            :class="{
              'product-activity-show-checked': activitySelect === index
            }"
            :key="index"
            @click.native="activitySelect = index"
            >{{ item.text }}
            <icon
              v-show="activitySelect === index"
              class="iconfont icon-ios-checkmark-circle1"
            ></icon>
          </Tag>
        </div>
      </FormItem>
      <FormItem
        label="选择活动:"
        class="product-activity-link"
        :class="{ 'product-activity-link-error': linkErrorShow }"
      >
        <Tooltip
          :content="selectData.title || '请选择活动'"
          placement="top-start"
        >
          <LinkButton
            :context="selectData"
            placeholder="请选择活动"
            width="240px"
            :text="selectData.title"
            :linkStatus="false"
            @onLinkBtnClick="onLinkBtnClick"
            @onSelectLink="onSelectLink"
          ></LinkButton>
        </Tooltip>
        <div v-show="linkErrorShow" class="product-activity-link-tip">
          请先选择活动
        </div>
      </FormItem>
      <FormItem label="选择商品" class="form-styleselect">
        <triangle class="arrow" :width="16" :height="8" :border-width="1" />
        <div style="display: flex;padding: 5px;">
          <div style="line-height: 22px;width: 40px;color: #464c5b;">
            商品：
          </div>
          <draggable
            class="draglist"
            style="width: 240px;"
            v-model="module.product_list"
            :options="options"
          >
            <div
              v-for="(item, index) in module.product_list"
              :key="index"
              class="product-item"
              :style="'background-image:url(' + getProductImg(item) + ')'"
            >
              <Icon
                type="md-close-circle"
                class="btn-del"
                @click="delItem(index)"
              />
            </div>
            <Button
              type="dashed"
              style="height: 44px;margin: 5px;"
              @click="onAddProductClick"
            >
              <Icon type="md-add" size="12" color="#999" />
            </Button>
            <p style="color:#9ea4b1;margin-top: 5px;">
              （可手动拖拽排序）
            </p>
          </draggable>
        </div>
      </FormItem>
      <FormItem label="商品样式" class="form-radio">
        <RadioGroup v-model="module.product_style">
          <Radio :label="1">无边白底</Radio>
          <Radio :label="2">卡片投影</Radio>
          <Radio :label="3">描边白底</Radio>
          <!--<Radio :label="4">无边透明底</Radio>-->
        </RadioGroup>
      </FormItem>
      <FormItem label="页面边距">
        <Slider
          v-model="module.padding_left_right"
          :min="0"
          :max="15"
          :step="1"
          show-input
        ></Slider>
      </FormItem>
      <FormItem label="商品间距" class="form-slider">
        <!--瀑布流下商品间距无法设置-->
        <Slider
          v-model="module.product_margin"
          :min="0"
          :max="20"
          :step="1"
          show-input
        ></Slider>
      </FormItem>
      <FormItem label="商品边角" class="form-radio">
        <RadioGroup v-model="module.border_style">
          <Radio :label="0">直角</Radio>
          <Radio :label="1">圆角</Radio>
        </RadioGroup>
      </FormItem>
    </Form>
    <modal-list
      v-model="modalActivityStatus"
      title="选择活动"
      selectKey="title"
      headList="多人拼团"
      :width="620"
      :headName="''"
      ref="modalList"
      :searchData="searchData"
      placeholder="请输入活动名称"
      :columns="activityColumns"
      :tableData="tableData"
      :tableLoading="tableLoading"
      :lastColumnWidth="100"
      :selectData="selectData"
      @onGetSelectData="onGetSelectData"
      @getList="getActivityData"
    ></modal-list>
    <ProductDialog
      v-model="showProductDialogState"
      :productIds="module.product_ids"
      :options="{
        group_buying_setting_id: selectData.id,
        product_status: 1
      }"
      url="/shop/admin/group/buying/product/list"
      @onGetProductInfo="onGetProductInfo"
    ></ProductDialog>
  </div>
</template>
<script type="text/ecmascript-6">
import triangle from "../triangle";
import LinkButton from "../link-select-button";
import BaseModuleProperty from "./BaseModuleProperty";
import draggable from "vuedraggable";
import modalList from "@/views/shop/components/modal/modal-select-list";
import ProductDialog from "@/views/shop/store/design/components/product-list";
export default {
  extends: BaseModuleProperty,
  components: { triangle, LinkButton, draggable, modalList, ProductDialog },
  props: ["module"],
  data() {
    return {
      curEditItem: null,
      activityLink: {
        link_url: ""
      },
      modalActivityStatus: false,
      linkErrorShow: false,
      tableData: [],
      tableLoading: false,
      searchData: {
        total: 0,
        searchName: "",
        currentPage: 1,
        pageSize: 20
      },
      showProductDialogState: false,
      activityColumns: [
        {
          width: 180,
          title: "活动名称",
          render: (h, params) => {
            return h("div", params.row.title);
          }
        },
        {
          width: 170,
          align: "center",
          title: "活动时间",
          render: (h, params) => {
            return h("div", [
              h("div", params.row.start_time),
              h("div", params.row.end_time)
            ]);
          }
        },
        {
          width: 120,
          align: "center",
          title: "状态",
          render: (h, params) => {
            return h("div", {
              class: ["table-warning", "table-success", "table-end"][[0, 1, -1].findIndex(n => n === params.row.status)]
            }, ["未开始", "进行中", "已结束"][[0, 1, -1].findIndex(n => n === params.row.status)]);
          }
        }
      ],
      activityArray: [
        {
          text: "预览活动中"
        },
        {
          text: "预览预告"
        },
        {
          text: "预览已结束"
        }
      ],
      activitySelect: 0,
      layouts: [
        { layout: 1, name: "样式一", image: "images/groupbuying/product list1.png" },
        { layout: 2, name: "样式二", image: "images/groupbuying/product list2.png" }
      ],
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
  watch: {
    "activitySelect": {
      handler() {
        this.setProductStatus();
      },
      immediate: true
    },
    "module.product_list": {
      handler(val) {
        this.$set(this.module, "product_ids", val.map(n => n.id));
      }
    }
  },
  computed: {
    selectData() {
      return {
        id: this.module.groupbuying_setting_id,
        url: !!this.module.groupbuying_setting_id,
        title: this.module.groupbuying_name || ""
      };
    }
  },
  methods: {
    setProductStatus() {
      this.module.product_list.forEach(n => {
        this.$set(n, "groupbuying_status", [1, 0, -1][this.activitySelect]);
      });
    },
    onLinkBtnClick() {
      if (!this.selectData.id) {
        this.modalActivityStatus = true;
        this.$refs["modalList"].resetData();
      }
    },
    getActivityData(searchData) {
      this.tableLoading = true;
      this.$httpPost("/shop/admin/group/buying/setting/list", {
        page: searchData.currentPage,
        "page_size": searchData.pageSize,
        status: "2",
        keyword: searchData.searchName
      }, res => {
        this.tableLoading = false;
        if (res.code === 200) {
          this.searchData = Object.assign({}, this.searchData, {total: res.data.total});
          this.tableData = res.data.list;
        } else {
          this.$Message.error(res.msg);
        }
      })
    },
    onGetSelectData(val) {
      if (val) {
        this.$set(this.module, "groupbuying_setting_id", val.id);
        this.$set(this.module, "groupbuying_name", val.title);
        this.linkErrorShow = false;
        this.modalActivityStatus = false;
      }
    },
    onSelectLink() {
      this.$Modal.confirm({
        title: "提示",
        content: "删除活动，同时也删除所选择商品，是否确定要删除？",
        onOk: () => {
          this.$set(this.module, "groupbuying_setting_id", 0);
          this.$set(this.module, "groupbuying_name", "");
          this.$set(this.module, "product_list", []);
        }
      });
    },
    getProductImg(pinfo) {
      if (pinfo.id > 0)
        return (
          this.$store.state.siteComdataPath + pinfo.small_images.split(",")[0]
        );
      else return pinfo.small_images.split(",")[0];
    },
    onAddProductClick() {
      if (!this.selectData.id) {
        this.linkErrorShow = true;
        return;
      }
      this.showProductDialogState = true;
    },
    delItem(index) {
      this.module.product_list.splice(index, 1);
    },
    onGetProductInfo(products) {
      let product_list = this.module.product_list;
      products.forEach(element => {
        if (this.module.product_ids.indexOf(element.id) == -1) {
          product_list.push(element);
        }
      });
      this.setProductStatus();
    }
  }
};
</script>
<style lang="less" scoped>
.form-styleselect {
  /deep/.ivu-form-item-label {
    margin-bottom: 10px;
  }
  /deep/.ivu-form-item-content {
    position: relative;
    background-color: #f9fbfd;
    border: solid 1px #e5e5e5;
    padding: 10px;
    margin-top: 8px;
    .arrow {
      position: absolute;
      top: -8px;
      left: 14px;
    }
  }
}
.property-container {
  /deep/.ivu-form-item {
    width: 322px;
  }
}
.product-activity-show {
  /deep/.ivu-tag {
    position: relative;
    margin: 0;
    width: 98px;
    height: 32px;
    line-height: 32px;
    border-color: #dcdee2;
    text-align: center;
    overflow: initial;
    & + .ivu-tag {
      margin-left: 12px;
    }
    &.product-activity-show-checked {
      border-color: #4a6af5;
      .ivu-tag-text {
        color: #4a6af5;
      }
    }
    i {
      position: absolute;
      top: -7px;
      right: -6px;
      background-color: #fff;
      width: 12px;
      height: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  }
}
.product-activity-link {
  display: flex;
  align-items: center;
  .product-activity-link-tip {
    position: absolute;
    color: #ed4014;
    line-height: 16px;
  }
  &.product-activity-link-error {
    /deep/.layout-1-container {
      border-color: #ed4014 !important;
    }
  }
  /deep/.ivu-form-item-label {
    display: block;
    margin-bottom: 0;
  }
  /deep/.ivu-form-item-content {
    .ivu-tooltip {
      display: block;
      .ivu-tooltip-rel {
        display: block;
      }
    }
  }
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
      display: block;
    }
  }
  .btn-del {
    display: none;
    position: absolute;
    font-size: 16px;
    top: -8px;
    right: -8px;
    cursor: pointer;
  }
}
.layout-item {
  cursor: pointer;
  width: 147px;
  height: 100px;
  display: inline-block;
  position: relative;
  background-color: #fff;
  &:nth-child(2n + 1) {
    margin-left: 6px;
  }
  &.active {
    border: solid 1px #fd8b26;
    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url(../../../../../../../public/images/xuanzhong.png);
      background-position: top right;
      background-repeat: no-repeat;
      z-index: 99;
    }
    .text {
      color: #fd892c;
    }
  }
  .img {
    position: relative;
    padding: 5px 10px;
    height: 68px;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .text {
    text-align: center;
    color: #333;
  }
}
</style>
