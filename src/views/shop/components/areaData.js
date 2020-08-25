// 获取地区数据的方法
export const getArea = function (areaArray,value){
    areaArray.filter(item => {
        if(item.Level == value || item.label == value || item.value == value){
            return item
        }else{
            if(item.children && item.children.length){
                getArea(item.children)
            }else {
                return []
            }
        }
    })
}
// 处理省份的方法
export const areaArray = function(areaArray,Level) {
  return  areaArray.filter(item => item.Level == Level )
}
// 处理城市区的方法
export const cityArray = function(areaArray,value) {
  let index = areaArray.findIndex(item => item.label == value)
  return areaArray[index].children ? [...areaArray[index].children] : []
}
