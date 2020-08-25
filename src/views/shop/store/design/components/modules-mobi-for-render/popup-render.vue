<template>
  <div v-if="popupInfo.items && popupInfo.items.length > 0 && show">
    <div
      :class="{mask:true,fullscreen:popupInfo.size_type == 2,popuphidden: !inited}"
      v-if="loadCompleted"
    ></div>
    <div
      :class="{'slider-container':true,fullscreen:popupInfo.size_type == 2,popuphidden: !inited}"
    >
      <div class="skip" @click="onSkipClick">跳过</div>
      <div id="popup-carousel">
        <div v-for="(item, index) in popupInfo.items" :key="index" class="item">
          <div class="item-link">
            <img
              v-if="item.type == 0"
              :class="{'item-img':true}"
              :src="item.src ? item.src : 'images/slider/demopic.png'"
              @load="imageLoaded"
            />
            <video
              v-if="item.type == 1"
              class="item-video"
              :id="'popup-video-' + index"
              preload="true"
              webkit-playsinline="webkit-playsinline"
              playsinline="playsinline"
              :src="item.src"
              :poster="item.poster"
              x5-video-player-type="h5-page"
              x5-video-player-fullscreen="false"
              muted="muted"
            ></video>
            <img src="images/slider/demopic.png" @load="imageLoaded(false)" style="display:none" />
          </div>
        </div>
      </div>
      <div class="numbers">
        <span>{{curIndex+1}}</span>
        <span>/</span>
        <span>{{popupInfo.items.length}}</span>
      </div>
    </div>
  </div>
