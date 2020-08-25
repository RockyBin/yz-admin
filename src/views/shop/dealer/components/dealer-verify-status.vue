<template>
  <div class="dealer-verify-status">
    <div
      class="dealer-verify-status-content"
      v-for="(item, index) in listData"
      :key="index"
    >
      <div
        class="dealer-verify-status-icon"
        :class="{ active: activeIndex >= index }"
      >
        <div
          class="dealer-verify-status-icon-content error"
          v-if="item.type === 'error'"
          :class="{ active: activeIndex >= index }"
        >
          <i class="iconfont icon-md-close"></i>
        </div>
        <div
          class="dealer-verify-status-icon-content"
          v-if="item.type === 'success'"
          :class="{
            active: activeIndex >= index,
            success: index === listData.length - 1
          }"
        >
          <i class="iconfont icon-md-checkmark"></i>
        </div>
        <div
          class="dealer-verify-status-icon-content wait"
          v-if="item.type === 'wait'"
          :class="{ active: activeIndex >= index }"
        ></div>
      </div>
      <div
        class="dealer-verify-status-text"
        :class="{ active: activeIndex === index }"
        style="line-height: 22px;"
      >
        <div style="font-size: 13px;font-weight: bold;">{{ item.title }}</div>
        <div>{{ item.text }}</div>
        <div>{{ item.time }}</div>
        <div v-if="index === listData.length - 1 && value.status === -1">
          理由：{{ item.reject_reason }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    value: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      listData: [],
      activeIndex: 0 // 当前审核的进度
    };
  },
  watch: {
    value: {
      handler(val) {
        if (val) {
          let list = [];
          let getItem = this.getStepItem();
          list.push({
            title: "提交申请",
            time: val.created_at,
            type: "success"
          });
          let fristStatus =
            val.invite_review_member > 0 &&
            val.invite_review_member !== val.parent_review_member;
          // 审核人审核
          fristStatus &&
            list.push(
              getItem(
                val.invite_review_status,
                "审核人：" + val.invite_nickname,
                val.invite_review_passed_at,
                "推荐人",
                val.invite_review_status === -1
                  ? this.value.invite_review_reject_reason
                  : ""
              )
            );
          // 上级审核
          list.push(
            getItem(
              val.parent_review_status,
              "审核人：" +
                (val.parent_review_member ? val.parent_nickname : "公司"),
              val.parent_review_passed_at,
              "上级",
              val.parent_review_status === -1
                ? val.parent_review_member
                  ? this.value.parent_review_reject_reason
                  : this.value.reject_reason
                : ""
            )
          );
          // 如果需要公司审核
          if (val.parent_review_member && !val.verify_process) {
            list.push(
              getItem(
                val.status,
                "",
                val.passed_at,
                "公司",
                val.status === -1 ? this.value.reject_reason : ""
              )
            );
          }
          // 如果不是拒绝都会显示成功文案
          if (val.status !== -1) {
            list.push(
              Object.assign(
                getItem(
                  val.status,
                  "",
                  val.passed_at,
                  "",
                  this.value.reject_reason
                ),
                {
                  title: "申请成功"
                }
              )
            );
          }

          let index = list.findIndex(n => n.type !== "success");
          this.activeIndex = index > -1 ? index : list.length - 1;
          let errorIndex = list.findIndex(n => n.type === "error");
          list = list.slice(0, errorIndex > -1 ? errorIndex + 1 : list.length);

          this.listData = list;
        }
      },
      immediate: true
    }
  },
  methods: {
    /**
     * 获取进度流程
     */
    getStepItem() {
      let flag = true;
      return (val, name, time, text, reject_reason) => {
        let status = {
          "0": "wait",
          "1": "success",
          "-1": "error"
        };
        let statusText = {
          "0": "审核",
          "1": "审核通过",
          "-1": "审核不通过"
        };
        let title = text + (!(flag && val === 0) ? statusText[val] : "审核中");
        // 追踪当前审核状态
        if (flag) flag = val === 1;
        return {
          title: title,
          text: name,
          time: [1, -1].includes(val) ? time : "",
          type: status[val],
          reject_reason
        };
      };
    }
  }
};
</script>
<style lang="less" scoped>
.dealer-verify-status {
  .dealer-verify-status-content {
    display: flex;
    &:last-child {
      .dealer-verify-status-icon:before {
        display: none;
      }
    }
    .dealer-verify-status-icon {
      position: relative;
      margin-right: 14px;
      &:before {
        content: "";
        display: block;
        position: absolute;
        left: 0;
        top: 20px;
        right: 0;
        bottom: 0;
        margin: auto;
        width: 2px;
        background-color: #bfc2c8;
      }
      &.active:before {
        background-color: #52b534;
      }
      .dealer-verify-status-icon-content {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        color: #bfc2c8;
        border: 2px solid #bfc2c8;
        i {
          font-size: 14px;
          &.icon-md-checkmark {
            font-weight: bold;
          }
        }
        &.wait {
          &:after {
            content: "";
            display: block;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #bfc2c8;
          }
        }
        &.active {
          color: #52b534;
          border-color: #52b534;
          &:after {
            background-color: #52b534;
          }
        }
        &.success {
          color: #52b534;
          background-color: #52b534;
          border: none;
          color: #fff;
          i {
            &.icon-md-checkmark {
              font-weight: initial;
            }
          }
        }
        &.error {
          background-color: #ff5606;
          border: none;
          color: #fff;
        }
      }
    }
    .dealer-verify-status-text {
      color: #999999;
      padding-bottom: 50px;
      &.active {
        color: #333333;
      }
    }
  }
}
</style>
