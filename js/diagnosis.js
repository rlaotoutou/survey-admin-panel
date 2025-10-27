// Optimized Restaurant Diagnosis System
// Performance optimizations: memoization, efficient calculations, lazy evaluation

class RestaurantDiagnosisAdvanced {
    constructor() {
        this.thresholds = {
            // 基础成本指标
            food_cost_ratio: 0.35,
            labor_cost_ratio: 0.30,
            rent_cost_ratio: 0.20,
            marketing_cost_ratio: 0.10,
            utility_cost_ratio: 0.05,
            gross_margin: 0.55,
            
            // 效率指标
            table_turnover: 3.0,
            revenue_per_sqm: 5000,  // 坪效: 元/平米/月
            revenue_per_employee: 30000,  // 人效: 元/人/月
            
            // 客户指标
            avg_spending: 50,  // 客单价
            member_repurchase: 0.25,
            
            // 线上指标
            takeaway_ratio: [0.3, 0.5],
            review_score: 4.0,
            negative_comment_rate: 0.05,
            
            // 内容营销指标
            content_marketing_index: 60,  // 综合评分
            short_video_count: 50,
            live_stream_count: 15,
            
            // 差评细分
            service_bad_review_rate: 0.30,
            taste_bad_review_rate: 0.30
        };

        this.industryBenchmarks = {
            '快餐': { table_turnover: 4.5, gross_margin: 0.60, takeaway_ratio: 0.4, revenue_per_sqm: 6000, avg_spending: 35 },
            '火锅': { table_turnover: 3.5, gross_margin: 0.65, takeaway_ratio: 0.3, revenue_per_sqm: 7000, avg_spending: 80 },
            '正餐': { table_turnover: 2.5, gross_margin: 0.58, takeaway_ratio: 0.25, revenue_per_sqm: 5500, avg_spending: 70 },
            '茶餐厅': { table_turnover: 3.0, gross_margin: 0.55, takeaway_ratio: 0.3, revenue_per_sqm: 5000, avg_spending: 45 },
            '咖啡厅': { table_turnover: 2.0, gross_margin: 0.70, takeaway_ratio: 0.4, revenue_per_sqm: 4500, avg_spending: 40 },
            '茶饮店': { table_turnover: 5.0, gross_margin: 0.65, takeaway_ratio: 0.6, revenue_per_sqm: 8000, avg_spending: 25 },
            '其他': { table_turnover: 3.0, gross_margin: 0.55, takeaway_ratio: 0.3, revenue_per_sqm: 5000, avg_spending: 50 }
        };

        // 商圈等级评分
        this.businessCircleScores = {
            '一类商场里面': 95,
            '二类商场里面': 85,
            '一类商圈': 90,
            '二类商圈': 80,
            '一类主街': 85,
            '二类主街': 75,
            '一类社区': 70,
            '二类社区': 60
        };

        // 装修档次评分
        this.decorationScores = {
            '中高档': 90,
            '中档': 75,
            '中低档': 60
        };

        // Memoization cache for expensive calculations
        this.cache = new Map();
    }
    calculateKPI(data) {
        // Check cache first
        const cacheKey = `kpi_${JSON.stringify(data)}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // 修复总成本计算 - 确保所有成本项都被正确计算
        const totalCost = (data.food_cost || 0) + (data.labor_cost || 0) + (data.rent_cost || 0) + 
                        (data.marketing_cost || 0) + (data.utility_cost || 0);
        
        // 计算员工数(根据人力成本和行业平均工资估算)
        const estimatedEmployees = Math.max(1, Math.round((data.labor_cost || 0) / 5000));
        
        // 修复毛利率计算 - 确保分母不为0，并正确处理负数情况
        const monthlyRevenue = data.monthly_revenue || 0;
        const grossMargin = monthlyRevenue > 0 ? Math.max(0, 1 - (totalCost / monthlyRevenue)) : 0;
        
        // 第一步：先构建基础 kpi 对象（不包含依赖自身的计算）
        const kpi = {
            // 基础成本率 - 添加安全检查
            food_cost_ratio: monthlyRevenue > 0 ? (data.food_cost || 0) / monthlyRevenue : 0,
            labor_cost_ratio: monthlyRevenue > 0 ? (data.labor_cost || 0) / monthlyRevenue : 0,
            rent_cost_ratio: monthlyRevenue > 0 ? (data.rent_cost || 0) / monthlyRevenue : 0,
            marketing_cost_ratio: monthlyRevenue > 0 ? (data.marketing_cost || 0) / monthlyRevenue : 0,
            utility_cost_ratio: monthlyRevenue > 0 ? (data.utility_cost || 0) / monthlyRevenue : 0,
            gross_margin: grossMargin,
            
            // 效率指标
            table_turnover: (data.daily_customers || 0) / (data.seats || 1),
            revenue_per_sqm: (data.monthly_revenue || 0) / (data.store_area || 1),  // 坪效
            revenue_per_employee: (data.monthly_revenue || 0) / estimatedEmployees,  // 人效
            
            // 客户指标
            avg_spending: (data.monthly_revenue || 0) / (data.total_customers || 1),  // 客单价
            member_repurchase: (data.repeat_customers || 0) / (data.total_customers || 1),
            
            // 线上指标
            takeaway_ratio: (data.online_revenue || 0) / (data.monthly_revenue || 1),
            review_score: data.average_rating || 0,
            negative_comment_rate: (data.bad_reviews || 0) / (data.total_reviews || 1),
            
            // 内容营销指数(综合评分)
            content_marketing_index: this.calculateContentMarketingIndex(data),
            short_video_count: data.short_video_count || 0,
            live_stream_count: data.live_stream_count || 0,
            
            // 差评分析
            service_bad_review_rate: (data.service_bad_reviews || 0) / (data.bad_reviews || 1),
            taste_bad_review_rate: (data.taste_bad_reviews || 0) / (data.bad_reviews || 1),
            
            // 选址匹配度
            location_match_score: this.calculateLocationMatchScore(data),
            
            // 营销健康度
            marketing_health_score: this.calculateMarketingHealthScore(data),
            
            // 辅助数据
            estimated_employees: estimatedEmployees
        };

        const financialHealth = this.calculateFinancialHealth(data, totalCost, monthlyRevenue);
        Object.assign(kpi, financialHealth);

        const operationalEfficiency = this.calculateOperationalEfficiency(data, kpi);
        Object.assign(kpi, operationalEfficiency);

        const customerValue = this.calculateCustomerValue(data, kpi);
        Object.assign(kpi, customerValue);

        const churnRisk = this.calculateCustomerChurnRisk(data, kpi);
        Object.assign(kpi, churnRisk);

        const satisfaction = this.calculateCustomerSatisfaction(data, kpi);
        Object.assign(kpi, satisfaction);

        const marketing = this.calculateMarketingEffectiveness(data, kpi);
        Object.assign(kpi, marketing);

        const risks = this.calculateRiskIndicators(data, kpi, totalCost, monthlyRevenue);
        Object.assign(kpi, risks);

        const competitive = this.calculateCompetitiveAnalysis(data, kpi);
        Object.assign(kpi, competitive);

        const expansion = this.calculateExpansionFeasibility(data, kpi);
        Object.assign(kpi, expansion);

        // Cache the result
        this.cache.set(cacheKey, kpi);
        return kpi;
    }

    // 计算内容营销指数
    calculateContentMarketingIndex(data) {
        let score = 0;
        
        // 短视频发布量得分 (0-40分)
        const videoScore = Math.min(40, (data.short_video_count || 0) / 100 * 40);
        score += videoScore;
        
        // 直播场次得分 (0-30分)
        const liveScore = Math.min(30, (data.live_stream_count || 0) / 30 * 30);
        score += liveScore;
        
        // 营销情况得分 (0-30分)
        const marketingSituationScore = {
            '有自己团队': 30,
            '找代运营': 25,
            '老板运营': 20,
            '无': 0
        };
        score += marketingSituationScore[data.marketing_situation] || 15;
        
        return Math.round(score);
    }

    // 计算选址匹配度评分
    calculateLocationMatchScore(data) {
        let score = 0;
        
        // 商圈得分 (0-40分)
        const circleScore = (this.businessCircleScores[data.business_circle] || 70) / 100 * 40;
        score += circleScore;
        
        // 装修档次得分 (0-30分)
        const decorScore = (this.decorationScores[data.decoration_level] || 70) / 100 * 30;
        score += decorScore;
        
        // 业态匹配得分 (0-30分) - 基于坪效和客单价
        const benchmark = this.industryBenchmarks[data.business_type] || this.industryBenchmarks['其他'];
        const revenuePerSqm = (data.monthly_revenue || 0) / (data.store_area || 1);
        const matchScore = Math.min(30, (revenuePerSqm / benchmark.revenue_per_sqm) * 30);
        score += matchScore;
        
        return Math.round(score);
    }

    // 计算营销健康度
    calculateMarketingHealthScore(data) {
        let score = 0;
        
        // ROI得分 (0-40分) - 营销成本占比越低越好
        const marketingRatio = (data.marketing_cost || 0) / (data.monthly_revenue || 1);
        const roiScore = Math.max(0, 40 - (marketingRatio * 100 * 4));
        score += roiScore;
        
        // 线上表现得分 (0-30分)
        const onlineScore = Math.min(30, ((data.average_rating || 0) / 5) * 30);
        score += onlineScore;
        
        // 内容营销得分 (0-30分)
        const contentScore = Math.min(30, ((data.short_video_count || 0) / 100) * 30);
        score += contentScore;
        
        return Math.round(score);
    }

    // 生成综合诊断报告
    generateReport(data, kpi, benchmark) {
        const totalCostCalc = (data.food_cost || 0) + (data.labor_cost || 0) + (data.rent_cost || 0) + 
                            (data.marketing_cost || 0) + (data.utility_cost || 0);

        const overallScore = Math.round((kpi.location_match_score + kpi.marketing_health_score + kpi.content_marketing_index) / 3);
        const healthLevel = this.getHealthLevel(overallScore);
        
        return `
            <div class="diagnosis-report-v2">
                ${this.generateStoreOverview(data, overallScore, healthLevel)}
                ${this.generateDashboardSection(kpi, data)}
                ${this.generateCostAnalysisSection(data, kpi)}
                ${this.generateRevenueSection(data, kpi)}
                ${this.generateOperationsSection(data, kpi)}
                ${this.generateMarketingSection(data, kpi)}
                ${this.generateAISuggestions(data, kpi)}
                ${this.generateAdminEditor()}
            </div>
        `;
    }

    generateStoreOverview(data, overallScore, healthLevel) {
        const businessType = data.business_type || '快餐';
        const location = data.location || '一类商圈';
        const area = data.area || 120;
        const seats = data.seats || 50;
        const monthlyRevenue = data.monthly_revenue || 150000;
        const dailyCustomers = Math.round(monthlyRevenue / 30 / (data.avg_order_value || 50));
        const decorationLevel = data.decoration_level || '中档';

        return `
            <div class="store-overview-card">
                <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">
                    📍 ${data.store_name || '朝阳路快餐店'} ｜ ${businessType}业态 ｜ ${location}
                </h2>
                <div class="store-info-grid">
                    <div class="store-info-item">
                        <span class="store-info-icon">🏠</span>
                        <span>面积：${area}㎡ ｜ 座位数：${seats}个</span>
                    </div>
                    <div class="store-info-item">
                        <span class="store-info-icon">💰</span>
                        <span>月营收：¥${this.formatNumber(monthlyRevenue)} ｜ 日均客流：${dailyCustomers}人</span>
                    </div>
                    <div class="store-info-item">
                        <span class="store-info-icon">⚙️</span>
                        <span>装修档次：${decorationLevel} ｜ 综合得分：${overallScore}分</span>
                    </div>
                </div>
                <div class="health-level-badge ${healthLevel.class}">
                    ${healthLevel.label}
                </div>
            </div>
        `;
    }

    getHealthLevel(score) {
        if (score >= 85) return { class: 'health-excellent', label: '优秀' };
        if (score >= 70) return { class: 'health-good', label: '良好' };
        if (score >= 60) return { class: 'health-warning', label: '待改善' };
        return { class: 'health-danger', label: '警示' };
    }

    calculateCostControlScore(data) {
        const foodCostRate = (data.food_cost || 0) / (data.monthly_revenue || 1) * 100;
        const laborCostRate = (data.labor_cost || 0) / (data.monthly_revenue || 1) * 100;
        const totalCostRate = foodCostRate + laborCostRate + (data.rent_cost || 0) / (data.monthly_revenue || 1) * 100;
        
        let score = 100;
        if (foodCostRate > 40) score -= 20;
        if (laborCostRate > 35) score -= 15;
        if (totalCostRate > 85) score -= 25;
        
        return Math.max(0, Math.min(100, score));
    }

    calculateRevenueAbilityScore(data) {
        const monthlyRevenue = data.monthly_revenue || 0;
        const area = data.area || 1;
        const seats = data.seats || 1;
        
        const revenuePerSqm = monthlyRevenue / area;
        const revenuePerSeat = monthlyRevenue / seats;
        
        let score = 50;
        if (revenuePerSqm > 1000) score += 20;
        if (revenuePerSeat > 3000) score += 20;
        if (monthlyRevenue > 200000) score += 10;
        
        return Math.max(0, Math.min(100, score));
    }

    calculateOperationEfficiencyScore(data) {
        const dailyCustomers = Math.round((data.monthly_revenue || 0) / 30 / (data.avg_order_value || 50));
        const seats = data.seats || 1;
        const turnoverRate = dailyCustomers / seats;
        
        let score = 50;
        if (turnoverRate > 2) score += 25;
        if (turnoverRate > 3) score += 15;
        if (dailyCustomers > 200) score += 10;
        
        return Math.max(0, Math.min(100, score));
    }

    calculateCustomerExperienceScore(data) {
        const satisfaction = data.customer_satisfaction || 70;
        const repeatRate = data.repeat_customer_rate || 30;
        
        let score = satisfaction * 0.7 + repeatRate * 0.3;
        return Math.max(0, Math.min(100, score));
    }

    generateDashboardSection(kpi, data) {
        const costControl = this.calculateCostControlScore(data);
        const revenueAbility = this.calculateRevenueAbilityScore(data);
        const operationEfficiency = this.calculateOperationEfficiencyScore(data);
        const customerExperience = this.calculateCustomerExperienceScore(data);
        const marketingAbility = kpi.marketing_health_score;

        return `
                <div class="diagnosis-section">
                <h3>📊 核心经营指标总览</h3>
                <div class="dashboard-container">
                    <div class="gauge-chart">
                        <h4>总盈利评分</h4>
                        <div id="profitGauge" style="height: 200px;"></div>
                        <div style="margin-top: 16px;">
                            <div style="font-size: 32px; font-weight: 700; color: #3b82f6;">
                                ${Math.round((costControl + revenueAbility + operationEfficiency + customerExperience) / 4)}分
                            </div>
                            <div style="color: #6b7280; margin-top: 8px;">
                                综合经营健康度评分
                        </div>
                            </div>
                        </div>
                    <div class="radar-chart">
                        <h4>五维能力雷达图</h4>
                        <div id="radarChart" style="height: 200px;"></div>
                        <div style="margin-top: 16px; font-size: 12px; color: #6b7280;">
                            <div>成本控制力: ${costControl}分</div>
                            <div>营收能力: ${revenueAbility}分</div>
                            <div>运营效率: ${operationEfficiency}分</div>
                            <div>客户体验: ${customerExperience}分</div>
                            <div>营销能力: ${marketingAbility}分</div>
                            </div>
                        </div>
                            </div>
                        </div>
        `;
    }

    generateCostAnalysisSection(data, kpi) {
        const monthlyRevenue = data.monthly_revenue || 150000;
        const foodCost = data.food_cost || 55000;
        const laborCost = data.labor_cost || 46000;
        const rentCost = data.rent_cost || 27600;
        const utilityCost = data.utility_cost || 7350;
        const marketingCost = data.marketing_cost || 13800;
        
        const foodCostRate = (foodCost / monthlyRevenue * 100).toFixed(1);
        const laborCostRate = (laborCost / monthlyRevenue * 100).toFixed(1);
        const rentCostRate = (rentCost / monthlyRevenue * 100).toFixed(1);
        const utilityCostRate = (utilityCost / monthlyRevenue * 100).toFixed(1);
        const marketingCostRate = (marketingCost / monthlyRevenue * 100).toFixed(1);
        
        const totalCostRate = parseFloat(foodCostRate) + parseFloat(laborCostRate) + parseFloat(rentCostRate) + 
                             parseFloat(utilityCostRate) + parseFloat(marketingCostRate);

        return `
            <div class="diagnosis-section">
                <h3>💰 成本结构分析</h3>
                <div class="cost-analysis-container">
                    <div class="pie-chart-container">
                        <h4>成本结构分布</h4>
                        <div id="costPieChart" style="height: 200px;"></div>
                        <div style="margin-top: 16px; font-size: 14px;">
                            <div style="display: flex; align-items: center; margin: 4px 0;">
                                <span style="color: #3b82f6;">🍱</span>
                                <span style="margin-left: 8px;">食材：${foodCostRate}%</span>
                    </div>
                            <div style="display: flex; align-items: center; margin: 4px 0;">
                                <span style="color: #10b981;">👷</span>
                                <span style="margin-left: 8px;">人力：${laborCostRate}%</span>
                </div>
                            <div style="display: flex; align-items: center; margin: 4px 0;">
                                <span style="color: #f59e0b;">🏢</span>
                                <span style="margin-left: 8px;">租金：${rentCostRate}%</span>
                            </div>
                            <div style="display: flex; align-items: center; margin: 4px 0;">
                                <span style="color: #8b5cf6;">⚡</span>
                                <span style="margin-left: 8px;">水电气：${utilityCostRate}%</span>
                            </div>
                            <div style="display: flex; align-items: center; margin: 4px 0;">
                                <span style="color: #ef4444;">📣</span>
                                <span style="margin-left: 8px;">营销：${marketingCostRate}%</span>
                            </div>
                        </div>
                    </div>
                    <div class="alert-panel">
                        <h4>🚨 成本预警</h4>
                        ${this.generateCostAlerts(foodCostRate, totalCostRate)}
                    </div>
                </div>
            </div>
        `;
    }

    generateCostAlerts(foodCostRate, totalCostRate) {
        let alerts = [];
        
        if (parseFloat(foodCostRate) > 40) {
            alerts.push(`
                <div class="alert-item alert-warning">
                    <span>⚠️</span>
                    <div>
                        <strong>食材成本率偏高（${foodCostRate}%）</strong><br>
                        <small>建议优化供应链，寻找更优质的供应商</small>
                    </div>
                </div>
            `);
        }
        
        if (totalCostRate > 85) {
            alerts.push(`
                <div class="alert-item alert-danger">
                    <span>🔴</span>
                    <div>
                        <strong>综合成本率${totalCostRate.toFixed(1)}%</strong><br>
                        <small>盈利空间严重不足，需要立即优化成本结构</small>
                    </div>
                </div>
            `);
        }
        
        if (alerts.length === 0) {
            alerts.push(`
                <div class="alert-item alert-info">
                    <span>✅</span>
                    <div>
                        <strong>成本控制良好</strong><br>
                        <small>各项成本指标均在合理范围内</small>
                    </div>
                </div>
            `);
        }
        
        return alerts.join('');
    }

    generateRevenueSection(data, kpi) {
        const monthlyRevenue = data.monthly_revenue || 150000;
        const onlineRevenue = data.online_revenue || (monthlyRevenue * 0.3);
        const offlineRevenue = monthlyRevenue - onlineRevenue;
        const onlineRate = (onlineRevenue / monthlyRevenue * 100).toFixed(1);
        
        const area = data.area || 120;
        const seats = data.seats || 50;
        const dailyCustomers = Math.round(monthlyRevenue / 30 / (data.avg_order_value || 50));
        
        const revenuePerSqm = Math.round(monthlyRevenue / area);
        const revenuePerSeat = Math.round(monthlyRevenue / seats);
        const seatUtilization = Math.round(dailyCustomers / seats * 100);

        return `
                <div class="diagnosis-section">
                <h3>📈 营收结构与盈利能力</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0;">
                    <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h4>营收来源对比</h4>
                        <div id="revenueChart" style="height: 200px;"></div>
                        <div style="margin-top: 16px;">
                            <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                                <span>线下营收：¥${this.formatNumber(offlineRevenue)}</span>
                                <span style="color: #3b82f6;">${(100 - onlineRate)}%</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                                <span>线上营收：¥${this.formatNumber(onlineRevenue)}</span>
                                <span style="color: #10b981;">${onlineRate}% ${onlineRate > 30 ? '↑' : '↓'}</span>
                            </div>
                        </div>
                    </div>
                    <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h4>关键指标卡片</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div style="text-align: center; padding: 16px; background: #f8fafc; border-radius: 8px;">
                                <div style="font-size: 20px; font-weight: 700; color: #3b82f6;">¥${revenuePerSqm}</div>
                                <div style="font-size: 12px; color: #6b7280;">坪效</div>
                            </div>
                            <div style="text-align: center; padding: 16px; background: #f8fafc; border-radius: 8px;">
                                <div style="font-size: 20px; font-weight: 700; color: #10b981;">¥${revenuePerSeat}</div>
                                <div style="font-size: 12px; color: #6b7280;">人效</div>
                            </div>
                            <div style="text-align: center; padding: 16px; background: #f8fafc; border-radius: 8px;">
                                <div style="font-size: 20px; font-weight: 700; color: #f59e0b;">¥${data.avg_order_value || 50}</div>
                                <div style="font-size: 12px; color: #6b7280;">客单价</div>
                            </div>
                            <div style="text-align: center; padding: 16px; background: #f8fafc; border-radius: 8px;">
                                <div style="font-size: 20px; font-weight: 700; color: #8b5cf6;">${seatUtilization}%</div>
                                <div style="font-size: 12px; color: #6b7280;">座位利用率</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateOperationsSection(data, kpi) {
        const dailyCustomers = Math.round((data.monthly_revenue || 0) / 30 / (data.avg_order_value || 50));
        const seats = data.seats || 50;
        const turnoverRate = (dailyCustomers / seats).toFixed(1);
        const satisfaction = data.customer_satisfaction || 75;
        const repeatRate = data.repeat_customer_rate || 30;

        return `
            <div class="diagnosis-section">
                <h3>👥 运营效率与客户体验分析</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0;">
                    <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h4>客流趋势分析</h4>
                        <div id="customerTrendChart" style="height: 200px;"></div>
                        <div style="margin-top: 16px;">
                            <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                                <span>日均客流：${dailyCustomers}人</span>
                                <span style="color: #3b82f6;">${dailyCustomers > 150 ? '↑' : '↓'}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                                <span>翻台率：${turnoverRate}次</span>
                                <span style="color: #10b981;">${turnoverRate > 2 ? '↑' : '↓'}</span>
                            </div>
                        </div>
                    </div>
                    <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h4>客户体验评分</h4>
                        <div style="text-align: center; margin-bottom: 20px;">
                            <div style="font-size: 48px; font-weight: 700; color: #3b82f6;">${satisfaction}</div>
                            <div style="color: #6b7280;">客户满意度</div>
                        </div>
                        <div style="margin-top: 16px;">
                            <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                                <span>复购率：${repeatRate}%</span>
                                <span style="color: #10b981;">${repeatRate > 40 ? '↑' : '↓'}</span>
                            </div>
                            <div style="margin-top: 12px; padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 14px;">
                                <strong>体验分析：</strong>该店在服务满意度方面表现良好，但口味问题占比32%，建议重点优化主菜出品。
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateMarketingSection(data, kpi) {
        const videoCount = data.video_count || 80;
        const liveCount = data.live_count || 20;
        const marketingIndex = kpi.content_marketing_index || 75;

        return `
            <div class="diagnosis-section">
                <h3>📱 内容营销与线上表现</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0;">
                    <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h4>营销指标卡</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div style="text-align: center; padding: 16px; background: #f8fafc; border-radius: 8px;">
                                <div style="font-size: 20px; font-weight: 700; color: #3b82f6;">${videoCount}条</div>
                                <div style="font-size: 12px; color: #6b7280;">短视频发布量/月</div>
                            </div>
                            <div style="text-align: center; padding: 16px; background: #f8fafc; border-radius: 8px;">
                                <div style="font-size: 20px; font-weight: 700; color: #10b981;">${liveCount}场</div>
                                <div style="font-size: 12px; color: #6b7280;">直播场次/月</div>
                            </div>
                            <div style="text-align: center; padding: 16px; background: #f8fafc; border-radius: 8px; grid-column: 1 / -1;">
                                <div style="font-size: 20px; font-weight: 700; color: #f59e0b;">${marketingIndex}/100</div>
                                <div style="font-size: 12px; color: #6b7280;">营销指数</div>
                            </div>
                        </div>
                    </div>
                    <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h4>内容增长趋势</h4>
                        <div id="marketingTrendChart" style="height: 200px;"></div>
                        <div style="margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 14px;">
                            <strong>AI建议：</strong>当前内容产量充足，但建议提高视频质量并建立达人合作机制。
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateAISuggestions(data, kpi) {
        const suggestions = this.generateAISuggestionList(data, kpi);
        
        return `
            <div class="diagnosis-section">
                <h3>🧩 AI智能建议区</h3>
                <div style="margin: 16px 0;">
                    ${suggestions.map(suggestion => `
                        <div class="ai-suggestion-card priority-${suggestion.priority}">
                            <div class="suggestion-header" onclick="toggleSuggestion(this)">
                                <div>
                                    <strong>${suggestion.icon} ${suggestion.title}</strong>
                                    <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                                        优先级：${suggestion.priority === 'high' ? '高' : suggestion.priority === 'medium' ? '中' : '低'}
                                    </div>
                                </div>
                                <div style="color: #6b7280;">▼</div>
                            </div>
                            <div class="suggestion-content">
                                <div style="margin-bottom: 12px;">
                                    <strong>问题：</strong>${suggestion.problem}
                                </div>
                                <div style="margin-bottom: 12px;">
                                    <strong>方案：</strong>${suggestion.solution}
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div style="color: #10b981; font-weight: 600;">
                                        预期收益：${suggestion.expectedBenefit}
                                    </div>
                                    <div style="display: flex; gap: 8px;">
                                        <button class="editor-btn" onclick="editSuggestion(this)">✏️ 编辑</button>
                                        <button class="editor-btn" onclick="copyToAdmin(this)">📋 复制到管理员区</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    generateAISuggestionList(data, kpi) {
        const suggestions = [];
        
        // 成本优化建议
        const foodCostRate = (data.food_cost || 0) / (data.monthly_revenue || 1) * 100;
        if (foodCostRate > 40) {
            suggestions.push({
                icon: '🎯',
                title: '成本优化方案',
                priority: 'high',
                problem: '食材成本率偏高（' + foodCostRate.toFixed(1) + '%），影响盈利能力',
                solution: '优化供应商、引入自助点餐、节能设备改造',
                expectedBenefit: '¥10,000/月'
            });
        }
        
        // 营收提升建议
        const monthlyRevenue = data.monthly_revenue || 0;
        if (monthlyRevenue < 200000) {
            suggestions.push({
                icon: '📈',
                title: '营收提升策略',
                priority: 'medium',
                problem: '月营收偏低，需要提升客流量和客单价',
                solution: '推出套餐优惠、增加外卖渠道、优化菜品结构',
                expectedBenefit: '营收增长15%'
            });
        }
        
        // 客户体验优化
        const satisfaction = data.customer_satisfaction || 0;
        if (satisfaction < 80) {
            suggestions.push({
                icon: '👥',
                title: '客户体验优化',
                priority: 'medium',
                problem: '客户满意度有待提升（' + satisfaction + '分）',
                solution: '加强员工培训、优化服务流程、改善就餐环境',
                expectedBenefit: '满意度提升至85分'
            });
        }
        
        // 营销推广建议
        const marketingIndex = kpi.content_marketing_index || 0;
        if (marketingIndex < 80) {
            suggestions.push({
                icon: '📱',
                title: '营销推广优化',
                priority: 'low',
                problem: '内容营销指数偏低（' + marketingIndex + '分）',
                solution: '增加短视频发布频率、建立达人合作、优化内容质量',
                expectedBenefit: '营销指数提升至85分'
            });
        }
        
        return suggestions;
    }

    generateAdminEditor() {
        return `
            <div class="diagnosis-section">
                <h3>✍️ 管理员专属建议区</h3>
                <div class="admin-editor">
                    <div class="editor-toolbar">
                        <button class="editor-btn" onclick="formatText('bold')"><strong>B</strong></button>
                        <button class="editor-btn" onclick="formatText('italic')"><em>I</em></button>
                        <button class="editor-btn" onclick="formatText('underline')"><u>U</u></button>
                        <button class="editor-btn" onclick="insertHeading()">H1</button>
                        <button class="editor-btn" onclick="insertTable()">表格</button>
                        <button class="editor-btn" onclick="insertIcon()">图标</button>
                        <button class="editor-btn" onclick="saveAdminNotes()">保存</button>
                        <button class="editor-btn" onclick="exportPDF()">导出PDF</button>
                    </div>
                    <div class="editor-content" contenteditable="true" id="adminEditor">
                        <h3>立即行动项（1周内）</h3>
                        <ul>
                            <li>优化食材采购渠道，降低食材成本</li>
                            <li>加强员工服务培训</li>
                        </ul>
                        
                        <h3>短期改进项（本月）</h3>
                        <ul>
                            <li>推出新菜品吸引客户</li>
                            <li>优化店内布局提升翻台率</li>
                        </ul>
                        
                        <h3>中长期规划（3个月内）</h3>
                        <ul>
                            <li>考虑开设分店</li>
                            <li>建立会员体系</li>
                        </ul>
                        
                        <h3>特别提醒</h3>
                        <p>请定期关注成本控制，确保盈利空间。</p>
                        
                        <h3>后续跟进日期</h3>
                        <p>下次评估时间：${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        `;
    }
                    
                    <!-- 盈亏平衡点分析 -->
                    <div class="info-card mb-6">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">💰 盈亏平衡点分析</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div class="metric-card" style="border-top-color: #3b82f6;">
                                <div class="metric-label">盈亏平衡点营收</div>
                                <div class="metric-value" style="font-size: 24px; color: #3b82f6;">¥${this.formatNumber(kpi.break_even_revenue || 0)}</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    月营收需达到此金额才能保本
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #10b981;">
                                <div class="metric-label">安全边际</div>
                                <div class="metric-value" style="font-size: 24px; color: #10b981;">${((kpi.safety_margin || 0) * 100).toFixed(1)}%</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    ${kpi.safety_margin > 0.3 ? '健康' : kpi.safety_margin > 0.2 ? '一般' : '危险'}
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #f59e0b;">
                                <div class="metric-label">现金流健康度</div>
                                <div class="metric-value" style="font-size: 24px; color: #f59e0b;">${kpi.cash_flow_health_score || 0}分</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    ${kpi.cash_flow_health_score > 80 ? '优秀' : kpi.cash_flow_health_score > 60 ? '良好' : '需改善'}
                                </div>
                            </div>
                        </div>
                        <div style="font-size: 13px; color: #666; line-height: 1.6;">
                            <p><strong>财务健康建议:</strong></p>
                            <p>• 固定成本: ¥${this.formatNumber(kpi.fixed_costs || 0)}/月</p>
                            <p>• 变动成本率: ${((kpi.variable_cost_rate || 0) * 100).toFixed(1)}%</p>
                            <p>• 边际贡献率: ${((kpi.contribution_margin_rate || 0) * 100).toFixed(1)}%</p>
                            <p>• 投资回收期: ${kpi.simple_payback_period ? kpi.simple_payback_period.toFixed(1) : '∞'}年</p>
                        </div>
                    </div>

                    <!-- 成本结构分析 -->
                    <div class="info-card">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">📊 成本构成明细</h4>
                        <table class="health-table">
                            <thead>
                                <tr>
                                    <th>成本项目</th>
                                    <th>金额(元/月)</th>
                                    <th>占比</th>
                                    <th>健康状态</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>食材成本</td>
                                    <td>¥${this.formatNumber(data.food_cost)}</td>
                                    <td>${(kpi.food_cost_ratio * 100).toFixed(1)}%</td>
                                    <td class="${kpi.food_cost_ratio <= 0.35 ? 'status-healthy' : kpi.food_cost_ratio <= 0.40 ? 'status-warning' : 'status-danger'}">
                                        ${kpi.food_cost_ratio <= 0.35 ? '健康' : kpi.food_cost_ratio <= 0.40 ? '警告' : '危险'}
                                    </td>
                                </tr>
                                <tr>
                                    <td>人力成本</td>
                                    <td>¥${this.formatNumber(data.labor_cost)}</td>
                                    <td>${(kpi.labor_cost_ratio * 100).toFixed(1)}%</td>
                                    <td class="${kpi.labor_cost_ratio <= 0.30 ? 'status-healthy' : kpi.labor_cost_ratio <= 0.35 ? 'status-warning' : 'status-danger'}">
                                        ${kpi.labor_cost_ratio <= 0.30 ? '健康' : kpi.labor_cost_ratio <= 0.35 ? '警告' : '危险'}
                                    </td>
                                </tr>
                                <tr>
                                    <td>租金成本</td>
                                    <td>¥${this.formatNumber(data.rent_cost)}</td>
                                    <td>${(kpi.rent_cost_ratio * 100).toFixed(1)}%</td>
                                    <td class="${kpi.rent_cost_ratio <= 0.20 ? 'status-healthy' : kpi.rent_cost_ratio <= 0.25 ? 'status-warning' : 'status-danger'}">
                                        ${kpi.rent_cost_ratio <= 0.20 ? '健康' : kpi.rent_cost_ratio <= 0.25 ? '警告' : '危险'}
                                    </td>
                                </tr>
                                <tr>
                                    <td>营销费用</td>
                                    <td>¥${this.formatNumber(data.marketing_cost)}</td>
                                    <td>${(kpi.marketing_cost_ratio * 100).toFixed(1)}%</td>
                                    <td class="${kpi.marketing_cost_ratio <= 0.10 ? 'status-healthy' : kpi.marketing_cost_ratio <= 0.15 ? 'status-warning' : 'status-danger'}">
                                        ${kpi.marketing_cost_ratio <= 0.10 ? '健康' : kpi.marketing_cost_ratio <= 0.15 ? '警告' : '危险'}
                                    </td>
                                </tr>
                                <tr>
                                    <td>水电气成本</td>
                                    <td>¥${this.formatNumber(data.utility_cost)}</td>
                                    <td>${(kpi.utility_cost_ratio * 100).toFixed(1)}%</td>
                                    <td class="${kpi.utility_cost_ratio <= 0.05 ? 'status-healthy' : kpi.utility_cost_ratio <= 0.08 ? 'status-warning' : 'status-danger'}">
                                        ${kpi.utility_cost_ratio <= 0.05 ? '健康' : kpi.utility_cost_ratio <= 0.08 ? '警告' : '危险'}
                                    </td>
                                </tr>
                                <tr style="background: #f0f9ff;">
                                    <td><strong>总成本</strong></td>
                                    <td><strong>¥${this.formatNumber(totalCostCalc)}</strong></td>
                                    <td><strong>${((totalCostCalc / data.monthly_revenue) * 100).toFixed(1)}%</strong></td>
                                    <td class="${kpi.gross_margin >= 0.55 ? 'status-healthy' : kpi.gross_margin >= 0.45 ? 'status-warning' : 'status-danger'}">
                                        毛利${(kpi.gross_margin * 100).toFixed(1)}%
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- 成本优化建议 -->
                    <div class="info-card">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">💡 成本优化建议</h4>
                        ${this.generateCostOptimizationAdvice(kpi, data)}
                    </div>
                </div>

                <div class="diagnosis-section">
                    <h3>三、运营效率深度分析</h3>
                    
                    <!-- 时段效率分析 -->
                    <div class="info-card mb-6">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">⏰ 时段效率分析</h4>
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div class="metric-card" style="border-top-color: #f59e0b;">
                                <div class="metric-label">早餐档 (7-10点)</div>
                                <div class="metric-value" style="font-size: 20px; color: #f59e0b;">¥${Math.round(kpi.time_slot_efficiency?.breakfast?.revenue || 0)}</div>
                                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                                    效率: ${(kpi.time_slot_efficiency?.breakfast?.efficiency || 0).toFixed(2)}
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #10b981;">
                                <div class="metric-label">午餐档 (11-14点)</div>
                                <div class="metric-value" style="font-size: 20px; color: #10b981;">¥${Math.round(kpi.time_slot_efficiency?.lunch?.revenue || 0)}</div>
                                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                                    效率: ${(kpi.time_slot_efficiency?.lunch?.efficiency || 0).toFixed(2)}
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #8b5cf6;">
                                <div class="metric-label">下午茶 (15-17点)</div>
                                <div class="metric-value" style="font-size: 20px; color: #8b5cf6;">¥${Math.round(kpi.time_slot_efficiency?.afternoon?.revenue || 0)}</div>
                                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                                    效率: ${(kpi.time_slot_efficiency?.afternoon?.efficiency || 0).toFixed(2)}
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #ef4444;">
                                <div class="metric-label">晚餐档 (18-21点)</div>
                                <div class="metric-value" style="font-size: 20px; color: #ef4444;">¥${Math.round(kpi.time_slot_efficiency?.dinner?.revenue || 0)}</div>
                                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                                    效率: ${(kpi.time_slot_efficiency?.dinner?.efficiency || 0).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 座位利用率分析 -->
                    <div class="info-card mb-6">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">🪑 座位利用率分析</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="metric-card" style="border-top-color: #6366f1;">
                                <div class="metric-label">当前利用率</div>
                                <div class="metric-value" style="font-size: 24px; color: #6366f1;">${((kpi.seat_utilization || 0) * 100).toFixed(1)}%</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    ${kpi.seat_utilization > 0.7 ? '优秀' : kpi.seat_utilization > 0.5 ? '良好' : '需提升'}
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #ec4899;">
                                <div class="metric-label">浪费率</div>
                                <div class="metric-value" style="font-size: 24px; color: #ec4899;">${((kpi.seat_waste_rate || 0) * 100).toFixed(1)}%</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    ${kpi.seat_waste_rate < 0.3 ? '健康' : kpi.seat_waste_rate < 0.5 ? '一般' : '需优化'}
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #14b8a6;">
                                <div class="metric-label">优化潜力</div>
                                <div class="metric-value" style="font-size: 24px; color: #14b8a6;">${((kpi.seat_optimization_potential?.improvement || 0) * 100).toFixed(1)}%</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    预计可提升利用率
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 菜品组合优化 -->
                    <div class="info-card mb-6">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">🍽️ 菜品组合优化</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div class="metric-card" style="border-top-color: #8b5cf6;">
                                    <div class="metric-label">菜单健康指数</div>
                                    <div class="metric-value" style="font-size: 24px; color: #8b5cf6;">${kpi.menu_health_index?.health_index || 0}分</div>
                                    <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                        ${kpi.menu_health_index?.health_index > 80 ? '优秀' : kpi.menu_health_index?.health_index > 60 ? '良好' : '需优化'}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div style="font-size: 13px; color: #666; line-height: 1.6;">
                                    <p><strong>推荐菜品结构:</strong></p>
                                    <p>• 明星菜品: ${((kpi.menu_health_index?.structure?.star_dishes || 0) * 100).toFixed(0)}%</p>
                                    <p>• 潜力菜品: ${((kpi.menu_health_index?.structure?.potential_dishes || 0) * 100).toFixed(0)}%</p>
                                    <p>• 引流菜品: ${((kpi.menu_health_index?.structure?.traffic_dishes || 0) * 100).toFixed(0)}%</p>
                                    <p>• 建议菜品数: ${kpi.menu_health_index?.recommended_dish_count || 15}道</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 基础效率指标 -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div class="metric-card" style="border-top-color: #6366f1;">
                            <div class="metric-label">翻台率</div>
                            <div class="metric-value" style="font-size: 24px; color: #6366f1;">${kpi.table_turnover.toFixed(1)}次</div>
                            <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                行业平均: ${benchmark.table_turnover}次
                            </div>
                            <div class="score-badge ${this.getEfficiencyBadgeClass(kpi.table_turnover, benchmark.table_turnover)}" style="margin-top: 8px;">
                                ${this.getEfficiencyLabel(kpi.table_turnover, benchmark.table_turnover)}
                            </div>
                        </div>
                        <div class="metric-card" style="border-top-color: #ec4899;">
                            <div class="metric-label">坪效</div>
                            <div class="metric-value" style="font-size: 24px; color: #ec4899;">¥${Math.round(kpi.revenue_per_sqm)}</div>
                            <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                行业平均: ¥${benchmark.revenue_per_sqm}
                            </div>
                            <div class="score-badge ${this.getEfficiencyBadgeClass(kpi.revenue_per_sqm, benchmark.revenue_per_sqm)}" style="margin-top: 8px;">
                                ${this.getEfficiencyLabel(kpi.revenue_per_sqm, benchmark.revenue_per_sqm)}
                            </div>
                        </div>
                        <div class="metric-card" style="border-top-color: #14b8a6;">
                            <div class="metric-label">人效</div>
                            <div class="metric-value" style="font-size: 24px; color: #14b8a6;">¥${Math.round(kpi.revenue_per_employee)}</div>
                            <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                行业平均: ¥${this.thresholds.revenue_per_employee}
                            </div>
                            <div class="score-badge ${this.getEfficiencyBadgeClass(kpi.revenue_per_employee, this.thresholds.revenue_per_employee)}" style="margin-top: 8px;">
                                ${this.getEfficiencyLabel(kpi.revenue_per_employee, this.thresholds.revenue_per_employee)}
                            </div>
                        </div>
                    </div>
                    
                    <!-- 运营效率优化建议 -->
                    <div class="info-card">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">🚀 运营效率优化建议</h4>
                        ${this.generateEfficiencyAdvice(kpi, data, benchmark)}
                    </div>
                </div>

                <div class="diagnosis-section">
                    <h3>四、客户价值深度分析</h3>
                    
                    <!-- 客户生命周期价值分析 -->
                    <div class="info-card mb-6">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">👥 客户生命周期价值分析</h4>
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div class="metric-card" style="border-top-color: #3b82f6;">
                                <div class="metric-label">基础LTV</div>
                                <div class="metric-value" style="font-size: 20px; color: #3b82f6;">¥${Math.round(kpi.base_ltv || 0)}</div>
                                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                                    客户基础价值
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #10b981;">
                                <div class="metric-label">利润LTV</div>
                                <div class="metric-value" style="font-size: 20px; color: #10b981;">¥${Math.round(kpi.profit_ltv || 0)}</div>
                                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                                    考虑毛利的价值
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #f59e0b;">
                                <div class="metric-label">获客成本</div>
                                <div class="metric-value" style="font-size: 20px; color: #f59e0b;">¥${Math.round(kpi.customer_acquisition_cost || 0)}</div>
                                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                                    单客获客成本
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #8b5cf6;">
                                <div class="metric-label">LTV/CAC比率</div>
                                <div class="metric-value" style="font-size: 20px; color: #8b5cf6;">${(kpi.ltv_cac_ratio || 0).toFixed(1)}</div>
                                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                                    ${kpi.ltv_cac_ratio > 5 ? '优秀' : kpi.ltv_cac_ratio > 3 ? '健康' : '需优化'}
                                </div>
                            </div>
                        </div>
                        <div style="font-size: 13px; color: #666; line-height: 1.6;">
                            <p><strong>客户价值洞察:</strong></p>
                            <p>• 客户寿命: ${(kpi.customer_lifespan || 0).toFixed(1)}年</p>
                            <p>• 年购买频次: ${(kpi.annual_purchase_frequency || 0).toFixed(1)}次</p>
                            <p>• 钻石客户价值: ¥${Math.round(kpi.customer_segmentation?.diamond || 0)}</p>
                            <p>• 金牌客户价值: ¥${Math.round(kpi.customer_segmentation?.gold || 0)}</p>
                        </div>
                    </div>

                    <!-- 客户流失预警 -->
                    <div class="info-card mb-6">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">⚠️ 客户流失预警</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="metric-card" style="border-top-color: #ef4444;">
                                <div class="metric-label">流失风险评分</div>
                                <div class="metric-value" style="font-size: 24px; color: #ef4444;">${kpi.churn_risk_score || 0}分</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    ${kpi.churn_risk_level === 'high' ? '高风险' : kpi.churn_risk_level === 'medium' ? '中风险' : '低风险'}
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #f59e0b;">
                                <div class="metric-label">流失概率</div>
                                <div class="metric-value" style="font-size: 24px; color: #f59e0b;">${((kpi.churn_probability || 0) * 100).toFixed(1)}%</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    客户流失可能性
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #10b981;">
                                <div class="metric-label">挽留策略</div>
                                <div class="metric-value" style="font-size: 16px; color: #10b981;">${kpi.retention_strategy || '正常维护'}</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    建议采取的措施
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 客户满意度分析 -->
                    <div class="info-card mb-6">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">😊 客户满意度分析</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="metric-card" style="border-top-color: #8b5cf6;">
                                <div class="metric-label">综合满意度</div>
                                <div class="metric-value" style="font-size: 24px; color: #8b5cf6;">${kpi.overall_satisfaction || 0}分</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    ${kpi.satisfaction_level || '需提升'}
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #3b82f6;">
                                <div class="metric-label">NPS评分</div>
                                <div class="metric-value" style="font-size: 24px; color: #3b82f6;">${kpi.nps_score || 0}</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    ${kpi.nps_score > 50 ? '优秀' : kpi.nps_score > 0 ? '良好' : '需改善'}
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #f59e0b;">
                                <div class="metric-label">改进领域</div>
                                <div class="metric-value" style="font-size: 16px; color: #f59e0b;">${(kpi.improvement_areas || []).join(', ') || '无'}</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    需要重点关注的方面
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 基础客户指标 -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div class="metric-card" style="border-top-color: #6366f1;">
                            <div class="metric-label">客单价</div>
                            <div class="metric-value" style="font-size: 24px; color: #6366f1;">¥${Math.round(kpi.avg_spending)}</div>
                            <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                行业平均: ¥${benchmark.avg_spending || 50}
                            </div>
                            <div class="score-badge ${this.getEfficiencyBadgeClass(kpi.avg_spending, benchmark.avg_spending || 50)}" style="margin-top: 8px;">
                                ${this.getEfficiencyLabel(kpi.avg_spending, benchmark.avg_spending || 50)}
                            </div>
                        </div>
                        <div class="metric-card" style="border-top-color: #ec4899;">
                            <div class="metric-label">复购率</div>
                            <div class="metric-value" style="font-size: 24px; color: #ec4899;">${(kpi.member_repurchase * 100).toFixed(1)}%</div>
                            <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                ${kpi.member_repurchase >= 0.25 ? '优秀水平' : kpi.member_repurchase >= 0.15 ? '合格水平' : '需提升'}
                            </div>
                            <div class="score-badge ${kpi.member_repurchase >= 0.25 ? 'score-excellent' : kpi.member_repurchase >= 0.15 ? 'score-good' : 'score-poor'}" style="margin-top: 8px;">
                                ${kpi.member_repurchase >= 0.25 ? '优秀' : kpi.member_repurchase >= 0.15 ? '良好' : '需改进'}
                            </div>
                        </div>
                    </div>
                    
                    <!-- 差评分析 -->
                    <div class="info-card mb-6">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">📊 差评分析</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span>服务差评率:</span>
                                    <span class="${kpi.service_bad_review_rate <= 0.3 ? 'status-healthy' : kpi.service_bad_review_rate <= 0.5 ? 'status-warning' : 'status-danger'}">
                                        ${(kpi.service_bad_review_rate * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span>口味差评率:</span>
                                    <span class="${kpi.taste_bad_review_rate <= 0.3 ? 'status-healthy' : kpi.taste_bad_review_rate <= 0.5 ? 'status-warning' : 'status-danger'}">
                                        ${(kpi.taste_bad_review_rate * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span>总体差评率:</span>
                                    <span class="${kpi.negative_comment_rate <= 0.05 ? 'status-healthy' : kpi.negative_comment_rate <= 0.10 ? 'status-warning' : 'status-danger'}">
                                        ${(kpi.negative_comment_rate * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            <div>
                                <div style="font-size: 13px; color: #666; line-height: 1.6;">
                                    <p><strong>差评分布:</strong></p>
                                    <p>• 服务问题: ${Math.round(kpi.service_bad_review_rate * 100)}%</p>
                                    <p>• 口味问题: ${Math.round(kpi.taste_bad_review_rate * 100)}%</p>
                                    <p>• 其他问题: ${Math.round((1 - kpi.service_bad_review_rate - kpi.taste_bad_review_rate) * 100)}%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 客户体验优化建议 -->
                    <div class="info-card">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">🎯 客户体验优化建议</h4>
                        ${this.generateCustomerExperienceAdvice(kpi, data)}
                    </div>
                </div>

                <div class="diagnosis-section">
                    <h3>五、营销效果深度分析</h3>
                    
                    <!-- 营销ROI分析 -->
                    <div class="info-card mb-6">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">📈 营销ROI多维评估</h4>
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div class="metric-card" style="border-top-color: #3b82f6;">
                                <div class="metric-label">总营销ROI</div>
                                <div class="metric-value" style="font-size: 20px; color: #3b82f6;">${(kpi.total_marketing_roi || 0).toFixed(2)}</div>
                                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                                    ${kpi.total_marketing_roi > 3 ? '优秀' : kpi.total_marketing_roi > 1 ? '健康' : '需优化'}
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #10b981;">
                                <div class="metric-label">平台投流ROI</div>
                                <div class="metric-value" style="font-size: 20px; color: #10b981;">${(kpi.channel_roi?.platform_advertising || 0).toFixed(2)}</div>
                                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                                    平台广告效果
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #f59e0b;">
                                <div class="metric-label">短视频ROI</div>
                                <div class="metric-value" style="font-size: 20px; color: #f59e0b;">${(kpi.channel_roi?.short_video || 0).toFixed(2)}</div>
                                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                                    短视频营销效果
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #8b5cf6;">
                                <div class="metric-label">直播ROI</div>
                                <div class="metric-value" style="font-size: 20px; color: #8b5cf6;">${(kpi.channel_roi?.live_streaming || 0).toFixed(2)}</div>
                                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                                    直播营销效果
                                </div>
                            </div>
                        </div>
                        <div style="font-size: 13px; color: #666; line-height: 1.6;">
                            <p><strong>营销效率洞察:</strong></p>
                            <p>• 营销效率评分: ${kpi.marketing_efficiency_score || 0}分</p>
                            <p>• 优惠活动ROI: ${(kpi.channel_roi?.promotions || 0).toFixed(2)}</p>
                            <p>• 内容营销健康度: ${kpi.content_marketing_health?.content_health_index || 0}分</p>
                        </div>
                    </div>

                    <!-- 内容营销分析 -->
                    <div class="info-card mb-6">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">📱 内容营销效能分析</h4>
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div class="metric-card" style="border-top-color: #3b82f6;">
                                <div class="metric-label">内容健康指数</div>
                                <div class="metric-value" style="font-size: 24px; color: #3b82f6;">${kpi.content_marketing_health?.content_health_index || 0}分</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    ${kpi.content_marketing_health?.content_health_index > 80 ? '优秀' : kpi.content_marketing_health?.content_health_index > 60 ? '良好' : '需提升'}
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #10b981;">
                                <div class="metric-label">短视频频次得分</div>
                                <div class="metric-value" style="font-size: 24px; color: #10b981;">${kpi.content_marketing_health?.video_frequency_score || 0}分</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    发布频次评估
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #f59e0b;">
                                <div class="metric-label">直播频次得分</div>
                                <div class="metric-value" style="font-size: 24px; color: #f59e0b;">${kpi.content_marketing_health?.live_frequency_score || 0}分</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    直播频次评估
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #8b5cf6;">
                                <div class="metric-label">团队得分</div>
                                <div class="metric-value" style="font-size: 24px; color: #8b5cf6;">${kpi.content_marketing_health?.team_score || 0}分</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    营销团队能力
                                </div>
                            </div>
                        </div>
                        <div style="font-size: 13px; color: #666; line-height: 1.6; margin-top: 12px;">
                            <p><strong>内容营销建议:</strong></p>
                            <p>• ${(kpi.content_marketing_health?.improvement_suggestions || []).join(' • ')}</p>
                        </div>
                    </div>

                    <!-- 基础营销指标 -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div class="metric-card" style="border-top-color: #f59e0b;">
                            <div class="metric-label">平均评分</div>
                            <div class="metric-value" style="font-size: 24px; color: #f59e0b;">${kpi.review_score}分</div>
                            <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                ${kpi.review_score >= 4.5 ? '优秀' : kpi.review_score >= 4.0 ? '良好' : '需提升'}
                            </div>
                            <div class="score-badge ${kpi.review_score >= 4.5 ? 'score-excellent' : kpi.review_score >= 4.0 ? 'score-good' : 'score-poor'}" style="margin-top: 8px;">
                                ${kpi.review_score >= 4.5 ? '优秀' : kpi.review_score >= 4.0 ? '良好' : '需改进'}
                            </div>
                        </div>
                        <div class="metric-card" style="border-top-color: #8b5cf6;">
                            <div class="metric-label">差评率</div>
                            <div class="metric-value" style="font-size: 24px; color: #8b5cf6;">${(kpi.negative_comment_rate * 100).toFixed(1)}%</div>
                            <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                ${kpi.negative_comment_rate <= 0.05 ? '健康' : kpi.negative_comment_rate <= 0.10 ? '警告' : '危险'}
                            </div>
                            <div class="score-badge ${kpi.negative_comment_rate <= 0.05 ? 'score-excellent' : kpi.negative_comment_rate <= 0.10 ? 'score-good' : 'score-poor'}" style="margin-top: 8px;">
                                ${kpi.negative_comment_rate <= 0.05 ? '优秀' : kpi.negative_comment_rate <= 0.10 ? '良好' : '需改进'}
                            </div>
                        </div>
                    </div>
                    
                    <!-- 内容营销分析 -->
                    <div class="info-card mb-6">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">📱 内容营销分析</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="text-center">
                                <div style="font-size: 24px; font-weight: 700; color: #3b82f6;">${kpi.content_marketing_index}分</div>
                                <div style="font-size: 12px; color: #666;">内容营销指数</div>
                                <div class="score-badge ${this.getScoreBadgeClass(kpi.content_marketing_index)}" style="margin-top: 8px;">
                                    ${this.getScoreLabel(kpi.content_marketing_index)}
                                </div>
                            </div>
                            <div class="text-center">
                                <div style="font-size: 24px; font-weight: 700; color: #10b981;">${kpi.short_video_count}条</div>
                                <div style="font-size: 12px; color: #666;">短视频发布量</div>
                                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                                    ${kpi.short_video_count >= 50 ? '达标' : '需加强'}
                                </div>
                            </div>
                            <div class="text-center">
                                <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">${kpi.live_stream_count}场</div>
                                <div style="font-size: 12px; color: #666;">直播场次</div>
                                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                                    ${kpi.live_stream_count >= 15 ? '达标' : '需加强'}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 线上渠道分析 -->
                    <div class="info-card mb-6">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">🌐 线上渠道分析</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span>线上营收占比:</span>
                                    <span class="${kpi.takeaway_ratio >= 0.3 && kpi.takeaway_ratio <= 0.5 ? 'status-healthy' : 'status-warning'}">
                                        ${(kpi.takeaway_ratio * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span>主营平台:</span>
                                    <span>${data.main_platforms || '未填写'}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span>营销情况:</span>
                                    <span>${data.marketing_situation || '未填写'}</span>
                                </div>
                            </div>
                            <div>
                                <div style="font-size: 13px; color: #666; line-height: 1.6;">
                                    <p><strong>渠道健康度:</strong></p>
                                    <p>• 线上占比: ${kpi.takeaway_ratio >= 0.3 && kpi.takeaway_ratio <= 0.5 ? '健康' : '需调整'}</p>
                                    <p>• 内容产出: ${kpi.content_marketing_index >= 60 ? '活跃' : '不足'}</p>
                                    <p>• 平台依赖: ${data.main_platforms ? '已建立' : '需完善'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 营销效果优化建议 -->
                    <div class="info-card">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">📈 营销效果优化建议</h4>
                        ${this.generateMarketingAdvice(kpi, data)}
                    </div>
                </div>

                <div class="diagnosis-section">
                    <h3>六、风险预警与战略分析</h3>
                    
                    <!-- 经营风险预警雷达 -->
                    <div class="info-card mb-6">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">⚠️ 经营风险预警雷达</h4>
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div class="metric-card" style="border-top-color: #ef4444;">
                                <div class="metric-label">综合风险指数</div>
                                <div class="metric-value" style="font-size: 24px; color: #ef4444;">${kpi.overall_risk_index || 0}分</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    ${kpi.risk_level || '需评估'}
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #f59e0b;">
                                <div class="metric-label">盈利风险</div>
                                <div class="metric-value" style="font-size: 20px; color: #f59e0b;">${kpi.risk_factors?.profit_risk || 0}分</div>
                                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                                    毛利率风险
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #8b5cf6;">
                                <div class="metric-label">现金流风险</div>
                                <div class="metric-value" style="font-size: 20px; color: #8b5cf6;">${kpi.risk_factors?.cash_flow_risk || 0}分</div>
                                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                                    资金周转风险
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #10b981;">
                                <div class="metric-label">客户风险</div>
                                <div class="metric-value" style="font-size: 20px; color: #10b981;">${kpi.risk_factors?.customer_risk || 0}分</div>
                                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                                    客户流失风险
                                </div>
                            </div>
                        </div>
                        <div style="font-size: 13px; color: #666; line-height: 1.6;">
                            <p><strong>风险因素分析:</strong></p>
                            <p>• 成本风险: ${kpi.risk_factors?.cost_risk || 0}分</p>
                            <p>• 竞争风险: ${kpi.risk_factors?.competition_risk || 0}分</p>
                            <p>• 口碑风险: ${kpi.risk_factors?.reputation_risk || 0}分</p>
                            <p>• 人员风险: ${kpi.risk_factors?.staff_risk || 0}分</p>
                            <p>• 市场风险: ${kpi.risk_factors?.market_risk || 0}分</p>
                        </div>
                    </div>

                    <!-- 季节性波动预测 -->
                    <div class="info-card mb-6">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">📅 季节性波动预测</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="metric-card" style="border-top-color: #3b82f6;">
                                <div class="metric-label">当前季节系数</div>
                                <div class="metric-value" style="font-size: 24px; color: #3b82f6;">${kpi.seasonal_risk?.current_seasonal_coefficient || 1.0}</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    ${kpi.seasonal_risk?.current_seasonal_coefficient > 1.2 ? '旺季' : kpi.seasonal_risk?.current_seasonal_coefficient < 0.8 ? '淡季' : '平季'}
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #10b981;">
                                <div class="metric-label">预测营收</div>
                                <div class="metric-value" style="font-size: 24px; color: #10b981;">¥${this.formatNumber(kpi.seasonal_risk?.predicted_revenue || 0)}</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    基于季节性的预测
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #f59e0b;">
                                <div class="metric-label">淡季生存测试</div>
                                <div class="metric-value" style="font-size: 20px; color: #f59e0b;">${kpi.seasonal_risk?.seasonal_survival_test ? '通过' : '未通过'}</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    ${kpi.seasonal_risk?.seasonal_survival_test ? '可承受淡季' : '需储备资金'}
                                </div>
                            </div>
                        </div>
                        <div style="font-size: 13px; color: #666; line-height: 1.6; margin-top: 12px;">
                            <p><strong>季节性准备指数:</strong> ${kpi.seasonal_risk?.seasonal_preparation_index || 0}%</p>
                            <p>• 指数 > 30%: 可适度扩张</p>
                            <p>• 指数 0-30%: 需谨慎运营</p>
                            <p>• 指数 < 0: 需提前储备资金</p>
                        </div>
                    </div>

                    <!-- 同业对标竞争力分析 -->
                    <div class="info-card mb-6">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">🏆 同业对标竞争力分析</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="metric-card" style="border-top-color: #8b5cf6;">
                                <div class="metric-label">综合竞争力</div>
                                <div class="metric-value" style="font-size: 24px; color: #8b5cf6;">${kpi.overall_competitiveness || 0}分</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    ${kpi.competitiveness_rank || '需评估'}
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #3b82f6;">
                                <div class="metric-label">成本效率</div>
                                <div class="metric-value" style="font-size: 20px; color: #3b82f6;">${kpi.competitiveness_factors?.cost_efficiency || 0}分</div>
                                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                                    成本控制能力
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #10b981;">
                                <div class="metric-label">运营效率</div>
                                <div class="metric-value" style="font-size: 20px; color: #10b981;">${kpi.competitiveness_factors?.operational_efficiency || 0}分</div>
                                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                                    运营管理水平
                                </div>
                            </div>
                        </div>
                        <div style="font-size: 13px; color: #666; line-height: 1.6; margin-top: 12px;">
                            <p><strong>竞争力分析:</strong></p>
                            <p>• 盈利能力: ${kpi.competitiveness_factors?.profitability || 0}分</p>
                            <p>• 客户表现: ${kpi.competitiveness_factors?.customer_performance || 0}分</p>
                            <p>• 营销能力: ${kpi.competitiveness_factors?.marketing_capability || 0}分</p>
                            <p>• 产品品质: ${kpi.competitiveness_factors?.product_quality || 0}分</p>
                        </div>
                    </div>

                    <!-- 扩张可行性评估 -->
                    <div class="info-card mb-6">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">🚀 扩张可行性评估</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="metric-card" style="border-top-color: #3b82f6;">
                                <div class="metric-label">扩张准备度</div>
                                <div class="metric-value" style="font-size: 24px; color: #3b82f6;">${kpi.expansion_readiness || 0}分</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    ${kpi.expansion_recommendation || '需评估'}
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #10b981;">
                                <div class="metric-label">投资回收期</div>
                                <div class="metric-value" style="font-size: 20px; color: #10b981;">${kpi.payback_period ? kpi.payback_period.toFixed(1) : '∞'}年</div>
                                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                                    预计回本时间
                                </div>
                            </div>
                            <div class="metric-card" style="border-top-color: #f59e0b;">
                                <div class="metric-label">财务准备</div>
                                <div class="metric-value" style="font-size: 20px; color: #f59e0b;">${kpi.feasibility_factors?.financial_readiness || 0}分</div>
                                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                                    资金准备情况
                                </div>
                            </div>
                        </div>
                        <div style="font-size: 13px; color: #666; line-height: 1.6; margin-top: 12px;">
                            <p><strong>扩张准备分析:</strong></p>
                            <p>• 盈利能力: ${kpi.feasibility_factors?.profitability || 0}分</p>
                            <p>• 运营成熟度: ${kpi.feasibility_factors?.operational_maturity || 0}分</p>
                            <p>• 团队准备: ${kpi.feasibility_factors?.team_readiness || 0}分</p>
                            <p>• 品牌认知: ${kpi.feasibility_factors?.brand_recognition || 0}分</p>
                        </div>
                    </div>

                    <!-- 传统风险预警 -->
                    <div class="info-card">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">⚠️ 传统经营风险预警</h4>
                        ${this.generateRiskWarning(kpi, data, benchmark)}
                    </div>
                    
                    <div class="info-card">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">🎯 综合改进建议</h4>
                        ${this.generateComprehensiveAdvice(kpi, data, benchmark)}
                    </div>
                </div>
            </div>
        `;
    }

    generateCostOptimizationAdvice(kpi, data) {
        let advice = '';
        
        if (kpi.food_cost_ratio > 0.35) {
            advice += `
                <div style="margin: 12px 0; padding: 12px; background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 4px;">
                    <strong>食材成本偏高 (${(kpi.food_cost_ratio * 100).toFixed(1)}%):</strong>
                    <ul style="margin: 8px 0 0 20px; font-size: 13px; line-height: 1.8;">
                        <li>建立标准化配方,严格控制出品份量</li>
                        <li>优化采购渠道,寻求批量议价</li>
                        <li>降低损耗率,改进库存管理</li>
                        <li>引入成本控制软件,实时监控食材使用</li>
                        <li>定期评估供应商,选择性价比最优的</li>
                        <li>预计可降低成本率3-5%,月节省¥${this.formatNumber(Math.round(data.monthly_revenue * 0.04))}</li>
                    </ul>
                </div>
            `;
        }
        
        if (kpi.labor_cost_ratio > 0.30) {
            advice += `
                <div style="margin: 12px 0; padding: 12px; background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 4px;">
                    <strong>人力成本偏高 (${(kpi.labor_cost_ratio * 100).toFixed(1)}%):</strong>
                    <ul style="margin: 8px 0 0 20px; font-size: 13px; line-height: 1.8;">
                        <li>优化排班,提高人效</li>
                        <li>引入自助点餐等降本工具</li>
                        <li>按高峰时段弹性配置人员</li>
                        <li>培训员工多技能,提高工作效率</li>
                        <li>考虑使用兼职员工降低固定成本</li>
                        <li>预计可提升人效20%,月节省¥${this.formatNumber(Math.round(data.labor_cost * 0.15))}</li>
                    </ul>
                </div>
            `;
        }
        
        if (kpi.rent_cost_ratio > 0.20) {
            advice += `
                <div style="margin: 12px 0; padding: 12px; background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 4px;">
                    <strong>租金成本偏高 (${(kpi.rent_cost_ratio * 100).toFixed(1)}%):</strong>
                    <ul style="margin: 8px 0 0 20px; font-size: 13px; line-height: 1.8;">
                        <li>评估选址性价比,考虑搬迁到性价比更高的位置</li>
                        <li>与房东协商租金调整或续约优惠</li>
                        <li>提高坪效,增加单位面积产出</li>
                        <li>考虑分时段经营或共享空间模式</li>
                        <li>预计可降低租金压力15-20%</li>
                    </ul>
                </div>
            `;
        }
        
        if (kpi.marketing_cost_ratio > 0.10) {
            advice += `
                <div style="margin: 12px 0; padding: 12px; background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 4px;">
                    <strong>营销成本偏高 (${(kpi.marketing_cost_ratio * 100).toFixed(1)}%):</strong>
                    <ul style="margin: 8px 0 0 20px; font-size: 13px; line-height: 1.8;">
                        <li>优化投流策略,提高ROI</li>
                        <li>建立私域流量,降低平台依赖</li>
                        <li>加强内容营销,提升自然流量</li>
                        <li>分析各渠道转化率,聚焦高效渠道</li>
                        <li>建立会员体系,提高客户粘性</li>
                        <li>预计可降低获客成本25%,月节省¥${this.formatNumber(Math.round(data.marketing_cost * 0.25))}</li>
                    </ul>
                </div>
            `;
        }
        
        if (kpi.utility_cost_ratio > 0.05) {
            advice += `
                <div style="margin: 12px 0; padding: 12px; background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 4px;">
                    <strong>水电气成本偏高 (${(kpi.utility_cost_ratio * 100).toFixed(1)}%):</strong>
                    <ul style="margin: 8px 0 0 20px; font-size: 13px; line-height: 1.8;">
                        <li>更换节能设备,降低能耗</li>
                        <li>优化营业时间,避免不必要的能源消耗</li>
                        <li>建立能源管理制度,定期检查设备</li>
                        <li>考虑使用太阳能等清洁能源</li>
                        <li>预计可降低能耗15-20%</li>
                    </ul>
                </div>
            `;
        }
        
        if (kpi.food_cost_ratio <= 0.35 && kpi.labor_cost_ratio <= 0.30 && kpi.marketing_cost_ratio <= 0.10 && kpi.rent_cost_ratio <= 0.20) {
            advice += `
                <div style="padding: 12px; background: #f0fdf4; border-left: 3px solid #22c55e; border-radius: 4px;">
                    <p style="color: #22c55e; font-weight: 600;">✓ 成本控制良好,继续保持!</p>
                    <p style="color: #16a34a; font-size: 13px; margin-top: 8px;">建议继续关注成本变化趋势,定期优化成本结构</p>
                </div>
            `;
        }
        
        return advice;
    }

    getScoreBadgeClass(score) {
        if (score >= 80) return 'score-excellent';
        if (score >= 70) return 'score-good';
        if (score >= 60) return 'score-average';
        return 'score-poor';
    }

    getScoreLabel(score) {
        if (score >= 80) return '优秀';
        if (score >= 70) return '良好';
        if (score >= 60) return '一般';
        return '需改进';
    }

    getEfficiencyBadgeClass(current, benchmark) {
        const ratio = current / benchmark;
        if (ratio >= 1.2) return 'score-excellent';
        if (ratio >= 1.0) return 'score-good';
        if (ratio >= 0.8) return 'score-average';
        return 'score-poor';
    }

    getEfficiencyLabel(current, benchmark) {
        const ratio = current / benchmark;
        if (ratio >= 1.2) return '优秀';
        if (ratio >= 1.0) return '良好';
        if (ratio >= 0.8) return '一般';
        return '需改进';
    }

    generateEfficiencyAdvice(kpi, data, benchmark) {
        let advice = '';
        
        // 翻台率分析
        if (kpi.table_turnover < benchmark.table_turnover * 0.8) {
            advice += `
                <div style="margin: 12px 0; padding: 12px; background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 4px;">
                    <strong>翻台率偏低 (${kpi.table_turnover.toFixed(1)}次 vs 行业${benchmark.table_turnover}次):</strong>
                    <ul style="margin: 8px 0 0 20px; font-size: 13px; line-height: 1.8;">
                        <li>优化菜单设计,减少顾客决策时间</li>
                        <li>提升出餐速度,缩短用餐时间</li>
                        <li>优化座位布局,提高空间利用率</li>
                        <li>引入预点餐系统,减少等待时间</li>
                        <li>培训服务员提高服务效率</li>
                        <li>预计可提升翻台率20-30%</li>
                    </ul>
                </div>
            `;
        }
        
        // 坪效分析
        if (kpi.revenue_per_sqm < benchmark.revenue_per_sqm * 0.8) {
            advice += `
                <div style="margin: 12px 0; padding: 12px; background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 4px;">
                    <strong>坪效偏低 (¥${Math.round(kpi.revenue_per_sqm)} vs 行业¥${benchmark.revenue_per_sqm}):</strong>
                    <ul style="margin: 8px 0 0 20px; font-size: 13px; line-height: 1.8;">
                        <li>重新规划空间布局,提高座位密度</li>
                        <li>增加高毛利产品比例</li>
                        <li>延长营业时间,提高空间利用率</li>
                        <li>考虑增加外卖业务,扩大服务范围</li>
                        <li>优化装修风格,提升客单价</li>
                        <li>预计可提升坪效25-35%</li>
                    </ul>
                </div>
            `;
        }
        
        // 人效分析
        if (kpi.revenue_per_employee < this.thresholds.revenue_per_employee * 0.8) {
            advice += `
                <div style="margin: 12px 0; padding: 12px; background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 4px;">
                    <strong>人效偏低 (¥${Math.round(kpi.revenue_per_employee)} vs 标准¥${this.thresholds.revenue_per_employee}):</strong>
                    <ul style="margin: 8px 0 0 20px; font-size: 13px; line-height: 1.8;">
                        <li>优化人员配置,减少冗余岗位</li>
                        <li>加强员工培训,提高专业技能</li>
                        <li>引入自动化设备,减少人工依赖</li>
                        <li>建立激励机制,提高员工积极性</li>
                        <li>优化工作流程,减少重复劳动</li>
                        <li>预计可提升人效30-40%</li>
                    </ul>
                </div>
            `;
        }
        
        // 综合效率评估
        const efficiencyScore = (kpi.table_turnover / benchmark.table_turnover + 
                                kpi.revenue_per_sqm / benchmark.revenue_per_sqm + 
                                kpi.revenue_per_employee / this.thresholds.revenue_per_employee) / 3;
        
        if (efficiencyScore >= 1.1) {
            advice += `
                <div style="padding: 12px; background: #f0fdf4; border-left: 3px solid #22c55e; border-radius: 4px;">
                    <p style="color: #22c55e; font-weight: 600;">✓ 运营效率表现优秀!</p>
                    <p style="color: #16a34a; font-size: 13px; margin-top: 8px;">继续保持当前运营水平,可考虑适度扩张</p>
                </div>
            `;
        } else if (efficiencyScore >= 0.9) {
            advice += `
                <div style="padding: 12px; background: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 4px;">
                    <p style="color: #92400e; font-weight: 600;">⚠ 运营效率有待提升</p>
                    <p style="color: #92400e; font-size: 13px; margin-top: 8px;">建议重点关注上述薄弱环节,制定改进计划</p>
                </div>
            `;
        }
        
        return advice;
    }

    generateCustomerExperienceAdvice(kpi, data) {
        let advice = '';
        
        // 客单价分析
        if (kpi.avg_spending < 40) {
            advice += `
                <div style="margin: 12px 0; padding: 12px; background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 4px;">
                    <strong>客单价偏低 (¥${Math.round(kpi.avg_spending)}):</strong>
                    <ul style="margin: 8px 0 0 20px; font-size: 13px; line-height: 1.8;">
                        <li>优化菜单设计,增加高价值产品推荐</li>
                        <li>推出套餐组合,提高客单价</li>
                        <li>加强服务员培训,提升推荐技巧</li>
                        <li>优化装修环境,提升消费体验</li>
                        <li>增加特色菜品,提高产品附加值</li>
                        <li>预计可提升客单价15-25%</li>
                    </ul>
                </div>
            `;
        }
        
        // 复购率分析
        if (kpi.member_repurchase < 0.15) {
            advice += `
                <div style="margin: 12px 0; padding: 12px; background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 4px;">
                    <strong>复购率偏低 (${(kpi.member_repurchase * 100).toFixed(1)}%):</strong>
                    <ul style="margin: 8px 0 0 20px; font-size: 13px; line-height: 1.8;">
                        <li>建立会员体系,提供专属优惠</li>
                        <li>定期推出新品,保持新鲜感</li>
                        <li>加强客户关系维护,定期回访</li>
                        <li>优化产品口味,提高满意度</li>
                        <li>建立客户微信群,增强互动</li>
                        <li>预计可提升复购率30-50%</li>
                    </ul>
                </div>
            `;
        }
        
        // 服务差评分析
        if (kpi.service_bad_review_rate > 0.3) {
            advice += `
                <div style="margin: 12px 0; padding: 12px; background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 4px;">
                    <strong>服务差评率偏高 (${(kpi.service_bad_review_rate * 100).toFixed(1)}%):</strong>
                    <ul style="margin: 8px 0 0 20px; font-size: 13px; line-height: 1.8;">
                        <li>加强服务员培训,提升服务技能</li>
                        <li>建立服务标准流程,确保一致性</li>
                        <li>增加服务人员配置,减少等待时间</li>
                        <li>建立客户投诉处理机制</li>
                        <li>定期进行服务满意度调查</li>
                        <li>预计可降低服务差评率40-60%</li>
                    </ul>
                </div>
            `;
        }
        
        // 口味差评分析
        if (kpi.taste_bad_review_rate > 0.3) {
            advice += `
                <div style="margin: 12px 0; padding: 12px; background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 4px;">
                    <strong>口味差评率偏高 (${(kpi.taste_bad_review_rate * 100).toFixed(1)}%):</strong>
                    <ul style="margin: 8px 0 0 20px; font-size: 13px; line-height: 1.8;">
                        <li>优化菜品配方,提升口味稳定性</li>
                        <li>加强厨师培训,确保出品质量</li>
                        <li>建立品控体系,定期检查口味</li>
                        <li>收集客户反馈,持续改进菜品</li>
                        <li>引入新鲜食材,提升菜品品质</li>
                        <li>预计可降低口味差评率50-70%</li>
                    </ul>
                </div>
            `;
        }
        
        // 综合客户体验评估
        const experienceScore = (kpi.avg_spending / 50 + kpi.member_repurchase / 0.25 + 
                                (1 - kpi.negative_comment_rate) / 0.95) / 3;
        
        if (experienceScore >= 0.9) {
            advice += `
                <div style="padding: 12px; background: #f0fdf4; border-left: 3px solid #22c55e; border-radius: 4px;">
                    <p style="color: #22c55e; font-weight: 600;">✓ 客户体验表现优秀!</p>
                    <p style="color: #16a34a; font-size: 13px; margin-top: 8px;">继续保持优质服务,可考虑扩大客户群体</p>
                </div>
            `;
        } else if (experienceScore >= 0.7) {
            advice += `
                <div style="padding: 12px; background: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 4px;">
                    <p style="color: #92400e; font-weight: 600;">⚠ 客户体验有待提升</p>
                    <p style="color: #92400e; font-size: 13px; margin-top: 8px;">建议重点关注上述薄弱环节,制定客户体验改进计划</p>
                </div>
            `;
        }
        
        return advice;
    }

    generateMarketingAdvice(kpi, data) {
        let advice = '';
        
        // 线上评分分析
        if (kpi.review_score < 4.0) {
            advice += `
                <div style="margin: 12px 0; padding: 12px; background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 4px;">
                    <strong>线上评分偏低 (${kpi.review_score}分):</strong>
                    <ul style="margin: 8px 0 0 20px; font-size: 13px; line-height: 1.8;">
                        <li>加强线上客服响应速度,及时回复客户</li>
                        <li>优化菜品图片和描述,提升线上展示效果</li>
                        <li>建立好评激励机制,鼓励客户给出好评</li>
                        <li>及时处理差评,主动联系客户解决问题</li>
                        <li>提升菜品质量和服务水平,从根源改善评分</li>
                        <li>预计可提升评分0.5-1.0分</li>
                    </ul>
                </div>
            `;
        }
        
        // 内容营销分析
        if (kpi.content_marketing_index < 60) {
            advice += `
                <div style="margin: 12px 0; padding: 12px; background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 4px;">
                    <strong>内容营销不足 (${kpi.content_marketing_index}分):</strong>
                    <ul style="margin: 8px 0 0 20px; font-size: 13px; line-height: 1.8;">
                        <li>增加短视频发布频率,每周至少3-5条</li>
                        <li>定期进行直播,与客户互动</li>
                        <li>建立专业营销团队或找代运营</li>
                        <li>制作高质量内容,突出菜品特色</li>
                        <li>利用热门话题和节日营销</li>
                        <li>预计可提升内容营销指数20-30分</li>
                    </ul>
                </div>
            `;
        }
        
        // 线上渠道分析
        if (kpi.takeaway_ratio < 0.3) {
            advice += `
                <div style="margin: 12px 0; padding: 12px; background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 4px;">
                    <strong>线上渠道占比偏低 (${(kpi.takeaway_ratio * 100).toFixed(1)}%):</strong>
                    <ul style="margin: 8px 0 0 20px; font-size: 13px; line-height: 1.8;">
                        <li>加强外卖平台运营,优化菜品展示</li>
                        <li>推出外卖专属优惠活动</li>
                        <li>提升外卖包装和配送体验</li>
                        <li>建立自有外卖渠道,降低平台依赖</li>
                        <li>预计可提升线上占比15-25%</li>
                    </ul>
                </div>
            `;
        } else if (kpi.takeaway_ratio > 0.5) {
            advice += `
                <div style="margin: 12px 0; padding: 12px; background: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 4px;">
                    <strong>线上渠道占比过高 (${(kpi.takeaway_ratio * 100).toFixed(1)}%):</strong>
                    <ul style="margin: 8px 0 0 20px; font-size: 13px; line-height: 1.8;">
                        <li>平衡线上线下渠道,避免过度依赖外卖</li>
                        <li>提升堂食体验,吸引更多到店客户</li>
                        <li>优化堂食环境和服务</li>
                        <li>推出堂食专属优惠</li>
                    </ul>
                </div>
            `;
        }
        
        // 差评率分析
        if (kpi.negative_comment_rate > 0.10) {
            advice += `
                <div style="margin: 12px 0; padding: 12px; background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 4px;">
                    <strong>差评率偏高 (${(kpi.negative_comment_rate * 100).toFixed(1)}%):</strong>
                    <ul style="margin: 8px 0 0 20px; font-size: 13px; line-height: 1.8;">
                        <li>建立差评监控和快速响应机制</li>
                        <li>主动联系差评客户,了解问题并解决</li>
                        <li>提升菜品质量和服务水平</li>
                        <li>建立客户满意度调查机制</li>
                        <li>预计可降低差评率50-70%</li>
                    </ul>
                </div>
            `;
        }
        
        // 营销团队分析
        if (!data.marketing_situation || data.marketing_situation === '无') {
            advice += `
                <div style="margin: 12px 0; padding: 12px; background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 4px;">
                    <strong>缺乏营销团队:</strong>
                    <ul style="margin: 8px 0 0 20px; font-size: 13px; line-height: 1.8;">
                        <li>考虑建立自己的营销团队</li>
                        <li>或寻找专业的代运营服务</li>
                        <li>老板可以学习基础营销知识</li>
                        <li>制定营销计划和预算</li>
                        <li>预计可提升营销效果40-60%</li>
                    </ul>
                </div>
            `;
        }
        
        // 综合营销评估
        const marketingScore = (kpi.review_score / 5 + kpi.content_marketing_index / 100 + 
                               (1 - kpi.negative_comment_rate) / 0.95 + 
                               (kpi.takeaway_ratio >= 0.3 && kpi.takeaway_ratio <= 0.5 ? 1 : 0.5)) / 4;
        
        if (marketingScore >= 0.8) {
            advice += `
                <div style="padding: 12px; background: #f0fdf4; border-left: 3px solid #22c55e; border-radius: 4px;">
                    <p style="color: #22c55e; font-weight: 600;">✓ 营销效果表现优秀!</p>
                    <p style="color: #16a34a; font-size: 13px; margin-top: 8px;">继续保持当前营销策略,可考虑扩大营销投入</p>
                </div>
            `;
        } else if (marketingScore >= 0.6) {
            advice += `
                <div style="padding: 12px; background: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 4px;">
                    <p style="color: #92400e; font-weight: 600;">⚠ 营销效果有待提升</p>
                    <p style="color: #92400e; font-size: 13px; margin-top: 8px;">建议重点关注上述薄弱环节,制定营销改进计划</p>
                </div>
            `;
        }
        
        return advice;
    }

    generateRiskWarning(kpi, data, benchmark) {
        let warnings = [];
        let riskLevel = 'low';
        
        // 财务风险
        if (kpi.gross_margin < 0.45) {
            warnings.push({
                level: 'high',
                category: '财务风险',
                message: '毛利率过低，存在严重财务风险',
                suggestion: '立即优化成本结构，提升毛利率至50%以上'
            });
            riskLevel = 'high';
        } else if (kpi.gross_margin < 0.55) {
            warnings.push({
                level: 'medium',
                category: '财务风险',
                message: '毛利率偏低，需要关注',
                suggestion: '优化成本控制，提升盈利能力'
            });
            if (riskLevel === 'low') riskLevel = 'medium';
        }
        
        // 运营风险
        if (kpi.table_turnover < benchmark.table_turnover * 0.6) {
            warnings.push({
                level: 'high',
                category: '运营风险',
                message: '翻台率严重偏低，影响盈利能力',
                suggestion: '优化运营流程，提升翻台率'
            });
            riskLevel = 'high';
        }
        
        if (kpi.revenue_per_sqm < benchmark.revenue_per_sqm * 0.6) {
            warnings.push({
                level: 'medium',
                category: '运营风险',
                message: '坪效偏低，空间利用率不足',
                suggestion: '重新规划空间布局，提升坪效'
            });
            if (riskLevel === 'low') riskLevel = 'medium';
        }
        
        // 客户风险
        if (kpi.negative_comment_rate > 0.15) {
            warnings.push({
                level: 'high',
                category: '客户风险',
                message: '差评率过高，影响品牌形象',
                suggestion: '立即改善服务质量，降低差评率'
            });
            riskLevel = 'high';
        }
        
        if (kpi.member_repurchase < 0.10) {
            warnings.push({
                level: 'medium',
                category: '客户风险',
                message: '复购率过低，客户粘性不足',
                suggestion: '建立客户关系管理体系，提升复购率'
            });
            if (riskLevel === 'low') riskLevel = 'medium';
        }
        
        // 营销风险
        if (kpi.content_marketing_index < 30) {
            warnings.push({
                level: 'medium',
                category: '营销风险',
                message: '内容营销严重不足，影响品牌曝光',
                suggestion: '加强内容营销投入，提升品牌知名度'
            });
            if (riskLevel === 'low') riskLevel = 'medium';
        }
        
        if (kpi.review_score < 3.5) {
            warnings.push({
                level: 'high',
                category: '营销风险',
                message: '线上评分过低，严重影响获客',
                suggestion: '立即改善服务质量，提升线上评分'
            });
            riskLevel = 'high';
        }
        
        // 成本风险
        const totalCostRatio = kpi.food_cost_ratio + kpi.labor_cost_ratio + kpi.rent_cost_ratio + 
                              kpi.marketing_cost_ratio + kpi.utility_cost_ratio;
        if (totalCostRatio > 0.85) {
            warnings.push({
                level: 'high',
                category: '成本风险',
                message: '总成本率过高，盈利空间被严重压缩',
                suggestion: '全面优化成本结构，降低总成本率'
            });
            riskLevel = 'high';
        }
        
        let html = '';
        
        // 风险等级显示
        const riskLevelClass = riskLevel === 'high' ? 'status-danger' : riskLevel === 'medium' ? 'status-warning' : 'status-healthy';
        const riskLevelText = riskLevel === 'high' ? '高风险' : riskLevel === 'medium' ? '中风险' : '低风险';
        
        html += `
            <div style="margin-bottom: 16px; padding: 12px; background: ${riskLevel === 'high' ? '#fef2f2' : riskLevel === 'medium' ? '#fef3c7' : '#f0fdf4'}; 
                        border-left: 3px solid ${riskLevel === 'high' ? '#ef4444' : riskLevel === 'medium' ? '#f59e0b' : '#22c55e'}; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600; color: ${riskLevel === 'high' ? '#dc2626' : riskLevel === 'medium' ? '#d97706' : '#16a34a'};">
                        综合风险等级: ${riskLevelText}
                    </span>
                    <span style="font-size: 12px; color: #666;">
                        检测到 ${warnings.length} 个风险点
                    </span>
                </div>
            </div>
        `;
        
        // 风险详情
        if (warnings.length > 0) {
            warnings.forEach(warning => {
                const levelClass = warning.level === 'high' ? 'status-danger' : 'status-warning';
                html += `
                    <div style="margin: 12px 0; padding: 12px; background: ${warning.level === 'high' ? '#fef2f2' : '#fef3c7'}; 
                                border-left: 3px solid ${warning.level === 'high' ? '#ef4444' : '#f59e0b'}; border-radius: 4px;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                            <span class="${levelClass}" style="font-weight: 600;">${warning.category}</span>
                            <span style="font-size: 11px; color: #666; background: #f3f4f6; padding: 2px 6px; border-radius: 10px;">
                                ${warning.level === 'high' ? '高风险' : '中风险'}
                            </span>
                        </div>
                        <p style="margin: 4px 0; font-size: 13px; color: #374151;">${warning.message}</p>
                        <p style="margin: 4px 0; font-size: 12px; color: #6b7280; font-style: italic;">建议: ${warning.suggestion}</p>
                    </div>
                `;
            });
        } else {
            html += `
                <div style="padding: 12px; background: #f0fdf4; border-left: 3px solid #22c55e; border-radius: 4px;">
                    <p style="color: #22c55e; font-weight: 600;">✓ 未发现重大经营风险</p>
                    <p style="color: #16a34a; font-size: 13px; margin-top: 8px;">当前经营状况良好，建议继续保持并持续优化</p>
                </div>
            `;
        }
        
        return html;
    }

    generateComprehensiveAdvice(kpi, data, benchmark) {
        let advice = '';
        
        // 计算综合评分
        const overallScore = (kpi.location_match_score + kpi.marketing_health_score + kpi.content_marketing_index) / 3;
        
        // 优先级建议
        const priorities = [];
        
        // 成本优化优先级
        if (kpi.gross_margin < 0.55) {
            priorities.push({
                priority: 1,
                title: '成本结构优化',
                description: '毛利率偏低，需要立即优化成本结构',
                impact: '高',
                effort: '中',
                timeline: '1-2个月'
            });
        }
        
        // 运营效率优先级
        if (kpi.table_turnover < benchmark.table_turnover * 0.8) {
            priorities.push({
                priority: 2,
                title: '运营效率提升',
                description: '翻台率和坪效需要提升',
                impact: '高',
                effort: '中',
                timeline: '2-3个月'
            });
        }
        
        // 客户体验优先级
        if (kpi.negative_comment_rate > 0.10 || kpi.member_repurchase < 0.15) {
            priorities.push({
                priority: 3,
                title: '客户体验改善',
                description: '差评率偏高或复购率偏低',
                impact: '中',
                effort: '中',
                timeline: '1-2个月'
            });
        }
        
        // 营销效果优先级
        if (kpi.content_marketing_index < 60 || kpi.review_score < 4.0) {
            priorities.push({
                priority: 4,
                title: '营销效果提升',
                description: '内容营销不足或线上评分偏低',
                impact: '中',
                effort: '高',
                timeline: '3-6个月'
            });
        }
        
        // 生成建议内容
        if (priorities.length > 0) {
            advice += `
                <div style="margin-bottom: 16px;">
                    <h5 style="font-weight: 600; margin-bottom: 12px; color: #374151;">🎯 改进优先级排序</h5>
                    <div style="display: grid; gap: 12px;">
            `;
            
            priorities.forEach(priority => {
                const priorityClass = priority.priority <= 2 ? 'status-danger' : priority.priority <= 3 ? 'status-warning' : 'status-healthy';
                advice += `
                    <div style="padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                            <span style="font-weight: 600; color: #374151;">${priority.priority}. ${priority.title}</span>
                            <span class="${priorityClass}" style="font-size: 11px; padding: 2px 6px; border-radius: 10px; background: ${priority.priority <= 2 ? '#fef2f2' : priority.priority <= 3 ? '#fef3c7' : '#f0fdf4'};">
                                优先级${priority.priority <= 2 ? '高' : priority.priority <= 3 ? '中' : '低'}
                            </span>
                        </div>
                        <p style="margin: 4px 0; font-size: 13px; color: #6b7280;">${priority.description}</p>
                        <div style="display: flex; gap: 16px; margin-top: 8px; font-size: 11px; color: #6b7280;">
                            <span>影响: ${priority.impact}</span>
                            <span>难度: ${priority.effort}</span>
                            <span>周期: ${priority.timeline}</span>
                        </div>
                    </div>
                `;
            });
            
            advice += `
                    </div>
                </div>
            `;
        }
        
        // 综合建议
        if (overallScore >= 80) {
            advice += `
                <div style="padding: 12px; background: #f0fdf4; border-left: 3px solid #22c55e; border-radius: 4px;">
                    <p style="color: #22c55e; font-weight: 600;">🎉 综合表现优秀!</p>
                    <p style="color: #16a34a; font-size: 13px; margin-top: 8px;">
                        您的餐厅经营状况良好，建议继续保持当前运营水平，可考虑适度扩张或开设分店。
                    </p>
                </div>
            `;
        } else if (overallScore >= 70) {
            advice += `
                <div style="padding: 12px; background: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 4px;">
                    <p style="color: #92400e; font-weight: 600;">📈 有提升空间</p>
                    <p style="color: #92400e; font-size: 13px; margin-top: 8px;">
                        您的餐厅经营状况良好，但仍有优化空间。建议按照上述优先级逐步改进，预计3-6个月内可显著提升经营效果。
                    </p>
                </div>
            `;
        } else {
            advice += `
                <div style="padding: 12px; background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 4px;">
                    <p style="color: #dc2626; font-weight: 600;">⚠️ 需要重点关注</p>
                    <p style="color: #dc2626; font-size: 13px; margin-top: 8px;">
                        您的餐厅存在多个需要改进的方面，建议立即制定改进计划，优先解决高风险问题，预计6-12个月内可显著改善经营状况。
                    </p>
                </div>
            `;
        }
        
        return advice;
    }

    formatNumber(num) {
        if (!num) return '0';
        return new Intl.NumberFormat('zh-CN').format(num);
    }

    // ==================== 财务健康类算法 ====================

    // 1. 盈亏平衡点分析算法
    calculateFinancialHealth(data, totalCost, monthlyRevenue) {
        // 固定成本 = 租金成本 + 人力成本基数(70%) + 水电气成本基数(80%)
        const fixedCosts = (data.rent_cost || 0) + 
                          (data.labor_cost || 0) * 0.7 + 
                          (data.utility_cost || 0) * 0.8;
        
        // 变动成本 = 食材成本 + 营销成本
        const variableCosts = (data.food_cost || 0) + (data.marketing_cost || 0);
        const variableCostRate = monthlyRevenue > 0 ? variableCosts / monthlyRevenue : 0;
        
        // 边际贡献率 = 1 - 变动成本率
        const contributionMarginRate = Math.max(0, 1 - variableCostRate);
        
        // 盈亏平衡点营收 = 固定成本 / 边际贡献率
        const breakEvenRevenue = contributionMarginRate > 0 ? fixedCosts / contributionMarginRate : 0;
        
        // 盈亏平衡点客流 = 盈亏平衡点营收 / 客单价
        const avgSpending = (data.total_customers || 0) > 0 ? monthlyRevenue / (data.total_customers || 1) : 50;
        const breakEvenCustomers = avgSpending > 0 ? breakEvenRevenue / avgSpending : 0;
        
        // 当前安全边际 = (当前营收 - 盈亏平衡点营收) / 当前营收
        const safetyMargin = monthlyRevenue > 0 ? (monthlyRevenue - breakEvenRevenue) / monthlyRevenue : 0;
        
        // 现金流健康度
        const operatingCashFlow = monthlyRevenue - totalCost;
        const cashFlowCoverageRatio = fixedCosts > 0 ? operatingCashFlow / fixedCosts : 0;
        
        // 应急储备月数 = 假设储备金 / 月固定成本
        const emergencyReserveMonths = 3; // 假设储备3个月
        const emergencyReserve = fixedCosts * emergencyReserveMonths;
        
        // 现金流健康分数
        const cashFlowHealthScore = Math.min(100, 
            (cashFlowCoverageRatio >= 1.5 ? 40 : cashFlowCoverageRatio >= 1.0 ? 30 : 20) +
            (emergencyReserve > 0 ? 30 : 0) +
            (data.table_turnover || 0) >= 3 ? 30 : 20
        );

        return {
            // 盈亏平衡点分析
            fixed_costs: fixedCosts,
            variable_costs: variableCosts,
            variable_cost_rate: variableCostRate,
            contribution_margin_rate: contributionMarginRate,
            break_even_revenue: breakEvenRevenue,
            break_even_customers: breakEvenCustomers,
            safety_margin: safetyMargin,
            
            // 现金流健康度
            operating_cash_flow: operatingCashFlow,
            cash_flow_coverage_ratio: cashFlowCoverageRatio,
            emergency_reserve: emergencyReserve,
            emergency_reserve_months: emergencyReserveMonths,
            cash_flow_health_score: cashFlowHealthScore,
            
            // 投资回报周期
            monthly_net_profit: operatingCashFlow,
            annual_net_profit: operatingCashFlow * 12,
            initial_investment: this.estimateInitialInvestment(data),
            simple_payback_period: this.calculateSimplePaybackPeriod(operatingCashFlow, data)
        };
    }

    // 2. 现金流健康度评估
    calculateCashFlowHealth(data, kpi) {
        const fixedCosts = (data.rent_cost || 0) + (data.labor_cost || 0) * 0.7 + (data.utility_cost || 0) * 0.8;
        const operatingCashFlow = (data.monthly_revenue || 0) - ((data.food_cost || 0) + (data.labor_cost || 0) + (data.rent_cost || 0) + (data.marketing_cost || 0) + (data.utility_cost || 0));
        
        return {
            cash_flow_coverage: fixedCosts > 0 ? operatingCashFlow / fixedCosts : 0,
            emergency_reserve_adequacy: this.calculateEmergencyReserveAdequacy(data, fixedCosts),
            working_capital_turnover: this.calculateWorkingCapitalTurnover(data)
        };
    }

    // 3. 投资回报周期预测
    calculateSimplePaybackPeriod(monthlyNetProfit, data) {
        const initialInvestment = this.estimateInitialInvestment(data);
        if (monthlyNetProfit <= 0) return Infinity;
        return initialInvestment / (monthlyNetProfit * 12);
    }

    estimateInitialInvestment(data) {
        // 根据门店面积和装修档次估算初始投资
        const area = data.store_area || 100;
        const decorationLevel = data.decoration_level || '中档';
        
        const decorationCostPerSqm = {
            '中高档': 2000,
            '中档': 1500,
            '中低档': 1000
        };
        
        const decorationCost = area * (decorationCostPerSqm[decorationLevel] || 1500);
        const equipmentCost = area * 800; // 设备成本
        const depositCost = (data.rent_cost || 0) * 3; // 押金
        const inventoryCost = (data.food_cost || 0) * 0.5; // 备货成本
        
        return decorationCost + equipmentCost + depositCost + inventoryCost;
    }

    // ==================== 运营效率类算法 ====================

    // 4. 时段效率分析模型
    calculateOperationalEfficiency(data, kpi) {
        // 时段分布（基于行业经验）
        const timeSlotDistribution = {
            breakfast: 0.15,    // 早餐档 (7-10点)
            lunch: 0.40,        // 午餐档 (11-14点)
            afternoon: 0.10,    // 下午茶 (15-17点)
            dinner: 0.35        // 晚餐档 (18-21点)
        };

        const monthlyRevenue = data.monthly_revenue || 0;
        const laborCost = data.labor_cost || 0;
        const rentCost = data.rent_cost || 0;
        const storeArea = data.store_area || 1;

        // 各时段效率分析
        const timeSlotEfficiency = {};
        Object.keys(timeSlotDistribution).forEach(slot => {
            const slotRevenue = monthlyRevenue * timeSlotDistribution[slot];
            const slotLaborCost = laborCost * timeSlotDistribution[slot];
            const slotRentCost = rentCost * timeSlotDistribution[slot];
            
            timeSlotEfficiency[slot] = {
                revenue: slotRevenue,
                efficiency: slotLaborCost + slotRentCost > 0 ? slotRevenue / (slotLaborCost + slotRentCost) : 0,
                revenue_per_sqm: slotRevenue / storeArea,
                revenue_per_hour: slotRevenue / (slot === 'breakfast' ? 3 : slot === 'lunch' ? 3 : slot === 'afternoon' ? 2 : 3)
            };
        });

        // 座位利用率分析
        const seats = data.seats || 1;
        const dailyCustomers = data.daily_customers || 0;
        const tableTurnover = kpi.table_turnover || 0;
        
        const seatUtilization = (dailyCustomers * 30) / (seats * tableTurnover * 30);
        const seatWasteRate = Math.max(0, 1 - seatUtilization);

        // 菜品组合优化分析
        const menuHealthIndex = this.calculateMenuHealthIndex(data);

        return {
            time_slot_efficiency: timeSlotEfficiency,
            seat_utilization: seatUtilization,
            seat_waste_rate: seatWasteRate,
            menu_health_index: menuHealthIndex,
            operational_efficiency_score: this.calculateOperationalEfficiencyScore(timeSlotEfficiency, seatUtilization, menuHealthIndex)
        };
    }

    // 5. 座位利用率优化算法
    calculateSeatUtilization(data, kpi) {
        const seats = data.seats || 1;
        const dailyCustomers = data.daily_customers || 0;
        const tableTurnover = kpi.table_turnover || 0;
        
        return {
            current_utilization: (dailyCustomers * 30) / (seats * tableTurnover * 30),
            theoretical_max: seats * 4 * 12 * 30, // 假设理想翻台率4次，营业12小时
            optimization_potential: this.calculateSeatOptimizationPotential(data, seats)
        };
    }

    // 6. 菜品组合优化模型
    calculateMenuHealthIndex(data) {
        // 基于行业经验估算菜品结构
        const estimatedMenuStructure = {
            star_dishes: 0.35,      // 明星菜品占比
            potential_dishes: 0.25, // 潜力菜品占比
            traffic_dishes: 0.25,   // 引流菜品占比
            eliminate_dishes: 0.15  // 淘汰菜品占比
        };

        const menuHealthScore = (
            estimatedMenuStructure.star_dishes * 40 +
            estimatedMenuStructure.potential_dishes * 30 +
            estimatedMenuStructure.traffic_dishes * 20 -
            estimatedMenuStructure.eliminate_dishes * 10
        );

        return {
            structure: estimatedMenuStructure,
            health_index: menuHealthScore,
            recommended_dish_count: Math.max(15, Math.floor((data.store_area || 100) / 20) + 15)
        };
    }

    // ==================== 客户价值类算法 ====================

    // 7. 客户生命周期价值(LTV)模型
    calculateCustomerValue(data, kpi) {
        const avgSpending = kpi.avg_spending || 50;
        const repurchaseRate = kpi.member_repurchase || 0.25;
        const monthlyChurnRate = 1 - repurchaseRate;
        const annualChurnRate = 1 - Math.pow(repurchaseRate, 12);
        
        // 年购买频次 = (复购率 × 12) / (1 - 复购率)
        const annualPurchaseFrequency = repurchaseRate > 0 ? (repurchaseRate * 12) / (1 - repurchaseRate) : 0;
        
        // 客户寿命(年) = 1 / 年流失率
        const customerLifespan = annualChurnRate > 0 ? 1 / annualChurnRate : 0;
        
        // 基础LTV = 客单价 × 年购买频次 × 客户寿命
        const baseLTV = avgSpending * annualPurchaseFrequency * customerLifespan;
        
        // 考虑利润的LTV = 基础LTV × 毛利率
        const profitLTV = baseLTV * (kpi.gross_margin || 0.55);
        
        // 新客获客成本
        const monthlyNewCustomers = (data.total_customers || 0) * 0.3; // 假设30%是新客
        const customerAcquisitionCost = monthlyNewCustomers > 0 ? (data.marketing_cost || 0) / monthlyNewCustomers : 0;
        
        // LTV/CAC比率
        const ltvCacRatio = customerAcquisitionCost > 0 ? profitLTV / customerAcquisitionCost : 0;

        return {
            base_ltv: baseLTV,
            profit_ltv: profitLTV,
            customer_lifespan: customerLifespan,
            annual_purchase_frequency: annualPurchaseFrequency,
            customer_acquisition_cost: customerAcquisitionCost,
            ltv_cac_ratio: ltvCacRatio,
            customer_segmentation: this.calculateCustomerSegmentation(profitLTV, avgSpending)
        };
    }

    // 8. 客户流失预警模型
    calculateCustomerChurnRisk(data, kpi) {
        // 基于现有数据估算流失风险
        const lastVisitDays = 30; // 假设最后消费时间
        const frequencyDecline = 0.1; // 假设频次下降10%
        const spendingDecline = 0.05; // 假设客单价下降5%
        const badReviewRate = kpi.negative_comment_rate || 0.05;

        // 流失风险评分（0-100分）
        let riskScore = 0;
        
        // 最近消费时间（35%权重）
        if (lastVisitDays > 90) riskScore += 100;
        else if (lastVisitDays > 60) riskScore += 80;
        else if (lastVisitDays > 30) riskScore += 50;
        else if (lastVisitDays > 15) riskScore += 20;
        
        // 消费频次下降（30%权重）
        if (frequencyDecline > 0.6) riskScore += 100;
        else if (frequencyDecline > 0.4) riskScore += 60;
        else if (frequencyDecline > 0.2) riskScore += 30;
        
        // 客单价下降（20%权重）
        if (spendingDecline > 0.4) riskScore += 100;
        else if (spendingDecline > 0.2) riskScore += 50;
        else if (spendingDecline > 0) riskScore += 20;
        
        // 差评记录（15%权重）
        if (badReviewRate > 0.1) riskScore += 100;
        else if (badReviewRate > 0.05) riskScore += 60;
        else if (badReviewRate > 0) riskScore += 30;

        return {
            risk_score: riskScore,
            risk_level: riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low',
            churn_probability: riskScore / 100,
            retention_strategy: this.getRetentionStrategy(riskScore)
        };
    }

    // 9. 客户满意度综合模型
    calculateCustomerSatisfaction(data, kpi) {
        const reviewScore = kpi.review_score || 0;
        const badReviewRate = kpi.negative_comment_rate || 0;
        const repurchaseRate = kpi.member_repurchase || 0;
        
        // 综合满意度 = 加权平均(各维度得分)
        const satisfactionScore = (
            (reviewScore / 5) * 30 +           // 评分维度（30%）
            (1 - badReviewRate) * 25 +         // 差评维度（25%）
            repurchaseRate * 100 * 4 * 25 +    // 复购维度（25%）
            this.calculateNPS(data) * 20       // 推荐指数（20%）
        );

        return {
            overall_satisfaction: satisfactionScore,
            satisfaction_level: this.getSatisfactionLevel(satisfactionScore),
            nps_score: this.calculateNPS(data),
            improvement_areas: this.identifyImprovementAreas(kpi)
        };
    }

    // ==================== 营销效果类算法 ====================

    // 10. 营销ROI多维评估模型
    calculateMarketingEffectiveness(data, kpi) {
        const marketingCost = data.marketing_cost || 0;
        const monthlyRevenue = data.monthly_revenue || 0;
        const onlineRevenue = data.online_revenue || 0;
        
        // 总营销ROI
        const totalMarketingROI = marketingCost > 0 ? (monthlyRevenue - marketingCost) / marketingCost : 0;
        
        // 各渠道ROI（基于行业经验分配）
        const channelROI = {
            platform_advertising: this.calculateChannelROI(marketingCost * 0.4, onlineRevenue * 0.6),
            short_video: this.calculateChannelROI(marketingCost * 0.3, onlineRevenue * 0.25),
            live_streaming: this.calculateChannelROI(marketingCost * 0.2, onlineRevenue * 0.1),
            promotions: this.calculateChannelROI(marketingCost * 0.1, monthlyRevenue * 0.05)
        };

        return {
            total_marketing_roi: totalMarketingROI,
            channel_roi: channelROI,
            marketing_efficiency_score: this.calculateMarketingEfficiencyScore(channelROI),
            content_marketing_health: this.calculateContentMarketingHealth(data)
        };
    }

    // 11. 内容营销效能指数
    calculateContentMarketingHealth(data) {
        const shortVideoCount = data.short_video_count || 0;
        const liveStreamCount = data.live_stream_count || 0;
        const marketingSituation = data.marketing_situation || '无';
        
        // 发布频次得分
        const videoFrequencyScore = Math.min(100, (shortVideoCount / 60) * 100);
        const liveFrequencyScore = Math.min(100, (liveStreamCount / 20) * 100);
        
        // 营销团队得分
        const teamScore = {
            '有自己团队': 100,
            '找代运营': 80,
            '老板运营': 60,
            '无': 20
        }[marketingSituation] || 20;
        
        const contentHealthIndex = (videoFrequencyScore * 0.4 + liveFrequencyScore * 0.3 + teamScore * 0.3);
        
        return {
            content_health_index: contentHealthIndex,
            video_frequency_score: videoFrequencyScore,
            live_frequency_score: liveFrequencyScore,
            team_score: teamScore,
            improvement_suggestions: this.getContentMarketingSuggestions(contentHealthIndex)
        };
    }

    // ==================== 风险预警类算法 ====================

    // 12. 经营风险预警雷达模型
    calculateRiskIndicators(data, kpi, totalCost, monthlyRevenue) {
        const riskFactors = {
            // 盈利风险（20%权重）
            profit_risk: kpi.gross_margin < 0.45 ? 80 : kpi.gross_margin < 0.55 ? 50 : 20,
            
            // 现金流风险（20%权重）
            cash_flow_risk: kpi.cash_flow_coverage_ratio < 1.0 ? 90 : kpi.cash_flow_coverage_ratio < 1.5 ? 50 : 20,
            
            // 成本风险（15%权重）
            cost_risk: (totalCost / monthlyRevenue) > 0.85 ? 85 : (totalCost / monthlyRevenue) > 0.75 ? 55 : 25,
            
            // 客流风险（15%权重）
            customer_risk: this.calculateCustomerRisk(data),
            
            // 竞争风险（10%权重）
            competition_risk: this.calculateCompetitionRisk(data),
            
            // 口碑风险（10%权重）
            reputation_risk: kpi.negative_comment_rate > 0.10 ? 85 : kpi.negative_comment_rate > 0.05 ? 55 : 25,
            
            // 人员风险（5%权重）
            staff_risk: this.calculateStaffRisk(data),
            
            // 市场风险（5%权重）
            market_risk: this.calculateMarketRisk(data)
        };

        const weights = {
            profit_risk: 0.20,
            cash_flow_risk: 0.20,
            cost_risk: 0.15,
            customer_risk: 0.15,
            competition_risk: 0.10,
            reputation_risk: 0.10,
            staff_risk: 0.05,
            market_risk: 0.05
        };

        // 综合风险指数
        const overallRiskIndex = Object.keys(riskFactors).reduce((sum, key) => 
            sum + (riskFactors[key] * weights[key]), 0
        );

        return {
            risk_factors: riskFactors,
            overall_risk_index: overallRiskIndex,
            risk_level: this.getRiskLevel(overallRiskIndex),
            risk_warnings: this.generateRiskWarnings(riskFactors),
            seasonal_risk: this.calculateSeasonalRisk(data, monthlyRevenue)
        };
    }

    // 13. 季节性波动预测模型
    calculateSeasonalRisk(data, monthlyRevenue) {
        const currentMonth = new Date().getMonth() + 1;
        const seasonalCoefficients = {
            1: 1.4,   // 春节
            2: 0.75,  // 节后淡季
            3: 0.95,
            4: 1.05,
            5: 1.25,  // 五一
            6: 0.95,
            7: 1.15,  // 暑假
            8: 1.15,
            9: 0.95,
            10: 1.35, // 国庆
            11: 0.95,
            12: 1.05
        };

        const currentCoefficient = seasonalCoefficients[currentMonth] || 1.0;
        const predictedRevenue = monthlyRevenue * currentCoefficient;
        const fixedCosts = (data.rent_cost || 0) + (data.labor_cost || 0) * 0.7 + (data.utility_cost || 0) * 0.8;
        
        return {
            current_seasonal_coefficient: currentCoefficient,
            predicted_revenue: predictedRevenue,
            seasonal_survival_test: predictedRevenue >= fixedCosts,
            seasonal_preparation_index: fixedCosts > 0 ? ((predictedRevenue / fixedCosts) - 1) * 100 : 0
        };
    }

    // ==================== 战略决策类算法 ====================

    // 14. 同业对标竞争力分析
    calculateCompetitiveAnalysis(data, kpi) {
        const benchmark = this.industryBenchmarks[data.business_type] || this.industryBenchmarks['其他'];
        
        const competitivenessFactors = {
            cost_efficiency: this.calculateCostEfficiencyScore(kpi, benchmark),
            operational_efficiency: this.calculateOperationalEfficiencyScore(kpi, benchmark),
            profitability: this.calculateProfitabilityScore(kpi, benchmark),
            customer_performance: this.calculateCustomerPerformanceScore(kpi, benchmark),
            marketing_capability: this.calculateMarketingCapabilityScore(kpi, data),
            product_quality: this.calculateProductQualityScore(kpi, data)
        };

        const weights = {
            cost_efficiency: 0.20,
            operational_efficiency: 0.20,
            profitability: 0.20,
            customer_performance: 0.20,
            marketing_capability: 0.10,
            product_quality: 0.10
        };

        const overallCompetitiveness = Object.keys(competitivenessFactors).reduce((sum, key) => 
            sum + (competitivenessFactors[key] * weights[key]), 0
        );

        return {
            competitiveness_factors: competitivenessFactors,
            overall_competitiveness: overallCompetitiveness,
            competitiveness_rank: this.getCompetitivenessRank(overallCompetitiveness),
            swot_analysis: this.performSWOTAnalysis(competitivenessFactors),
            improvement_priorities: this.getImprovementPriorities(competitivenessFactors)
        };
    }

    // 15. 扩张可行性评估模型
    calculateExpansionFeasibility(data, kpi) {
        const monthlyNetProfit = kpi.monthly_net_profit || 0;
        const annualNetProfit = monthlyNetProfit * 12;
        const initialInvestment = this.estimateInitialInvestment(data);
        
        const feasibilityFactors = {
            // 财务准备（30%权重）
            financial_readiness: this.calculateFinancialReadiness(data, initialInvestment),
            
            // 盈利能力（25%权重）
            profitability: kpi.gross_margin >= 0.60 ? 100 : kpi.gross_margin >= 0.55 ? 80 : kpi.gross_margin >= 0.50 ? 60 : 40,
            
            // 运营成熟度（20%权重）
            operational_maturity: this.calculateOperationalMaturity(data),
            
            // 团队准备（15%权重）
            team_readiness: this.calculateTeamReadiness(data),
            
            // 品牌认知（10%权重）
            brand_recognition: this.calculateBrandRecognition(data, kpi)
        };

        const weights = {
            financial_readiness: 0.30,
            profitability: 0.25,
            operational_maturity: 0.20,
            team_readiness: 0.15,
            brand_recognition: 0.10
        };

        const expansionReadiness = Object.keys(feasibilityFactors).reduce((sum, key) => 
            sum + (feasibilityFactors[key] * weights[key]), 0
        );

        return {
            feasibility_factors: feasibilityFactors,
            expansion_readiness: expansionReadiness,
            expansion_recommendation: this.getExpansionRecommendation(expansionReadiness),
            payback_period: initialInvestment > 0 && annualNetProfit > 0 ? initialInvestment / annualNetProfit : Infinity,
            expansion_risks: this.assessExpansionRisks(data, kpi)
        };
    }

    // ==================== 辅助计算方法 ====================

    calculateCostEfficiencyScore(kpi, benchmark) {
        const costRate = kpi.food_cost_ratio + kpi.labor_cost_ratio + kpi.rent_cost_ratio;
        const benchmarkCostRate = 0.35 + 0.30 + 0.20; // 行业平均成本率
        return Math.max(0, (1 - costRate / benchmarkCostRate) * 100);
    }

    calculateOperationalEfficiencyScore(kpi, benchmark) {
        const turnoverScore = Math.min(100, (kpi.table_turnover / benchmark.table_turnover) * 100);
        const sqmScore = Math.min(100, (kpi.revenue_per_sqm / benchmark.revenue_per_sqm) * 100);
        return (turnoverScore + sqmScore) / 2;
    }

    calculateProfitabilityScore(kpi, benchmark) {
        return Math.min(100, (kpi.gross_margin / benchmark.gross_margin) * 100);
    }

    calculateCustomerPerformanceScore(kpi, benchmark) {
        const spendingScore = Math.min(100, (kpi.avg_spending / benchmark.avg_spending) * 100);
        const repurchaseScore = Math.min(100, kpi.member_repurchase * 400);
        const reviewScore = Math.min(100, (kpi.review_score / 5) * 100);
        return (spendingScore + repurchaseScore + reviewScore) / 3;
    }

    calculateMarketingCapabilityScore(kpi, data) {
        const contentScore = kpi.content_marketing_index || 0;
        const onlineScore = Math.min(100, (kpi.takeaway_ratio || 0) * 200);
        return (contentScore + onlineScore) / 2;
    }

    calculateProductQualityScore(kpi, data) {
        const reviewScore = Math.min(100, (kpi.review_score / 5) * 100);
        const badReviewScore = Math.max(0, 100 - (kpi.negative_comment_rate || 0) * 1000);
        return (reviewScore + badReviewScore) / 2;
    }

    // 其他辅助方法
    calculateChannelROI(cost, revenue) {
        return cost > 0 ? (revenue - cost) / cost : 0;
    }

    calculateNPS(data) {
        // 基于评分和复购率估算NPS
        const reviewScore = data.average_rating || 0;
        const repurchaseRate = data.repeat_customers / data.total_customers || 0;
        return Math.max(-100, Math.min(100, (reviewScore - 3) * 20 + repurchaseRate * 50));
    }

    getSatisfactionLevel(score) {
        if (score >= 90) return '优秀';
        if (score >= 80) return '良好';
        if (score >= 70) return '及格';
        return '较差';
    }

    getRiskLevel(riskIndex) {
        if (riskIndex >= 80) return '极高风险';
        if (riskIndex >= 60) return '高风险';
        if (riskIndex >= 40) return '中等风险';
        if (riskIndex >= 20) return '低风险';
        return '极低风险';
    }

    getCompetitivenessRank(score) {
        if (score >= 85) return '行业领先(Top 10%)';
        if (score >= 70) return '行业优秀(Top 30%)';
        if (score >= 55) return '行业中等(Middle 40%)';
        if (score >= 40) return '行业偏下(Bottom 30%)';
        return '行业落后(Bottom 10%)';
    }

    getExpansionRecommendation(readiness) {
        if (readiness >= 80) return '建议扩张';
        if (readiness >= 60) return '谨慎扩张';
        return '不建议扩张';
    }

    // 更多辅助方法...
    calculateEmergencyReserveAdequacy(data, fixedCosts) {
        const recommendedReserve = fixedCosts * 3; // 3个月固定成本
        return {
            recommended: recommendedReserve,
            adequacy_ratio: data.cash_reserve ? data.cash_reserve / recommendedReserve : 0
        };
    }

    calculateWorkingCapitalTurnover(data) {
        const monthlyRevenue = data.monthly_revenue || 0;
        const workingCapital = (data.food_cost || 0) * 0.5; // 假设50%的食材成本作为营运资金
        return workingCapital > 0 ? monthlyRevenue / workingCapital : 0;
    }

    calculateCustomerSegmentation(ltv, avgSpending) {
        const avgLTV = ltv;
        return {
            diamond: avgLTV * 3,
            gold: avgLTV * 2,
            silver: avgLTV * 1,
            bronze: avgLTV * 0.5
        };
    }

    getRetentionStrategy(riskScore) {
        if (riskScore > 70) return '立即发放高价值券，店长亲自致电';
        if (riskScore > 40) return '发送优惠信息，新品试吃邀请';
        return '正常维护';
    }

    identifyImprovementAreas(kpi) {
        const areas = [];
        if (kpi.review_score < 4.0) areas.push('服务培训');
        if (kpi.negative_comment_rate > 0.05) areas.push('质量管控');
        if (kpi.member_repurchase < 0.15) areas.push('客户关系管理');
        return areas;
    }

    calculateMarketingEfficiencyScore(channelROI) {
        const avgROI = Object.values(channelROI).reduce((sum, roi) => sum + roi, 0) / Object.keys(channelROI).length;
        return Math.min(100, avgROI * 20);
    }

    getContentMarketingSuggestions(healthIndex) {
        if (healthIndex < 60) return ['增加发布频次', '提升内容质量', '建立专业团队'];
        if (healthIndex < 80) return ['优化内容策略', '加强互动'];
        return ['保持当前水平', '探索新形式'];
    }

    calculateCustomerRisk(data) {
        const customerDecline = 0.1; // 假设客流下降10%
        if (customerDecline > 0.2) return 80;
        if (customerDecline > 0.1) return 50;
        return 20;
    }

    calculateCompetitionRisk(data) {
        // 基于商圈情况估算竞争风险
        const businessCircle = data.business_circle || '';
        if (businessCircle.includes('一类')) return 15;
        if (businessCircle.includes('二类')) return 25;
        return 45;
    }

    calculateStaffRisk(data) {
        const turnoverRate = 0.2; // 假设20%年流失率
        if (turnoverRate > 0.3) return 80;
        if (turnoverRate > 0.15) return 50;
        return 20;
    }

    calculateMarketRisk(data) {
        const businessType = data.business_type || '';
        const saturatedTypes = ['茶饮店', '咖啡厅'];
        return saturatedTypes.includes(businessType) ? 70 : 25;
    }

    generateRiskWarnings(riskFactors) {
        const warnings = [];
        Object.keys(riskFactors).forEach(factor => {
            if (riskFactors[factor] > 70) {
                warnings.push({
                    factor: factor,
                    level: 'high',
                    message: this.getRiskMessage(factor, riskFactors[factor])
                });
            }
        });
        return warnings;
    }

    getRiskMessage(factor, score) {
        const messages = {
            profit_risk: '毛利率过低，存在严重财务风险',
            cash_flow_risk: '现金流紧张，需要关注资金状况',
            cost_risk: '总成本率过高，盈利空间被压缩',
            customer_risk: '客流下降，需要加强营销',
            competition_risk: '竞争激烈，需要差异化定位',
            reputation_risk: '口碑风险较高，需要改善服务',
            staff_risk: '人员流失率高，需要加强管理',
            market_risk: '市场饱和度高，需要创新突破'
        };
        return messages[factor] || '存在经营风险';
    }

    performSWOTAnalysis(factors) {
        const strengths = [];
        const weaknesses = [];
        const opportunities = [];
        const threats = [];

        Object.keys(factors).forEach(factor => {
            if (factors[factor] > 70) {
                strengths.push(factor);
            } else if (factors[factor] < 50) {
                weaknesses.push(factor);
            }
        });

        return { strengths, weaknesses, opportunities, threats };
    }

    getImprovementPriorities(factors) {
        return Object.keys(factors)
            .map(key => ({ factor: key, score: factors[key] }))
            .sort((a, b) => a.score - b.score)
            .slice(0, 3);
    }

    calculateFinancialReadiness(data, initialInvestment) {
        const cashReserve = data.cash_reserve || 0;
        const monthlyNetProfit = data.monthly_net_profit || 0;
        const requiredReserve = initialInvestment + (monthlyNetProfit * 6);
        
        if (cashReserve >= requiredReserve) return 100;
        if (cashReserve >= initialInvestment) return 70;
        if (cashReserve >= initialInvestment * 0.5) return 40;
        return 0;
    }

    calculateOperationalMaturity(data) {
        const updateCount = data.update_count || 0;
        if (updateCount > 20) return 100;
        if (updateCount > 10) return 70;
        if (updateCount > 5) return 40;
        return 20;
    }

    calculateTeamReadiness(data) {
        const hasManager = data.has_manager || false;
        const teamSize = data.team_size || 0;
        
        if (hasManager && teamSize > 5) return 100;
        if (hasManager || teamSize > 3) return 70;
        if (teamSize > 1) return 40;
        return 20;
    }

    calculateBrandRecognition(data, kpi) {
        const reviewScore = kpi.review_score || 0;
        const contentIndex = kpi.content_marketing_index || 0;
        
        if (reviewScore > 4.5 && contentIndex > 80) return 100;
        if (reviewScore > 4.0 && contentIndex > 60) return 70;
        if (reviewScore > 3.5 && contentIndex > 40) return 40;
        return 20;
    }

    assessExpansionRisks(data, kpi) {
        return {
            financial_risk: kpi.gross_margin < 0.5 ? 'high' : 'medium',
            management_risk: data.team_size < 3 ? 'high' : 'medium',
            market_risk: data.business_circle?.includes('一类') ? 'low' : 'medium',
            timing_risk: 'medium'
        };
    }

    calculateSeatOptimizationPotential(data, seats) {
        const currentUtilization = data.seat_utilization || 0.5;
        const potentialUtilization = Math.min(1.0, currentUtilization * 1.5);
        return {
            current: currentUtilization,
            potential: potentialUtilization,
            improvement: potentialUtilization - currentUtilization
        };
    }
}

// JavaScript交互功能
function toggleSuggestion(header) {
    const content = header.nextElementSibling;
    const arrow = header.querySelector('div:last-child');
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        arrow.textContent = '▼';
    } else {
        content.classList.add('expanded');
        arrow.textContent = '▲';
    }
}

function editSuggestion(button) {
    const suggestionCard = button.closest('.ai-suggestion-card');
    const content = suggestionCard.querySelector('.suggestion-content');
    
    // 创建编辑模式
    const problemDiv = content.querySelector('div:first-child');
    const solutionDiv = content.querySelector('div:nth-child(2)');
    
    const problemText = problemDiv.textContent.replace('问题：', '').trim();
    const solutionText = solutionDiv.textContent.replace('方案：', '').trim();
    
    problemDiv.innerHTML = `<strong>问题：</strong><input type="text" value="${problemText}" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 4px;">`;
    solutionDiv.innerHTML = `<strong>方案：</strong><textarea style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 4px; min-height: 60px;">${solutionText}</textarea>`;
    
    button.textContent = '💾 保存';
    button.onclick = () => saveSuggestion(suggestionCard);
}

function saveSuggestion(suggestionCard) {
    const content = suggestionCard.querySelector('.suggestion-content');
    const problemInput = content.querySelector('input');
    const solutionTextarea = content.querySelector('textarea');
    
    const problemDiv = content.querySelector('div:first-child');
    const solutionDiv = content.querySelector('div:nth-child(2)');
    
    problemDiv.innerHTML = `<strong>问题：</strong>${problemInput.value}`;
    solutionDiv.innerHTML = `<strong>方案：</strong>${solutionTextarea.value}`;
    
    const saveButton = content.querySelector('button');
    saveButton.textContent = '✏️ 编辑';
    saveButton.onclick = () => editSuggestion(saveButton);
}

function copyToAdmin(button) {
    const suggestionCard = button.closest('.ai-suggestion-card');
    const title = suggestionCard.querySelector('strong').textContent;
    const problem = suggestionCard.querySelector('.suggestion-content div:first-child').textContent.replace('问题：', '').trim();
    const solution = suggestionCard.querySelector('.suggestion-content div:nth-child(2)').textContent.replace('方案：', '').trim();
    
    const adminEditor = document.getElementById('adminEditor');
    const currentContent = adminEditor.innerHTML;
    
    adminEditor.innerHTML = currentContent + `
        <div style="margin-top: 16px; padding: 12px; background: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
            <h4>${title}</h4>
            <p><strong>问题：</strong>${problem}</p>
            <p><strong>方案：</strong>${solution}</p>
        </div>
    `;
    
    // 滚动到管理员编辑器
    adminEditor.scrollIntoView({ behavior: 'smooth' });
}

function formatText(command) {
    document.execCommand(command, false, null);
}

function insertHeading() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const heading = document.createElement('h3');
        heading.textContent = '新标题';
        range.insertNode(heading);
    }
}

function insertTable() {
    const table = `
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr>
                <th style="border: 1px solid #ccc; padding: 8px; background: #f5f5f5;">项目</th>
                <th style="border: 1px solid #ccc; padding: 8px; background: #f5f5f5;">金额</th>
                <th style="border: 1px solid #ccc; padding: 8px; background: #f5f5f5;">备注</th>
            </tr>
            <tr>
                <td style="border: 1px solid #ccc; padding: 8px;">示例项目</td>
                <td style="border: 1px solid #ccc; padding: 8px;">¥0</td>
                <td style="border: 1px solid #ccc; padding: 8px;">示例备注</td>
            </tr>
        </table>
    `;
    
    const adminEditor = document.getElementById('adminEditor');
    adminEditor.innerHTML += table;
}

function insertIcon() {
    const icons = ['💰', '📊', '🎯', '📈', '👥', '📱', '⚠️', '✅', '❌', '💡'];
    const icon = icons[Math.floor(Math.random() * icons.length)];
    
    const adminEditor = document.getElementById('adminEditor');
    adminEditor.innerHTML += `<span style="font-size: 20px; margin: 0 4px;">${icon}</span>`;
}

function saveAdminNotes() {
    const adminEditor = document.getElementById('adminEditor');
    const content = adminEditor.innerHTML;
    
    // 保存到本地存储
    localStorage.setItem('adminNotes', content);
    
    // 显示保存成功提示
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '✅ 已保存';
    button.style.background = '#10b981';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
    }, 2000);
}

function exportPDF() {
    // 创建PDF导出功能
    const reportContent = document.getElementById('reportExport');
    
    // 使用html2pdf库导出PDF
    if (typeof html2pdf !== 'undefined') {
        const opt = {
            margin: 1,
            filename: '餐饮店诊断报告.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        
        html2pdf().set(opt).from(reportContent).save();
    } else {
        alert('PDF导出功能需要加载html2pdf库');
    }
}

// 加载保存的管理员笔记
document.addEventListener('DOMContentLoaded', function() {
    const savedNotes = localStorage.getItem('adminNotes');
    if (savedNotes) {
        const adminEditor = document.getElementById('adminEditor');
        if (adminEditor) {
            adminEditor.innerHTML = savedNotes;
        }
    }
});

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RestaurantDiagnosisAdvanced;
}
