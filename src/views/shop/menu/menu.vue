<template>
  <div>
    <!-- 一级菜单 -->
    <div
      class="menu-wrapper right-show"
      v-for="(item,index) in menuList"
      :key="item.id"
      :style="{height: datashow===index ? (45 * (item.secondMenu ? item.secondMenu.length : 0) + 44) + 'px' : '44px'}"     
    >
      <!-- 当有redir不需要跳时(即有二级路由)，需要设置成$route.fullPath，不能为空，空会设置成没有参数的当前路由，失去参数点击会有问题 -->
      <router-link :to="item.meta.redir ? $route.fullPath : {path: item.path}" exact>
        <div
          class="home-login primary-hover-before-bgcolor primary-hover-font-color"
          :class="{'active primary-before-bgcolor' : datashow===index || menuIndex===index,'show-active' : showActive && index === recordIndex}"
          @click="onChangeMenu(index, item.secondMenu && item.secondMenu.length)"
          @mouseenter="onMouseenterMenu(index, item.secondMenu && item.secondMenu.length, item.component)"
        >
          <span
            :class="{'primary-font-color ' : datashow===index || menuIndex===index}"
          >
            <svg v-if="item.meta.icon && item.meta.icon[0] === '#'" class="iconfont" style="width: 16px;height: 100%;" aria-hidden="true">
              <use :xlink:href="item.meta.icon"></use>
            </svg>
            <i v-else-if="item.meta.icon" :class="'iconfont ' + item.meta.icon"></i>
            <template v-else>&nbsp;</template>
          </span>
          <span>{{item.meta && item.meta.title}}</span>
          <!-- <span
            :style="{transform:  datashow===index ?'rotate(90deg)':'',height: '50px', transition: 'transform 0.5s ease'}"
          >
            <i
              class="iconfont icon-md-arrow-dropright"
              v-if="item.secondMenu && item.secondMenu.length"
            ></i>
            <i v-else>&nbsp;</i>
          </span> -->
        </div>
      </router-link>
      <!-- 二级菜单 -->
      <div class="menu-wrapper" v-for="item1 in item.secondMenu" :key="item1.id" @mouseenter="onEnterTwoMenu">
        <router-link :to="{path:item1.path}">          
          <div
            class="home-login second-menu"
            :class="{'active primary-active-bgcolor' : $route.path === item1.path || $route.meta.parent === item1.name || (item1.threeMenu && item1.threeMenu.map(n => n.name).includes($route.meta.parent))}"
          >  
            <!-- <span style="display:none;">{{$route.path}}={{item1.path}}<br>{{$route.meta.parent}}={{item1.name}}</span> -->
            <span>&nbsp;</span>
            <span>{{item1.meta && item1.meta.title}}</span>
            <span>&nbsp;</span>
          </div>
        </router-link>
      </div>
      <!-- 悬停时菜单 -->
      <div v-show="!leftMenuStatus && showHoverMenu && index === recordIndex && !(!slideStatus && item.component)" class="menu-right-wrapper" @mouseleave="onMouseLeaveMenu"  @mouseenter="onRightMouseEnterMenu" @click="onCloseTwoMenu">
         <div
            class="home-one-login" v-if="slideStatus"         
          >
            <!-- <span>&nbsp;</span> -->
            <span>{{item.meta && item.meta.title}}</span>
            <!-- <span>&nbsp;</span> -->
          </div> 
        <div v-for="item2 in item.secondMenu" :key="item2.id">
          <router-link :to="{path:item2.path}">           
            <div
              class="home-login"
              :class="{'active primary-hover-bgcolor' : $route.path === item2.path || $route.meta.parent === item2.name}"
            >
              <!-- <span>&nbsp;</span> -->
              <span>{{item2.meta && item2.meta.title}}</span>
              <!-- <span>&nbsp;</span> -->
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  // 是否显示二级菜单
  props: {
    slideStatus: {
      default: false,
      type: Boolean
    },
    leftMenuStatus: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {
      showHoverMenu: false,
      showActive: false,
      recordIndex: -1,
      datashow: -1 // 标记是否显示哪一个一级菜单的子项
    };
  },
  watch: {
    /**
     * 关闭二级菜单显示
     */
    slideStatus(val) {
      this.showHoverMenu = false;
      if (val) {
        this.datashow = this.menuList.length;
      }
    },
    /**
     * 打开左边菜单名称内容区域
     */
    datashow(val) {
      if (val < this.menuList.length) {
        this.$emit("changeSlide");
      }
    },
    menuIndex(val) {
      if (this.datashow !== val) {
        this.datashow = val;
      }
    }
  },
  computed: {
    menuList() {
      let menuList = mapGetters(["menuList"]).menuList.apply(this);
      // 清除一级菜单是页面的二级菜单
      menuList = menuList.map(n => {
        return Object.assign({}, n, n.secondMenu ? {secondMenu: n.component ? [] : n.secondMenu} : {})
      });
      return menuList;
    },
    menuIndex() {
      return this.menuList.findIndex(
        item =>
          item.name === this.$route.name ||
          item.name ===
            this.$route.path.split(/[\\|\/]/).filter(item => item)[0]
      );
    }
  },
  created() {
    if (this.datashow !== this.menuList.length && this.datashow === -1) {
      this.datashow =
        this.menuIndex > -1 ? this.menuIndex : this.menuList.length;
    }
  },
  methods: {
    onMouseenterMenu(index, length, flag) {
      if (length || flag) {
        this.recordIndex = index;
        // 如果不是点击当前菜单，则显示点击的一级菜单的二级菜单，否则关闭当前菜单
        if (this.datashow !== index) {
          this.showHoverMenu = true;
        } else {
          this.showHoverMenu = false;
        }
        let mTop = document.querySelectorAll(".right-show")[index].offsetTop;
        let sTop = document.querySelectorAll(".left-menu-content")[0].scrollTop;
        let allHeight =
          document.body.clientHeight && document.documentElement.clientHeight;
        let rightHeight = 0;
        if (this.slideStatus) {
          rightHeight = (length + 1) * 50;
        } else {
          rightHeight = length * 50;
        }
        let rightTop = document
          .querySelectorAll(".right-show")
          [index].querySelectorAll(".menu-right-wrapper")[0];
        if (
          Number(allHeight) - (Number(mTop) + 60 - Number(sTop)) >
          rightHeight
        ) {
          rightTop.style.top = Number(mTop) + 60 - Number(sTop) + "px";
        } else {
          if (flag) {
            rightTop.style.top = 60 + "px";
          } else {
            rightTop.style.top =
              Number(mTop) +
              60 -
              Number(sTop) +
              (Number(allHeight) -
                (Number(mTop) + 60 - Number(sTop)) -
                rightHeight) +
              "px";
          }
        }
        let lefts = document
          .querySelectorAll(".right-show")
          [index].querySelectorAll(".menu-right-wrapper")[0];
        if (this.slideStatus) {
          lefts.style.left = 50 + "px";
        } else {
          lefts.style.left = 140 + "px";
        }
      }
    },
    onMouseLeaveMenu() {
      this.showHoverMenu = false;
      this.showActive = false;
    },
    onRightMouseEnterMenu() {
      this.showActive = true;
    },
    onEnterTwoMenu() {
      this.showHoverMenu = false;
    },
    onCloseTwoMenu() {
      this.showHoverMenu = false;
    },
    // 改变二级菜单显示状态
    onChangeMenu(index, length) {
      // 菜单栏如果没有展开，点击展开二级菜单关闭悬停菜单，否则关闭二级菜单，展示悬停菜单
      if (index === this.datashow) {
        this.showHoverMenu = true;
      } else {
        this.showHoverMenu = false;
      }
      if (length) {
        // 如果不是点击当前菜单，则显示点击的一级菜单的二级菜单，否则关闭当前菜单
        if (this.datashow !== index) {
          this.datashow = index;
        } else {
          this.datashow = this.menuList.length;
        }
      } else {
        // 如果是只有一级菜单，则在第二次点击同意菜单时需要刷新
        if (this.menuIndex === index) {
          this.$emit("reloadPage");
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
@left-width: 140px;
@left-icon-width: 50px;
@left-arrow-width: 0px;
@left-name-width: @left-width - @left-icon-width;
.menu-wrapper {
  width: @left-width;
  height: 50px;
  overflow: hidden;
  transition: height 0.5s;
  background-color: #252e3b;
  .show-active {
    span:first-child {
      color: #5d7af7 !important;
    }
    span:nth-child(2) {
      color: #fff;
    }
  }
  .menu-right-wrapper {
    border-radius: 3px;
    width: 120px;
    position: fixed;
    left: 200px;
    background: #fff;
    box-shadow: 0px 0px 5px 5px rgba(0, 0, 0, 0.1);
    a {
      font-size: 12px;
      .primary-hover-bgcolor {
        background: #f0f2fd !important;
        span {
          color: #4570ea !important;
        }
      }
      .home-login {
        color: #000;
        height:40px;
        line-height:40px;
        padding-left:20px;
        span{
          width:auto;
          height:40px;
          float:none;
        }
        // span {
        //   width: 20px;
        //   font-size: 14px;
        // }
        // span:nth-child(2) {
        //   width: 90px;
        // }
        // span:last-child {
        //   width: 10px;
        // }
      }
      .home-login:hover {
        background: #f0f2fd !important;
        span {
          color: #4570ea !important;
        }
      }
    }
  }
  .menu-wrapper {
    height:45px;
    line-height:40px;
    padding-bottom:5px;
    background-color: #081221;
    &:nth-child(2){
      padding-top:5px;
    }
    // /deep/a .home-login {
    //   font-size: 14px;
    // }
  }
  /deep/a {
    font-size: 13px;
    display: block;
    .home-login {
      line-height: 44px;
      height: 44px;
      color: #9cacc7;
      i {
        font-size: 18px;
      }
      & > span {
        display: inline-block;
        width: @left-icon-width;
        height:44px;
        &:first-child {
          float: left;
        }
        &:nth-child(2) {
          width: @left-name-width - @left-arrow-width;
          text-align: left;
        }
        &:nth-child(3) {
          width: @left-arrow-width;
        }
      }
      &:hover > span {
        &:nth-child(2) {
          color: #fff;
        }
        &:nth-child(3) {
          color: #fff;
        }
      }
      &.active > span:nth-child(n + 2) {
        color: #fff;
        cursor: default;
      }
    }
    .second-menu{
      height:40px;
      line-height:40px;
      & > span{
        height:40px;
      }
    }
  }
  & > a .home-login {
    position: relative;
    &:before {
      content: "";
      display: block;
      position: absolute;
      width: 4px;
      margin-left: -2px;
      top: 7px;
      height: 34px;
      border-radius: 2px;
    }
  }
  .home-one-login {
    line-height: 44px;
    height: 44px;
    font-size: 14px;
    color: #000;
    font-weight: bold;
    border-bottom: 1px solid #ebecee;
    padding-left:20px;
    margin-bottom:10px;
    text-align:left;
    &:last-child{
      margin-bottom:0;
    }
    // span {
    //   width: 20px;
    //   display: inline-block;
    // }
    // span:nth-child(2) {
    //   width: 90px;
    //   text-align: left;
    // }
    // span:last-child {
    //   width: 20px;
    // }
  }
}
</style>
