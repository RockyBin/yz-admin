<template>
  <div class="property-container" v-if="module.module_type == 'ModuleCoupon'">
    <h3>
      <span>优惠券设置</span>
    </h3>
    <Form class="property-form" :label-width="80">
      <FormItem label="选择样式">
        <div class="wrapper">
          <triangle class="arrow" :width="16" :height="8" :border-width="1"/>
          <div
            @click="module.layout = item.layout"
            :class="['coupon-tyle',module.layout == item.layout ? 'active':'']"
            v-for="(item,index) in couponStyles"
            :key="index"
          >
            <div class="img">
              <img :src="item.image">
            </div>
            <div class="text">{{item.name}}</div>
          </div>
        </div>
      </FormItem>
      <FormItem label="颜色">
        <ColorSelect :colors="colors" :current="module.color" @onSelected="onColorSelected"></ColorSelect>
      </FormItem>
      <FormItem label="背景颜色">
        <ColorPicker v-model="module.background" recommend editable alpha/>
      </FormItem>
      <FormItem label="页面边距">
        <Slider v-model="module.padding_left_right" :min="0" :max="15" :step="1" show-input></Slider>
      </FormItem>
      <FormItem label="一屏显示个数(若优惠券数量(N) < 显示个数(M)，则只显示N个)" v-if="[1,4].indexOf(module.layout) > -1 && deviceType == 2">
        <RadioGroup v-model="module.cols">
          <Radio :label="3">三张</Radio>
          <Radio :label="4">四张</Radio>
          <Radio :label="5">五张</Radio>
          <Radio :label="6">六张</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="优惠券" style="margin-bottom:0;">
        <draggable v-model="module.coupon_list" :options="options" @update="onSorted">
          <div v-for="(item,index) in module.coupon_list" :key="index" class="coupon-item">
            <div class="coupon-info">
              <span class="coupon-title">{{item.title}}</span>
              <span class="coupon-menkan">（{{getMenkanInfo(item)}}）</span>
            </div>
            <div class="btn-del">
              <Icon @click="delItem(index)" type="md-close-circle"/>
            </div>
          </div>
        </draggable>
      </FormItem>
      <div v-if="module.coupon_list.length < 10" class="div-add">
        <div class="button">
          <Button type="primary" @click="showCouponDialog">添加优惠券</Button>
        </div>
        <div class="text">最多可添加10张，可拖拽排序</div>
      </div>
      <CouponDialog
        v-model="showCouponDialogState"
        :couponIds="module.coupon_ids"
        @onGetCouponInfo="onGetCouponInfo"
      ></CouponDialog>
    </Form>
  </div>
