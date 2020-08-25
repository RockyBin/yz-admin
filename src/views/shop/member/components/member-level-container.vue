<template>
  <div class="member">
    <member-add  
      @backMemberLevel="backMemberLevel"
      :levelList="levelList"
      :modify="modify"
      :modifyData="modifyData"
      :member_count="member_counts"
    ></member-add>
  </div>
</template>

<script>
import memberAdd from "./member-add.vue";
import moreMessage from "COMPONENTS/more-message/more-message";
import verticalLineTitlebar from "COMPONENTS/titlebar/vertical-line-titlebar";
export default {
  components: { memberAdd, verticalLineTitlebar, moreMessage },
  data() {
    return {
      isShowModal: false, // 默认不显示弹框
      memberList: [], // 列表数据
      modifyData: {}, // 存储修改时的数据
      member_counts: 0, // 记录成员下的会员数量
      levelList: [], // 等级权重列表
      modify: false
    };
  },
  methods: {
    backMemberLevel(showAdd) {
      this.modify = false;
      this.$router.push({ name: "memberLevel" });
    },
    // 获取列表数据
    getList() {
      this.$httpGet("/shop/admin/member/level/list", "", res => {
        if (res.code === 200) {
          this.memberList = res.data.list;
          for (let i = 0; i < 100; i++) {
            let obj = {};
            obj.value = i;
            this.levelList.push(obj);
          }
          // 处理生成的数据是否被禁用
          this.levelList.forEach(item => {
            this.memberList.forEach(el => {
              // 是否被禁用
              if (el.status === 1 && el.weight === item.value) {
                item.status = 1;
              }
            });
          });
        }
      });
    }
  },
  mounted() {
    if (this.$route.query.id) {
      this.$httpGet(
        "/shop/admin/member/level/info",
        { id: this.$route.query.id },
        res => {
          if (res.code === 200) {
            this.modifyData = res.data;
            this.modifyData.discount = Number(this.modifyData.discount);
            this.modify = true;
          }
        }
      );
    }
    this.getList();
  }
};
</script>

<style lang="less" scoped>
.member {
  padding: 24px;
  text-align: left;
  height: 100%;
}
</style>
