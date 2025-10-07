// 测试数值计算错误
console.log('=== 测试数值计算 ===');

// 模拟数据
const testData = {
    monthly_revenue: 150000,
    food_cost: 60000,
    labor_cost: 50000,
    rent_cost: 30000,
    marketing_cost: 10000,
    utility_cost: 8000
};

console.log('原始数据:');
console.log('月营收:', testData.monthly_revenue);
console.log('食材成本:', testData.food_cost);
console.log('人力成本:', testData.labor_cost);
console.log('租金成本:', testData.rent_cost);
console.log('营销费用:', testData.marketing_cost);
console.log('水电气成本:', testData.utility_cost);

// 测试总成本计算
const totalCost = (testData.food_cost || 0) + (testData.labor_cost || 0) + (testData.rent_cost || 0) + 
                  (testData.marketing_cost || 0) + (testData.utility_cost || 0);

console.log('\n计算结果:');
console.log('总成本:', totalCost);
console.log('总成本率:', ((totalCost / testData.monthly_revenue) * 100).toFixed(1) + '%');
console.log('毛利率:', ((1 - (totalCost / testData.monthly_revenue)) * 100).toFixed(1) + '%');

// 测试格式化函数
function formatNumber(num) {
    if (!num) return '0';
    return new Intl.NumberFormat('zh-CN').format(num);
}

console.log('\n格式化结果:');
console.log('总成本格式化:', '¥' + formatNumber(totalCost));
console.log('月营收格式化:', '¥' + formatNumber(testData.monthly_revenue));

// 检查数据类型
console.log('\n数据类型检查:');
console.log('food_cost类型:', typeof testData.food_cost);
console.log('labor_cost类型:', typeof testData.labor_cost);
console.log('rent_cost类型:', typeof testData.rent_cost);
console.log('marketing_cost类型:', typeof testData.marketing_cost);
console.log('utility_cost类型:', typeof testData.utility_cost);

// 测试字符串拼接问题
console.log('\n字符串拼接测试:');
const wrongWay = testData.food_cost + "" + testData.labor_cost + "" + testData.rent_cost + "" + testData.marketing_cost + "" + testData.utility_cost;
console.log('错误方式(字符串拼接):', wrongWay);
console.log('正确方式(数字相加):', totalCost);