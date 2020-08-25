<template>
  <div v-if="isShow" :class="{'slider-container': true,'layout-3': module.layout == 3}">
    <div
      class="module-slider"
      :id="'carousel' + module.id"
      v-if="module.module_type == 'ModuleSlider'"
    >
      <div v-for="(item, index) in module.items" :key="index" class="item">
        <a
          :href="item.link_url"
          @click="linkClick(item.link_url)"
          :class="{'item-link': true,'item-link-card':module.image_style == 2}"
        >
          <img
            :class="{'item-img':true,'hide-after-one': hideAfterOne && index > 0,'item-img-radius': module.border_style == 2,'item-img-card':module.image_style == 2}"
            :src="item.image ? item.image : 'images/slider/demopic.png'"
            @load="imageLoaded"
          >
        </a>
      </div>
    </div>
    <div v-if="module.layout == 2" class="numbers">
      <span>{{curIndex+1}}</span>
      <span>/</span>
      <span>{{module.items.length}}</span>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
let $ = window.$;
export default {
  components: {},
  props: ["module", "editMode"],
  data() {
    return {
      curIndex: 0,
      isShow: true,
      hideAfterOne: true,
      loadedImages: 0
    };
  },
  watch: {
    "module.layout": {
      handler() {
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
        }
        this.timer = setTimeout(() => {
          this.carouselInit();
        }, 50);
      }
    },
    "module.image_style": {
      handler() {
        if (this.module.image_style == 2) {
          $("#carousel" + this.module.id).addClass("slider-card");
        } else {
          $("#carousel" + this.module.id).removeClass("slider-card");
        }

        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
        }
        this.timer = setTimeout(() => {
          this.carouselInit();
        }, 50);
      }
    },
    "module.padding_left_right": {
      handler() {
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
        }
        this.timer = setTimeout(() => {
          this.carouselInit();
        }, 50);
      }
    },
    "module.items": {
      handler() {
        //设置一下幻灯片的父窗口的高度只是为了让界面跳动不要这么厉害
        var dom = $(".slider-container")
          .parent()
          .height($(".module-slider").height());
        this.isShow = false;
        setTimeout(() => {
          this.isShow = true;
          if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
          }
          this.timer = setTimeout(() => {
            dom.height("auto");
            this.carouselInit();
          }, 50);
        }, 10);
      }
    }
  },
  mounted() {
    if (this.editMode) {
      this.timer = setTimeout(() => {
        this.carouselInit();
      }, 500);
    }
  },
  methods: {
    imageLoaded() {
      this.loadedImages++;
      if (this.loadedImages >= this.module.items.length) {
        this.hideAfterOne = false;
        //if(!this.editMode){
        this.carouselInit();
        //}
      }
    },
    carouselInit() {
      this.timer = null;
      var that = this;
      if ($("#carousel" + this.module.id).hasClass("slick-initialized")) {
        $("#carousel" + this.module.id).removeClass("slick-initialized");
        try {
          $("#carousel" + this.module.id).slick("unslick");
        } catch (e) {}
      }
      var options = {
        dots: this.module.layout != 2,
        infinite: true,
        arrows: false,
        autoplay: this.editMode ? false : true, // 编辑时不做自动轮播
        autoplaySpeed: this.module.auto_play * 1000,
        adaptiveHeight: true,
        dotsClass: "slick-dots my-slick-dots",
        slidesToShow: 1,
        pauseOnFocus: false
      };
      if (that.module.layout == 3) {
        options["centerMode"] = true;
        options["centerPadding"] = "40px";
      }
      $("#carousel" + this.module.id).slick(options);
      $("#carousel" + this.module.id).css("margin-bottom", 0);
      $("#carousel" + this.module.id).off("beforeChange");
      $("#carousel" + this.module.id).off("afterChange");
      $("#carousel" + this.module.id).on("afterChange", function(
        slick,
        currentSlide
      ) {
        that.curIndex = currentSlide.currentSlide;
      });
      // 解决在模块3时，在最后一个切换到第一个的时候缩放跳动问题
      that.module.layout == 3 &&
        $("#carousel" + this.module.id).on("beforeChange", function(
          slick,
          currentSlide
        ) {
          let currentIndex = currentSlide.currentSlide;
          that.$nextTick(() => {
            let lastChangeElem = $(this).find(
              '.slick-slide[data-slick-index="' +
                that.module.items.length +
                '"]'
            );
            if (that.module.items.length - 1 === currentIndex) {
              lastChangeElem.addClass("slick-active");
            } else {
              lastChangeElem.removeClass("slick-active");
            }
          });
        });
      // 删除轮播初始化复制的节点遗留下来的class
      [].forEach.call(this.$el.querySelectorAll(".hide-after-one"), elm => {
        let className = elm.className.split(/\s/g);
        elm.className = className
          .filter(item => item !== "hide-after-one")
          .join(" ");
      });
    },
    //处理无链接时，点击不会有任何动作
    linkClick(url) {
      if (!url) return false;
    }
  }
};
</script>
<style lang="less" scoped>
.slider-container {
  position: relative;
}
.item-img {
  width: 100%;
}
.hide-after-one {
  display: none;
}
/deep/.my-slick-dots {
  bottom: 0px;
  overflow: hidden;
  li {
    width: 6px;
    height: 6px;
    margin: 3px;
    button {
      &::before {
        content: "";
        background: #fff;
        border-radius: 6px;
        width: 6px;
        height: 6px;
      }
    }
  }
}
/deep/.slider-card {
  .my-slick-dots {
    bottom: 6px;
  }
}
.numbers {
  position: absolute;
  background: #000;
  opacity: 0.7;
  width: 45px;
  height: 20px;
  border-radius: 10px;
  right: 10px;
  bottom: 10px;
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
  .item-link-card {
    padding: 6px;
  }
  .item-link {
    display: block;
    position: relative;
    box-sizing: border-box;
    .item-img {
      position: relative;
    }
    .item-img-radius {
      border-radius: 4px;
    }
    .item-img-card {
      box-shadow: 2px 2px 5px #999;
    }
    .item-noimg {
      height: 150px;
      line-height: 150px;
      text-align: center;
    }
  }
}
.layout-3 {
  /deep/.my-slick-dots {
    font-size: 0;
    li {
      width: 6px;
      transition: width 1s ease;
      margin: 5px 3px;
      button {
        width: auto;
        padding: 0;
        &::before {
          width: 100%;
        }
      }
    }
    .slick-active {
      width: 14px;
      button {
        &::before {
          content: "";
          background: #fff;
          border-radius: 6px;
          height: 6px;
        }
      }
    }
  }
  .item {
    .item-link {
      transform: scale(0.92);
    }
  }
  .slick-active {
    .item-link {
      transform: scale(1);
    }
  }
}
</style>
