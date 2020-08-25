<template>
  <div class="area-agent-collapse">
        <div class="area-agent-collapse-content" :class="!areaItem.provide ? 'area-agent-title' : ''">
            <div class="collapse-icon" v-if="iconStatus">
                <i
                    class="iconfont icon-md-arrow-dropright"
                    :class="{'agent-setting-update-transform':iconSelectStatus}"
                ></i>
            </div>
            <div class="member-detail-area-agent-box box-item">
                <span class="area_type_title" v-if="areaItem.provide">{{getAreagentLevelText(areaType)}}</span>
                <span>{{areaText}}</span>
            </div>
            <div class="member-detail-area-agent-box" v-if="areaType > 9">
                <span>总：</span>
                <a href="Javascript:;" @click.stop="onChangeAreaType(null,areaAgentId,areaItem,0)"><span>{{Number(cityCount) + Number(districtCount)}}</span>人</a>
            </div>
            <div class="member-detail-area-agent-box" v-if="areaType > 9">
                <span>市代：</span>
                <a href="Javascript:;"  @click.stop="onChangeAreaType(9,areaAgentId,areaItem,1)"><span>{{cityCount}}</span>人</a>
            </div>
            <div class="member-detail-area-agent-box" v-if="areaType  > 8">
                <span>区代：</span>
                <a href="Javascript:;" @click.stop="onChangeAreaType(8,areaAgentId,areaItem,areaType > 9 ? 2 : 1 || areaType > 8 ? 0 : '')"><span>{{districtCount}}</span>人</a>
            </div>
        </div>
  </div>
</template>

<script>
export default {
    props: {
        iconStatus: {//字体图标的显示状态
            type: Boolean,
            default () {
                return false
            } 
        },
        iconSelectStatus : {//字体图标动态样式添加
            type:Boolean,
            default () {
                return false
            }
        },
        areaType: {//区域代理的身份类型
            default () {
                return -1
            }
        },
        areaText: {//区域代理的身份文字
            type:String,
            default () {
                return "--"
            }
        },
        cityCount: {//下级市代理的人数
            default () {
                return 0
            }
        },
        districtCount: {//下级区代理的人数
            default () {
                return 0
            }
        },
        areaAgentId: {//代理身份id
            default () {
                return null
            }
        },
        areaItem : {//当前代理身份的所有信息
            type:Object,
            default () {
                return null
            }
        }
    },
    methods: {
        getAreagentLevelText (value) {//判断代理身份
            if(value == 10) {
                return "省代："
            } else if (value == 9) {
                return "市代："
            } else {
                return "区代："
            }
        },
        onChangeAreaType (type,id,value,index) {
            let data = {}
            data.area_type = type
            data.area_agent_id = id
            data.info = value
            data.activeIndex = index
            this.$emit('onChangeAreaType',data)
        }
    }
}
</script>

<style lang="less" scoped>
.area-agent-collapse {
    .area-agent-collapse-content {
        display: flex;
        align-items: center;
      & > div:last-child {
        margin: 0px;
      }
    }
    .area-agent-title {
        margin-left: 38px;
    }
    .collapse-icon {
            & > i {
            display: inline-block;
            width: 20px;
            height: 28px;
            text-align: center;
            line-height: 28px;
            transition: transform 0.2s ease-in-out;
            &.agent-setting-update-transform {
              transform: rotate(90deg);
            }
          }
    }
    .member-detail-area-agent-box {
        color: #657180;
        line-height: 28px;
        margin: 0 10px 0 0;
       &.box-item {
           .area_type_title {
                color: #464c5b;
           }        
       }
       & >a {
           span {
               text-decoration: underline;
           }
        }
    }
}
</style>