<template>
  <div
    class="module-groupbuying"
    :class="{
      'layout-one': module.layout === 1,
      'layout-two': module.layout === 2
    }"
  >
    <div
      class="module-groupbuying-item"
      v-for="(item, index) in module.product_list"
      @click="
        $router.push({
          name: 'groupBuyingProductDetail',
          query: { id: item.id }
        })
      "
      :style="
        `margin-bottom: ${module.product_margin}px;${getStyle(index)}` +
          (module.border_style === 0 ? 'border-radius: 0;' : '') +
          (module.product_style === 3
            ? 'border: 1px solid #EEEEEE;box-shadow: none;'
            : module.product_style === 1
            ? 'box-shadow: none;'
            : '')
      "
      :key="index"
    >
      <div class="module-groupbuying-icon"></div>
      <div
        class="module-groupbuying-image"
        :style="
          `background-image: url(${getProductImg(item)});` +
            (module.border_style === 0 ? 'border-radius: 0;' : '')
        "
      >
        <div
          v-if="
            module.layout === 1 && [0, -1].includes(item.groupbuying_status)
          "
          :style="
            item.groupbuying_status === 0
              ? 'background: linear-gradient(#08BE8C, #04C479);'
              : ''
          "
        >
          <div>
            {{
              item.groupbuying_status === 0
                ? item.start_time + " 开团"
                : "活动已结束"
            }}
          </div>
        </div>
      </div>
      <div class="module-groupbuying-content">
        <div class="module-groupbuying-name">{{ item.name }}</div>
        <div class="module-groupbuying-desc">
          <div class="module-groupbuying-price">
            <div><span>拼团价</span><span>￥</span>{{ item.min_price }}</div>
            <div>
              <div>
                单购¥<span>{{ item.price }}</span>
              </div>
            </div>
          </div>
          <div class="module-groupbuying-buy">
            <div
              class="module-groupbuying-num"
              v-if="module.layout === 1 || item.groupbuying_status !== 0"
            >
              <div
                v-show="module.layout === 1 || item.groupbuying_status === -1"
              >
                {{ item.people_num }}人团
              </div>
              <div v-if="item.groupbuying_status !== 0">
                <div>
                  已拼{{
                    getNum(item.order_base_num + item.total_sold_num || 0)
                  }}件
                </div>
              </div>
            </div>
            <div
              class="module-groupbuying-button"
              v-if="
                module.layout === 2 && [0, 1].includes(item.groupbuying_status)
              "
              :class="{
                'module-groupbuying-button-red': item.groupbuying_status === 1
              }"
            >
              <div
                :style="
                  'padding: 0;' +
                    (item.groupbuying_status === 0
                      ? 'width: 74px;'
                      : 'width: 55px;')
                "
              >
                {{ item.people_num }}人团
              </div>
              <div>
                <span>
                  {{
                    item.groupbuying_status === 1
                      ? "去拼团"
                      : item.start_time + " 开团"
                  }}
                </span>
                <i
                  v-if="item.groupbuying_status === 1"
                  class="iconfont iconfont1 icon-fanhui"
                ></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="module-groupbuying-end"
        v-if="module.layout === 2 && item.groupbuying_status === -1"
      >
        已结束
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["module", "editMode"],
  data() {
    return {};
  },
  methods: {
    getProductImg(pinfo) {
      if (this.editMode)
        return (
          this.$store.state.siteComdataPath + pinfo.small_images.split(",")[0]
        );
      else
        return this.$root.$options.filters.getUrl(
          pinfo.small_images.split(",")[0]
        );
    },
    /**
     * 获取在线观看人数
     */
    getNum(num) {
      if (num >= 10000) {
        return (Math.floor(num / 1000) / 10).toFixed(1) + "w";
      } else {
        return num;
      }
    },
    getStyle(index) {
      return [
        `width: calc(50% - ${this.module.product_margin / 2}px);` +
          (index % 2 === 0
            ? ""
            : `margin-left: ${this.module.product_margin}px;`),
        ""
      ][this.module.layout - 1];
    }
  }
};
</script>
<style lang="less" scoped>
.module-groupbuying {
  &.layout-two {
    .module-groupbuying-item {
      padding: 10px 10px 10px 15px;
      display: flex;
      border-radius: 5px;
      box-shadow: 2px 2px 5px 0px rgba(0, 0, 0, 0.16);
      .module-groupbuying-image {
        width: 110px;
        height: 110px;
        margin-right: 8px;
      }
      .module-groupbuying-content {
        width: calc(100% - 118px);
        .module-groupbuying-desc {
          margin-top: 4px;
          .module-groupbuying-buy {
            margin-top: 8px;
            height: 28px;
            .module-groupbuying-num {
              & > div {
                &:nth-child(1) {
                  line-height: 16px;
                  margin-right: 6px;
                  border: 1px solid #ff305c;
                  padding: 0 5px;
                  color: #ff305c;
                  background-color: #fff4f6;
                }
              }
            }
          }
        }
      }
      .module-groupbuying-end {
        position: absolute;
        right: 10px;
        bottom: 10px;
        width: 50px;
        height: 50px;
        line-height: 50px;
        color: #333;
        font-size: 12px;
        text-align: center;
        transform: rotate(-45deg);
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.06);
      }
    }
  }
  &.layout-one {
    display: flex;
    flex-wrap: wrap;
    .module-groupbuying-item {
      width: calc(50% - 5px);
      border-radius: 5px;
      box-shadow: 0px 3px 3px 0px rgba(0, 0, 0, 0.1);
      .module-groupbuying-image {
        position: relative;
        padding-top: 100%;
        border-radius: 5px 5px 0 0;
        & > div {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 25px;
          text-align: center;
          background-color: rgba(51, 51, 51, 0.9);
          border-radius: 5px 5px 0 0;
          opacity: 0.8;
          div {
            color: #fff;
            font-size: 22px;
            transform: scale(0.5);
            transform-origin: left top;
            height: 50px;
            line-height: 52px;
            width: 200%;
          }
        }
      }
      .module-groupbuying-content {
        margin-top: 7px;
        padding: 0 9px 14px 7px;
        .module-groupbuying-desc {
          display: flex;
          flex-direction: column-reverse;
          margin-top: 6px;
          .module-groupbuying-price {
            margin-top: 2px;
          }
          .module-groupbuying-num {
            & > div {
              &:nth-child(1) {
                line-height: 16px;
                height: 15px;
                padding: 0 5px;
                border-radius: 3px;
                color: #fff;
                background-color: #ff322b;
              }
              &:nth-child(2) {
                height: 15px;
                margin-left: 5px;
                div {
                  height: 30px;
                  line-height: 26px;
                }
              }
            }
          }
        }
      }
    }
  }
  .module-groupbuying-item {
    position: relative;
    background: #ffffff;
    .module-groupbuying-icon {
      position: absolute;
      top: 0;
      left: -5px;
      overflow: hidden;
      z-index: 1;
      &::before {
        content: "";
        position: absolute;
        top: 1px;
        left: -21px;
        display: block;
        border-width: 13px;
        border-style: solid;
        border-color: #f8a9ba #f8a9ba transparent transparent;
      }
      &::after {
        content: "拼团";
        position: relative;
        display: block;
        width: 88px;
        height: 44px;
        line-height: 44px;
        font-size: 22px;
        text-align: center;
        border-radius: 0 44px 44px 0;
        transform: scale(0.5);
        transform-origin: top left;
        color: #fff;
        background: linear-gradient(#fd6b8a, #ff645a);
      }
    }
    .module-groupbuying-image {
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    }
    .module-groupbuying-name {
      display: -webkit-box;
      line-height: 17px;
      height: 34px;
      font-size: 13px;
      color: #333;
      overflow: hidden;
      -webkit-box-orient: vertical;
      text-overflow: ellipsis;
      -webkit-line-clamp: 2;
      word-break: break-all;
    }
    .module-groupbuying-desc {
      .module-groupbuying-price {
        & > div {
          &:nth-child(1) {
            color: #fe3737;
            font-size: 16px;
            line-height: 21px;
            height: 21px;
            font-weight: bold;
            margin-bottom: 1px;
            span {
              font-size: 62.5%;
              font-weight: initial;
              &:first-child {
                font-size: 12px;
              }
            }
          }
          &:nth-child(2) {
            position: relative;
            height: 14px;
            color: #999;
            div {
              position: absolute;
              width: 200px;
              font-size: 20px;
              transform: scale(0.5);
              transform-origin: top left;
              span {
                text-decoration: line-through;
              }
            }
          }
        }
      }
      .module-groupbuying-buy {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        .module-groupbuying-button {
          display: flex;
          flex: 1;
          height: 28px;
          line-height: 28px;
          border-radius: 4px;
          color: #07be88;
          text-align: center;
          border: 1px solid #06c084;
          background-color: #f4fffb;
          & > div {
            padding: 0 9px;
            &:nth-child(2) {
              padding: 0;
              line-height: 26px;
              flex: 1;
              color: #fff;
              background: linear-gradient(#08be8c, #04c479);
              span {
                vertical-align: middle;
                line-height: 16px;
                display: inline-block;
              }
              i {
                font-size: 12px;
                transform: rotate(180deg) scale(0.8);
                display: inline-block;
                margin-right: -3px;
                margin-left: 2px;
                vertical-align: baseline;
              }
            }
          }
          &.module-groupbuying-button-red {
            width: 120px;
            flex: none;
            color: #ff305c;
            border: 1px solid #ff305c;
            background-color: #fff4f6;
            & > div {
              &:nth-child(2) {
                background: linear-gradient(#ff305c, #ff3225);
              }
            }
          }
        }
        .module-groupbuying-num {
          display: flex;
          & > div {
            &:nth-child(2) {
              position: relative;
              min-width: 60px;
              height: 18px;
              color: #999;
              div {
                position: absolute;
                height: 36px;
                padding: 0 12px;
                line-height: 32px;
                font-size: 20px;
                border-radius: 30px 30px 30px 0;
                text-align: center;
                border: 2px solid #eee;
                transform: scale(0.5);
                transform-origin: top left;
                white-space: nowrap;
              }
            }
          }
        }
      }
    }
  }
}
</style>
