<template>
  <div class="verify-progress">
    <div 
      v-for="(item, index) in progressList" 
      :key="index" class="flex-box" 
      :class="{
        [item.type]:true,
        active:activeIndex>=index,
        current: activeIndex==index,
      }"
    >
      <div class="left">
        <div class="circle">
          <i v-if="item.type=='success'" class="iconfont icon-md-checkmark"></i>
          <i v-if="item.type=='error'" class="iconfont icon-md-close"></i>
          <div v-if="item.type=='wait'" class="dot"></div>
        </div>
        <div class="line"></div>
      </div>
      <div class="right">
        <div class="title">{{item.title}}</div>
        <div v-if="item.content" class="content">{{item.content}}</div>
        <div v-if="item.extra" class="extra">{{item.extra}}</div>
        <div v-if="item.time" class="time">{{item.time}}</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    progressList: {
      type: Array,
      default() {
        return [
          {
            type: "success",
            title: "提交申请",
            content: "111111111",
            extra: "2222222222",
            time: "2019-12-23 10:23:49"
          },
          {
            type: "wait",
            title: "提交申请",
            content: "111111111",
            extra: "2222222222",
            time: "2019-12-23 10:23:49"
          },
          {
            type: "wait",
            title: "提交申请",
          }
        ]
      }
    }
  },
  computed: {
    activeIndex() {
      let index = this.progressList.findIndex(item => {
        return item.type != "success"
      })
      return index == -1 ? this.progressList.length -1 : index
    }
  }
}
</script>
<style lang='less' scoped>
.verify-progress {
  .flex-box {
    display: flex;
    .left {
      position: relative;
      .iconfont {
        font-size: 14px;
        font-weight: bold;
        line-height: 16px;
      }
    }
    .right {
      color: #999;
      font-size: 12px;
      line-height: 22px;
      padding-bottom: 25px;
      margin-left: 14px;
      .title {
        font-size: 13px;
        font-weight: bold;
      }
    }
    .circle {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid #bfc2c8;
      display: flex;
      align-items: center;
      justify-content: center;
      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #bfc2c8;
      }
    }
    .line {
      position: absolute;
      width: 2px;
      top: 20px;
      bottom: 0;
      left: 0;
      right: 0;
      margin: auto;
      background-color: #bfc2c8;
    }
    &.current {
      .right {
        color: #333;
      }
    }
    &.active {
      .circle {
        color: #52b534;
        border-color: #52b534;
        .dot {
          background-color: #52b534
        }
      }
      .line {
        background-color: #52b534;
      }
    }
    &.error {
      .circle {
        color: white;
        background: #ff5606;
        border-color: #ff5606;
      }
    }
    &.success:last-child {
      .circle {
        color: white;
        background: #52b534;
        border-color: #52b534;
      }
    }
    &:last-child {
      .right {
        padding-bottom: 0;
      }
      .line {
        display: none;
      }
    }
  }
}
</style>