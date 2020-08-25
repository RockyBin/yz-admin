<template>
  <div v-if="isIE">
    <Modal
      class="check-browser"
      v-model="modalShow"
      :closable="false"
      :mask-closable="false"
      :scrollable="false"
      footer-hide
      width="800px"
    >
      <div class="check-browser-content">
        <div class="check-browser-title">
          <i class="iconfont icon-ios-close" @click="modalShow = false"></i>
          <span>浏览器版本提示</span>
        </div>
        <div class="check-browser-body">
          <div class="check-browser-tip">
            <p>
              <i :style="`background-image: url(${require('./../../public/images/ie/tis.png')});`"></i>本平台不支持ie浏览器访问
            </p>
            <p>为了获得最佳体验效果，推荐使用以下浏览器</p>
          </div>
          <div
            class="check-browser-type"
            :style="`background-image: url(${require('./../../public/images/ie/juxing.png')});`"
          >
            <div class="check-browser-type-item">
              <div
                :style="`background-image: url(${require('./../../public/images/ie/diannao.png')});`"
              ></div>
              <div>浏览器推荐</div>
            </div>
            <div class="check-browser-type-item">
              <div
                :style="`background-image: url(${require('./../../public/images/ie/google.png')});`"
              ></div>
              <div>谷歌浏览器</div>
            </div>
            <div class="check-browser-type-item">
              <div
                :style="`background-image: url(${require('./../../public/images/ie/360liulanq.png')});position:relative;`"
              >
                 <div :style="`background-image: url(${require('./../../public/images/ie/speed.png')});position:absolute;top: -29px;right: -37px;width: 54px;height: 54px;`">
                </div>
              </div>
              <div>360浏览器</div>
            </div>
            <div class="check-browser-type-item">
              <div
                :style="`background-image: url(${require('./../../public/images/ie/QQliulanq.png')});position:relative;`"
              >
                <div :style="`background-image: url(${require('./../../public/images/ie/speed.png')});position:absolute;top: -29px;right: -37px;width: 54px;height: 54px;`">
                </div>
              </div>
              <div>QQ浏览器</div>
            </div>
            <div class="check-browser-type-item">
              <div
                :style="`background-image: url(${require('./../../public/images/ie/sougouliulanq.png')});position:relative;`"
              >
                 <div :style="`background-image: url(${require('./../../public/images/ie/speed.png')});position:absolute;top: -29px;right: -37px;width: 54px;height: 54px;`">
                </div>
              </div>
              <div>搜狗浏览器</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>
<script>
export default {
  props: {
    isIE: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      modalShow: this.isIE
    };
  }
};
</script>
<style lang="less" scoped>
.check-browser {
  /deep/.ivu-modal {
    .ivu-modal-content {
      border-radius: 0;
      .ivu-modal-body {
        padding: 0;
        .check-browser-content {
          height: 400px;
          width: 800px;
          .check-browser-title {
            height: 40px;
            line-height: 40px;
            padding: 0 5px 0 15px;
            font-size: 14px;
            color: #999;
            background-color: #f9f9f9;
            i.iconfont {
              font-size: 32px;
              display: block;
              float: right;
              width: 40px;
              text-align: center;
              cursor: pointer;
            }
          }
        }
        .check-browser-body {
          text-align: center;
          .check-browser-tip {
            margin-top: 45px;
            p {
              &:first-child {
                position: relative;
                display: inline-block;
                *display: inline;
                *zoom: 1;
                font-size: 18px;
                color: #333;
                i {
                  position: absolute;
                  display: inline-block;
                  *display: inline;
                  *zoom: 1;
                  top: 0;
                  bottom: 0;
                  margin: auto;
                  height: 20px;
                  width: 20px;
                  left: -33px;
                  background-repeat: no-repeat;
                  background-size: cover;
                }
              }
              + p {
                font-size: 16px;
                color: #666;
                margin-top: 11px;
              }
            }
          }
          .check-browser-type {
            margin-top: 30px;
            font-size: 0;
            display: inline-block;
            *display: inline;
            *zoom: 1;
            width: 685px;
            height: 152px;
            box-sizing: border-box;
            padding: 28px 0;
            font-size: 0;
            letter-spacing: -4px;
            *letter-spacing: normal;
            *word-spacing: -1px;
            background-repeat: no-repeat;
            background-size: cover;
            .check-browser-type-item {
              letter-spacing: normal;
              *word-spacing: normal;
              vertical-align: top;
              display: inline-block;
              *display: inline;
              *zoom: 1;
              width: 140px;
              &:first-child {
                width: 125px;
                div {
                  font-size: 16px;
                  color: #fff;
                }
              }
              div {
                font-size: 14px;
                color: #8e96ba;
                &:first-child {
                  width: 64px;
                  height: 64px;
                  margin-left: auto;
                  margin-right: auto;
                  margin-bottom: 20px;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>