</template>
<script type="text/ecmascript-6">
import triangle from "../triangle.vue";
import draggable from "vuedraggable";
import BaseModuleProperty from "./BaseModuleProperty";
import ColorSelect from "../color-select";
import CouponDialog from "@/views/shop/store/design/components/coupon-list.vue";
export default {
  extends: BaseModuleProperty,
  components: { CouponDialog, draggable, ColorSelect, triangle },
  props: ["module"],
  data() {
    return {
      showCouponDialogState: false,
      deviceType: 1,
      couponStyles: [
        { layout: 1, name: "样式一", image: "images/coupon/1.png" },
        { layout: 2, name: "样式二", image: "images/coupon/2.png" },
        { layout: 3, name: "样式三", image: "images/coupon/3.png" },
        { layout: 4, name: "样式四", image: "images/coupon/4.png" }
      ],
      colors: [
        { name: "red", value: "#ea3d44" },
        { name: "blue", value: "#41a3ee" },
        { name: "orange", value: "#f67238" }
      ],
      options: {
        emptyInsertThreshold: 5,
        direction: "vertical",
        forceFallback: true,
        filter: ".btn-del",
        fallbackClass: "drag-class",
        fallbackOnBody: false,
        animation: 150,
        cursor: "move",
        draggable: ".coupon-item"
      }
    };
  },
  created(){
    if(this.module.coupon_list.length>this.module.coupon_ids.length){
      let index=this.module.coupon_list.findIndex(item=>{
        return this.module.coupon_ids.indexOf(item.id)==-1
      })
      this.module.coupon_ids.splice(index,0,this.module.coupon_list[index].id)
    }
    if(this.module.coupon_list.length<this.module.coupon_ids.length){
      let index=this.module.coupon_ids.findIndex(id=>{
        return !this.module.coupon_list.some(item=>{
          return item.id==id
        })
      })
      this.module.coupon_ids.splice(index,1);
      if(!this.module.cols){
        this.module.cols = 3;
      }
    }
  },
  mounted(){
    if(this.$route.name == 'bigscreenDesignHomeMobile'){
      this.deviceType = 2;
    }
  },
  methods: {
    showCouponDialog() {
      this.showCouponDialogState = true;
    },
    onColorSelected(color) {
      this.module.color = color.name;
    },
    onBgColorSelected(color) {
      this.module.background = color.name;
    },
    onGetCouponInfo(coupons) {
      coupons.forEach(element => {
        if (this.module.coupon_ids.indexOf(element.id) == -1) {
          this.module.coupon_ids.push(element.id);
          this.module.coupon_list.push(element);
        }
      });
    },
    onSorted() {
      //更新ID的顺序
      this.module.coupon_ids = [];
      this.module.coupon_list.forEach(element => {
        if (
          this.module.coupon_ids.indexOf(element.id) == -1 &&
          this.module.coupon_list.length <= 10
        ) {
          this.module.coupon_ids.push(element.id);
        }
      });
    },
    delItem(index) {
      this.module.coupon_ids.splice(index, 1);
      this.module.coupon_list.splice(index, 1);
    },
    /**
     * 获取优惠券的使用门槛信息
     */
    getMenkanInfo(info) {
      var menkan = parseFloat(info.doorsill_full_money);
      var coupon_money = parseFloat(info.coupon_money);
      if (info.doorsill_type) {
        return (
          "满 " +
          menkan +
          "，" +
          (info.coupon_type == 0 ? "减 " + coupon_money : coupon_money + " 折")
        );
      } else {
        return (
          "无门槛，" +
          (info.coupon_type == 0
            ? "优惠" + coupon_money
            : coupon_money + " 折优惠")
        );
      }
    }
  }
};
</script>
<style lang="less" scoped>
.ivu-slider /deep/ .ivu-input-number {
  width: 50px;
  margin-right: 30px;
}
.wrapper {
  position: relative;
  width: 323px;
  height: 250px;
  padding: 4px 2px;
  background-color: #f9fbfd;
  border: solid 1px #eff0f6;
  .arrow {
    position: absolute;
    top: -8px;
    left: 20px;
  }
}
.coupon-tyle {
  background: white;
  cursor: pointer;
  width: 148px;
  height: 110px;
  display: inline-block;
  margin: 5px;
  border: 1px solid transparent;
  position: relative;
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
  }
  .img {
    position: relative;
    height: 70px;
    img {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
  .text {
    text-align: center;
    color: #333;
  }
}
.coupon-item {
  width: 100%;
  position: relative;
  border-radius: 5px;
  border: 1px solid #dcdee2;
  margin: 16px 0;
  cursor: move;
  display: flex;
  &:hover{
    .btn-del{
      display:inline-block;
    }
  }
}
.coupon-info {
  width: 316px;
  flex: 1;
  line-height: 50px;
  height: 50px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.coupon-title {
  margin-left: 16px;
  // display: inline-block;
}
.coupon-menkan {
  line-height: 50px;
  height: 50px;
  // display: inline-block;
  color: #666;
  margin-left: 4px;
}
.btn-del {
  display:none;
  cursor: pointer;
  position: absolute;
  top: -16px;
  right: -8px;
  .ivu-icon {
    font-size: 16px;
  }
}
.div-add {
  display: flex;
  align-items: center;
  padding: 14px 12px;
  border-radius: 5px;
  border: solid 1px #e5e5e5;
  .button {
    width: 100px;
  }
  .text {
    color: #999999;
    text-align: right;
    flex: 1;
  }
}
</style>
