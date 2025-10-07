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

        const totalCost = (data.food_cost || 0) + (data.labor_cost || 0) + (data.rent_cost || 0) + 
                        (data.marketing_cost || 0) + (data.utility_cost || 0);
        
        // 计算员工数(根据人力成本和行业平均工资估算)
        const estimatedEmployees = Math.max(1, Math.round((data.labor_cost || 0) / 5000));
        
        const kpi = {
            // 基础成本率
            food_cost_ratio: (data.food_cost || 0) / (data.monthly_revenue || 1),
            labor_cost_ratio: (data.labor_cost || 0) / (data.monthly_revenue || 1),
            rent_cost_ratio: (data.rent_cost || 0) / (data.monthly_revenue || 1),
            marketing_cost_ratio: (data.marketing_cost || 0) / (data.monthly_revenue || 1),
            utility_cost_ratio: (data.utility_cost || 0) / (data.monthly_revenue || 1),
            gross_margin: 1 - (totalCost / (data.monthly_revenue || 1)),
            
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

        return `
            <div id="reportExport">
                <div class="diagnosis-section">
                    <h3>一、综合健康度评分</h3>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div class="metric-card" style="border-top-color: #3b82f6;">
                            <div class="metric-label">选址匹配度</div>
                            <div class="metric-value" style="font-size: 32px; color: #3b82f6;">${kpi.location_match_score}分</div>
                            <div class="score-badge ${this.getScoreBadgeClass(kpi.location_match_score)}" style="margin-top: 8px;">
                                ${this.getScoreLabel(kpi.location_match_score)}
                            </div>
                        </div>
                        <div class="metric-card" style="border-top-color: #10b981;">
                            <div class="metric-label">营销健康度</div>
                            <div class="metric-value" style="font-size: 32px; color: #10b981;">${kpi.marketing_health_score}分</div>
                            <div class="score-badge ${this.getScoreBadgeClass(kpi.marketing_health_score)}" style="margin-top: 8px;">
                                ${this.getScoreLabel(kpi.marketing_health_score)}
                            </div>
                        </div>
                        <div class="metric-card" style="border-top-color: #f59e0b;">
                            <div class="metric-label">内容营销指数</div>
                            <div class="metric-value" style="font-size: 32px; color: #f59e0b;">${kpi.content_marketing_index}分</div>
                            <div class="score-badge ${this.getScoreBadgeClass(kpi.content_marketing_index)}" style="margin-top: 8px;">
                                ${this.getScoreLabel(kpi.content_marketing_index)}
                            </div>
                        </div>
                        <div class="metric-card" style="border-top-color: #8b5cf6;">
                            <div class="metric-label">综合评分</div>
                            <div class="metric-value" style="font-size: 32px; color: #8b5cf6;">${Math.round((kpi.location_match_score + kpi.marketing_health_score + kpi.content_marketing_index) / 3)}分</div>
                            <div class="score-badge ${this.getScoreBadgeClass(Math.round((kpi.location_match_score + kpi.marketing_health_score + kpi.content_marketing_index) / 3))}" style="margin-top: 8px;">
                                ${this.getScoreLabel(Math.round((kpi.location_match_score + kpi.marketing_health_score + kpi.content_marketing_index) / 3))}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="diagnosis-section">
                    <h3>二、成本结构深度分析</h3>
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
                    <h3>四、客户体验深度分析</h3>
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
                    <h3>六、风险预警与建议</h3>
                    <div class="info-card">
                        <h4 style="font-weight: 600; margin-bottom: 10px;">⚠️ 经营风险预警</h4>
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
}