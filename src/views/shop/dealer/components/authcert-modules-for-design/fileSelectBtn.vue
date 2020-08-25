<template>
<div>
  <Button class="btn-select" :type="file?'default':'dashed'" @click="showFilesSelector=true">
    <img v-if="url||file" :src="url||file"/> 
    <Icon v-else type="md-add" size="16" color="#c0c2c9"/>
    <Icon v-if="url||file" type="ios-close-circle" size="16" color="#444" @click.stop="deleteImg"/>
  </Button>
  <FilesSelector v-model="showFilesSelector" @onSelected="onFilesSelected"></FilesSelector>
</div>
</template>
<script>
import FilesSelector from "@/components/files/files";
export default {
  props:['url'],
  components:{
    FilesSelector
  },
  data(){
    return{
      file:'',
      showFilesSelector:false
    }
  },
  methods:{
    onFilesSelected(files){
      if(files.length>0){
        this.file=files[0];
        this.$emit('fileSelected',this.file);
      }
    },
    deleteImg(){
      this.file=""
      this.$emit('fileSelected',this.file);
    }
  }
}
</script>
<style lang="less" scoped>
  .btn-select{
    width:60px;
    height:60px;
    padding:0;
    position:relative;
    img{
      width:100%;
      height:100%;
      object-fit:contain;
    }
    /deep/.ivu-icon-ios-close-circle{
      position:absolute;
      right:-8px;
      top:-8px;
    }
  }
</style>