</template>
<script>
let $ = window.$;
export default {
  components: {},
  props: {
    /** 弹窗信息 */
    popupInfo: {
      type: Object,
      default: function() {
        return {
          items: []
        };
      }
    },
    editMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      curIndex: 0,
      loadedImages: 0,
      loadCompleted: false, //图片是否已经加载完成
      show: false,
      inited: false, //幻灯片是否已经初始化完成
      freeTimer: null, //空闲时间计数器，用来自动重复弹出
      freeSecond: 0, //已经空闲了几秒
      showTimer: null, //显示时间计数器，用来自动关闭
      showSecond: 0 //已经显示了几秒
    };
  },
  mounted() {
    var that = this;
    //判断是否应该弹出
    if ([2, 3].indexOf(this.popupInfo.show_type) > -1) {
      this.show = true;
    }
    if (
      this.popupInfo.show_type == 1 &&
      !window["popup_device_type_" + this.getDeviceType()]
    ) {
      this.show = true;
    }
    setTimeout(() => {
      if (this.show && !window["hasAllowAutoPlay"] && $("video").length > 0) {
        window["hasAllowAutoPlay"] = true;
        this.$dialog({ message: "请点击确定以便可以播放声音" }).then(() => {
          console.log("allow sound clicked");
          $(".item-video").each(function(i, item) {
            item.muted = false;
          });
        });
      }
    }, 300);
    //当页面点击时，空闲清零
    $("body").on(
      "click.popup tap.popup touchstart.popup touchmove.popup touchend.popup",
      function(e) {
        //console.log(e.type);
        that.freeSecond = 0;
      }
    );
  },
  destroyed() {
    if (this.showTimer) {
      clearInterval(this.showTimer);
    }
    if (this.freeTimer) {
      clearInterval(this.freeTimer);
    }
  },
  methods: {
    imageLoaded(noAdd) {
      if (noAdd !== false) this.loadedImages++;
      var imageItems = this.popupInfo.items.filter(x => x.type == 0);
      if (this.loadedImages >= imageItems.length) {
        this.loadCompleted = true;
        this.carouselInit();
      }
    },
    carouselInit() {
      if (this.showTimer) {
        clearInterval(this.showTimer);
      }
      if (this.freeTimer) {
        clearInterval(this.freeTimer);
      }
      var that = this;
      if ($("#popup-carousel").hasClass("slick-initialized")) {
        $("#popup-carousel").removeClass("slick-initialized");
        try {
          $("#popup-carousel").slick("unslick");
        } catch (e) {}
      }
      var options = {
        dots: false,
        infinite: true,
        arrows: this.editMode ? true : false,
        autoplay: true,
        autoplaySpeed: this.popupInfo.interval
          ? this.popupInfo.interval * 1000
          : 999999,
        adaptiveHeight: this.popupInfo.size_type != 2,
        dotsClass: "slick-dots my-slick-dots",
        slidesToShow: 1,
        pauseOnFocus: false
      };
      $("#popup-carousel").slick(options);
      $("#popup-carousel").css("margin-bottom", 0);
      $("#popup-carousel").off("beforeChange");
      $("#popup-carousel").off("afterChange");
      $("#popup-carousel").on("afterChange", function(slick, currentSlide) {
        that.curIndex = currentSlide.currentSlide;
        $("#popup-carousel").slick("slickPlay");
        that.processVideo();
      });
      that.processVideo();
      //记录显示了多少秒
      clearInterval(this.showTimer);
      if (!this.editMode) {
        this.showTimer = setInterval(() => {
          this.showSecond++;
          if (
            this.popupInfo.autoclose == 1 &&
            this.showSecond >= this.popupInfo.autoclose_second &&
            this.popupInfo.autoclose_second > 0
          ) {
            this.close();
          }
        }, 1000);
      }
      //初始化完成才显示界面，否则界面会有跳一下的感觉
      this.inited = true;
      window["popup_device_type_" + this.getDeviceType()] = true;
    },
    getDeviceType() {
      return 2;
    },
    //处理无链接时，点击不会有任何动作
    linkClick(url) {
      if (this.editMode) return false;
      if (!url) return false;
    },
    //处理切换时的视频播放
    processVideo() {
      var that = this;
      //停止所有视频播放
      $(".item-video").each(function(i, item) {
        item.currentTime = 0;
        item.pause();
      });
      var currentVideo = $("#popup-carousel").find(".slick-current video");
      if (currentVideo.length > 0) {
        currentVideo[0].play();
        $("#popup-carousel").slick("slickPause");
        if (!that.editMode) {
          currentVideo[0].addEventListener(
            "ended",
            function() {
              setTimeout(() => {
                $("#popup-carousel").slick("slickNext");
                $("#popup-carousel").slick("slickPlay");
              }, that.popupInfo.interval * 1000);
            },
            false
          );
        } else {
          currentVideo[0].muted = false;
        }
      }
    },
    onSkipClick() {
      if (this.editMode) {
        alert("为方便预览，编辑模式下不能跳过");
        return;
      }
      this.close();
    },
    //关闭弹窗
    close() {
      try {
        $("#popup-carousel").slick("unslick");
      } catch (e) {}
      this.inited = false;
      this.show = false;
      this.curIndex = 0;
      this.loadedImages = 0;
      this.loadCompleted = false;
      this.freeSecond = 0;
      if (this.showTimer) {
        clearInterval(this.showTimer);
      }
      this.showSecond = 0;
      this.freeCounter();
    },
    //重新弹出
    popup() {
      this.show = true;
      if (this.freeTimer) {
        clearInterval(this.freeTimer);
      }
    },
    //空闲计数器
    freeCounter() {
      clearInterval(this.freeTimer);
      this.freeTimer = setInterval(() => {
        this.freeSecond++;
        if (
          this.popupInfo.show_type == 3 &&
          this.freeSecond >= this.popupInfo.show_interval * 60 &&
          this.popupInfo.show_interval > 0
        ) {
          this.popup();
        }
      }, 1000);
    }
  }
};
</script>
<style lang="less" scoped>
.popuphidden {
  visibility: hidden;
}
.mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 2001;
  &.fullscreen {
    background: rgba(0, 0, 0, 1);
  }
}
.slider-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 80%;
  z-index: 2002;
  &.fullscreen {
    max-width: 100%;
    width: 99%;
    height: 100%;
    .skip {
      position: absolute;
      top: 10px;
      right: 10px;
    }
    .numbers {
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
    }
    #popup-carousel {
      width: 100%;
      height: 100%;
      /deep/.slick-list {
        width: 100%;
        height: 100%;
      }
      /deep/.slick-track {
        width: 100%;
        height: 100%;
      }
      .item {
        width: 100%;
        height: 100%;
        .item-link {
          width: 100%;
          height: 100%;
          .item-img {
            width: 100%;
            height: 100%;
          }
          .item-video {
            width: 100%;
            top: 50%;
            transform: translateY(-50%);
          }
        }
      }
      .slick-slide {
        width: 100%;
        height: 100%;
      }
    }
  }
}
.skip {
  width: 40px;
  padding: 3px;
  background: #333;
  border-radius: 3px;
  cursor: pointer;
  z-index: 2003;
  color: white;
  text-align: center;
  margin: 0 0 10px auto;
}
.numbers {
  background: #000;
  z-index: 2003;
  opacity: 0.7;
  width: 45px;
  height: 20px;
  border-radius: 10px;
  margin: 20px auto 0 auto;
  text-align: center;
  padding-top: 1px;
  span {
    color: white;
    line-height: 20px;
    display: inline-block;
    margin-left: 3px;

    &:first-child {
      margin-left: 0;
    }
  }
}
.item {
  box-sizing: border-box;
  .item-link {
    display: block;
    position: relative;
    box-sizing: border-box;
    text-align: center;
    .item-img {
      position: relative;
      max-width: 100%;
      max-height: 100%;
      margin: 0 auto;
      &:first-child {
        position: relative;
      }
    }
    .item-noimg {
      height: 150px;
      line-height: 150px;
      text-align: center;
    }
    .item-video {
      position: relative;
      max-width: 100%;
      max-height: 100%;
      margin: 0 auto;
      &:first-child {
        position: relative;
      }
    }
  }
}
</style>