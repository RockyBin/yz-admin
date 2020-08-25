<template>
  <div ref="ccc" v-if="module.module_type == 'ModuleProductList'" >
    <div ref="widthHelper"></div>
    <div v-if="module.layout == 6 && showBricks" class="layout-6" ref="bricks-container" :style="'padding:0px '+module.padding_left_right+'px'">
      <bricks ref="bricks" :data="listToDisplay" :sizes="waterfallSizes" :lazy="true">
        <template slot-scope="scope">
          <div :style="getPaddingStyle(scope.item,scope.index)">
            <router-link style="color:#333;display:block;height:100%;" :to="'/product/product-detail?id='+scope.item.id">
              <div class="product-item" :style="getBricksStyle()">
                <div
                  :class="['product-item-border','item-borderstyle-' + module.border_style,'item-border-' + module.product_style,'item-border-bg-' + module.product_style]"
                >
                  <div
                    v-if="module.show_params.indexOf('corner_mark') > -1"
                    class="product-corner-mark-div"
                    :style="{top:module.corner_mark==1?'6px':'0px'}"
                  >
                    <img :src="cornerMark" :style="{width:module.corner_mark==9?'28px':'auto'}">
                  </div>
                  <div ref="product-img-div" class="product-img-div">
                    <img :src="getProductImg(scope.item)" class="product-img">
                  </div>
                  <div class="product-info-div">
                    <div
                      class="name"
                      :class="['font-style-' + module.font_style]"
                      v-if="module.show_params.indexOf('name') > -1"
                    >{{scope.item.name}}</div>
                    <div
                      class="sold-count"
                      v-if="module.show_params.indexOf('sold_count') > -1"
                    >已售 {{scope.item.sold_count}}</div>
                    <div class="price-row">
                      <span
                        class="price"
                        :class="['font-style-' + module.font_style]"
                        v-if="module.show_params.indexOf('price') > -1"
                      >￥{{scope.item.price}}</span>
                      <span
                        class="market-price"
                        v-if="module.show_params.indexOf('market_price') > -1"
                      >￥{{scope.item.market_price}}</span>
                      <div class="btn-buy" v-if="module.show_params.indexOf('btn_buy') > -1">
                        <img :src="btnBuy" alt>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </router-link>
          </div>
        </template>
      </bricks>
    </div>
    <div v-else style="overflow:auto;">
      <div :class="['list','layout-' + module.layout,editMode ? 'edit-mode':'']" :style="'padding:0px '+module.padding_left_right+'px'">
        <div
          v-for="(item,index) in listToDisplay"
          :key="index"
          class="product-item"
          :style="getItemStyle(index)"
        >
          <router-link style="color:#333;display:block;height:100%;" :to="'/product/product-detail?id='+item.id">
            <div
              :class="['product-item-border','item-borderstyle-' + module.border_style,'item-border-' + module.product_style,'item-border-bg-' + module.product_style]"
            >
              <div
                v-if="module.show_params.indexOf('corner_mark') > -1"
                class="product-corner-mark-div"
                :style="{top:module.corner_mark==1?'6px':'0px'}"
              >
                <img :src="cornerMark" :style="{width:module.corner_mark==9?'28px':'auto'}">
              </div>
              <div ref="product-img-div" class="product-img-div">
                <img :src="getProductImg(item)" class="product-img">
              </div>
              <div class="product-info-div">
                <div
                  class="name"
                  :class="['font-style-' + module.font_style]"
                  v-if="module.show_params.indexOf('name') > -1"
                >{{item.name}}</div>
                <div
                  :class="['sold-count',{'no-show':module.show_params.indexOf('sold_count')==-1}]"
                  v-if="module.layout==4||module.layout!=1&&module.layout!=3&&module.layout!=5&&module.show_params.indexOf('sold_count') > -1"
                >已售 {{item.sold_count}}</div>
                <div class="price-row" >
                  <span
                    class="price"
                    :class="['font-style-' + module.font_style]"
                    v-if="module.show_params.indexOf('price') > -1&&item.price"
                  ><span class="small">￥</span>{{item.price}}</span>
                  <span
                    class="market-price"
                    v-if="module.show_params.indexOf('market_price') > -1&&item.market_price"
                  >￥{{item.market_price}}</span>
                  <div class="btn-buy" v-if="module.show_params.indexOf('btn_buy') > -1">
                    <img :src="btnBuy" alt>
                  </div>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
