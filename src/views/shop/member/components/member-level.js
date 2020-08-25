//分销商等级升级条件
const distributionKey = {
    // DistributionLevelUpgradeCondition_TotalTeam: 8, //团队总数量
    // DistributionLevelUpgradeCondition_DirectlyMember: 17, //直推成员人数
    // DistributionLevelUpgradeCondition_IndirectMember: 18, //间推成员人数
    // DistributionLevelUpgradeCondition_SubordinateMember: 12, //会员总数量
    // DistributionLevelUpgradeCondition_DirectlyUnderMember: 10, //一级会员数量
    // DistributionLevelUpgradeCondition_IndirectUnderMember: 19, //间推会员人数
    // DistributionLevelUpgradeCondition_SubordinateDistributor: 11, //分销商总数量
    // DistributionLevelUpgradeCondition_DirectlyUnderDistributor: 9, // 一级分销商数量
    // DistributionLevelUpgradeCondition_TeamArbitrarilyLevelDistributionMember: 20, // 间推分销商合计数量

    // DistributionLevelUpgradeCondition_TotalCommission: 1, //佣金总收益
    // DistributionLevelUpgradeCondition_SubordinateDealTimes: 6, //团队总交易次数
    // DistributionLevelUpgradeCondition_SubordinateDealMoney: 7, //团队总交易金额
    // DistributionLevelUpgradeCondition_SelfDealTimes: 2, //自购交易次数
    DistributionLevelUpgradeCondition_SelfDealMoney: 0, //累计交易金额
    // DistributionLevelUpgradeCondition_DirectlyUnderDealTimes: 4, // 一级分销团队交易次数
    // DistributionLevelUpgradeCondition_DirectlyUnderDealMoney: 5, // 一级分销团队交易金额
    // DistributionLevelUpgradeCondition_IndirectOrderTime: 21, // 间推订单笔数
    // DistributionLevelUpgradeCondition_IndirectOrderMoney: 22, // 间推订单金额

    DistributionLevelUpgradeCondition_AccumulatedRechargeAmount: 2, // 累计充值金额
    DistributionLevelUpgradeCondition_OneTimeRechargeAmount: 1, // 一次性充值金额

    // DistributionLevelUpgradeCondition_TeamBuyDesignatedProduct: 13, //团队指定商品
    // DistributionLevelUpgradeCondition_SelfBuyDesignatedProduct: 14, //自购指定商品
    // DistributionLevelUpgradeCondition_DirectlyBuyDesignatedProduct: 15, //直推指定商品
    // DistributionLevelUpgradeCondition_IndirectBuyDesignatedProduct: 16 //间推指定商品
};

// const conditionPerson = [
//     {
//         id: distributionKey.DistributionLevelUpgradeCondition_TotalTeam,
//         conditionType: "人数",
//         tip: "分销团队的所有成员（指一二三级的分销商和会员）人数，包括自己",
//         rowSpan: 9,
//         conditionName: "分销团队总人数",
//         explain: true,
//         unit: "人"
//     },
//     {
//         id: distributionKey.DistributionLevelUpgradeCondition_DirectlyMember,
//         tip: "所有直推成员（指分销商和会员）人数，不包括自己",
//         conditionName: "直推成员人数",
//         unit: "人"
//     },
//     {
//         id: distributionKey.DistributionLevelUpgradeCondition_IndirectMember,
//         tip: "所有间推成员（指二三级的分销商和会员）人数，不包括自己",
//         conditionName: "间推成员人数",
//         explain: true,
//         unit: "人"
//     },
//     {
//         id: distributionKey.DistributionLevelUpgradeCondition_SubordinateMember,
//         tip: "所有会员（指分销团队内的非分销商）人数，不包括自己",
//         conditionName: "会员总人数",
//         explain: true,
//         unit: "人"
//     },
//     {
//         id: distributionKey.DistributionLevelUpgradeCondition_DirectlyUnderMember,
//         tip: "所有直推会员（指非分销商）人数，不包括自己",
//         conditionName: " 直推会员人数",
//         unit: "人"
//     },
//     {
//         id: distributionKey.DistributionLevelUpgradeCondition_IndirectUnderMember,
//         tip: "所有间推会员（指二三级的会员）人数，不包括自己",
//         conditionName: "间推会员人数",
//         explain: true,
//         unit: "人"
//     },
//     {
//         id:
//         distributionKey.DistributionLevelUpgradeCondition_SubordinateDistributor,
//         tip: "分销团队内，XX等级的分销商的总人数，包括自己",
//         conditionName: "团队分销商合计数量",
//         explain: true,
//         unit: "人"
//     },
//     {
//         id:
//         distributionKey.DistributionLevelUpgradeCondition_DirectlyUnderDistributor,
//         tip: "XX等级所有直推的分销商人数，不包括自己",
//         conditionName: "直推分销商合计数量",
//         unit: "人"
//     },
//     {
//         id:
//         distributionKey.DistributionLevelUpgradeCondition_TeamArbitrarilyLevelDistributionMember,
//         tip: "XX等级所有间推分销商（指二三级的分销商）人数，不包括自己",
//         conditionName: "间推分销商合计数量",
//         explain: true,
//         unit: "人"
//     }
// ];

