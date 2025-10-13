// 测试数值计算错误 - 修复版
console.log('=== 测试数值计算 ===');

// 添加安全的数字转换函数
function toNumber(value) {
    if (value === null || value === undefined || value === '') return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
}

// 模拟数据（可能来自表单，是字符串）
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

// 修复：使用toNumber确保数字类型
const totalCost = toNumber(testData.food_cost) + 
                  toNumber(testData.labor_cost) + 
                  toNumber(testData.rent_cost) + 
                  toNumber(testData.marketing_cost) + 
                  toNumber(testData.utility_cost);

const monthlyRevenue = toNumber(testData.monthly_revenue);

console.log('\n计算结果:');
console.log('总成本:', totalCost);
console.log('总成本率:', ((totalCost / monthlyRevenue) * 100).toFixed(1) + '%');
console.log('净利润率:', ((1 - (totalCost / monthlyRevenue)) * 100).toFixed(1) + '%');

// 修复：改进格式化函数，确保处理数字
function formatNumber(num) {
    const number = toNumber(num);
    if (number === 0) return '0';
    return new Intl.NumberFormat('zh-CN').format(number);
}

console.log('\n格式化结果:');
console.log('总成本格式化:', '¥' + formatNumber(totalCost));
console.log('月营收格式化:', '¥' + formatNumber(monthlyRevenue));

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
console.log('❌ 错误方式(字符串拼接):', wrongWay);
console.log('✅ 正确方式(数字相加):', totalCost);

// 额外测试：模拟字符串输入场景
console.log('\n=== 字符串输入场景测试 ===');
const stringData = {
    monthly_revenue: '150000',
    food_cost: '60000',
    labor_cost: '50000',
    rent_cost: '30000',
    marketing_cost: '10000',
    utility_cost: '8000'
};

const stringTotalCost = toNumber(stringData.food_cost) + 
                        toNumber(stringData.labor_cost) + 
                        toNumber(stringData.rent_cost) + 
                        toNumber(stringData.marketing_cost) + 
                        toNumber(stringData.utility_cost);

console.log('字符串数据总成本:', stringTotalCost);
console.log('结果是否正确:', stringTotalCost === 158000);

// 如果不使用toNumber会发生什么
const wrongStringTotal = stringData.food_cost + stringData.labor_cost + stringData.rent_cost + 
                         stringData.marketing_cost + stringData.utility_cost;
console.log('❌ 不转换直接相加:', wrongStringTotal);
console.log('❌ 错误结果类型:', typeof wrongStringTotal);
