<template>
  <div v-if="module.module_type == 'ModuleLink'" :class="['container-layout-' + module.layout,editMode ? 'edit-mode':'']">
    <div v-if="module.slide != 1">
      <div v-if="module.layout == 1" class="fixed-layout1">
        <div
          v-for="(item, index) in module.items"
          :key="index"
          :class="['item']"
          :style="{'width':(100 / module.row_num)+'%'}"
        >
          <a :href="item.link_url" :rel="item.link_type">
            <div class="wrapper1">
              <img class="img1" :style="{'border-radius':module.border_radius}" :src="item.image||'images/sample/placeholder.png'">
            </div>
            <span
              :class="['link-text','layout-' + module.layout]"
              :style="'color:'+module.font_color+';'"
            >{{item.link_text ? item.link_text : "标题名称"}}</span>
          </a>
        </div>
      </div>
      <div v-if="module.layout == 2 || module.layout == 3" class="fixed-layout2">
        <div
          v-for="(item, index) in module.items"
          :key="index"
          :class="['item',module.layout == 3 && index < module.items.length - 1 && 'bordered-nouse']"
          :style="{'width':(100 / (module.layout == 3 ? module.items.length : module.row_num))+'%'}"
        >
          <a :href="item.link_url" :rel="item.link_type">
            <div class="wrapper" v-if="module.layout == 1 || module.layout == 2">
              <img class="img" :style="{'border-radius':module.border_radius}" :src="item.image||'images/sample/placeholder.png'">
            </div>
            <span
              v-if="module.layout == 3"
              :class="['link-text','layout-' + module.layout]"
              :style="'color:'+module.font_color+';'"
            >{{item.link_text ? item.link_text : "标题名称"}}</span>
          </a>
        </div>
      </div>
    </div>
    <div v-if="module.slide == 1">
      <div v-if="showSlide && module.layout == 1" ref="slide" class="slide-layout1" key="layout1">
        <div
          class="item"
          v-for="(item,index) in module.items"
          :key="'layout1-item'+index"
          :style="{'width':(100 / module.show_num / module.row_count)+'%'}"
        >
          <a :href="item.link_url" :rel="item.link_type">
            <div class="wrapper1">
              <img class="img1" :style="{'border-radius':module.border_radius}" :src="item.image||'images/sample/placeholder.png'">
            </div>
            <span class="link-text" :style="'color:'+module.font_color+';'">{{item.link_text ? item.link_text : "标题名称"}}</span>
          </a>
        </div>
      </div>
      <div v-if="module.layout == 2 || module.layout == 3" class="slide-layout2" key="layout2">
        <div class="item-group" v-for="(gitem,idx) in groups" :key="'group'+idx">
          <div
            :class="['item',module.layout == 3 && 'bordered-nouse']"
            v-for="(item,index) in gitem"
            :key="'layout2-item'+index"
            :style="{width:module.row_count==2 && module.layout != 3 ? 100 / (module.show_num / 2 + 0.5) + '%': 100 / (module.show_num + 0.5) +'%'}"
          >
            <a :href="item.link_url" :rel="item.link_type">
              <div class="wrapper" v-if="module.layout == 2">
                <img class="img" :style="{'border-radius':module.border_radius}" :src="item.image||'images/sample/placeholder.png'">
              </div>
              <span
                v-if="module.layout == 3"
                :class="['link-text','layout-' + module.layout]"
                :style="'color:'+module.font_color+';'"
              >{{item.link_text ? item.link_text : "标题名称"}}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
let $ = window.$;
export default {
  components: {},
  props: ["module","editMode"],
  data() {
    return {
      groups: [],
      initRowNum: 0,
      initItemNum: 0,
      showSlide: true
    };
  },
  created() {},
  mounted() {
    if (this.module && this.module.module_type == "ModuleLink") {
      this.initRowNum = this.module.row_num;
      this.initItemNum = this.module.items.length;
    }
    this.initGroups();
    if (this.module.layout == 1 && this.module.slide == 1) {
      this.initSlide();
    }
  },
  watch: {
    module: {
      handler(newValue) {
        this.initGroups();
        if (newValue.layout == 1 && newValue.slide == 1) {
          this.clearSlide();
          this.initSlide();
        }
      },
      deep: true
    }
  },
  methods: {
    initGroups: function() {
      this.groups = [];
      if (this.module.layout == 2) {
        for (var i = 0; i < this.module.row_count; i++) {
          this.groups.push([]);
        }
        var groupIndex = 0;
        this.module.items.forEach((item, index) => {
          this.groups[groupIndex].push(item);
          if (
            index + 1 ==
            Math.ceil(this.module.items.length / this.module.row_count)
          ) {
            groupIndex++;
          }
        });
      } else if (this.module.layout == 3) {
        this.groups[0] = this.module.items;
      }
    },
    initSlide: function() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(() => {
        var slide = this.$refs.slide;
        if (slide) {
          $(slide).slick({
            arrows: false,
            infinite: false,
            // slidesToSrolll:3,
            slidesToShow: Math.ceil(
              this.module.show_num / this.module.row_count
            ),
            rows: this.module.row_count,
            slidesPerRow: 1,
            // slidesPerRow:Math.ceil(this.module.items.length/this.module.row_count),
            swipeToSlide: true,
            swipe: true,
            touchMove: true
          });
        }
      }, 1);
    },
    clearSlide() {
      var slide = this.$refs.slide;
      if (slide && $(slide).hasClass("slick-initialized")) {
        $(slide).slick("unslick");
        $(slide).removeClass("slick-initialized");
      }
    }
  }
};
</script>
<style lang="less" scoped>
.edit-mode {
  .slide-layout2 {
    overflow: hidden;
  }
}
.fixed-layout1,
.fixed-layout2 {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  overflow: auto;
  align-items: flex-start;
}
.slide-layout1 {
  width: 100%;
  overflow: hidden;
}
.slide-layout2 {
  width: 100%;
  overflow: auto;
  .item {
    float: left;
  }
}
.item-group {
  display: flex;
  flex-wrap: nowrap;
}
.item {
  box-sizing: border-box;
  padding: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
  display: inline-block;
  &.bordered:not(:last-child) {
    position: relative;
    &:after {
      position: absolute;
      right: 0;
      top: 8px;
      content: "";
      width: 1px;
      height: 16px;
      background-color: #959595;
    }
  }
}
.fixed-layout1,
.slide-layout1{
  .item{
    padding:0
  }
  .link-text{
    line-height:1;
    height:auto;
    margin-bottom:6px;
  }
}
.slide-layout1 /deep/.slick-slide>div{
  font-size:0;
}
.container-layout-3 {
  height: 38px;
  overflow-y: hidden;
  .item {
    padding: 0;
  }
}
.item a {
  display: block;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  font-size: 0px;
}
.wrapper {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  .img {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
.wrapper1 {
  width: 100%;
  padding: 6px 0;
  text-align: center;
  .img1 {
    display: inline-block;
    width: 43px;
    height: 43px;
    object-fit: contain;
  }
}
.link-text {
  font-size: 12px;
  display: block;
  text-align: center;
  line-height: 25px;
  height: 25px;
  overflow: hidden;
  text-overflow: ellipsis;
  &.layout-3 {
    font-size: 13px;
    line-height: 38px;
  }
}
</style>
