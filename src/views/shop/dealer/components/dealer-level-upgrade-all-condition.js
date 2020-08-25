// 经销商等级升级条件
export const DealerLevelUpgradeCondition_TeamDealerNum = "1"; // 团队经销商人数
export const DealerLevelUpgradeCondition_DirectlyDealerNum = "2"; // 直推经销商人数
export const DealerLevelUpgradeCondition_IndirectDealerNum = "3"; // 间推经销商人数
export const DealerLevelUpgradeCondition_SelfBuyMoney = "4"; // 自购云仓订单金额

export const DealerLevelUpgradeCondition_TotalRechargeMoney = "7"; // 累计充值金额
export const DealerLevelUpgradeCondition_OnceRechargeMoney = "6"; // 一次性充值金额

export const DealerLevelUpgradeCondition_SelfBuyProduct = "5"; // 自购云仓商品数量
export default {
  [DealerLevelUpgradeCondition_TeamDealerNum]: {
    type: DealerLevelUpgradeCondition_TeamDealerNum,
    logistic: "or",
    explain:true,
    value: {
      dealer_level_id: [],
      member_count: null
    }
  },
  [DealerLevelUpgradeCondition_DirectlyDealerNum]: {
    type: DealerLevelUpgradeCondition_DirectlyDealerNum,
    logistic: "or",
    value: {
      dealer_level_id: [],
      member_count: null
    }
  },
  [DealerLevelUpgradeCondition_IndirectDealerNum]: {
    type: DealerLevelUpgradeCondition_IndirectDealerNum,
    logistic: "or",
    explain:true,
    value: {
      dealer_level_id: [],
      member_count: null
    }
  },
  [DealerLevelUpgradeCondition_SelfBuyMoney]: {
    type: DealerLevelUpgradeCondition_SelfBuyMoney,
    logistic: "or",
    explain:true,
    value: null
  },
  [DealerLevelUpgradeCondition_TotalRechargeMoney]: {
    type: DealerLevelUpgradeCondition_TotalRechargeMoney,
    logistic: "or",
    value: null
  },
  [DealerLevelUpgradeCondition_OnceRechargeMoney]: {
    type: DealerLevelUpgradeCondition_OnceRechargeMoney,
    logistic: "or",
    value: null
  },
  [DealerLevelUpgradeCondition_SelfBuyProduct]: {
    type: DealerLevelUpgradeCondition_SelfBuyProduct,
    logistic: "or",
    explain:true,
    value: null
  }
}