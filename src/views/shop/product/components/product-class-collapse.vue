<template>
  <div class="my-collapse">
    <!-- 表头 -->
    <div class="title">
      <ul class="title-container">
        <li class="class-name">
          分类名称
          <span class="sub-tip">（拖拽分类可以改变同级分类之间的排序，保存生效）</span>
        </li>
        <!-- <li class="product-count">商品数</li> -->
        <li>
          状态
          <more-message class="tool-tip" :text="tooltip"></more-message>
        </li>
        <li>操作</li>
      </ul>
    </div>

    <!-- 内容 -->
    <div class="container">
      <!-- 一级分类 -->
      <firstmenu ref="first" :firstClass="firstClass" :firstClassStatus="firstClassStatus"></firstmenu>
    </div>
  </div>
</template>
<script>
import firstmenu from "./product-class-firstmenu.vue";
import moreMessage from "@/views/shop/components/more-message/more-message.vue";

export default {
  components: {
    firstmenu,
    moreMessage
  },
  data() {
    return {
      tooltip:
        "显示分类即把分类数据展示在商品中，可以用分类查询到该商品；隐藏分类则不展示，但分类数据仍保留",
      tooltip2: "按住分类名称拖拽可以改变同级分类之间的排序",
      currentStatus: {}
    };
  },
  props: {
    firstClass: {
      type: Array,
      default: []
    },
    firstClassStatus: {
      type: Object,
      default: {}
    }
  }
};
</script>

<style lang="less" scoped>
.my-collapse {
  width: 100%;
  padding-bottom: 84px;
  min-width: 1094px;
  overflow: auto;
}

.title {
  margin-top: 24px;
  height: 42px;
  background: #f8f8f9;
  border: 1px solid rgba(180, 180, 180, 0.4);

  .title-container {
    height: 100%;
    list-style: none;
    line-height: 42px;
    display: flex;

    li {
      flex: 2;
      font-weight: bold;
      text-align: center;
      padding: 0 14px;
      box-sizing: border-box;

      .tool-tip {
        font-weight: normal;
        margin: -2px 2px 0 3px;
        color: #999999;
      }
    }

    .class-name {
      flex: 5;
      padding: 0 14px 16px 21px;
      margin-right: 32px;
      text-align: left;

      .sub-tip {
        color: #999999;
        font-size: 12px;
        font-family: "Microsoft YaHei Regular";
        font-weight: normal;
        color: rgba(153, 153, 153, 1);
      }
    }
  }
}

.container {
  background: #ffffff;
}
</style>