const conditionOrder = [
    // {
    //     id: distributionKey.DistributionLevelUpgradeCondition_TotalCommission,
    //     conditionType: "订单",
    //     rowSpan: 9,
    //     tip: "分销佣金累计的总收益",
    //     conditionName: "佣金总收益",
    //     explain: true,
    //     precision: 2,
    //     unit: "元"
    // },
    // {
    //     id: distributionKey.DistributionLevelUpgradeCondition_SubordinateDealTimes,
    //     tip: "分销团队的所有分销订单总笔数，包括分销自购",
    //     conditionName: "分销团队总订单笔数",
    //     explain: true,
    //     precision: 0,
    //     unit: "笔"
    // },
    // {
    //     id: distributionKey.DistributionLevelUpgradeCondition_SubordinateDealMoney,
    //     tip: "分销团队的所有分销订单总金额，包括分销自购",
    //     conditionName: "分销团队总订单金额",
    //     explain: true,
    //     precision: 2,
    //     unit: "元"
    // },
    // {
    //     id: distributionKey.DistributionLevelUpgradeCondition_SelfDealTimes,
    //     tip: "自购的所有订单总笔数",
    //     conditionName: "自购订单笔数",
    //     precision: 0,
    //     unit: "笔"
    // },
    {
        id: distributionKey.DistributionLevelUpgradeCondition_SelfDealMoney,
        conditionType: "订单",
        rowSpan: 1,
        tip: " 累计自购的交易总金额",
        conditionName: "累计交易金额",
        precision: 2,
        unit: "元"
    },
    // {
    //     id:
    //     distributionKey.DistributionLevelUpgradeCondition_DirectlyUnderDealTimes,
    //     tip: "所有直推成员下的订单总笔数，不包括自购",
    //     conditionName: "直推订单笔数",
    //     precision: 0,
    //     unit: "笔"
    // },
    // {
    //     id:
    //     distributionKey.DistributionLevelUpgradeCondition_DirectlyUnderDealMoney,
    //     tip: "所有直推成员下的订单总金额，不包括自购",
    //     conditionName: "直推订单金额",
    //     precision: 2,
    //     unit: "元"
    // },
    // {
    //     id: distributionKey.DistributionLevelUpgradeCondition_IndirectOrderTime,
    //     tip: "分销团队的所有间推成员（指二三级成员）下的订单总笔数，不包括自购",
    //     conditionName: "间推订单笔数",
    //     explain: true,
    //     precision: 0,
    //     unit: "笔"
    // },
    // {
    //     id: distributionKey.DistributionLevelUpgradeCondition_IndirectOrderMoney,
    //     tip: "分销团队的所有间推成员（指二三级成员）下的订单总金额，不包括自购",
    //     conditionName: "间推订单金额",
    //     explain: true,
    //     precision: 2,
    //     unit: "元"
    // }
];

const conditionRecharge = [
    {
        id:
        distributionKey.DistributionLevelUpgradeCondition_AccumulatedRechargeAmount,
        conditionType: "充值",
        rowSpan: 2,
        tip: "累计充值到余额账户的总金额，包括充值和转现，不包括提现到余额和充值赠送的金额",
        conditionName: "累计充值金额",
        precision: 0,
        unit: "元"
    },
    {
        id:
        distributionKey.DistributionLevelUpgradeCondition_OneTimeRechargeAmount,
        tip: "一次性充值到余额账户的金额，包括充值和转现，不包括提现到余额和充值赠送的金额",
        conditionName: "一次性充值金额",
        precision: 0,
        unit: "元"
    },
];

// const conditionProduct = [
//     {
//         id:
//         distributionKey.DistributionLevelUpgradeCondition_TeamBuyDesignatedProduct,
//         conditionType: "商品",
//         rowSpan: 4,
//         tip: "分销团队的所有成员购买的商品总数量，包括自购",
//         conditionName: "分销团队指定商品",
//         explain: true,
//         unit: "件"
//     },
//     {
//         id:
//         distributionKey.DistributionLevelUpgradeCondition_SelfBuyDesignatedProduct,
//         tip: "自购的商品总数量",
//         conditionName: "自购指定商品",
//         unit: "件"
//     },
//     {
//         id:
//         distributionKey.DistributionLevelUpgradeCondition_DirectlyBuyDesignatedProduct,
//         tip: "所有直推成员购买的商品总数量，不包括自购",
//         conditionName: "直推指定商品",
//         unit: "件"
//     },
//     {
//         id:
//         distributionKey.DistributionLevelUpgradeCondition_IndirectBuyDesignatedProduct,
//         tip: "分销团队的所有间推成员（指二三级成员）购买的商品总数量，不包括自购",
//         conditionName: "间推指定商品",
//         explain: true,
//         unit: "件"
//     }
// ];

const conditionData = [
    // ...conditionPerson,
    ...conditionOrder,
    ...conditionRecharge,
    // ...conditionProduct
];
// 用于升级条件类型判断
const conditionType = {
    // person: {
    //     extra: {
    //         11: "团队",
    //         9: "直推",
    //         20: "间推"
    //     }
    // },
    order: {},
    recharge:{},
    // product: {}
};
// conditionPerson.forEach(item => {
//     conditionType.person[item.id] = item;
// });
conditionOrder.forEach(item => {
    conditionType.order[item.id] = item;
});
conditionRecharge.forEach(item => {
    conditionType.recharge[item.id] = item;
});
// conditionProduct.forEach(item => {
//     conditionType.product[item.id] = item;
// });

conditionData.forEach(item => Object.freeze(item));

export { conditionData, conditionType, distributionKey };
