<template>
  <div v-if="module.module_type == 'ModuleShopwindow'">
    <div v-if="module.layout==1" class="layout layout1" :style="'margin: '+ module.item_margin +'px 0;'">
      <a :href="getLink(0)">
        <img :src="getPic(0)" :style="(isNoPic([0]) ? 'width:100%;height:200px;object-fit:unset;':'')">
      </a>
    </div>
    <div
      v-if="module.layout == 2"
      :class="['layout','layout'+module.layout]"
    >
      <div v-for="(item,index) in count" :key="index" class="item" :style="{'margin-right':module.item_margin +  'px','height':(isNoPic([0,1])?'180px':'auto')}">
        <a :href="getLink(index)" :class="{'nopic': !hasPic(index)}">
          <img :src="getPic(index)">
        </a>
      </div>
    </div>
    <div
      v-if="module.layout == 3"
      :class="['layout','layout'+module.layout]"
    >
      <div v-for="(item,index) in count" :key="index" class="item" :style="{'margin-right':module.item_margin +  'px','height':(isNoPic([0,1,2])?'117px':'auto')}">
        <a :href="getLink(index)" :class="{'nopic': !hasPic(index)}">
          <img :src="getPic(index)">
        </a>
      </div>
    </div>
    <div
      v-if="module.layout == 4"
      :style="isNoPic([0,1,2]) ? 'height:200px':''"
      :class="['layout','layout'+module.layout]"
    >
      <div class="left">
        <div class="item" :style="{'margin-right':module.item_margin +  'px'}">
          <a :href="getLink(0)" :class="{'nopic': !hasPic(0),'nopic-layout4-1': !hasPic(0)}">
            <img :src="getPic(0)">
          </a>
        </div>
      </div>
      <div class="right">
        <div class="item" :style="{'margin-bottom':module.item_margin +  'px','height':'calc(50% - '+module.item_margin / 2+'px)'}">
          <a :href="getLink(1)" :class="{'nopic': !hasPic(1)}">
           <img :src="getPic(1)" :style="isNoPic([1]) ? 'height:100px':''">
          </a>
        </div>
        <div class="item" :style="{'height':'calc(50% - '+module.item_margin / 2+'px)'}">
          <a :href="getLink(2)" :class="{'nopic': !hasPic(2)}">
            <img :src="getPic(2)" :style="isNoPic([2]) ? 'height:100px':''">
          </a>
        </div>
      </div>
    </div>
    <div
      v-if="module.layout==5"
      :style="isNoPic([0,1,2]) ? 'height:200px':''"
      :class="['layout','layout'+module.layout]"
    >
      <div class="left">
        <div class="item" :style="{'margin-bottom':module.item_margin +  'px','height':'calc(50% - '+module.item_margin / 2+'px)'}">
          <a :href="getLink(0)" :class="{'nopic': !hasPic(0)}">
            <img :src="getPic(0)" :style="isNoPic([0]) ? 'height:100px':''">
          </a>
        </div>
        <div class="item" :style="{'height':'calc(50% - '+module.item_margin / 2+'px)'}">
          <a :href="getLink(1)" :class="{'nopic': !hasPic(1)}">
           <img :src="getPic(1)" :style="isNoPic([1]) ? 'height:100px':''">
          </a>
        </div>
      </div>
      <div class="right">
        <div class="item" :style="{'margin-left':module.item_margin +  'px'}">
          <a :href="getLink(2)" :class="{'nopic': !hasPic(2)}">
            <img :src="getPic(2)">
          </a>
        </div>
      </div>
    </div>
    <div
      v-if="module.layout==6"
      :class="['layout','layout'+module.layout]"
    >
      <div class="top" :style="{'margin-bottom':module.item_margin +  'px'}">
        <div class="item">
          <a :href="getLink(0)" :class="{'nopic': !hasPic(0),'nopic-line1': isNoPic([0])}">
            <img :src="getPic(0)">
          </a>
        </div>
      </div>
      <div class="bottom">
        <div class="item" :style="{'margin-right':module.item_margin +  'px'}">
          <a :href="getLink(1)" :class="{'nopic': !hasPic(1),'nopic-line2': isNoPic([1,2])}">
           <img :src="getPic(1)">
          </a>
        </div>
        <div class="item">
          <a :href="getLink(2)" :class="{'nopic': !hasPic(2),'nopic-line2': isNoPic([1,2])}">
            <img :src="getPic(2)">
          </a>
        </div>
      </div>
    </div>
    <div
      v-if="module.layout==7"
      :class="['layout','layout'+module.layout]"
    >
      <div class="top" :style="{'margin-bottom':module.item_margin +  'px'}">
        <div class="item">
          <a :href="getLink(0)" :class="{'nopic': !hasPic(0),'nopic-line1': isNoPic([0])}">
            <img :src="getPic(0)">
          </a>
        </div>
      </div>
      <div class="bottom">
        <div class="item" :style="{'margin-right':module.item_margin +  'px'}">
          <a :href="getLink(1)" :class="{'nopic': !hasPic(1),'nopic-line2': isNoPic([1,2,3])}">
           <img :src="getPic(1)">
          </a>
        </div>
        <div class="item" :style="{'margin-right':module.item_margin +  'px'}">
          <a :href="getLink(2)" :class="{'nopic': !hasPic(2),'nopic-line2': isNoPic([1,2,3])}">
            <img :src="getPic(2)">
          </a>
        </div>
        <div class="item">
          <a :href="getLink(3)" :class="{'nopic': !hasPic(3),'nopic-line2': isNoPic([1,2,3])}">
            <img :src="getPic(3)">
          </a>
        </div>
      </div>
    </div>
    <div
      v-if="module.layout==8"
      :class="['layout','layout'+module.layout]"
    >
      <div
        v-for="(item,index) in count"
        :key="index"
        :style="{'width': 'calc(50% - '+module.item_margin/2+'px)','margin-right':index % 2 ?'0px':module.item_margin + 'px','margin-bottom':index < 2 ? module.item_margin+ 'px':'0px'}"
        class="item"
      >
        <a :href="getLink(index)" :class="{'nopic': !hasPic(index),'nopic-line1':index < 2 && isNoPic([0,1]),'nopic-line2':index >= 2 && isNoPic([2,3])}">
          <img :src="getPic(index)">
        </a>
      </div>
    </div>
    <div
      v-if="module.layout==9"
      :class="['layout','layout'+module.layout]"
    >
      <div class="block" :style="{'width': 'calc(50% - '+module.item_margin/2+'px)','margin-right':module.item_margin+'px','margin-bottom':module.item_margin+'px'}">
        <div class="item">
          <a :href="getLink(0)" :class="{'nopic': !hasPic(0),'nopic-line1':isNoPic([0,1])}">
            <img :src="getPic(0)">
          </a>
        </div>
      </div>
      <div class="block" :style="{'width': 'calc(50% - '+module.item_margin/2+'px)','margin-bottom':module.item_margin+'px'}">
        <div class="item">
          <a :href="getLink(1)" :class="{'nopic': !hasPic(1),'nopic-line1':isNoPic([0,1])}">
           <img :src="getPic(1)">
          </a>
        </div>
      </div>
      <div class="block bottom" :style="{'width': 'calc(50% - '+module.item_margin/2+'px)','margin-right':module.item_margin+'px'}">
        <div class="item" :style="{'width': 'calc(50% - '+module.item_margin/2+'px)','margin-right':module.item_margin+'px'}">
          <a :href="getLink(2)" :class="{'nopic': !hasPic(2),'nopic-line2':isNoPic([2,3,4,5])}">
            <img :src="getPic(2)">
          </a>
        </div>
        <div class="item" :style="{'width': 'calc(50% - '+module.item_margin/2+'px)'}">
          <a :href="getLink(3)" :class="{'nopic': !hasPic(3),'nopic-line2':isNoPic([2,3,4,5])}">
            <img :src="getPic(3)">
          </a>
        </div>
      </div>
      <div class="block bottom" :style="{'width': 'calc(50% - '+module.item_margin/2+'px)'}">
        <div class="item" :style="{'width': 'calc(50% - '+module.item_margin/2+'px)','margin-right':module.item_margin+'px'}">
          <a :href="getLink(4)" :class="{'nopic': !hasPic(4),'nopic-line2':isNoPic([2,3,4,5])}">
            <img :src="getPic(4)">
          </a>
        </div>
        <div class="item" :style="{'width': 'calc(50% - '+module.item_margin/2+'px)'}">
          <a :href="getLink(5)" :class="{'nopic': !hasPic(5),'nopic-line2':isNoPic([2,3,4,5])}">
            <img :src="getPic(5)">
          </a>
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
    return { };
  },
  computed: {
    count() {
      if (this.module.layout <= 2) return this.module.layout;
      else if (this.module.layout >= 3 && this.module.layout <= 6) return 3;
      else if (this.module.layout >= 7 && this.module.layout <= 8) return 4;
      else return 6;
    }
  },
  methods: {
    isNoPic(indexs) {
      var flag = true;
      indexs.forEach(index => {
        flag &= !this.module.items[index] || (this.module.items[index] && !this.module.items[index].image);
      });
      return flag;
    },
    hasPic(index) {
      return this.module.items[index] && this.module.items[index].image;
    },
    getPic(index) {
      if (this.module.items[index] && this.module.items[index].image) return this.module.items[index].image;
      return "images/sample/gray_bg.png";
    },
    getLink(index) {
      return this.module.items[index] ? this.module.items[index].link_url : "#";
    }
  }
};
</script>
<style lang="less" scoped>
.layout {
  width: 100%;
  font-size: 0;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    &.img-sample {
      object-fit: fill;
    }
  }
  .item {
    //display: flex;
    //flex-direction: column;
    a {
      &.nopic {
        text-decoration: none;
        background-image: url(images/gray_bg.png);
        background-size: 100% 100%;
        background-repeat: no-repeat;
        display: block;
        height: 100%;
        img {
          visibility: hidden;
          display:none;
        }
      }
      &.nopic-line1 {
        height: 100px;
      }
      &.nopic-line2 {
        height: 100px;
      }
    }
  }
}
.layout2,
.layout3 {
  display: flex;
  .item {
    flex: 1;
    &:last-child {
      margin-right: 0px!important;
    }
  }
}
.layout4 {
  display: flex;
  .left {
    flex: 1;
    .item {
      margin-right: 8px;
      height: 100%;
    }
  }
  .right {
    flex: 1;
    .item {
      height: calc(50% - 4px);
      margin-bottom: 8px;
      position: relative;
      &:last-child {
        margin-bottom: 0px;
      }
      a {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        img {
          object-fit: unset;
        }
      }
    }
  }
}
.layout5 {
  display: flex;
  .right {
    flex: 1;
    .item {
      margin-left: 8px;
      height: 100%;
    }
  }
  .left {
    flex: 1;
    .item {
      height: calc(50% - 4px);
      margin-bottom: 8px;
      position: relative;
      &:last-child {
        margin-bottom: 0px;
      }
      a {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        img {
          object-fit: unset;
        }
      }
    }
  }
}
.layout6,
.layout7 {
  .top {
    margin-bottom: 8px;
  }
  .bottom {
    display: flex;
    .item {
      flex: 1;
      margin-right: 8px;
      &:last-child {
        margin-right: 0px;
      }
    }
  }
}
.layout8 {
  display: flex;
  flex-wrap: wrap;
  .item {
    width: calc(50% - 4px);
  }
}
.layout9 {
  display: flex;
  flex-wrap: wrap;
  .block {
    width: calc(50% - 4px);
    .item {
      height: 100%;
    }
    &.bottom {
      display: flex;
      .item {
        /*width: calc(50% - 4px);*/
      }
    }
  }
}
</style>