import ModuleProductList from "../modules-mobi-for-design/ModuleProductList";
import "vue-bricks/lib/vueBricks.css";
import bricks from "vue-bricks";
// import BScroll from 'better-scroll';
export default {
  components: { bricks },
  props: ["module", "editMode"],
  data() {
    return {
      showBricks: false,
      waterfallSizes: [{ columns: 2, gutter: 0 }]
    };
  },
  watch: {
    module: {
      handler(newValue) {
        if (newValue.layout == 6) {
          this.showBricks = false;
          this.showBricks = true;
          this.$nextTick(() => {
            //在编辑模式下，当切换展示风格时，浏览器渲染需要一定的时候，这里多试几次以便等浏览器渲染出基本DOM之后进行瀑布流布局
            for (var i = 1; i <= 3; i++) {
              setTimeout(() => {
                if (this.$refs.bricks) this.$refs.bricks.pack();
              }, 300 * i);
            }
          });
        }
      },
      deep: true
    }
  },
  computed: {
    listToDisplay: function() {
      var list = [];
      if (this.module.product_list) {
        list = this.module.product_list.slice(0, this.module.data_source <= 0 ? this.module.product_num : 9999);
      }
      return list;
    },
    cornerMark: function() {
      if (this.module.corner_mark == 9) {
        return this.module.custom_corner_mark;
      } else if (this.module.corner_mark == 1) {
        return "images/corner_mark/xinpin.png";
      } else if (this.module.corner_mark == 2) {
        return "images/corner_mark/remai.png";
      } else if (this.module.corner_mark == 3) {
        return "images/corner_mark/NEW.png";
      } else if (this.module.corner_mark == 4) {
        return "images/corner_mark/fengqiangbaokuan.png";
      }
      return "";
    },
    btnBuy() {
      if (this.module.btn_buy_style == 1) {
        return "images/btn_buy/gouwuche.png";
      } else if (this.module.btn_buy_style == 2) {
        return "images/btn_buy/tianjia.png";
      } else if (this.module.btn_buy_style == 3) {
        return "images/btn_buy/qiang.png";
      } else if (this.module.btn_buy_style == 4) {
        return "images/btn_buy/buy.png";
      }
      return "";
    }
  },
  updated() {
    this.$nextTick(function() {
      this.resetImgHeight();
    });
  },
  mounted() {
    this.$nextTick(function() {
      setTimeout(() => {
        this.showBricks = true;
      }, 100); //延时一点，好让 widthHelper 已经渲染完成，否则 widthHelper.clientWidth 为 0
      setTimeout(() => {
        if (this.$refs.bricks) this.$refs.bricks.pack();
      }, 150);
      this.resetImgHeight();
    });
  },
  created() {
    if (this.editMode && this.module && this.module.data_source <= 0)
      this.module.product_list = ModuleProductList.createClassDemoList(this.module.layout);
  },
  methods: {
    getProductImg(pinfo) {
      if (pinfo.id > 0)
        return (
          this.$store.state.siteComdataPath + pinfo.small_images.split(",")[0]
        );
      else return pinfo.small_images.split(",")[0];
    },
    getItemStyle(index) {
      var width = "100%";
      var marginLeft = "0px";
      var marginBottom = "0px";
      if (this.module.layout == 1) {
        marginBottom = this.module.product_margin + "px";
        return { "margin-bottom": marginBottom };
      } else if (this.module.layout == 2) {
        width = `calc(50% - ${this.module.product_margin / 2}px)`;
        marginLeft =
          index % this.module.layout ? this.module.product_margin + "px" : "0";
        marginBottom = this.module.product_margin + "px";
        return {
          width: width,
          "margin-left": marginLeft,
          "margin-bottom": marginBottom
        };
      } else if (this.module.layout == 3) {
        width = `calc(33.333% - ${(this.module.product_margin * 2) / 3}px)`;
        marginLeft =
          index % this.module.layout ? this.module.product_margin + "px" : "0";
        marginBottom = this.module.product_margin + "px";
        return {
          width: width,
          "margin-left": marginLeft,
          "margin-bottom": marginBottom
        };
      } else if (this.module.layout == 4) {
        marginBottom = this.module.product_margin + "px";
        return { "margin-bottom": marginBottom };
      } else if (this.module.layout == 5) {
        marginBottom = this.module.product_margin + "px";
        marginLeft = index ? this.module.product_margin + "px" : "0";
        return { "margin-left": marginLeft, "margin-bottom": marginBottom };
      }
    },
    /**
     * 判断最后一行元素的个数
     */
    getNotMarginBotton(length, num) {
      return length % num ? length % num : num;
    },
    getPaddingStyle(pinfo, index) {
      var lastIndex = this.module.product_list.length - 1;
      if (lastIndex > this.module.product_num)
        lastIndex = this.module.product_num - 1;
      if (
        (this.module.layout == 1 || this.module.layout == 4) &&
        index < lastIndex
      ) {
        return "padding-bottom:" + this.module.product_margin + "px;";
      }
      if (this.module.layout == 2) {
        let padding = "";
        if ((index + 1) % 2 != 0)
          padding += "padding-right:" + this.module.product_margin / 2 + "px;";
        else
          padding += "padding-left:" + this.module.product_margin / 2 + "px;";
        if (index > 1)
          padding += "padding-top:" + this.module.product_margin + "px";
        return padding;
      }
      if (this.module.layout == 3) {
        let padding = "";
        if ((index + 1) % 3 == 1)
          padding += "padding-right:" + this.module.product_margin / 2 + "px;";
        else if ((index + 1) % 3 == 2)
          padding +=
            "padding-left:" +
            this.module.product_margin / 4 +
            "px;padding-right:" +
            this.module.product_margin / 4 +
            "px;";
        else
          padding += "padding-left:" + this.module.product_margin / 2 + "px;";
        if (index > 2)
          padding += "padding-top:" + this.module.product_margin * 0.75 + "px";
        return padding;
      }
      if (this.module.layout == 5 && index < lastIndex) {
        return "margin-right:" + this.module.product_margin + "px;";
      }
      if (this.module.layout == 6) {
        return "padding:" + this.module.product_margin / 2 + "px;";
      }
      return "";
    },
    /*一行多列的样式，重图片框的高度和宽度一样，以便让每列对齐*/
    resetImgHeight() {
      // if (
      //   this.$refs["product-img-div"] &&
      //   this.$refs["product-img-div"] instanceof Array
      // ) {
      //   this.$refs["product-img-div"].forEach(item => {
      //     if (
      //       this.module.layout == 2 ||
      //       this.module.layout == 3 ||
      //       this.module.layout == 5
      //     ) {
      //       item.style.height =
      //         this.$refs["product-img-div"][0].clientWidth + "px";
      //     } else {
      //       item.style.height = "100%";
      //     }
      //   });
      // }
    },
    /**
     * 获取瀑布流布局时的item宽度
     */
    getBricksStyle() {
      var width =
        this.$refs["widthHelper"].clientWidth - this.module.product_margin * 2; //为什么*4,瀑布流显示两列，padding就有4边
      var itemWidth = width / 2;
      return { width: itemWidth + "px" };
    }
  }
};
</script>
<style lang="less" scoped>
.product-item {
  position: relative;
  display: inline-block;
  width: 100%;
}
.list {
  display: flex;
  // padding-top: 5px;
  // padding-bottom: 5px;
  flex-wrap: wrap;
  width: 100%;
}
.product-img-div {
  position: relative;
  // display: inline-block;
  width: 100%;
  // background-position: center;
  // background-repeat: no-repeat;
  // background-size: contain;
  // padding: 3px;
}
.product-corner-mark-div {
  position: absolute;
  // width: 36px;
  top: 0;
  left: 0;
  z-index: 1;
}
.product-corner-mark-div img {
  max-width: 28px;
}
/*文字样式*/
.product-info-div .name.font-style-1 {
  font-weight: bold;
}
.product-info-div .price.font-style-1 {
  font-weight: bold;
}
/*边框背景*/
.item-borderstyle-1 {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}
/*无边白底*/
.item-border-1 {
  border: 0;
  background: white;
}
.item-bg-1 {
  background: white;
}
/*卡片投影*/
.item-border-2 {
  border: 0;
  background:white;
  box-shadow: 0px 3px 3px 0px rgba(0, 0, 0, 0.1);
}
.item-bg-2 {
  background: #eee;
}
/*描边白底*/
.item-border-3 {
  background: white;
  border: 1px solid rgba(229, 229, 229, 1);
}
.item-bg-3 {
  background: white;
}
/*无边透明底*/
.item-border-4 {
  border: 0;
}
.item-bg-4 {
  background: transparent;
}
/* 购买按钮 */
.btn-buy {
  img {
    width: 22px;
  }
}
/* 价格显示 */
.price-row {
  position: relative;
}
/*大图单列*/
.layout-1 {
  .product-item {
    width: 100%;
  }
  .product-img-div{
    position:relative;
    &:before{
      content:'';
      display:block;
      padding-top:56.25%;
    }
  }
  .product-img {
    position:absolute;
    left:0;
    top:0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .product-info-div {
    position: relative;
    padding: 16px 6px 8px;
    line-height: 1;
    .name {
      font-size: 16px;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .price-row {
      margin-top: 8px;
      line-height:22px;
    }
    .price {
      margin-right: 5px;
      font-size: 18px;
      color: #fe3737;
    }
    .market-price {
      font-size: 12px;
      text-decoration: line-through;
      color: #999;
    }
    .sold-count {
      margin-top: 6px;
      font-size: 11px;
      color: #999;
    }
    .btn-buy {
      float:right;
      img{
        width: 22px;
        height: 22px;
        object-fit:contain;
      }
    }
  }
}
/*一行两列*/
.layout-2 {
  .product-img-div{
    position:relative;
    overflow:hidden;
    &:before{
      content:'';
      display:block;
      padding-top:100%;
    }
  }
  .product-img {
    position: absolute;
    left:0;
    top:0;
    right:0;
    bottom:0;
    margin:auto;
    width: 100%;
  }
  .product-info-div {
    position: relative;
    font-size: 14px;
    line-height: 1;
    padding: 8px 6px;
    .name {
      height: 32px;
      line-height: 16px;
      font-size: 14px;
      color:#333;
      width:100%;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2; //行数
      -webkit-box-orient: vertical;
    }
    .price-row {
      margin-top: 10px;
      line-height:20px;
    }
    .price {
      margin-right: 4px;
      color: #fe3737;
      font-size: 16px;
    }
    .market-price {
      text-decoration: line-through;
      color: #666;
      font-size: 12px;
      color: rgba(153, 153, 153, 1);
    }
    .sold-count {
      margin-top: 6px;
      font-size: 11px;
      color: #999;
    }
    .btn-buy {
      float:right;
      img{
        width:20px;
        height:20px;
        object-fit:contain;
      }
    }
  }
}
/*一行三列*/
.layout-3 {
  .product-item-border{
    height:100%;
  }
   .product-img-div{
    position:relative;
    overflow:hidden;
    &:before{
      content:'';
      display:block;
      padding-top:100%;
    }
  }
  .product-img {
    position: absolute;
    left:0;
    top:0;
    right:0;
    bottom:0;
    margin:auto;
    width: 100%;
  }
  .product-info-div {
    position: relative;
    line-height: 1;
    padding: 6px;
    font-size: 12px;
    .name {
      font-size:12px;
      color:#333;
      height: 28px;
      line-height: 14px;
      width:100%;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2; //行数
      -webkit-box-orient: vertical;
    }
    .price-row {
      margin-top: 8px;
      height:18px;
      line-height:18px;
    }
    .price {
      font-size: 14px;
      margin-right: 5px;
      color: #fe3737;
    }
    .market-price {
      text-decoration: line-through;
      color: #666;
      font-size: 12px;
      display: none;
    }
    .sold-count {
      font-size: 11px;
      margin-top: 6px;
      color: #999;
    }
    .btn-buy {
      float:right;
      img{
        width:18px;
        height:18px;
        object-fit:contain;
      }
    }
  }
}
/*小图单列*/
.layout-4 {
  .product-item-border {
    width: 100%;
    display: flex;
    flex-wrap: nowrap;
  }
  .product-img-div{
    width:120px;
    height:120px;
    overflow:hidden;
  }
  .product-img {
    position:absolute;
    left:0;
    top:0;
    bottom:0;
    right:0;
    margin:auto;
    width: 120px;
  }
  .product-info-div {
    width:calc(100% - 120px);
    padding: 8px 8px 4px;
    font-size: 14px;
    line-height: 1;
    .name {
      height: 32px;
      line-height: 16px;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2; //行数
      -webkit-box-orient: vertical;
      word-wrap:break-word;
    }
    .price-row {
      margin-top: 28px;
      line-height:20px;
      height:20px;
    }
    .price {
      width: 20%;
      font-size: 18px;
      margin-right: 4px;
      color: #fe3737;
    }
    .market-price {
      text-decoration: line-through;
      color: #999;
      font-size: 12px;
    }
    .sold-count {
      margin-top: 10px;
      font-size: 11px;
      color: #999;
      &.no-show {
        visibility: hidden;
      }
    }
    .btn-buy {
      float:right;
      img{
        width:20px;
        height:20px;
        object-fit:contain;
      }
    }
  }
}
/*横向滚动*/
.layout-5 {
  flex-wrap: nowrap;
  align-items: stretch;
  position: relative;
  // overflow: auto;
  width:fit-content;
  &.edit-mode {
    overflow: hidden;
  }
  .product-item {
    width: 102px;
    flex-shrink: 0;
  }
  // .product-item-border{
  //   height:100%;
  //   display:flex;
  //   flex-direction:column;
  // }
  // .product-img-div{
  //   flex:1;
  // }
  .product-img-div{
    position:relative;
    overflow:hidden;
    &:before{
      content:'';
      display:block;
      padding-top:100%;
    }
  }
  .product-img {
    position: absolute;
    left:0;
    top:0;
    bottom:0;
    right:0;
    margin:auto;
    width: 100%;
  }
  .product-info-div {
    padding: 6px 4px 4px;
    line-height: 1;
    .name {
      font-size: 12px;
      color:#333;
      white-space:nowrap;
      overflow: hidden;
      text-overflow:ellipsis
    }
    .price-row {
      margin-top: 10px;
      line-height:14px;
      height:14px;
    }
    .price {
      color: #fe3737;
      font-size: 14px;
    }
    .market-price {
      font-size: 10px;
      text-decoration: line-through;
      color: #999;
    }
    .sold-count {
      margin-top: 10px;
      font-size: 1px;
      color: #666;
    }
    .btn-buy {
      float:right;
      img{
        width:14px;
        height:14px;
        object-fit:contain;
      }
    }
  }
}

/*瀑布流*/
.layout-6 {
  .masonry {
    column-count: 2;
    column-width: calc((100%) / 3);
    column-gap: 10px;
  }
  .product-item {
    box-sizing: border-box;
  }
  .product-img {
    position: relative;
    max-width: 100%;
    max-height: 100%;
  }
  .product-item-border {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: auto;
    box-sizing: border-box;
  }
  .product-img-div {
    font-size: 0;
  }
 .product-info-div {
    position: relative;
    font-size: 14px;
    line-height: 1;
    padding: 8px 6px;
    .name {
      height: 32px;
      line-height: 16px;
      font-size: 14px;
      color:#333;
      width:100%;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2; //行数
      -webkit-box-orient: vertical;
    }
    .price-row {
      margin-top: 10px;
      line-height:20px;
    }
    .price {
      margin-right: 4px;
      color: #fe3737;
      font-size: 16px;
    }
    .market-price {
      text-decoration: line-through;
      color: #666;
      font-size: 12px;
      color: rgba(153, 153, 153, 1);
    }
    .sold-count {
      margin-top: 6px;
      font-size: 11px;
      color: #999;
    }
    .btn-buy {
      float:right;
      img{
        width:20px;
        height:20px;
        object-fit:contain;
      }
    }
  }
}
</style>
