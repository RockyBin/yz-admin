<template>
  <div class="container" v-if="module.module_type == 'ModuleNotice'">
    <div :class="['icon',getIconStyle()]">
      <img :src="module.icon">
    </div>
    <div class="marquee_box">
      <div class="marquee_list" :class="{anim:animate == true}">
        <div class="item" v-for="item in items" :key="item.index">
          <a
            :style="module.color ? 'color:' + module.color : ''"
            :href="item.link_url"
          >{{item.content||'请填写公告内容'}}</a>
        </div>
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
export default {
  components: {},
  props: ["module"],
  data() {
    return {
      animate: false,
      timer: null,
      items: []
    };
  },
  created() {
    this.items = Object.assign([], this.module.items); //为什么做拷贝：这样就不会因为items的动态改变而引起属性窗口的内容不断变化
    this.timer = window.setInterval(this.scroll, 3000);
  },
  watch: {
    "module.items": {
      handler(newValue) {
        if (newValue) this.items = Object.assign([], newValue);
      }
    }
  },
  methods: {
    getIconStyle() {
      var cls = "";
      if (this.module.icon.indexOf("1.") > -1) cls = "icon-1";
      if (this.module.icon.indexOf("2.") > -1) cls = "icon-2";
      if (this.module.icon.indexOf("3.") > -1) cls = "icon-3";
      if (this.module.icon.indexOf("4.") > -1) cls = "icon-4";
      return cls;
    },
    scroll() {
      if (this.module && this.items && this.items.length > 1) {
        this.animate = true; // 因为在消息向上滚动的时候需要添加css3过渡动画，所以这里需要设置true
        window.setTimeout(() => {
          this.items.push(this.items[0]); // 将数组的第一个元素添加到数组的
          this.items.shift(); //删除数组的第一个元素
          this.animate = false; // margin-top 为0 的时候取消过渡动画，实现无缝滚动
        }, 500);
      }
    },
    goUrl(url) {
      window.location.href = url;
    }
  },
  beforeDestroy() {
    window.clearInterval(this.timer);
  }
};
</script>
<style lang="less" scoped>
@icon-height: 30px;
@item-height: 30px;
.container {
  display: flex; /*设为伸缩容器*/
  flex-flow: row; /*伸缩项目单行排列*/
  align-items: flex-start;
}
.icon {
  display: flex;
  height: @icon-height;
  padding: 1px 0;
  align-items: center;
  &.icon-1 img {
    width: 67px;
  }
  &.icon-2 img {
    width: 32px;
  }
  &.icon-3 img {
    width: 50px;
  }
  &.icon-4 img {
    
  }
  img {
    max-height: 100%;
  }
}
.marquee_box {
  flex: 1;
  display: block;
  position: relative;
  height: @item-height;
  overflow: hidden;
}
.marquee_list {
  display: block;
  flex: 1;
  height: @item-height;
  position: absolute;
}
.item {
  padding-top: 2px;
}
.item a {
  padding-left: 15px;
  height: @item-height;
  line-height: @item-height;
  display: block;
}
.anim {
  transition: all 0.5s;
  margin-top: -@item-height;
}
</style>
