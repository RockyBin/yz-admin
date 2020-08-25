<template>
  <div class="nav-bar" :style="'background:' + info.background">
    <router-link
      :to="editMode ? '' : (item.link_url+'').replace('#','')"
      :rel="item.link_type"
      v-for="(item, index) in info.items"
      :key="index"
      :class="{'nav-item': true, 'no-name': !item.name}"
      @click.native="onClick(index,$event)"
    >
      <div :class="{'icon-container': true, 'no-name': !item.name, 'no-url': !item.link_url}">
        <my-icon
          v-if="item.icon_type == 0"
          :type="item.icon"
          size="20"
          :color="currentItem != index ? info.normal_color : info.active_color"
        />
        <img :class="{'icon-img': true, 'no-name': !item.name}" v-else :src="currentItem != index ? item.image:item.image_active">
      </div>
      <span v-if="item.name" class="nav-name" :style="{fontSize:'11px', color:currentItem != index ? info.normal_color:info.active_color}">{{item.name}}</span>
    </router-link>
  </div>
</template>
<script>
import myIcon from "@/views/shop/components/icons/icon.vue";
export default {
  components: {
    myIcon
  },
  props: ["info", "editMode"],
  watch: {
    $route: {
      handler(val) {
        if (!this.clickStatus) {
          this.currentItem =
            this.info.items &&
            this.info.items.findIndex(item => item.link_url === "#" + val.path);
        } else {
          this.clickStatus = false;
        }
      },
      immediate: true
    },
    info(){
      this.info.items.forEach((item, index) => {
        var path = (item.link_url + "").replace("#", "");
        path = path.split("?")[0];
        if (path == this.$route.path) {
          this.currentItem = index;
        }
      });
    }
  },
  data() {
    return {
      currentItem: -1,
      clickStatus: false // 标记是否是点击触发路由，防止导航有相同路由时定位不准确
    };
  },
  mounted() {
    
  },
  methods: {
    onClick(index, event) {
      if (this.editMode){
        event.preventDefault();
        event.stopPropagation();
      } else {
        this.currentItem = index;
        this.clickStatus = true;
      }
    }
  }
};
</script>
<style lang="less" scoped>
.nav-bar {
  display: flex;
  height: 49px;
  width: 100%;
  box-sizing: border-box;
  justify-content: space-around;
  align-items: center;
  line-height: 1;
  border-top: 1px solid #e8ebef;
  .nav-item {
    text-align: center;
    line-height: 1.18;
    display: block;
    &.no-url {
      pointer-events: none;
    }
  }
  .icon-container {
    width: 22px;
    height: 22px;
    padding: 1px;
    text-align: center;
    margin: 0 auto;
	&.no-name {
		width: unset;
		height: unset;
		max-width: 60px;
		max-height: 49px;
	}
  }
  .icon-img {
    width: 20px;
    height: 20px;
    object-fit: contain;
    vertical-align: bottom;
    margin-bottom: 3px;
	&.no-name {
		width: unset;
		height: unset;
		max-width: 100%;
		max-height: 38px;
		margin-bottom: 0;
	}
  }
  .nav-name {
    margin-top: 3px;
    display: inline-block;
  }
}
</style>
