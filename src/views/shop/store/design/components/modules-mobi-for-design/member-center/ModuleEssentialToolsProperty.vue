<template>
  <div class="property-container">
    <h3>
      <span>必备工具设置</span>
    </h3>
    <div class="property-container-content">
      <Form>
        <FormItem>
          <div class="property-container-title">选择样式</div>
          <message-box>
            <div class="property-layout">
              <div
                class="property-layout-item"
                :class="{'active': module.layout === 1}"
                @click="module.layout = 1"
              >
                <img :src="require('./images/essential_tool1.png')" alt />
                <div>列表</div>
              </div>
              <div
                class="property-layout-item"
                :class="{'active': module.layout === 2}"
                @click="module.layout = 2"
              >
                <img :src="require('./images/essential_tool2.png')" alt />
                <div>九宫格</div>
              </div>
            </div>
          </message-box>
        </FormItem>
        <FormItem>
          <div class="property-container-title">
            显示内容
            <i
              class="iconfont icon-ios-information-circ1"
              style="position: absolute;margin-top: 2px;margin-left: 6px;"
            ></i>
            <span style="font-size: 12px;margin-left:30px;">拖拽以下组件可以改变排序</span>
          </div>
          <div
            class="property-container-title"
            style="padding-top: 0;font-size: 12px;"
            v-show="!designData.retail_status"
          >*未激活的功能请到&lt;通用设置-开启零售功能>激活生效</div>
          <div>
            <draggable v-model="items" v-bind="dragOption">
              <div class="drag-handle" v-for="item in items" :key="item.label" v-show="!item.hide">
                <Checkbox
                  :true-value="1"
                  :false-value="0"
                  v-model="module[item.label]"
                  :disabled="item.disabled"
                >{{item.text}}</Checkbox>
              </div>
            </draggable>
          </div>
        </FormItem>
      </Form>
    </div>
  </div>
</template>
<script>
import messageBox from "./components/message-box";
import draggable from "vuedraggable";
export default {
  props: ["module", "designData"],
  components: {
    messageBox,
    draggable
  },
  data() {
    return {
      dragOption: {
        emptyInsertThreshold: 10,
        delay: 10,
        direction: "vertical",
        forceFallback: true,
        fallbackClass: "drag-class",
        fallbackOnBody: false,
        animation: 150,
        cursor: "move",
        handle: ".drag-handle"
      }
    };
  },
  computed: {
    items: {
      get() {
        // 排序
        let items = [];
        let showItems = this.getShowItem();
        this.module.sort_list.forEach(item => {
          items.push(showItems[item]);
          delete showItems[item];
        });
        // 防止数据重复
        items = items.filter(n => n);
        items.push(...Object.values(showItems));
        return items;
      },
      set(val) {
        this.$set(this.module, "sort_list", val.map(n => n.label));
      }
    }
  },
  methods: {
    getShowItem() {
      return {
        my_fans_is_show: {
          label: "my_fans_is_show",
          text: "我的粉丝"
        },
        coupon_center_is_show: {
          label: "coupon_center_is_show",
          text: "领券中心",
          disabled: !this.designData.retail_status
        },
        member_collection_is_show: {
          label: "member_collection_is_show",
          text: "收藏夹",
          disabled: !this.designData.retail_status
        },
        my_browse_record_is_show: {
          label: "my_browse_record_is_show",
          text: "我的足迹",
          disabled: !this.designData.retail_status
        },
        my_address_is_show: {
          label: "my_address_is_show",
          text: "地址管理"
        },
        comment_center_is_show: {
          label: "comment_center_is_show",
          text: "评价中心",
          disabled: !this.designData.retail_status
        },
        distribution_is_show: {
          label: "distribution_is_show",
          text: "分销中心",
          hide: !this.hasLicensePerm("ENABLE_DISTRIBUTION"),
          disabled: !this.designData.retail_status
        },
        agent_is_show: {
          label: "agent_is_show",
          text: "代理中心",
          hide: !this.hasLicensePerm("ENABLE_AGENT"),
          disabled: !this.designData.retail_status
        },
        area_agent_is_show: {
          label: "area_agent_is_show",
          text: "区域代理中心",
          hide: !this.hasLicensePerm("ENABLE_AREA_AGENT"),
          disabled: !this.designData.retail_status
        },
        dealer_is_show: {
          label: "dealer_is_show",
          text: "经销商中心",
          hide: !this.hasLicensePerm("ENABLE_CLOUDSTOCK")
        },
        security_code_is_show: {
          label: "security_code_is_show",
          text: "防伪查询",
          hide: !this.hasLicensePerm("ENABLE_SECURITY_CODE")
        },
        shop_cart_is_show: {
          label: "shop_cart_is_show",
          text: "购物车",
          disabled: !this.designData.retail_status
        },
        member_setting_is_show: {
          label: "member_setting_is_show",
          text: "个人设置"
        },
        member_modify_is_show: {
          label: "member_modify_is_show",
          text: "修改信息"
        },
        service_phone_is_show: {
          label: "service_phone_is_show",
          text: "联系客服"
        }
      };
    }
  }
};
</script>
<style lang="less" scoped>
</style>