<template>
  <div class="h5">
    <third-menu :list="thirdMenu" />
    <div class="main-content">
      <div class="main-board">
        <div class="wrapper">
          <alert-warning>
            <p>1. 开启H5后，买家在移动端网页中，可直接通过手机号验证登录，完成购买。</p>
          </alert-warning>
          <h3>
            <span>H5设置</span>
          </h3>
          <Form :label-width="80">
            <FormItem label="H5环境：" prop="name">
              <span>{{'已开启'}}</span>
            </FormItem>
          </Form>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import thirdMenu from "@/views/shop/menu/third-menu.vue";
import alertWarning from "@/views/shop/components/alert/alert-warning.vue"
export default {
  components: {
    thirdMenu: thirdMenu,
    alertWarning
  },
  data() {
    return {
      thirdMenu: [
        {
          title: "H5设置",
          target: "/channel/h5/h5-setting"
        }
      ]
    };
  }
};
</script>
<style lang="less" scoped>
.h5 {
  width: 100%;
  height: 100%;
  background: #f2f4fd;
  display: flex;
  .left-menu {
    flex-shrink: 0;
    width: 130px;
    padding: 20px;
    text-align: center;
    background: #fff;
    border-top: 1px solid #f2f4fd;
    .link {
      line-height: 30px;
      margin-bottom: 16px;
      border-radius: 5px;
      &:hover {
        cursor: pointer;
      }
      &:last-child {
        margin-bottom: 0;
      }
      &.router-link-active {
        background: #e6ecfc;
      }
    }
  }
  .main-content {
    width: 100%;
    height: 100%;
  }
}
.main-board {
  width: 100%;
  height: 100%;
  background: #fff;
  .wrapper {
    padding: 24px;
    height: calc(100% - 70px);
  }
  h3 {
    height: 32px;
    line-height: 32px;
    margin: 24px 0;
    font-size: 14px;
    &:before {
      content: "";
      display: inline-block;
      width: 4px;
      height: 18px;
      border-radius: 20px;
      background: #4570ea;
      vertical-align: middle;
      margin-right: 12px;
    }
    // span {
    //   padding-left: 12px;
    //   border-left: 4px solid #4570ea;
    // }
  }
  // /deep/.ivu-alert-warning {
  //   padding: 18px 58px;
  // }
  // /deep/.ivu-alert-icon {
  //   left: 25px;
  //   top: 22px;
  //   .ivu-icon {
  //     font-size: 18px;
  //   }
  // }
  // /deep/.ivu-alert-message {
  //   font-size: 13px;
  //   line-height: 25px;
  // }
}
</style>