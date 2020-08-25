<template>
  <div v-if="module.module_type == 'ModuleTitle'">
    <div :class="'layout layout'+module.layout" :style="style">
      <span class="inner">
        <span v-if="module.layout==2||module.layout==3" class="before" :style="{background:module.color}"></span>{{module.title ? module.title : '请输入标题'}}
        <span v-if="module.layout==3" class="after" :style="{background:module.color}"></span>
      </span>
      <a v-if="module.layout==4" :href='module.link_url' :rel="module.link_type" class="right" :style="{color:module.color}">查看更多</a>
      <a v-if="module.layout==5" :href='module.link_url' :rel="module.link_type" class="right"><Icon :color="module.color" size="16" type="ios-arrow-forward" /></a> 
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
export default {
  components: {},
  props: ["module"],
  data() {
    return {};
  },
  computed:{
    style(){
      return{
        'color':this.module.color
      }
    }
  },
  methods: {}
};
</script>
<style lang="less" scoped>
.layout{
  font-size:14px;
  height:44px;
  line-height:44px;
}
.layout1{
  text-align:center;
}
.layout2{
  padding-left:15px;
  .before{
    display:inline-block;
    width:3px;
    height:16px;
    margin-right:10px;
    vertical-align:sub;
  }
}
.layout3{
  text-align:center;
  .before,.after{
    display:inline-block;
    vertical-align:middle;
    width:16px;
    height:3px;
  }
  .before{
    margin-right:10px;
  }
  .after{
    margin-left:10px;
  }
}
.layout4{
  display:flex;
  padding:0 15px;
  .inner{
    flex:1;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }
  .right{
    height:100%;
    width:56px;
  }
}
.layout5{
  display:flex;
  padding-left:15px;
  .inner{
    flex:1;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }
  .right{
    height:100%;
    width:44px;
    text-align:center;
  }
}
</style>