<template>
  <div class="member-infor">
    <template v-if="headurl">
      <img v-if="!goDetail" :src="headurl" />
      <img
        class="member-infor-img"
        v-else
        @click="
          $router.push({
            name: 'memberDetail',
            query: { id: memberId ? memberId : id }
          })
        "
        perm="member.detail.view"
        :src="headurl"
      />
    </template>
    <div>
      <slot>
        <span class="one-hide">{{nickname}}</span>
        <span style="color: #9ea7b4;font-size: 12px;" class="one-hide" v-if="name">姓名:{{name}}</span>
        <span style="display: block;color: #9ea7b4;font-size: 12px;">手机：{{mobile}}</span>
        <span style="display: block;color: #9ea7b4;font-size: 12px;">{{idname}}:{{id}}</span>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      default: null
    },
    idname: {
      type: String,
      default: "ID"
    },
    headurl: {
      type: String
    },
    memberId:{
      type: Number,
      default: null
    },
    goDetail: {
      type: Boolean,
      default: true
    },
    nickname: {
      type: String
    },
    mobile: {
      type: String
    },
    name:{
      type:String
    }
  }
};
</script>

<style lang="less" scoped>
.member-infor {
  padding: 8px 0;
  img {
    color: #5cadff;
    width: 40px;
    height: 40px;
    vertical-align: middle;
    display: inline-block;
    margin-right: 14px;
    border-radius: 4px;
  }
  img.member-infor-img {
    cursor: pointer;
  }
  img.member-infor-img:hover {
    -moz-box-shadow: 0px 2px 5px #8f93a5;
    -webkit-box-shadow: 0px 2px 5px #8f93a5;
    box-shadow: 0px 2px 5px #8f93a5;
  }
  & > div {
    display: inline-block;
    vertical-align: middle;
  }
  img + div {
    width: calc(100% - 60px);
  }
  .one-hide {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    font-size: 13px;
    color: #657180;
  }
}
</style>