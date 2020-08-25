<template>
  <Modal 
  v-model="showDialog" 
  title="图标库" 
  width="780"
  @on-ok="close(true)" 
  @on-cancel="close(false)">
    <div class="content">
      <div v-for="(item,index) in allIcons" :key="index" :class="['box',{'selected':currentItem==item}]" @click="selectIcon(item)">
        <img src="images/xuanzhong.png" alt="">
        <myIcon :type="item" size="28"/>
      </div>
    </div>
    
  </Modal>
</template>
<script>
import myIcon from "./icon.vue";
export default {
  props: ["show"],
  components:{myIcon},
  data() {
    return {
      currentItem:'',
      allIcons: require("./icons.json"),
      showDialog:false
    };
  },
  watch:{
    show(newVal){
      if(newVal==true){
        this.showDialog=true;
      }
    }
  },
  methods: {
    selectIcon(icon) {
      this.currentItem=icon;
    },
    close(b){
      this.$emit("iconSelected", b?this.currentItem:'');
      this.showDialog = false;
    }
  }
};
</script>
<style lang="less" scoped>
.content {
  display: flex;
  flex-wrap: wrap;
  width:644px;
  margin:6px auto 0;
  .box {
    position:relative;
    width:72px;
    height:72px;
    line-height:50px;
    padding: 10px;
    margin:10px;
    text-align:center;
    border-radius:2px;
    border: 1px solid rgba(229,229,229,1);
    cursor:pointer;
    img{
      position:absolute;
      top:0;
      right:0;
      display:none;
    }
    &.selected {
      border: 1px solid #fe951e;
      img{
        display:block;
      }
    }
  }
}
</style>