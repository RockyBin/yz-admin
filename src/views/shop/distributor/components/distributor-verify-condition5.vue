<template>
    <div>
        <div class="item"><div class="key">申请分销商时间：</div><div class="value">{{info.created_at?info.created_at:"--"}}</div></div>
        <div class="item"><div class="key">申请条件：</div><div class="value">累计直推会员数量满 {{info.directly_member}}人</div></div>
        <div class="item"><div class="key">实际情况：</div><div class="value"><div>目前累计直推会员数量满 {{info.now_directly_member}}人</div></div></div>
    </div>
</template>
<script>
    export default {
        props:["info"]
    }
</script>
<style lang="less" scoped>
    .item{
        display:flex;
        .key{
            flex-shrink:0;
        }
        .value>div:not(:last-child){
            margin-bottom:5px;
        }
        &:not(:last-child){
            margin-bottom:15px;
        }
    }
</style>