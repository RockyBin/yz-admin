<template>
  <div class="product-info">
    <div class="product-img">
      <img :src="headUrl" alt />
    </div>
    <div class="product-content">
      <Tooltip placement="top" class="product-name">
        <div class="product-name-text">{{name}}</div>
        <div class="product-img product-gong">
            <i class="iconfont icon-gonghuoshang product-iconfont"></i>
            <!-- <span class="product-icon">自营</span> -->
            <span class="stroe-nickname">{{nickname}}</span>
        </div>
        <div slot="content" class="tooltip-text">{{name}}</div>
      </Tooltip>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    headUrl: {
      type: String,
      default() {
        return "";
      }
    },
    name: {
      type: String,
      default() {
        return "";
      }
    },
    nickname: {
      type: String,
      default() {
        return "";
      }
    }
  }
};
</script>

<style lang="less" scoped>
.product-info {
  display: flex;
  .product-img {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 14px;
    &.product-gong {
        padding-top: 3px;
        height: 20px;
        justify-content:left;
        margin: 0;
    }
    img {
      height: 40px;
      width: 40px;
      display: block;
      object-fit: contain;
    }
  }
  .product-content {
    vertical-align: middle;
    .product-name {
      &-text {
        max-width: 300;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }
      .tooltip-text {
        white-space: normal;
        max-width: 300;
      }
    }
    .product-iconfont {
        color: #41b44d;
    }
    .product-icon {
      display: inline-block;
      width: 32px;
      font-size: 12px;
      color: #ffffff;
      background: #ff9900;
      border-radius: 4px;
    }
    .stroe-nickname {
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      font-size: 12px;
       margin-left: 3px;
      color: #9ea7b4;
    }
  }
}
</style>