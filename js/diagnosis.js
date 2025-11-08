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
        // 防御性检查：确保 kpi 对象存在
        if (!kpi) {
            console.error('❌ generateReport: kpi 参数缺失或为空', kpi);
            kpi = {
                location_match_score: 70,
                marketing_health_score: 70,
                content_marketing_index: 70,
                avg_spending: 50,
                table_turnover: 3.0,
                takeaway_ratio: 0.3,
                rating: 4.2
            };
        }

        const totalCostCalc = (data.food_cost || 0) + (data.labor_cost || 0) + (data.rent_cost || 0) +
                            (data.marketing_cost || 0) + (data.utility_cost || 0);

        const overallScore = Math.round(((kpi.location_match_score || 70) + (kpi.marketing_health_score || 70) + (kpi.content_marketing_index || 70)) / 3);
        const healthLevel = this.getHealthLevel(overallScore);
        
        return `
            <div class="diagnosis-report-v2">
                ${this.generateStoreOverview(data, overallScore, healthLevel)}
                ${this.generateDashboardSection(kpi, data)}
                ${this.generateCostAnalysisSection(data, kpi)}
                ${this.generateTrafficAndExperienceSection(data, kpi)}
                ${this.generateOperationsSection(data, kpi)}
                ${this.generateMarketingSection(data, kpi)}
                ${this.generateAISuggestions(data, kpi)}
                ${this.generateAdminEditor()}
            </div>
        `;
    }

    generateStoreOverview(data, overallScore, healthLevel) {
        const businessType = data.business_type || '快餐';
        const location = data.business_circle || '一类商圈';
        const area = data.store_area || 120;
        const seats = data.seats || 50;
        const monthlyRevenue = data.monthly_revenue || 150000;
        const dailyCustomers = data.daily_customers || Math.round(monthlyRevenue / 30 / (data.avg_order_value || 50));
        const decorationLevel = data.decoration_level || '中档';
        const avgOrderValue = Math.round(monthlyRevenue / (dailyCustomers * 30)) || 50;
        const totalCustomers = data.total_customers || dailyCustomers * 30;

        return `
            <div class="store-overview-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 24px; margin-bottom: 24px; color: white; box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                    <div>
                        <h2 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            🏪 ${data.store_name || '餐饮门店'}
                        </h2>
                        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                            <span style="background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 20px; font-size: 14px; backdrop-filter: blur(10px);">
                                📍 ${location}
                            </span>
                            <span style="background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 20px; font-size: 14px; backdrop-filter: blur(10px);">
                                🍴 ${businessType}
                            </span>
                            <span style="background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 20px; font-size: 14px; backdrop-filter: blur(10px);">
                                ✨ ${decorationLevel}装修
                            </span>
                        </div>
                    </div>
                    <div style="text-align: center; background: rgba(255,255,255,0.95); color: #667eea; padding: 16px 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        <div style="font-size: 36px; font-weight: 700; line-height: 1; margin-bottom: 4px;">${overallScore}</div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 8px;">综合得分</div>
                        <div class="health-level-badge ${healthLevel.class}" style="display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 13px; background: ${healthLevel.bgColor}; color: ${healthLevel.color};">
                            ${healthLevel.label}
                        </div>
                        <div style="font-size: 10px; color: #9ca3af; margin-top: 8px;">${healthLevel.description}</div>
                    </div>
                </div>

                <!-- 关键指标卡片网格 -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 20px;">
                    <!-- 门店面积 -->
                    <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 12px; color: #2c3e50; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #3b82f6;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                            <div style="font-size: 32px;">🏠</div>
                            <div style="flex: 1;">
                                <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">门店面积</div>
                                <div style="font-size: 24px; font-weight: 700; color: #3b82f6;">${area}<span style="font-size: 14px; color: #6b7280;">㎡</span></div>
                            </div>
                        </div>
                        <div style="font-size: 11px; color: #9ca3af; margin-top: 8px;">
                            坪效：¥${Math.round(monthlyRevenue / area)}/㎡
                        </div>
                    </div>

                    <!-- 座位数 -->
                    <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 12px; color: #2c3e50; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #10b981;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                            <div style="font-size: 32px;">🪑</div>
                            <div style="flex: 1;">
                                <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">座位数量</div>
                                <div style="font-size: 24px; font-weight: 700; color: #10b981;">${seats}<span style="font-size: 14px; color: #6b7280;">个</span></div>
                            </div>
                        </div>
                        <div style="font-size: 11px; color: #9ca3af; margin-top: 8px;">
                            翻台率：${(dailyCustomers / seats).toFixed(1)}次/天
                        </div>
                    </div>

                    <!-- 月营收 -->
                    <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 12px; color: #2c3e50; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #f59e0b;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                            <div style="font-size: 32px;">💰</div>
                            <div style="flex: 1;">
                                <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">月营收</div>
                                <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">¥${this.formatNumber(monthlyRevenue)}</div>
                            </div>
                        </div>
                        <div style="font-size: 11px; color: #9ca3af; margin-top: 8px;">
                            日均：¥${this.formatNumber(Math.round(monthlyRevenue / 30))}
                        </div>
                    </div>

                    <!-- 日均客流 -->
                    <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 12px; color: #2c3e50; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #8b5cf6;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                            <div style="font-size: 32px;">👥</div>
                            <div style="flex: 1;">
                                <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">日均客流</div>
                                <div style="font-size: 24px; font-weight: 700; color: #8b5cf6;">${dailyCustomers}<span style="font-size: 14px; color: #6b7280;">人</span></div>
                            </div>
                        </div>
                        <div style="font-size: 11px; color: #9ca3af; margin-top: 8px;">
                            月客流：${this.formatNumber(totalCustomers)}人
                        </div>
                    </div>

                    <!-- 客单价 -->
                    <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 12px; color: #2c3e50; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #ef4444;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                            <div style="font-size: 32px;">🎫</div>
                            <div style="flex: 1;">
                                <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">客单价</div>
                                <div style="font-size: 24px; font-weight: 700; color: #ef4444;">¥${avgOrderValue}</div>
                            </div>
                        </div>
                        <div style="font-size: 11px; color: #9ca3af; margin-top: 8px;">
                            ${avgOrderValue >= 80 ? '高档消费' : avgOrderValue >= 50 ? '中档消费' : '平价消费'}
                        </div>
                    </div>

                    <!-- 营业时长/人效 -->
                    <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 12px; color: #2c3e50; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #06b6d4;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                            <div style="font-size: 32px;">⚡</div>
                            <div style="flex: 1;">
                                <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">人效指标</div>
                                <div style="font-size: 24px; font-weight: 700; color: #06b6d4;">¥${this.formatNumber(Math.round(monthlyRevenue / Math.max(1, Math.round((data.labor_cost || 0) / 5000))))}</div>
                            </div>
                        </div>
                        <div style="font-size: 11px; color: #9ca3af; margin-top: 8px;">
                            月人均营收
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getHealthLevel(score) {
        if (score >= 85) {
            return {
                class: 'health-excellent',
                label: '🌟 优秀',
                color: '#10b981',
                bgColor: '#d1fae5',
                description: '经营状况优秀，保持良好势头'
            };
        }
        if (score >= 70) {
            return {
                class: 'health-good',
                label: '✅ 良好',
                color: '#3b82f6',
                bgColor: '#dbeafe',
                description: '经营状况良好，有提升空间'
            };
        }
        if (score >= 60) {
            return {
                class: 'health-warning',
                label: '⚠️ 待改善',
                color: '#f59e0b',
                bgColor: '#fef3c7',
                description: '需要关注部分经营指标'
            };
        }
        return {
            class: 'health-danger',
            label: '🚨 警示',
            color: '#ef4444',
            bgColor: '#fee2e2',
            description: '经营状况需要重点改善'
        };
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

    // ==================== 总盈利评分算法 (Profitability Score) ====================

    // 业态差异化配置（平均工资和基准价格）
    getBusinessTypeConfig(businessType) {
        const configs = {
            '快餐': {
                avgWage: 4500,      // 平均工资 元/月
                basePrice: 35       // 基准客单价 元
            },
            '正餐': {
                avgWage: 5500,
                basePrice: 70
            },
            '火锅': {
                avgWage: 6000,
                basePrice: 100
            },
            '其他': {
                avgWage: 5000,
                basePrice: 50
            }
        };

        return configs[businessType] || configs['其他'];
    }

    // 行业基线带宽配置（正餐+中档+二类商场档位）
    getProfitabilityBaselines() {
        return {
            net_margin: { min: 5, ideal: 15, max: 25 },        // 净利率 %
            gross_margin: { min: 55, ideal: 65, max: 75 },     // 毛利率 %
            cost_rate: { min: 65, ideal: 75, max: 85 },        // 综合成本率 % (反向)
            online_boost: { min: 0, ideal: 5, max: 15 },       // 线上对毛利的拉动 %
            price_volatility: { min: 0, ideal: 10, max: 25 },  // 客单价波动 % (反向) - 已优化标准
            revenue_per_sqm: { min: 800, ideal: 1200, max: 2000 }, // 坪效 元/㎡
            revenue_per_labor: { min: 18000, ideal: 30000, max: 45000 }, // 人效 元/人 - 已优化标准
            resilience_months: { min: -3, ideal: 0, max: 3 }   // 收益韧性 连续下行月数 (反向)
        };
    }

    // 权重配置（分层权重：财务主导 + 效率与结构校正）
    getProfitabilityWeights() {
        return {
            net_margin: 0.25,          // 净利率 - 核心权重
            gross_margin: 0.20,        // 毛利率 - 核心权重
            cost_rate: 0.20,           // 综合成本率 - 核心权重
            online_boost: 0.08,        // 线上拉动
            price_volatility: 0.07,    // 价格稳定性
            revenue_per_sqm: 0.10,     // 坪效
            revenue_per_labor: 0.10    // 人效
            // resilience_months 作为惩罚项，不计入权重
        };
    }

    // 获取默认的盈利评分结果（当计算失败时使用）
    getDefaultProfitabilityResult() {
        return {
            score: 0,
            level: '数据不足',
            levelClass: 'warning',
            levelColor: '#9ca3af',
            levelBg: '#f3f4f6',
            description: '数据不足，无法计算盈利评分',
            indicators: {},
            normalized: {},
            penalty: 0,
            topFactors: [],
            bottomFactors: []
        };
    }

    // 区间标准化函数（映射到 20-100，避免过度惩罚）
    normalizeToRange(value, baseline, inverse = false) {
        const { min, ideal, max } = baseline;

        // 🔧 防御性检查：如果 value 不是有效数字，返回 20（最低保底分）
        if (!isFinite(value) || isNaN(value)) {
            console.warn('⚠️ normalizeToRange 收到无效值:', value);
            return 20;
        }

        let result;

        if (inverse) {
            // 反向指标（越低越好，如成本率）
            if (value <= min) {
                result = 100;  // 优秀水平
            } else if (value >= max) {
                result = 20;   // 最低保底分（而非 0）
            } else if (value <= ideal) {
                // min → ideal: 100 → 80（轻微下降 -20 分）
                result = 100 - ((value - min) / (ideal - min)) * 20;
            } else {
                // ideal → max: 80 → 20（快速下降 -60 分）
                result = 80 - ((value - ideal) / (max - ideal)) * 60;
            }
        } else {
            // 正向指标（越高越好）
            if (value <= min) {
                result = 20;   // 最低保底分（而非 0）
            } else if (value >= max) {
                result = 100;  // 优秀水平
            } else if (value <= ideal) {
                // min → ideal: 20 → 80（快速增长 +60 分）
                result = 20 + ((value - min) / (ideal - min)) * 60;
            } else {
                // ideal → max: 80 → 100（轻微增长 +20 分）
                result = 80 + ((value - ideal) / (max - ideal)) * 20;
            }
        }

        // 🔧 确保返回值是有效数字且在 [20, 100] 范围内
        if (!isFinite(result) || isNaN(result)) {
            console.error('❌ normalizeToRange 计算出 NaN:', { value, baseline, inverse, result });
            return 20;
        }

        return Math.max(20, Math.min(100, result));
    }

    // 计算总盈利评分
    calculateProfitabilityScore(data, kpi, historicalData = null) {
        // 防御性检查
        if (!data || !kpi) {
            console.error('❌ calculateProfitabilityScore: data 或 kpi 参数缺失', { data, kpi });
            return this.getDefaultProfitabilityResult();
        }

        console.log('🔍 calculateProfitabilityScore 输入参数:', {
            data字段: Object.keys(data),
            kpi字段: Object.keys(kpi),
            关键数据: {
                store_area: data.store_area,
                seats: data.seats,
                total_customers: data.total_customers,
                online_revenue: data.online_revenue,
                'kpi.avg_spending': kpi.avg_spending,
                'kpi.takeaway_ratio': kpi.takeaway_ratio
            }
        });

        const monthlyRevenue = Number(data.monthly_revenue) || 0;
        const foodCost = Number(data.food_cost) || 0;
        const laborCost = Number(data.labor_cost) || 0;
        const rentCost = Number(data.rent_cost) || 0;
        const marketingCost = Number(data.marketing_cost) || 0;
        const utilityCost = Number(data.utility_cost) || 0;
        const totalCost = foodCost + laborCost + rentCost + marketingCost + utilityCost;

        const area = Number(data.store_area) || 120;
        const seats = Number(data.seats) || 50;

        // 🔧 获取业态差异化配置（平均工资和基准价格）
        const businessType = data.business_type || '其他';
        const btConfig = this.getBusinessTypeConfig(businessType);
        const avgWage = btConfig.avgWage;      // 业态相关的平均工资
        const basePrice = btConfig.basePrice;  // 业态相关的基准客单价

        console.log('📌 业态配置:', { businessType, avgWage, basePrice });

        // 计算各项指标
        const indicators = {
            net_margin: monthlyRevenue > 0 ? ((monthlyRevenue - totalCost) / monthlyRevenue * 100) : 0,
            gross_margin: monthlyRevenue > 0 ? ((monthlyRevenue - foodCost) / monthlyRevenue * 100) : 0,
            cost_rate: monthlyRevenue > 0 ? (totalCost / monthlyRevenue * 100) : 0,
            online_boost: ((kpi && kpi.takeaway_ratio) || 0.3) * 100 * 0.15, // 简化：线上占比 * 拉动系数
            price_volatility: Math.abs(((kpi && kpi.avg_spending) || basePrice) - basePrice) / basePrice * 100, // ✅ 使用业态基准价格
            revenue_per_sqm: area > 0 ? monthlyRevenue / area : 0,
            revenue_per_labor: laborCost > 0 ? monthlyRevenue / (laborCost / avgWage) : 0, // ✅ 使用业态平均工资
            resilience_months: 0 // 需要历史数据，暂时为0
        };

        // 获取基线和权重
        const baselines = this.getProfitabilityBaselines();
        const weights = this.getProfitabilityWeights();

        // 标准化各项指标
        const normalized = {
            net_margin: this.normalizeToRange(indicators.net_margin, baselines.net_margin, false),
            gross_margin: this.normalizeToRange(indicators.gross_margin, baselines.gross_margin, false),
            cost_rate: this.normalizeToRange(indicators.cost_rate, baselines.cost_rate, true),
            online_boost: this.normalizeToRange(indicators.online_boost, baselines.online_boost, false),
            price_volatility: this.normalizeToRange(indicators.price_volatility, baselines.price_volatility, true),
            revenue_per_sqm: this.normalizeToRange(indicators.revenue_per_sqm, baselines.revenue_per_sqm, false),
            revenue_per_labor: this.normalizeToRange(indicators.revenue_per_labor, baselines.revenue_per_labor, false)
        };

        // 加权求和
        let weightedScore = 0;
        for (const key in weights) {
            weightedScore += normalized[key] * weights[key];
        }

        console.log('📊 盈利评分计算过程:', {
            indicators,
            normalized,
            weights,
            weightedScore
        });

        // 惩罚机制
        let penalty = 0;

        // 1. 关键指标突破警戒线惩罚
        if (indicators.net_margin < 5) {
            penalty += 10; // 净利率低于5%
        }
        if (indicators.cost_rate > 85) {
            penalty += 10; // 成本率高于85%
        }

        // 2. 连续下行惩罚（需要历史数据，这里简化处理）
        if (indicators.resilience_months < -2) {
            penalty += 5 * Math.abs(indicators.resilience_months + 2); // 每多一个月惩罚5分
        }

        // 最终评分
        let finalScore = Math.max(0, Math.min(100, weightedScore - penalty));

        // 🔧 修复 NaN 问题：如果计算结果为 NaN，使用 0 作为默认值
        if (isNaN(finalScore) || !isFinite(finalScore)) {
            console.error('⚠️ finalScore 计算异常，使用默认值 0', { weightedScore, penalty, finalScore });
            finalScore = 0;
        }

        console.log('✅ 最终评分 (finalScore):', finalScore, '类型:', typeof finalScore, 'isNaN:', isNaN(finalScore));

        // 等级标签 - 根据 finalScore 区间分类
        let level, levelClass, levelColor, levelBg, description;
        if (finalScore >= 80) {
            level = '优秀';
            levelClass = 'excellent';
            levelColor = '#10b981';
            levelBg = '#d1fae5';
            description = '盈利能力优秀，经营体质健康';
        } else if (finalScore >= 65) {
            level = '良好';
            levelClass = 'good';
            levelColor = '#3b82f6';
            levelBg = '#dbeafe';
            description = '盈利能力良好，有提升空间';
        } else if (finalScore >= 50) {
            level = '警戒';
            levelClass = 'warning';
            levelColor = '#f59e0b';
            levelBg = '#fef3c7';
            description = '盈利能力偏弱，需重点关注';
        } else {
            level = '危险';
            levelClass = 'danger';
            levelColor = '#ef4444';
            levelBg = '#fee2e2';
            description = '盈利能力严重不足，需紧急改善';
        }

        // 识别关键拉动/拖累因子
        const factors = [];
        const sortedNormalized = Object.entries(normalized)
            .map(([key, value]) => ({ key, value, weight: weights[key] || 0, impact: value * (weights[key] || 0) }))
            .sort((a, b) => b.impact - a.impact);

        // 前2个拉动因子
        const topFactors = sortedNormalized.slice(0, 2);
        // 后2个拖累因子
        const bottomFactors = sortedNormalized.slice(-2).reverse();

        const factorNames = {
            net_margin: '净利率',
            gross_margin: '毛利率',
            cost_rate: '综合成本率',
            online_boost: '线上拉动',
            price_volatility: '价格稳定性',
            revenue_per_sqm: '坪效',
            revenue_per_labor: '人效'
        };

        console.log('📍 准备构建返回对象, finalScore=', finalScore, 'level=', level);

        const result = {
            score: Math.round(finalScore),
            level,
            levelClass,
            levelColor,
            levelBg,
            description,
            indicators,
            normalized,
            penalty,
            topFactors: topFactors.map(f => ({
                name: factorNames[f.key] || f.key || '未知指标',
                score: Math.round(f.value || 0),
                impact: Math.round((f.impact || 0) * 100) / 100
            })),
            bottomFactors: bottomFactors.map(f => ({
                name: factorNames[f.key] || f.key || '未知指标',
                score: Math.round(f.value || 0),
                impact: Math.round((f.impact || 0) * 100) / 100
            }))
        };

        console.log('🎯 calculateProfitabilityScore 返回值:', result);
        console.log('🎯 返回对象的 score:', result.score, 'level:', result.level);

        return result;
    }

    // 生成模拟历史趋势数据（12周）
    generateTrendData(currentValue, volatility = 0.1) {
        const data = [];
        let value = currentValue * (1 - volatility * 6); // 从较低值开始
        for (let i = 0; i < 12; i++) {
            const change = (Math.random() - 0.45) * volatility * currentValue;
            value = Math.max(0, value + change + currentValue * volatility * 0.5);
            data.push(Math.round(value));
        }
        data[11] = currentValue; // 确保最后一个值是当前值
        return data;
    }

    // 生成迷你趋势线SVG
    generateSparkline(data, color = '#3b82f6', isPercentage = false) {
        const width = 60;
        const height = 24;
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;

        const points = data.map((val, idx) => {
            const x = (idx / (data.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            return `${x},${y}`;
        }).join(' ');

        const trend = data[data.length - 1] > data[0] ? '↑' : data[data.length - 1] < data[0] ? '↓' : '→';
        const trendColor = data[data.length - 1] > data[0] ? '#10b981' : data[data.length - 1] < data[0] ? '#ef4444' : '#6b7280';

        return `
            <div style="display: flex; align-items: center; gap: 4px;">
                <svg width="${width}" height="${height}" style="display: block;">
                    <polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span style="font-size: 14px; color: ${trendColor};">${trend}</span>
            </div>
        `;
    }

    // 检测异常（偏离基线）
    detectAnomaly(current, baseline, threshold = 0.15) {
        const deviation = Math.abs(current - baseline) / baseline;
        if (deviation > threshold * 2) return { status: 'danger', color: '#ef4444', border: '3px solid #ef4444' };
        if (deviation > threshold) return { status: 'warning', color: '#f59e0b', border: '3px solid #f59e0b' };
        return { status: 'normal', color: '#10b981', border: '3px solid #e5e7eb' };
    }

    generateDashboardSection(kpi, data) {
        // 防御性检查：确保 kpi 对象存在
        if (!kpi) {
            console.error('❌ generateDashboardSection: kpi 参数缺失', kpi);
            kpi = {
                avg_spending: 50,
                table_turnover: 3.0,
                takeaway_ratio: 0.3,
                rating: 4.2
            };
        }

        // 🔧 强制转换为数字，避免字符串拼接问题
        const monthlyRevenue = Number(data.monthly_revenue) || 0;
        const foodCost = Number(data.food_cost) || 0;
        const laborCost = Number(data.labor_cost) || 0;
        const rentCost = Number(data.rent_cost) || 0;
        const marketingCost = Number(data.marketing_cost) || 0;
        const utilityCost = Number(data.utility_cost) || 0;

        // ✅ 计算总成本（确保数字相加，不是字符串拼接）
        const totalCost = foodCost + laborCost + rentCost + marketingCost + utilityCost;

        // 📊 调试日志（在浏览器控制台查看）
        console.log('💰 核心经营指标计算 - Dashboard KPI:', {
            原始数据类型检查: {
                monthly_revenue: typeof data.monthly_revenue,
                food_cost: typeof data.food_cost,
                labor_cost: typeof data.labor_cost
            },
            转换后的数值: {
                monthlyRevenue: `${typeof monthlyRevenue} = ${monthlyRevenue}`,
                foodCost: `${typeof foodCost} = ${foodCost}`,
                laborCost: `${typeof laborCost} = ${laborCost}`,
                rentCost: `${typeof rentCost} = ${rentCost}`,
                marketingCost: `${typeof marketingCost} = ${marketingCost}`,
                utilityCost: `${typeof utilityCost} = ${utilityCost}`,
                totalCost: `${typeof totalCost} = ${totalCost}`
            },
            关键指标计算结果: {
                毛利率: ((monthlyRevenue - foodCost) / monthlyRevenue * 100).toFixed(2) + '%',
                净利率: ((monthlyRevenue - totalCost) / monthlyRevenue * 100).toFixed(2) + '%',
                综合成本率: (totalCost / monthlyRevenue * 100).toFixed(2) + '%'
            }
        });

        // 计算9个核心KPI
        const kpis = [
            {
                id: 'revenue',
                name: '营收',
                icon: '💰',
                value: monthlyRevenue,
                unit: '元',
                format: val => '¥' + this.formatNumber(val),
                mom: -3.2, // 环比（模拟数据）
                yoy: 12.5, // 同比（模拟数据）
                baseline: monthlyRevenue * 0.95,
                trend: this.generateTrendData(monthlyRevenue, 0.08),
                color: '#3b82f6'
            },
            {
                id: 'gross_margin',
                name: '毛利率',
                icon: '📊',
                value: monthlyRevenue > 0 ? ((monthlyRevenue - foodCost) / monthlyRevenue * 100) : 0,
                unit: '%',
                format: val => val.toFixed(1) + '%',
                mom: 1.2,
                yoy: -2.3,
                baseline: 58,
                trend: this.generateTrendData(monthlyRevenue > 0 ? ((monthlyRevenue - foodCost) / monthlyRevenue * 100) : 0, 0.05),
                color: '#10b981'
            },
            {
                id: 'net_margin',
                name: '净利率',
                icon: '💎',
                value: monthlyRevenue > 0 ? ((monthlyRevenue - totalCost) / monthlyRevenue * 100) : 0,
                unit: '%',
                format: val => val.toFixed(1) + '%',
                mom: -0.8,
                yoy: 3.5,
                baseline: 15,
                trend: this.generateTrendData(monthlyRevenue > 0 ? ((monthlyRevenue - totalCost) / monthlyRevenue * 100) : 0, 0.08),
                color: '#8b5cf6'
            },
            {
                id: 'cost_rate',
                name: '综合成本率',
                icon: '📉',
                value: monthlyRevenue > 0 ? (totalCost / monthlyRevenue * 100) : 0,
                unit: '%',
                format: val => val.toFixed(1) + '%',
                mom: 2.1,
                yoy: -1.5,
                baseline: 75,
                trend: this.generateTrendData(monthlyRevenue > 0 ? (totalCost / monthlyRevenue * 100) : 0, 0.05),
                color: '#f59e0b',
                inverse: true // 越低越好
            },
            {
                id: 'daily_customers',
                name: '日均客流',
                icon: '👥',
                value: data.daily_customers || Math.round(monthlyRevenue / 30 / 50),
                unit: '人',
                format: val => this.formatNumber(Math.round(val)) + '人',
                mom: -5.3,
                yoy: 8.2,
                baseline: (data.daily_customers || Math.round(monthlyRevenue / 30 / 50)) * 1.05,
                trend: this.generateTrendData(data.daily_customers || Math.round(monthlyRevenue / 30 / 50), 0.12),
                color: '#ec4899'
            },
            {
                id: 'avg_spending',
                name: '客单价',
                icon: '🎫',
                value: kpi.avg_spending || 50,
                unit: '元',
                format: val => '¥' + Math.round(val),
                mom: 2.8,
                yoy: 5.6,
                baseline: (kpi.avg_spending || 50) * 0.98,
                trend: this.generateTrendData(kpi.avg_spending || 50, 0.06),
                color: '#ef4444'
            },
            {
                id: 'table_turnover',
                name: '翻台率',
                icon: '🔄',
                value: kpi.table_turnover || 3.0,
                unit: '次/天',
                format: val => val.toFixed(1) + '次',
                mom: -1.5,
                yoy: 4.2,
                baseline: 3.5,
                trend: this.generateTrendData((kpi.table_turnover || 3.0) * 10, 0.08).map(v => v / 10),
                color: '#06b6d4'
            },
            {
                id: 'online_ratio',
                name: '线上占比',
                icon: '📱',
                value: (kpi.takeaway_ratio || 0.3) * 100,
                unit: '%',
                format: val => val.toFixed(1) + '%',
                mom: 3.5,
                yoy: 15.8,
                baseline: 35,
                trend: this.generateTrendData((kpi.takeaway_ratio || 0.3) * 100, 0.1),
                color: '#8b5cf6'
            },
            {
                id: 'rating',
                name: '平均评分',
                icon: '⭐',
                value: kpi.review_score || 4.5,
                unit: '分',
                format: val => val.toFixed(1) + '分',
                mom: 0.2,
                yoy: 0.5,
                baseline: 4.3,
                trend: this.generateTrendData((kpi.review_score || 4.5) * 10, 0.03).map(v => v / 10),
                color: '#f59e0b'
            }
        ];

        // 生成KPI卡片HTML
        const kpiCards = kpis.map(kpi => {
            const anomaly = this.detectAnomaly(kpi.value, kpi.baseline);

            return `
                <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: ${anomaly.border}; transition: all 0.3s;">
                    <!-- 标题行 -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 24px;">${kpi.icon}</span>
                            <span style="font-size: 13px; color: #6b7280; font-weight: 500;">${kpi.name}</span>
                        </div>
                        ${anomaly.status !== 'normal' ? `<span style="font-size: 18px;">${anomaly.status === 'danger' ? '🚨' : '⚠️'}</span>` : ''}
                    </div>

                    <!-- 主值 -->
                    <div style="font-size: 32px; font-weight: 700; color: ${kpi.color}; line-height: 1;">
                        ${kpi.format(kpi.value)}
                    </div>
                </div>
            `;
        }).join('');

        // 计算总盈利评分
        let profitabilityResult;
        try {
            profitabilityResult = this.calculateProfitabilityScore(data, kpi);
            console.log('✅ 总盈利评分计算成功:', profitabilityResult);
        } catch (error) {
            console.error('❌ 总盈利评分计算失败:', error);
            profitabilityResult = this.getDefaultProfitabilityResult();
        }

        return `
            <div class="diagnosis-section" style="background: #f9fafb; padding: 24px; border-radius: 16px; margin: 24px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; font-size: 24px; font-weight: 700; color: #1f2937;">📊 核心经营指标总览</h3>
                    <div style="display: flex; gap: 8px; font-size: 12px;">
                        <span style="display: flex; align-items: center; gap: 4px; color: #6b7280;">
                            <span style="width: 12px; height: 12px; background: #10b981; border-radius: 2px;"></span>
                            正常
                        </span>
                        <span style="display: flex; align-items: center; gap: 4px; color: #6b7280;">
                            <span style="width: 12px; height: 12px; background: #f59e0b; border-radius: 2px;"></span>
                            预警
                        </span>
                        <span style="display: flex; align-items: center; gap: 4px; color: #6b7280;">
                            <span style="width: 12px; height: 12px; background: #ef4444; border-radius: 2px;"></span>
                            异常
                        </span>
                    </div>
                </div>

                <!-- 总盈利评分卡片 -->
                <div style="background: linear-gradient(135deg, ${profitabilityResult.levelColor} 0%, ${profitabilityResult.levelColor}dd 100%); border-radius: 16px; padding: 32px; margin-bottom: 24px; color: white; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">
                    <div style="display: grid; grid-template-columns: 2fr 3fr; gap: 32px;">
                        <!-- 左侧：评分展示 -->
                        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; background: rgba(255,255,255,0.15); border-radius: 12px; padding: 24px; backdrop-filter: blur(10px);">
                            <div style="font-size: 16px; font-weight: 500; margin-bottom: 12px; opacity: 0.9;">总盈利评分</div>
                            <div style="font-size: 72px; font-weight: 700; line-height: 1; margin-bottom: 12px;">${profitabilityResult.score}</div>
                            <div style="font-size: 14px; opacity: 0.8; margin-bottom: 16px;">满分100分</div>
                            <div style="display: inline-block; padding: 8px 20px; background: rgba(255,255,255,0.95); color: ${profitabilityResult.levelColor}; border-radius: 20px; font-weight: 600; font-size: 16px;">
                                ${profitabilityResult.level}
                            </div>
                            <div style="margin-top: 12px; font-size: 12px; opacity: 0.9; text-align: center;">${profitabilityResult.description}</div>
                        </div>

                        <!-- 右侧：拉动与拖累因子 -->
                        <div>
                            <div style="margin-bottom: 20px;">
                                <div style="font-size: 14px; font-weight: 600; margin-bottom: 12px; opacity: 0.9;">🚀 关键拉动因子</div>
                                <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; backdrop-filter: blur(10px);">
                                    ${(profitabilityResult.topFactors && profitabilityResult.topFactors.length > 0) ? profitabilityResult.topFactors.map((factor, idx) => `
                                        <div style="display: flex; justify-content: space-between; align-items: center; ${idx > 0 ? 'margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.2);' : ''}">
                                            <div>
                                                <div style="font-weight: 600;">${idx + 1}. ${factor.name || '未知'}</div>
                                                <div style="font-size: 12px; opacity: 0.8; margin-top: 2px;">贡献度: ${(factor.impact || 0).toFixed(2)}</div>
                                            </div>
                                            <div style="font-size: 24px; font-weight: 700;">${factor.score || 0}分</div>
                                        </div>
                                    `).join('') : '<div style="text-align: center; opacity: 0.7;">暂无数据</div>'}
                                </div>
                            </div>

                            <div>
                                <div style="font-size: 14px; font-weight: 600; margin-bottom: 12px; opacity: 0.9;">⚠️ 主要拖累因子</div>
                                <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; backdrop-filter: blur(10px);">
                                    ${(profitabilityResult.bottomFactors && profitabilityResult.bottomFactors.length > 0) ? profitabilityResult.bottomFactors.map((factor, idx) => `
                                        <div style="display: flex; justify-content: space-between; align-items: center; ${idx > 0 ? 'margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.2);' : ''}">
                                            <div>
                                                <div style="font-weight: 600;">${idx + 1}. ${factor.name || '未知'}</div>
                                                <div style="font-size: 12px; opacity: 0.8; margin-top: 2px;">影响度: ${(factor.impact || 0).toFixed(2)}</div>
                                            </div>
                                            <div style="font-size: 24px; font-weight: 700;">${factor.score || 0}分</div>
                                        </div>
                                    `).join('') : '<div style="text-align: center; opacity: 0.7;">暂无数据</div>'}
                                </div>
                            </div>

                            ${profitabilityResult.penalty > 0 ? `
                                <div style="margin-top: 16px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 12px; backdrop-filter: blur(10px);">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="font-size: 20px;">🚨</span>
                                        <div>
                                            <div style="font-weight: 600; font-size: 13px;">警戒惩罚</div>
                                            <div style="font-size: 12px; opacity: 0.9; margin-top: 2px;">扣除 ${profitabilityResult.penalty} 分（关键指标低于警戒线）</div>
                                        </div>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <!-- 九宫格KPI卡片 -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                    ${kpiCards}
                </div>
            </div>
        `;
    }

    // 🪶 VIBE CODING - 成本结构分析（感知型数据系统）
    generateCostAnalysisSection(data, kpi) {
        const monthlyRevenue = Number(data.monthly_revenue) || 0;
        const foodCost = Number(data.food_cost) || 0;
        const laborCost = Number(data.labor_cost) || 0;
        const rentCost = Number(data.rent_cost) || 0;
        const utilityCost = Number(data.utility_cost) || 0;
        const marketingCost = Number(data.marketing_cost) || 0;

        const totalCost = foodCost + laborCost + rentCost + utilityCost + marketingCost;
        const netProfit = monthlyRevenue - totalCost;

        // 计算成本率（定量层）
        const costItems = [
            { name: '食材成本', value: foodCost, rate: monthlyRevenue > 0 ? (foodCost / monthlyRevenue * 100) : 0, icon: '🥬', baseline: 35, id: 'food' },
            { name: '人力成本', value: laborCost, rate: monthlyRevenue > 0 ? (laborCost / monthlyRevenue * 100) : 0, icon: '👨‍🍳', baseline: 30, id: 'labor' },
            { name: '租金成本', value: rentCost, rate: monthlyRevenue > 0 ? (rentCost / monthlyRevenue * 100) : 0, icon: '🏠', baseline: 18, id: 'rent' },
            { name: '水电气', value: utilityCost, rate: monthlyRevenue > 0 ? (utilityCost / monthlyRevenue * 100) : 0, icon: '⚡', baseline: 5, id: 'utility' },
            { name: '营销费用', value: marketingCost, rate: monthlyRevenue > 0 ? (marketingCost / monthlyRevenue * 100) : 0, icon: '📱', baseline: 7, id: 'marketing' }
        ];

        const totalCostRate = monthlyRevenue > 0 ? (totalCost / monthlyRevenue * 100) : 0;
        const netMarginRate = monthlyRevenue > 0 ? (netProfit / monthlyRevenue * 100) : 0;

        // 算法语义层：生成诊断标签和自然语言解释
        const diagnosis = this.generateCostDiagnosis(costItems, totalCostRate, netMarginRate, monthlyRevenue);

        // 🧠 高级算法层：成本分类、敏感度、健康指数、优化优先级
        const classification = this.classifyCosts(costItems, monthlyRevenue);
        const sensitivity = this.calculateSensitivity(monthlyRevenue, totalCost, classification);
        const healthIndex = this.calculateStructuralHealthIndex(costItems, totalCostRate, netMarginRate, classification);
        const optimizations = this.prioritizeOptimizations(costItems, totalCostRate, monthlyRevenue, classification);

        return `
            <!-- 🪶 VIBE CODING: Cost Architecture -->
            <div style="
                background: linear-gradient(135deg, #18181B 0%, #27272A 100%);
                border-radius: 24px;
                padding: 40px;
                margin: 32px 0;
                position: relative;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                animation: sectionFadeIn 300ms ease-out;
            ">
                <!-- 背景光晕效果 -->
                <div style="
                    position: absolute;
                    top: -50%;
                    right: -10%;
                    width: 400px;
                    height: 400px;
                    background: radial-gradient(circle, ${diagnosis.glowColor}15 0%, transparent 70%);
                    filter: blur(60px);
                    animation: breathe 3s ease-in-out infinite;
                    pointer-events: none;
                "></div>

                <!-- 标题区 -->
                <div style="position: relative; z-index: 1; margin-bottom: 32px;">
                    <h3 style="
                        font-size: 28px;
                        font-weight: 700;
                        color: #FAFAFA;
                        margin: 0 0 12px 0;
                        letter-spacing: -0.5px;
                    ">💰 成本流入路径</h3>
                    <p style="
                        font-size: 14px;
                        color: #A1A1AA;
                        margin: 0;
                        font-weight: 400;
                    ">Cost Architecture · 数据有呼吸，成本有节奏</p>
                </div>

                <!-- 成本瀑布流 (Cost Waterfall) -->
                <div style="position: relative; z-index: 1;">
                    ${this.generateCostWaterfall(monthlyRevenue, costItems, netProfit, diagnosis)}
                </div>

                <!-- 诊断卡片区 -->
                <div style="
                    position: relative;
                    z-index: 1;
                    margin-top: 32px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                ">
                    <!-- 定量值卡片 -->
                    <div style="
                        background: rgba(255,255,255,0.03);
                        border: 1px solid rgba(255,255,255,0.08);
                        border-radius: 16px;
                        padding: 24px;
                        transition: all 300ms ease;
                    " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 32px rgba(0,0,0,0.3)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                        <div style="font-size: 13px; color: #71717A; font-weight: 500; margin-bottom: 12px;">
                            QUANTITATIVE · 定量值
                        </div>
                        <div style="font-size: 36px; font-weight: 700; color: ${diagnosis.quantitativeColor}; margin-bottom: 8px;">
                            ${totalCostRate.toFixed(1)}%
                        </div>
                        <div style="font-size: 14px; color: #A1A1AA;">
                            综合成本率 · ${netMarginRate >= 0 ? '利润空间 +' + netMarginRate.toFixed(1) + '%' : '亏损 ' + netMarginRate.toFixed(1) + '%'}
                        </div>
                    </div>

                    <!-- 诊断标签卡片 -->
                    <div style="
                        background: rgba(255,255,255,0.03);
                        border: 1px solid rgba(255,255,255,0.08);
                        border-radius: 16px;
                        padding: 24px;
                        transition: all 300ms ease;
                    " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 32px rgba(0,0,0,0.3)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                        <div style="font-size: 13px; color: #71717A; font-weight: 500; margin-bottom: 12px;">
                            SEMANTIC · 诊断标签
                        </div>
                        <div style="
                            display: inline-flex;
                            align-items: center;
                            gap: 8px;
                            padding: 10px 20px;
                            background: ${diagnosis.semanticBg};
                            border: 1px solid ${diagnosis.semanticBorder};
                            border-radius: 999px;
                            font-size: 15px;
                            font-weight: 600;
                            color: ${diagnosis.semanticColor};
                            animation: pulseGlow 3s ease-in-out infinite;
                        ">
                            <span style="font-size: 18px;">${diagnosis.semanticIcon}</span>
                            ${diagnosis.semanticLabel}
                        </div>
                    </div>
                </div>

                <!-- 自然语言解释卡片 -->
                <div style="
                    position: relative;
                    z-index: 1;
                    margin-top: 20px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 16px;
                    padding: 28px;
                    transition: all 300ms ease;
                " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 32px rgba(0,0,0,0.3)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                    <div style="font-size: 13px; color: #71717A; font-weight: 500; margin-bottom: 16px;">
                        NARRATIVE · 自然语言洞察
                    </div>
                    <div style="
                        font-size: 15px;
                        color: #D4D4D8;
                        line-height: 1.8;
                        font-weight: 400;
                    ">
                        ${diagnosis.narrative}
                    </div>
                    ${diagnosis.suggestions.length > 0 ? `
                        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.08);">
                            <div style="font-size: 13px; color: #A1A1AA; margin-bottom: 12px;">
                                建议与共识
                            </div>
                            ${diagnosis.suggestions.map(s => `
                                <div style="
                                    display: flex;
                                    align-items: flex-start;
                                    gap: 12px;
                                    margin-bottom: 10px;
                                    font-size: 14px;
                                    color: #A1A1AA;
                                ">
                                    <span style="color: ${s.color}; font-size: 16px; margin-top: 2px;">${s.icon}</span>
                                    <span>${s.text}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>

                <!-- 🧠 高级分析模块 -->
                ${this.generateAdvancedAnalysisModules(classification, sensitivity, healthIndex, optimizations, monthlyRevenue)}
            </div>

            <!-- 添加关键帧动画 -->
            <style>
                @keyframes sectionFadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes breathe {
                    0%, 100% {
                        opacity: 0.6;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.1);
                    }
                }

                @keyframes pulseGlow {
                    0%, 100% {
                        box-shadow: 0 0 0 rgba(255,255,255,0);
                    }
                    50% {
                        box-shadow: 0 0 20px rgba(255,255,255,0.1);
                    }
                }

                @keyframes flowIn {
                    from {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            </style>
        `;
    }

    // 生成成本瀑布图
    generateCostWaterfall(revenue, costItems, netProfit, diagnosis) {
        let currentLevel = revenue;
        const maxHeight = 300;

        let html = `
            <div style="background: rgba(255,255,255,0.02); border-radius: 16px; padding: 24px;">
                <!-- 瀑布图标题 -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <div style="font-size: 15px; color: #FAFAFA; font-weight: 600;">
                        成本流入路径 · Waterfall View
                    </div>
                    <div style="font-size: 13px; color: #71717A;">
                        从营收到净利的完整路径
                    </div>
                </div>

                <!-- 起点：总营收 -->
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 12px;
                    animation: flowIn 300ms ease-out;
                ">
                    <div style="
                        min-width: 120px;
                        font-size: 14px;
                        color: #A1A1AA;
                        font-weight: 500;
                        text-align: right;
                    ">营业收入</div>
                    <div style="flex: 1; height: 48px; background: linear-gradient(90deg, #2DD4BF 0%, #14B8A6 100%); border-radius: 8px; position: relative; box-shadow: 0 0 20px rgba(45,212,191,0.3); display: flex; align-items: center; justify-content: space-between; padding: 0 20px; transition: all 300ms ease;" onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 0 30px rgba(45,212,191,0.5)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 0 20px rgba(45,212,191,0.3)';">
                        <span style="font-size: 15px; color: white; font-weight: 600;">¥${this.formatNumber(revenue)}</span>
                        <span style="font-size: 12px; color: rgba(255,255,255,0.8);">100.0%</span>
                    </div>
                </div>`;

        // 成本项流入
        costItems.forEach((item, index) => {
            currentLevel -= item.value;
            const percentage = revenue > 0 ? (item.value / revenue * 100) : 0;
            const widthPercent = revenue > 0 ? (item.value / revenue * 100) : 0;

            // 根据成本率判断状态颜色
            let barColor, barGradient, glowColor, statusEmoji;
            if (item.rate > item.baseline * 1.2) {
                // 超出基线20%：柔红
                barColor = '#FCA5A5';
                barGradient = 'linear-gradient(90deg, #FCA5A5 0%, #EF4444 100%)';
                glowColor = 'rgba(252,165,165,0.3)';
                statusEmoji = '⚠️';
            } else if (item.rate < item.baseline * 0.9) {
                // 低于基线10%：轻绿
                barColor = '#6EE7B7';
                barGradient = 'linear-gradient(90deg, #6EE7B7 0%, #10B981 100%)';
                glowColor = 'rgba(110,231,183,0.3)';
                statusEmoji = '✓';
            } else {
                // 平稳：淡蓝
                barColor = '#93C5FD';
                barGradient = 'linear-gradient(90deg, #93C5FD 0%, #60A5FA 100%)';
                glowColor = 'rgba(147,197,253,0.3)';
                statusEmoji = '•';
            }

            html += `
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 12px;
                    animation: flowIn 300ms ease-out ${(index + 1) * 100}ms backwards;
                ">
                    <div style="
                        min-width: 120px;
                        font-size: 14px;
                        color: #A1A1AA;
                        font-weight: 500;
                        text-align: right;
                        display: flex;
                        align-items: center;
                        justify-content: flex-end;
                        gap: 6px;
                    ">
                        <span style="font-size: 16px;">${item.icon}</span>
                        <span>${item.name}</span>
                    </div>
                    <div style="
                        flex: 1;
                        height: 40px;
                        background: ${barGradient};
                        border-radius: 8px;
                        width: ${widthPercent}%;
                        max-width: 100%;
                        position: relative;
                        box-shadow: 0 0 15px ${glowColor};
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 0 16px;
                        transition: all 300ms ease;
                        cursor: pointer;
                    " onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 0 25px ${glowColor}, 0 4px 12px rgba(0,0,0,0.2)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 0 15px ${glowColor}';">
                        <span style="font-size: 14px; color: white; font-weight: 600;">¥${this.formatNumber(item.value)}</span>
                        <span style="font-size: 12px; color: rgba(255,255,255,0.9);">${statusEmoji} ${item.rate.toFixed(1)}%</span>
                    </div>
                </div>`;
        });

        // 终点：净利润
        const netMarginPercent = revenue > 0 ? Math.abs(netProfit / revenue * 100) : 0;
        const isProfitable = netProfit >= 0;

        html += `
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255,255,255,0.08);
                    animation: flowIn 300ms ease-out ${(costItems.length + 1) * 100}ms backwards;
                ">
                    <div style="
                        min-width: 120px;
                        font-size: 14px;
                        color: #FAFAFA;
                        font-weight: 600;
                        text-align: right;
                    ">${isProfitable ? '净利润' : '净亏损'}</div>
                    <div style="
                        flex: 1;
                        height: 48px;
                        background: ${isProfitable ? 'linear-gradient(90deg, #34D399 0%, #10B981 100%)' : 'linear-gradient(90deg, #F87171 0%, #DC2626 100%)'};
                        border-radius: 8px;
                        position: relative;
                        box-shadow: 0 0 20px ${isProfitable ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)'};
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 0 20px;
                        transition: all 300ms ease;
                    " onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 0 30px ${isProfitable ? 'rgba(52,211,153,0.6)' : 'rgba(248,113,113,0.6)'}';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 0 20px ${isProfitable ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)'}';">
                        <span style="font-size: 16px; color: white; font-weight: 700;">${isProfitable ? '¥' : '-¥'}${this.formatNumber(Math.abs(netProfit))}</span>
                        <span style="font-size: 13px; color: rgba(255,255,255,0.9);">${isProfitable ? '+' : ''}${(netMarginPercent * (isProfitable ? 1 : -1)).toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    // 生成成本诊断（算法语义层）
    generateCostDiagnosis(costItems, totalCostRate, netMarginRate, revenue) {
        // 定量值判断
        let quantitativeColor, semanticLabel, semanticIcon, semanticColor, semanticBg, semanticBorder, glowColor, narrative;
        let suggestions = [];

        if (totalCostRate > 100) {
            // 亏损状态
            quantitativeColor = '#FCA5A5';
            semanticLabel = '盈利空间承压';
            semanticIcon = '⚠️';
            semanticColor = '#FCA5A5';
            semanticBg = 'rgba(252,165,165,0.1)';
            semanticBorder = 'rgba(252,165,165,0.3)';
            glowColor = '#FCA5A5';

            narrative = `综合成本率 ${totalCostRate.toFixed(1)}%，收入暂时无法覆盖成本。`;

            // 分析哪些成本偏高
            const highCostItems = costItems.filter(item => item.rate > item.baseline * 1.2);
            if (highCostItems.length > 0) {
                const topItem = highCostItems.sort((a, b) => b.rate - a.rate)[0];
                narrative += `主要压力来自${topItem.name}（${topItem.rate.toFixed(1)}%），高于合理区间约 ${(topItem.rate - topItem.baseline).toFixed(1)} 个百分点。`;

                suggestions.push({
                    icon: '🎯',
                    color: '#60A5FA',
                    text: `${topItem.name}占比偏高，可以从供应链优化或流程改进入手。`
                });
            }

            suggestions.push({
                icon: '💡',
                color: '#34D399',
                text: '建议保持坪效与线上占比的优势，通过结构调整逐步改善利润空间。'
            });

        } else if (totalCostRate > 85) {
            // 警戒状态
            quantitativeColor = '#FCD34D';
            semanticLabel = '成本结构偏紧';
            semanticIcon = '○';
            semanticColor = '#FCD34D';
            semanticBg = 'rgba(252,211,77,0.1)';
            semanticBorder = 'rgba(252,211,77,0.3)';
            glowColor = '#FCD34D';

            narrative = `综合成本率 ${totalCostRate.toFixed(1)}%，利润空间约 ${netMarginRate.toFixed(1)}%，处于紧平衡状态。`;

            const improvableItems = costItems.filter(item => item.rate > item.baseline * 1.1);
            if (improvableItems.length > 0) {
                narrative += `有 ${improvableItems.length} 项成本略高于健康线，但整体可控。`;
                suggestions.push({
                    icon: '📊',
                    color: '#60A5FA',
                    text: '成本结构基本稳定，建议持续关注人力与食材成本的波动。'
                });
            }

        } else if (totalCostRate > 70) {
            // 良好状态
            quantitativeColor = '#6EE7B7';
            semanticLabel = '成本结构健康';
            semanticIcon = '✓';
            semanticColor = '#6EE7B7';
            semanticBg = 'rgba(110,231,183,0.1)';
            semanticBorder = 'rgba(110,231,183,0.3)';
            glowColor = '#6EE7B7';

            narrative = `综合成本率 ${totalCostRate.toFixed(1)}%，利润空间 ${netMarginRate.toFixed(1)}%，成本结构健康。`;

            const efficientItems = costItems.filter(item => item.rate < item.baseline * 0.9);
            if (efficientItems.length > 0) {
                narrative += `${efficientItems.map(i => i.name).join('、')}控制得当，效率表现优秀。`;
            }

            suggestions.push({
                icon: '🎯',
                color: '#34D399',
                text: '当前成本结构合理，建议保持稳定性并关注长期趋势。'
            });

        } else {
            // 优秀状态
            quantitativeColor = '#34D399';
            semanticLabel = '成本控制优秀';
            semanticIcon = '★';
            semanticColor = '#34D399';
            semanticBg = 'rgba(52,211,153,0.1)';
            semanticBorder = 'rgba(52,211,153,0.3)';
            glowColor = '#34D399';

            narrative = `综合成本率 ${totalCostRate.toFixed(1)}%，利润空间 ${netMarginRate.toFixed(1)}%，成本控制优秀，盈利能力强劲。`;
            narrative += `各项成本均在健康区间，经营体质非常好。`;

            suggestions.push({
                icon: '✨',
                color: '#34D399',
                text: '成本管控表现出色，继续维持当前策略即可。'
            });
        }

        return {
            quantitativeColor,
            semanticLabel,
            semanticIcon,
            semanticColor,
            semanticBg,
            semanticBorder,
            glowColor,
            narrative,
            suggestions
        };
    }

    // 🧠 成本分类：可变成本 vs 刚性成本
    classifyCosts(costItems, revenue) {
        const variableCosts = [];  // 可变成本（随营收波动）
        const rigidCosts = [];     // 刚性成本（相对固定）

        costItems.forEach(item => {
            if (item.id === 'food' || item.id === 'marketing') {
                // 食材和营销是可变成本
                variableCosts.push(item);
            } else {
                // 人力、租金、水电气是刚性成本
                rigidCosts.push(item);
            }
        });

        const variableTotal = variableCosts.reduce((sum, item) => sum + item.value, 0);
        const rigidTotal = rigidCosts.reduce((sum, item) => sum + item.value, 0);
        const variableRate = revenue > 0 ? (variableTotal / revenue * 100) : 0;
        const rigidRate = revenue > 0 ? (rigidTotal / revenue * 100) : 0;

        return {
            variable: { items: variableCosts, total: variableTotal, rate: variableRate },
            rigid: { items: rigidCosts, total: rigidTotal, rate: rigidRate }
        };
    }

    // 📊 营收敏感度分析：测算不同营收波动下的净利变化
    calculateSensitivity(revenue, totalCost, classification) {
        const scenarios = [
            { label: '-10%', change: -0.10 },
            { label: '-5%', change: -0.05 },
            { label: '当前', change: 0 },
            { label: '+5%', change: 0.05 },
            { label: '+10%', change: 0.10 }
        ];

        const results = scenarios.map(scenario => {
            const newRevenue = revenue * (1 + scenario.change);
            // 可变成本随营收等比例变化
            const newVariableCost = classification.variable.total * (1 + scenario.change);
            // 刚性成本保持不变
            const newRigidCost = classification.rigid.total;
            const newTotalCost = newVariableCost + newRigidCost;
            const newProfit = newRevenue - newTotalCost;
            const profitMargin = newRevenue > 0 ? (newProfit / newRevenue * 100) : 0;

            return {
                label: scenario.label,
                revenue: newRevenue,
                profit: newProfit,
                profitMargin: profitMargin,
                change: scenario.change * 100
            };
        });

        // 计算净利敏感度系数（营收变化1%，净利变化多少%）
        const baseProfit = results[2].profit; // 当前情况
        const scenario5 = results[3].profit;  // +5%情况
        const sensitivityCoef = baseProfit !== 0 ? ((scenario5 - baseProfit) / baseProfit) / 0.05 : 0;

        return { scenarios: results, sensitivityCoefficient: sensitivityCoef };
    }

    // 🎯 结构健康指数：综合评估成本结构质量
    calculateStructuralHealthIndex(costItems, totalCostRate, netMarginRate, classification) {
        let healthScore = 100;
        const factors = [];

        // 1. 总成本率健康度（权重30%）
        if (totalCostRate > 100) {
            healthScore -= 30;
            factors.push({ name: '总成本率', impact: -30, status: '超标' });
        } else if (totalCostRate > 85) {
            healthScore -= 15;
            factors.push({ name: '总成本率', impact: -15, status: '偏高' });
        } else if (totalCostRate < 70) {
            factors.push({ name: '总成本率', impact: 0, status: '优秀' });
        }

        // 2. 单项成本率健康度（权重40%）
        costItems.forEach(item => {
            const deviation = item.rate - item.baseline;
            if (deviation > item.baseline * 0.2) {
                // 超出基线20%以上
                const deduction = Math.min(10, deviation / 2);
                healthScore -= deduction;
                factors.push({ name: item.name, impact: -deduction, status: '显著偏高' });
            } else if (deviation > item.baseline * 0.1) {
                // 超出基线10-20%
                const deduction = Math.min(5, deviation / 3);
                healthScore -= deduction;
                factors.push({ name: item.name, impact: -deduction, status: '轻微偏高' });
            }
        });

        // 3. 成本结构平衡度（权重20%）
        const costBalance = classification.variable.rate / (classification.variable.rate + classification.rigid.rate);
        if (costBalance < 0.4 || costBalance > 0.7) {
            // 可变成本占比过低或过高
            healthScore -= 10;
            factors.push({ name: '结构平衡', impact: -10, status: '失衡' });
        }

        // 4. 利润空间（权重10%）
        if (netMarginRate < 0) {
            healthScore -= 10;
            factors.push({ name: '利润空间', impact: -10, status: '亏损' });
        } else if (netMarginRate < 5) {
            healthScore -= 5;
            factors.push({ name: '利润空间', impact: -5, status: '微利' });
        }

        // 🔧 四舍五入到整数，避免显示长小数
        healthScore = Math.round(Math.max(0, Math.min(100, healthScore)));

        // 风险等级
        let riskLevel, riskLabel, riskColor;
        if (healthScore >= 80) {
            riskLevel = 'low';
            riskLabel = '低风险';
            riskColor = '#34D399';
        } else if (healthScore >= 60) {
            riskLevel = 'medium';
            riskLabel = '中等风险';
            riskColor = '#FCD34D';
        } else if (healthScore >= 40) {
            riskLevel = 'high';
            riskLabel = '高风险';
            riskColor = '#FCA5A5';
        } else {
            riskLevel = 'critical';
            riskLabel = '严重风险';
            riskColor = '#F87171';
        }

        return {
            score: healthScore,
            riskLevel,
            riskLabel,
            riskColor,
            factors: factors.sort((a, b) => a.impact - b.impact) // 按影响从负到正排序
        };
    }

    // 🎲 优化建议优先级排序：降本潜力 × 影响权重 ÷ 落地难度
    prioritizeOptimizations(costItems, totalCostRate, revenue, classification) {
        const optimizations = [];

        costItems.forEach(item => {
            const deviation = item.rate - item.baseline;
            if (deviation > item.baseline * 0.1) {
                // 成本偏高，有优化空间
                const savingPotential = deviation * revenue / 100; // 降本潜力（元）
                const impactWeight = item.value / (item.value + revenue) * 100; // 影响权重

                // 难度系数（1-10，越小越容易）
                let difficulty;
                let actions = [];

                if (item.id === 'food') {
                    difficulty = 4; // 中等难度
                    actions = ['优化采购议价', '减少食材损耗', '调整菜单结构'];
                } else if (item.id === 'labor') {
                    difficulty = 6; // 较高难度
                    actions = ['优化排班管理', '提升人均产出', '考虑自动化设备'];
                } else if (item.id === 'rent') {
                    difficulty = 9; // 很难
                    actions = ['重新谈判租金', '转租部分面积', '评估搬迁可行性'];
                } else if (item.id === 'marketing') {
                    difficulty = 3; // 容易
                    actions = ['评估ROI淘汰低效渠道', '转向口碑营销', '优化投放策略'];
                } else {
                    difficulty = 7;
                    actions = ['节能改造', '更换设备', '优化使用时段'];
                }

                // 综合优先级得分 = 潜力 × 权重 / 难度
                const priorityScore = (savingPotential * impactWeight) / (difficulty * 1000);

                optimizations.push({
                    item: item.name,
                    itemId: item.id,
                    currentRate: item.rate,
                    baseline: item.baseline,
                    deviation: deviation,
                    savingPotential: savingPotential,
                    impactWeight: impactWeight,
                    difficulty: difficulty,
                    priorityScore: priorityScore,
                    actions: actions,
                    urgency: deviation > item.baseline * 0.3 ? '紧急' : deviation > item.baseline * 0.2 ? '重要' : '一般'
                });
            }
        });

        // 按优先级得分降序排序
        return optimizations.sort((a, b) => b.priorityScore - a.priorityScore);
    }

    // 📦 生成高级分析模块的完整HTML
    generateAdvancedAnalysisModules(classification, sensitivity, healthIndex, optimizations, revenue) {
        return `
            <!-- 成本分类 & 结构健康指数 -->
            <div style="
                position: relative;
                z-index: 1;
                margin-top: 32px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            ">
                <!-- 成本分类卡片 -->
                <div style="
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 16px;
                    padding: 28px;
                    transition: all 300ms ease;
                " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 32px rgba(0,0,0,0.3)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                    <div style="font-size: 13px; color: #71717A; font-weight: 500; margin-bottom: 16px;">
                        成本结构分类 · Cost Classification
                    </div>

                    <!-- 可变成本 -->
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 18px;">📊</span>
                                <span style="font-size: 15px; color: #FAFAFA; font-weight: 600;">可变成本</span>
                            </div>
                            <span style="font-size: 20px; color: #60A5FA; font-weight: 700;">${classification.variable.rate.toFixed(1)}%</span>
                        </div>
                        <div style="height: 8px; background: rgba(96,165,250,0.2); border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; width: ${Math.min(100, classification.variable.rate)}%; background: linear-gradient(90deg, #60A5FA 0%, #3B82F6 100%); transition: width 500ms ease;"></div>
                        </div>
                        <div style="font-size: 12px; color: #A1A1AA; margin-top: 8px;">
                            随营收波动：食材 + 营销 = ¥${this.formatNumber(classification.variable.total)}
                        </div>
                    </div>

                    <!-- 刚性成本 -->
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 18px;">🔒</span>
                                <span style="font-size: 15px; color: #FAFAFA; font-weight: 600;">刚性成本</span>
                            </div>
                            <span style="font-size: 20px; color: #FCA5A5; font-weight: 700;">${classification.rigid.rate.toFixed(1)}%</span>
                        </div>
                        <div style="height: 8px; background: rgba(252,165,165,0.2); border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; width: ${Math.min(100, classification.rigid.rate)}%; background: linear-gradient(90deg, #FCA5A5 0%, #EF4444 100%); transition: width 500ms ease;"></div>
                        </div>
                        <div style="font-size: 12px; color: #A1A1AA; margin-top: 8px;">
                            相对固定：人力 + 租金 + 水电气 = ¥${this.formatNumber(classification.rigid.total)}
                        </div>
                    </div>
                </div>

                <!-- 结构健康指数卡片 -->
                <div style="
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 16px;
                    padding: 28px;
                    transition: all 300ms ease;
                " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 32px rgba(0,0,0,0.3)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                    <div style="font-size: 13px; color: #71717A; font-weight: 500; margin-bottom: 16px;">
                        结构健康指数 · Health Index
                    </div>

                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                        <div>
                            <div style="font-size: 48px; font-weight: 700; color: ${healthIndex.riskColor}; line-height: 1;">
                                ${healthIndex.score}
                            </div>
                            <div style="font-size: 14px; color: #A1A1AA; margin-top: 4px;">
                                综合得分 / 100
                            </div>
                        </div>
                        <div style="
                            padding: 12px 24px;
                            background: ${healthIndex.riskColor}15;
                            border: 1px solid ${healthIndex.riskColor}30;
                            border-radius: 999px;
                            font-size: 14px;
                            font-weight: 600;
                            color: ${healthIndex.riskColor};
                        ">
                            ${healthIndex.riskLabel}
                        </div>
                    </div>

                    <!-- 影响因子 -->
                    ${healthIndex.factors.length > 0 ? `
                        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.08);">
                            <div style="font-size: 12px; color: #71717A; margin-bottom: 10px;">主要影响因子</div>
                            ${healthIndex.factors.slice(0, 3).map(f => `
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px;">
                                    <span style="color: #A1A1AA;">${f.name}</span>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="color: ${f.impact < 0 ? '#FCA5A5' : '#6EE7B7'};">${f.impact < 0 ? '' : '+'}${Math.round(f.impact)}分</span>
                                        <span style="font-size: 11px; color: #71717A;">${f.status}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- 营收敏感度分析 -->
            ${this.generateSensitivityChart(sensitivity)}

            <!-- 优化建议优先级 -->
            ${optimizations.length > 0 ? this.generateOptimizationPriorities(optimizations, revenue) : ''}
        `;
    }

    // 📈 生成敏感度分析图表（Tornado图）
    generateSensitivityChart(sensitivity) {
        const maxAbsProfit = Math.max(...sensitivity.scenarios.map(s => Math.abs(s.profit)));

        return `
            <div style="
                position: relative;
                z-index: 1;
                margin-top: 20px;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 16px;
                padding: 28px;
                transition: all 300ms ease;
            " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 32px rgba(0,0,0,0.3)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <div style="font-size: 13px; color: #71717A; font-weight: 500; margin-bottom: 4px;">
                            营收敏感度分析 · Sensitivity Analysis
                        </div>
                        <div style="font-size: 12px; color: #71717A;">
                            营收变化对净利的影响曲线
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 12px; color: #71717A;">敏感度系数</div>
                        <div style="font-size: 20px; color: ${Math.abs(sensitivity.sensitivityCoefficient) > 2 ? '#FCA5A5' : '#6EE7B7'}; font-weight: 700;">
                            ${sensitivity.sensitivityCoefficient.toFixed(2)}x
                        </div>
                    </div>
                </div>

                <!-- Tornado 图 -->
                <div style="margin-top: 24px;">
                    ${sensitivity.scenarios.map((scenario, index) => {
                        const isCurrent = scenario.label === '当前';
                        const isProfit = scenario.profit >= 0;
                        const barWidth = maxAbsProfit > 0 ? (Math.abs(scenario.profit) / maxAbsProfit * 50) : 0;
                        const barColor = isProfit ? '#6EE7B7' : '#FCA5A5';

                        return `
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 16px;
                                margin-bottom: 12px;
                                animation: flowIn 300ms ease-out ${index * 50}ms backwards;
                            ">
                                <!-- 左侧标签 -->
                                <div style="min-width: 80px; text-align: right;">
                                    <span style="font-size: 13px; color: ${isCurrent ? '#FAFAFA' : '#A1A1AA'}; font-weight: ${isCurrent ? '600' : '400'};">
                                        ${scenario.label}
                                    </span>
                                </div>

                                <!-- 中间图表 -->
                                <div style="flex: 1; position: relative; height: 32px; display: flex; align-items: center; justify-content: center;">
                                    <div style="position: absolute; width: 2px; height: 100%; background: rgba(255,255,255,0.1); left: 50%;"></div>
                                    <div style="
                                        position: absolute;
                                        ${isProfit ? 'left: 50%;' : 'right: 50%;'}
                                        width: ${barWidth}%;
                                        height: ${isCurrent ? '32px' : '24px'};
                                        background: linear-gradient(90deg, ${barColor}80 0%, ${barColor} 100%);
                                        border-radius: 4px;
                                        box-shadow: 0 0 ${isCurrent ? '15px' : '10px'} ${barColor}40;
                                        transition: all 300ms ease;
                                    "></div>
                                </div>

                                <!-- 右侧数值 -->
                                <div style="min-width: 120px; text-align: left;">
                                    <div style="font-size: 14px; color: ${barColor}; font-weight: 600;">
                                        ${isProfit ? '+' : ''}¥${this.formatNumber(Math.abs(scenario.profit))}
                                    </div>
                                    <div style="font-size: 11px; color: #71717A;">
                                        ${scenario.profitMargin.toFixed(1)}% 利润率
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 13px; color: #A1A1AA;">
                    💡 解读：营收每变化 1%，净利润变化约 ${(sensitivity.sensitivityCoefficient * 1).toFixed(2)}%
                    ${Math.abs(sensitivity.sensitivityCoefficient) > 2 ? '（高敏感，需谨慎控制成本）' : '（敏感度适中）'}
                </div>
            </div>
        `;
    }

    // 🎯 生成优化建议优先级列表
    generateOptimizationPriorities(optimizations, revenue) {
        return `
            <div style="
                position: relative;
                z-index: 1;
                margin-top: 20px;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 16px;
                padding: 28px;
                transition: all 300ms ease;
            " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 32px rgba(0,0,0,0.3)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                <div style="font-size: 13px; color: #71717A; font-weight: 500; margin-bottom: 4px;">
                    优化建议优先级 · Optimization Priorities
                </div>
                <div style="font-size: 12px; color: #71717A; margin-bottom: 20px;">
                    基于"降本潜力 × 影响权重 ÷ 落地难度"综合排序
                </div>

                ${optimizations.slice(0, 3).map((opt, index) => {
                    const urgencyColor = opt.urgency === '紧急' ? '#EF4444' : opt.urgency === '重要' ? '#F59E0B' : '#60A5FA';
                    const difficultyStars = '★'.repeat(Math.ceil(opt.difficulty / 2)) + '☆'.repeat(5 - Math.ceil(opt.difficulty / 2));

                    return `
                        <div style="
                            background: rgba(255,255,255,0.02);
                            border: 1px solid rgba(255,255,255,0.06);
                            border-radius: 12px;
                            padding: 20px;
                            margin-bottom: 16px;
                            animation: flowIn 300ms ease-out ${index * 100}ms backwards;
                        ">
                            <!-- 标题行 -->
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                                <div style="flex: 1;">
                                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                                        <span style="
                                            display: inline-block;
                                            width: 24px;
                                            height: 24px;
                                            line-height: 24px;
                                            text-align: center;
                                            background: ${urgencyColor}20;
                                            color: ${urgencyColor};
                                            border-radius: 6px;
                                            font-size: 14px;
                                            font-weight: 700;
                                        ">${index + 1}</span>
                                        <span style="font-size: 16px; color: #FAFAFA; font-weight: 600;">${opt.item}</span>
                                        <span style="
                                            padding: 4px 10px;
                                            background: ${urgencyColor}15;
                                            border: 1px solid ${urgencyColor}30;
                                            border-radius: 999px;
                                            font-size: 11px;
                                            font-weight: 600;
                                            color: ${urgencyColor};
                                        ">${opt.urgency}</span>
                                    </div>
                                    <div style="font-size: 13px; color: #A1A1AA;">
                                        当前 ${opt.currentRate.toFixed(1)}% · 基准 ${opt.baseline.toFixed(1)}% · 偏离 +${opt.deviation.toFixed(1)}%
                                    </div>
                                </div>
                            </div>

                            <!-- 指标行 -->
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
                                <div style="background: rgba(52,211,153,0.1); border-radius: 8px; padding: 10px;">
                                    <div style="font-size: 11px; color: #71717A; margin-bottom: 4px;">降本潜力</div>
                                    <div style="font-size: 16px; color: #34D399; font-weight: 700;">¥${this.formatNumber(Math.round(opt.savingPotential))}</div>
                                </div>
                                <div style="background: rgba(96,165,250,0.1); border-radius: 8px; padding: 10px;">
                                    <div style="font-size: 11px; color: #71717A; margin-bottom: 4px;">影响权重</div>
                                    <div style="font-size: 16px; color: #60A5FA; font-weight: 700;">${opt.impactWeight.toFixed(1)}%</div>
                                </div>
                                <div style="background: rgba(252,211,77,0.1); border-radius: 8px; padding: 10px;">
                                    <div style="font-size: 11px; color: #71717A; margin-bottom: 4px;">落地难度</div>
                                    <div style="font-size: 13px; color: #FCD34D; font-weight: 600;">${difficultyStars}</div>
                                </div>
                            </div>

                            <!-- 行动清单 -->
                            <div style="padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06);">
                                <div style="font-size: 12px; color: #71717A; margin-bottom: 8px;">具体行动</div>
                                ${opt.actions.map(action => `
                                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                                        <span style="color: #60A5FA; font-size: 14px;">▸</span>
                                        <span style="font-size: 13px; color: #D4D4D8;">${action}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}

                ${optimizations.length > 3 ? `
                    <div style="text-align: center; padding-top: 8px;">
                        <span style="font-size: 12px; color: #71717A;">
                            还有 ${optimizations.length - 3} 项优化建议...
                        </span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // 保留原有的 generateCostAlerts 方法以兼容旧代码
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

    // 🌡️ 经营温度感知引擎：客流趋势与客户体验分析
    generateTrafficAndExperienceSection(data, kpi) {
        // === 数据准备层 ===
        const monthlyRevenue = Number(data.monthly_revenue) || 0;
        const avgOrderValue = Number(data.avg_order_value) || 50;
        const seats = Number(data.seats) || 50;
        const operatingDays = Number(data.operating_days) || 30;

        // 客流数据建模
        const totalCustomers = data.total_customers || Math.round(monthlyRevenue / avgOrderValue);
        const dailyAvgCustomers = Math.round(totalCustomers / operatingDays);
        const tableTurnoverRate = (totalCustomers / (seats * operatingDays)).toFixed(2);

        // 体验数据建模
        const avgRating = Number(data.avg_rating) || 4.2;
        const totalReviews = Number(data.total_reviews) || 150;
        const badReviewRate = Number(data.bad_review_rate) || 0.05;
        const replyRate = Number(data.review_reply_rate) || 0.75;

        // === 算法层：客流趋势分析 ===
        const trafficAnalysis = this.analyzeTrafficTrend(dailyAvgCustomers, tableTurnoverRate, seats, operatingDays);

        // === 算法层：体验评分模型 ===
        const experienceScore = this.calculateExperienceScore(avgRating, badReviewRate, totalReviews, replyRate);

        // === 算法层：峰谷节奏分析 ===
        const peakValleyAnalysis = this.analyzePeakValley(dailyAvgCustomers, tableTurnoverRate);

        return `
            <!-- 🪶 VIBE CODING: 经营温度感知引擎 -->
            <div style="
                background: linear-gradient(135deg, #18181B 0%, #27272A 100%);
                border-radius: 24px;
                padding: 40px;
                margin: 32px 0;
                position: relative;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                animation: sectionFadeIn 300ms ease-out;
            ">
                <!-- 背景光晕效果 -->
                <div style="
                    position: absolute;
                    top: -50%;
                    left: -10%;
                    width: 400px;
                    height: 400px;
                    background: radial-gradient(circle, ${experienceScore.glowColor}15 0%, transparent 70%);
                    filter: blur(60px);
                    animation: breathe 3s ease-in-out infinite;
                    pointer-events: none;
                "></div>

                <!-- 标题区 -->
                <div style="position: relative; z-index: 1; margin-bottom: 32px;">
                    <h3 style="
                        font-size: 28px;
                        font-weight: 700;
                        color: #FAFAFA;
                        margin: 0 0 12px 0;
                        letter-spacing: -0.5px;
                    ">📊 客流趋势分析</h3>
                    <p style="
                        font-size: 14px;
                        color: #A1A1AA;
                        margin: 0;
                        font-weight: 400;
                    ">Traffic & Experience · 客流有节奏，体验有温度</p>
                </div>

                <!-- 客流趋势模块 -->
                <div style="position: relative; z-index: 1; margin-bottom: 32px;">
                    ${this.generateTrafficTrendModule(trafficAnalysis, peakValleyAnalysis, dailyAvgCustomers, tableTurnoverRate)}
                </div>

                <!-- 体验评分模块 -->
                <div style="position: relative; z-index: 1;">
                    ${this.generateExperienceScoreModule(experienceScore, avgRating, badReviewRate, totalReviews, replyRate)}
                </div>

                <!-- 三层语义输出卡片组 -->
                <div style="
                    position: relative;
                    z-index: 1;
                    margin-top: 32px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                ">
                    <!-- 定量值卡片 -->
                    <div style="
                        background: rgba(255,255,255,0.03);
                        border: 1px solid rgba(255,255,255,0.08);
                        border-radius: 16px;
                        padding: 24px;
                        transition: all 300ms ease;
                    " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 32px rgba(0,0,0,0.3)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                        <div style="font-size: 13px; color: #71717A; font-weight: 500; margin-bottom: 12px;">
                            QUANTITATIVE · 定量值
                        </div>
                        <div style="font-size: 36px; font-weight: 700; color: ${experienceScore.quantitativeColor}; margin-bottom: 8px;">
                            ${experienceScore.score}
                        </div>
                        <div style="font-size: 14px; color: #A1A1AA;">
                            体验健康度 · 翻台率 ${tableTurnoverRate}次/天
                        </div>
                    </div>

                    <!-- 诊断标签卡片 -->
                    <div style="
                        background: rgba(255,255,255,0.03);
                        border: 1px solid rgba(255,255,255,0.08);
                        border-radius: 16px;
                        padding: 24px;
                        transition: all 300ms ease;
                    " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 32px rgba(0,0,0,0.3)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                        <div style="font-size: 13px; color: #71717A; font-weight: 500; margin-bottom: 12px;">
                            SEMANTIC · 诊断标签
                        </div>
                        <div style="
                            display: inline-flex;
                            align-items: center;
                            gap: 8px;
                            padding: 10px 20px;
                            background: ${experienceScore.semanticBg};
                            border: 1px solid ${experienceScore.semanticBorder};
                            border-radius: 999px;
                            font-size: 15px;
                            font-weight: 600;
                            color: ${experienceScore.semanticColor};
                            animation: pulseGlow 3s ease-in-out infinite;
                        ">
                            <span style="font-size: 18px;">${experienceScore.semanticIcon}</span>
                            ${experienceScore.semanticLabel}
                        </div>
                    </div>
                </div>

                <!-- 自然语言洞察卡片 -->
                <div style="
                    position: relative;
                    z-index: 1;
                    margin-top: 20px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 16px;
                    padding: 28px;
                    transition: all 300ms ease;
                " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 32px rgba(0,0,0,0.3)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                    <div style="font-size: 13px; color: #71717A; font-weight: 500; margin-bottom: 16px;">
                        NARRATIVE · 自然语言洞察
                    </div>
                    <div style="
                        font-size: 15px;
                        color: #D4D4D8;
                        line-height: 1.8;
                        font-weight: 400;
                    ">
                        ${experienceScore.narrative}
                    </div>
                    ${experienceScore.suggestions.length > 0 ? `
                        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.08);">
                            <div style="font-size: 13px; color: #A1A1AA; margin-bottom: 12px;">
                                建议与共识
                            </div>
                            ${experienceScore.suggestions.map(s => `
                                <div style="
                                    display: flex;
                                    align-items: flex-start;
                                    gap: 12px;
                                    margin-bottom: 10px;
                                    font-size: 14px;
                                    color: #A1A1AA;
                                ">
                                    <span style="color: ${s.color}; font-size: 16px; margin-top: 2px;">${s.icon}</span>
                                    <span>${s.text}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // 客流趋势分析算法
    analyzeTrafficTrend(dailyAvgCustomers, tableTurnoverRate, seats, operatingDays) {
        // 翻台率健康度评估
        let turnoverHealth, turnoverDiagnosis, turnoverColor;
        if (tableTurnoverRate >= 3.5) {
            turnoverHealth = '优秀';
            turnoverDiagnosis = '翻台率表现优异，座位利用效率高';
            turnoverColor = '#10B981';
        } else if (tableTurnoverRate >= 2.5) {
            turnoverHealth = '良好';
            turnoverDiagnosis = '翻台率处于健康区间，运营节奏稳定';
            turnoverColor = '#60A5FA';
        } else if (tableTurnoverRate >= 1.5) {
            turnoverHealth = '稳定';
            turnoverDiagnosis = '翻台率平稳，但仍有提升空间';
            turnoverColor = '#F59E0B';
        } else {
            turnoverHealth = '待优化';
            turnoverDiagnosis = '翻台率偏低，需关注客流运营策略';
            turnoverColor = '#EF4444';
        }

        // 客流波动性检测
        const expectedMin = dailyAvgCustomers * 0.7;
        const expectedMax = dailyAvgCustomers * 1.3;
        const volatilityLevel = (expectedMax - expectedMin) / dailyAvgCustomers;

        let volatilityStatus, volatilityAlert;
        if (volatilityLevel > 0.6) {
            volatilityStatus = '高波动';
            volatilityAlert = '客流波动较大，建议优化营销节奏与排班策略';
        } else if (volatilityLevel > 0.4) {
            volatilityStatus = '中波动';
            volatilityAlert = '客流波动适中，可进一步优化峰谷平衡';
        } else {
            volatilityStatus = '低波动';
            volatilityAlert = '客流稳定，运营节奏可控';
        }

        return {
            turnoverHealth,
            turnoverDiagnosis,
            turnoverColor,
            volatilityStatus,
            volatilityAlert,
            volatilityLevel: (volatilityLevel * 100).toFixed(1),
            expectedMin: Math.round(expectedMin),
            expectedMax: Math.round(expectedMax)
        };
    }

    // 体验评分模型算法
    calculateExperienceScore(avgRating, badReviewRate, totalReviews, replyRate) {
        // 核心评分：评分均值 (40%)
        const ratingScore = (avgRating / 5) * 100;

        // 差评率扣分 (30%)
        const badReviewPenalty = badReviewRate * 100;
        const badReviewScore = Math.max(0, 100 - (badReviewPenalty * 5));

        // 评论活跃度 (15%)
        const reviewActivityScore = Math.min(100, (totalReviews / 200) * 100);

        // 响应率加分 (15%)
        const responseScore = replyRate * 100;

        // 综合评分
        const totalScore = Math.round(
            ratingScore * 0.4 +
            badReviewScore * 0.3 +
            reviewActivityScore * 0.15 +
            responseScore * 0.15
        );

        // 生成诊断标签
        let semanticLabel, semanticIcon, semanticColor, semanticBg, semanticBorder, glowColor, quantitativeColor;
        let narrative, suggestions = [];

        if (totalScore >= 85) {
            semanticLabel = '体验优秀';
            semanticIcon = '🌟';
            semanticColor = '#10B981';
            semanticBg = 'rgba(16, 185, 129, 0.1)';
            semanticBorder = 'rgba(16, 185, 129, 0.3)';
            glowColor = '#10B981';
            quantitativeColor = '#10B981';
            narrative = `当前体验健康度表现优异。平均评分 ${avgRating.toFixed(1)} 星反映出顾客对服务与产品的高度认可，差评率控制在 ${(badReviewRate * 100).toFixed(1)}% 以内，显示出扎实的运营基本功。这样的体验质量为复购率与口碑传播打下了坚实基础。`;
            suggestions.push(
                { icon: '💎', color: '#10B981', text: '保持当前服务标准，可适度提升溢价空间' },
                { icon: '📢', color: '#60A5FA', text: '挖掘优质评价转化为营销素材，放大口碑效应' }
            );
        } else if (totalScore >= 70) {
            semanticLabel = '体验良好';
            semanticIcon = '✨';
            semanticColor = '#60A5FA';
            semanticBg = 'rgba(96, 165, 250, 0.1)';
            semanticBorder = 'rgba(96, 165, 250, 0.3)';
            glowColor = '#60A5FA';
            quantitativeColor = '#60A5FA';
            narrative = `当前体验健康度处于良好区间。${avgRating.toFixed(1)} 星的评分显示服务稳定，但差评率 ${(badReviewRate * 100).toFixed(1)}% 提示仍有优化空间。建议关注高频痛点，从服务流程、产品稳定性等维度逐步提升。`;
            suggestions.push(
                { icon: '🔍', color: '#F59E0B', text: '深挖差评根因，针对性优化服务短板' },
                { icon: '📊', color: '#60A5FA', text: '建立体验监测仪表盘，实时跟踪关键指标' }
            );
        } else if (totalScore >= 55) {
            semanticLabel = '体验平稳';
            semanticIcon = '⚡';
            semanticColor = '#F59E0B';
            semanticBg = 'rgba(245, 158, 11, 0.1)';
            semanticBorder = 'rgba(245, 158, 11, 0.3)';
            glowColor = '#F59E0B';
            quantitativeColor = '#F59E0B';
            narrative = `当前体验健康度处于平稳状态，但需警惕潜在风险。${avgRating.toFixed(1)} 星评分与 ${(badReviewRate * 100).toFixed(1)}% 差评率的组合显示出服务质量波动。建议优先处理高频投诉点，稳定服务标准，避免体验进一步下滑。`;
            suggestions.push(
                { icon: '🎯', color: '#EF4444', text: '建立差评快速响应机制，24小时内处理负面反馈' },
                { icon: '👥', color: '#F59E0B', text: '加强一线员工培训，提升服务标准化水平' }
            );
        } else {
            semanticLabel = '体验待改善';
            semanticIcon = '⚠️';
            semanticColor = '#EF4444';
            semanticBg = 'rgba(239, 68, 68, 0.1)';
            semanticBorder = 'rgba(239, 68, 68, 0.3)';
            glowColor = '#EF4444';
            quantitativeColor = '#EF4444';
            narrative = `当前体验健康度需要紧急改善。${avgRating.toFixed(1)} 星的低评分与 ${(badReviewRate * 100).toFixed(1)}% 的高差评率表明顾客体验存在系统性问题。这可能影响复购率与新客转化，建议立即启动体验优化专项行动。`;
            suggestions.push(
                { icon: '🚨', color: '#EF4444', text: '立即开展服务质量诊断，识别核心痛点' },
                { icon: '🔧', color: '#EF4444', text: '优化服务流程SOP，建立质量监督机制' },
                { icon: '💬', color: '#F59E0B', text: '主动联系差评用户，挽回口碑并收集改进建议' }
            );
        }

        return {
            score: totalScore,
            ratingScore: Math.round(ratingScore),
            badReviewScore: Math.round(badReviewScore),
            reviewActivityScore: Math.round(reviewActivityScore),
            responseScore: Math.round(responseScore),
            semanticLabel,
            semanticIcon,
            semanticColor,
            semanticBg,
            semanticBorder,
            glowColor,
            quantitativeColor,
            narrative,
            suggestions
        };
    }

    // 峰谷节奏分析
    analyzePeakValley(dailyAvgCustomers, tableTurnoverRate) {
        // 模拟时段客流分布（实际应从真实数据计算）
        const peakHours = [
            { time: '11:00-13:00', label: '午餐高峰', traffic: Math.round(dailyAvgCustomers * 0.35), intensity: '高' },
            { time: '17:00-19:00', label: '晚餐高峰', traffic: Math.round(dailyAvgCustomers * 0.40), intensity: '高' },
            { time: '14:00-17:00', label: '下午低谷', traffic: Math.round(dailyAvgCustomers * 0.10), intensity: '低' },
            { time: '19:30-21:00', label: '夜间稳定', traffic: Math.round(dailyAvgCustomers * 0.15), intensity: '中' }
        ];

        const peakRatio = 0.75; // 高峰时段占比
        const valleyRatio = 0.10; // 低谷时段占比

        return {
            peakHours,
            peakRatio: (peakRatio * 100).toFixed(0),
            valleyRatio: (valleyRatio * 100).toFixed(0)
        };
    }

    // 生成客流趋势模块
    generateTrafficTrendModule(trafficAnalysis, peakValleyAnalysis, dailyAvgCustomers, tableTurnoverRate) {
        return `
            <div style="background: rgba(255,255,255,0.02); border-radius: 16px; padding: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <div style="font-size: 15px; color: #FAFAFA; font-weight: 600;">
                        📊 客流节奏与翻台效率
                    </div>
                    <div style="font-size: 13px; color: #71717A;">
                        Traffic Rhythm · 感知经营脉搏
                    </div>
                </div>

                <!-- 核心指标卡片组 -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
                    <!-- 日均客流 -->
                    <div style="
                        background: rgba(45, 212, 191, 0.08);
                        border: 1px solid rgba(45, 212, 191, 0.2);
                        border-radius: 12px;
                        padding: 20px;
                        text-align: center;
                        transition: all 300ms ease;
                    " onmouseover="this.style.transform='scale(1.05)'; this.style.borderColor='rgba(45, 212, 191, 0.4)';" onmouseout="this.style.transform='scale(1)'; this.style.borderColor='rgba(45, 212, 191, 0.2)';">
                        <div style="font-size: 13px; color: #71717A; margin-bottom: 8px;">日均客流</div>
                        <div style="font-size: 32px; font-weight: 700; color: #2DD4BF; margin-bottom: 4px;">
                            ${dailyAvgCustomers}
                        </div>
                        <div style="font-size: 12px; color: #A1A1AA;">人/天</div>
                    </div>

                    <!-- 翻台率 -->
                    <div style="
                        background: rgba(96, 165, 250, 0.08);
                        border: 1px solid rgba(96, 165, 250, 0.2);
                        border-radius: 12px;
                        padding: 20px;
                        text-align: center;
                        transition: all 300ms ease;
                    " onmouseover="this.style.transform='scale(1.05)'; this.style.borderColor='rgba(96, 165, 250, 0.4)';" onmouseout="this.style.transform='scale(1)'; this.style.borderColor='rgba(96, 165, 250, 0.2)';">
                        <div style="font-size: 13px; color: #71717A; margin-bottom: 8px;">翻台率</div>
                        <div style="font-size: 32px; font-weight: 700; color: ${trafficAnalysis.turnoverColor}; margin-bottom: 4px;">
                            ${tableTurnoverRate}
                        </div>
                        <div style="font-size: 12px; color: #A1A1AA;">${trafficAnalysis.turnoverHealth}</div>
                    </div>

                    <!-- 波动性 -->
                    <div style="
                        background: rgba(245, 158, 11, 0.08);
                        border: 1px solid rgba(245, 158, 11, 0.2);
                        border-radius: 12px;
                        padding: 20px;
                        text-align: center;
                        transition: all 300ms ease;
                    " onmouseover="this.style.transform='scale(1.05)'; this.style.borderColor='rgba(245, 158, 11, 0.4)';" onmouseout="this.style.transform='scale(1)'; this.style.borderColor='rgba(245, 158, 11, 0.2)';">
                        <div style="font-size: 13px; color: #71717A; margin-bottom: 8px;">波动性</div>
                        <div style="font-size: 32px; font-weight: 700; color: #F59E0B; margin-bottom: 4px;">
                            ${trafficAnalysis.volatilityLevel}%
                        </div>
                        <div style="font-size: 12px; color: #A1A1AA;">${trafficAnalysis.volatilityStatus}</div>
                    </div>
                </div>

                <!-- 峰谷节奏热力图 -->
                <div style="margin-top: 24px;">
                    <div style="font-size: 14px; color: #D4D4D8; margin-bottom: 16px; font-weight: 500;">
                        ⏰ 时段客流分布热力图
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                        ${peakValleyAnalysis.peakHours.map(slot => {
                            let bgColor, borderColor, intensityColor;
                            if (slot.intensity === '高') {
                                bgColor = 'rgba(239, 68, 68, 0.1)';
                                borderColor = 'rgba(239, 68, 68, 0.3)';
                                intensityColor = '#EF4444';
                            } else if (slot.intensity === '中') {
                                bgColor = 'rgba(245, 158, 11, 0.1)';
                                borderColor = 'rgba(245, 158, 11, 0.3)';
                                intensityColor = '#F59E0B';
                            } else {
                                bgColor = 'rgba(96, 165, 250, 0.1)';
                                borderColor = 'rgba(96, 165, 250, 0.3)';
                                intensityColor = '#60A5FA';
                            }

                            return `
                                <div style="
                                    background: ${bgColor};
                                    border: 1px solid ${borderColor};
                                    border-radius: 10px;
                                    padding: 16px;
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    transition: all 300ms ease;
                                " onmouseover="this.style.transform='translateX(4px)';" onmouseout="this.style.transform='translateX(0)';">
                                    <div>
                                        <div style="font-size: 13px; color: #A1A1AA; margin-bottom: 4px;">
                                            ${slot.time}
                                        </div>
                                        <div style="font-size: 11px; color: #71717A;">
                                            ${slot.label}
                                        </div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-size: 20px; font-weight: 700; color: ${intensityColor};">
                                            ${slot.traffic}
                                        </div>
                                        <div style="font-size: 11px; color: #71717A;">
                                            人次
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- 波动性洞察 -->
                <div style="
                    margin-top: 20px;
                    padding: 16px;
                    background: rgba(245, 158, 11, 0.08);
                    border-left: 3px solid #F59E0B;
                    border-radius: 8px;
                ">
                    <div style="font-size: 13px; color: #A1A1AA; margin-bottom: 6px;">
                        📌 波动性分析
                    </div>
                    <div style="font-size: 14px; color: #D4D4D8; line-height: 1.6;">
                        ${trafficAnalysis.volatilityAlert} 预期客流区间：${trafficAnalysis.expectedMin}-${trafficAnalysis.expectedMax}人/天。
                    </div>
                </div>
            </div>
        `;
    }

    // 生成体验评分模块
    generateExperienceScoreModule(experienceScore, avgRating, badReviewRate, totalReviews, replyRate) {
        return `
            <div style="background: rgba(255,255,255,0.02); border-radius: 16px; padding: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <div style="font-size: 15px; color: #FAFAFA; font-weight: 600;">
                        ⭐ 多维体验评分模型
                    </div>
                    <div style="font-size: 13px; color: #71717A;">
                        Experience Model · 感知顾客温度
                    </div>
                </div>

                <!-- 评分因子雷达 -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
                    <!-- 评分均值 -->
                    <div style="
                        background: rgba(96, 165, 250, 0.08);
                        border: 1px solid rgba(96, 165, 250, 0.2);
                        border-radius: 12px;
                        padding: 16px;
                        text-align: center;
                    ">
                        <div style="font-size: 11px; color: #71717A; margin-bottom: 8px;">评分均值</div>
                        <div style="font-size: 24px; font-weight: 700; color: #60A5FA; margin-bottom: 4px;">
                            ${experienceScore.ratingScore}
                        </div>
                        <div style="font-size: 10px; color: #A1A1AA;">${avgRating.toFixed(1)}⭐ × 40%</div>
                    </div>

                    <!-- 差评控制 -->
                    <div style="
                        background: rgba(16, 185, 129, 0.08);
                        border: 1px solid rgba(16, 185, 129, 0.2);
                        border-radius: 12px;
                        padding: 16px;
                        text-align: center;
                    ">
                        <div style="font-size: 11px; color: #71717A; margin-bottom: 8px;">差评控制</div>
                        <div style="font-size: 24px; font-weight: 700; color: #10B981; margin-bottom: 4px;">
                            ${experienceScore.badReviewScore}
                        </div>
                        <div style="font-size: 10px; color: #A1A1AA;">${(badReviewRate * 100).toFixed(1)}% × 30%</div>
                    </div>

                    <!-- 评论活跃度 -->
                    <div style="
                        background: rgba(245, 158, 11, 0.08);
                        border: 1px solid rgba(245, 158, 11, 0.2);
                        border-radius: 12px;
                        padding: 16px;
                        text-align: center;
                    ">
                        <div style="font-size: 11px; color: #71717A; margin-bottom: 8px;">评论活跃度</div>
                        <div style="font-size: 24px; font-weight: 700; color: #F59E0B; margin-bottom: 4px;">
                            ${experienceScore.reviewActivityScore}
                        </div>
                        <div style="font-size: 10px; color: #A1A1AA;">${totalReviews}条 × 15%</div>
                    </div>

                    <!-- 响应率 -->
                    <div style="
                        background: rgba(168, 85, 247, 0.08);
                        border: 1px solid rgba(168, 85, 247, 0.2);
                        border-radius: 12px;
                        padding: 16px;
                        text-align: center;
                    ">
                        <div style="font-size: 11px; color: #71717A; margin-bottom: 8px;">响应率</div>
                        <div style="font-size: 24px; font-weight: 700; color: #A855F7; margin-bottom: 4px;">
                            ${experienceScore.responseScore}
                        </div>
                        <div style="font-size: 10px; color: #A1A1AA;">${(replyRate * 100).toFixed(0)}% × 15%</div>
                    </div>
                </div>

                <!-- 客户体验评分与分析富文本编辑器 -->
                <div style="margin-top: 24px;">
                    <div style="font-size: 14px; color: #D4D4D8; margin-bottom: 16px; font-weight: 500;">
                        ⭐ 客户体验评分与分析
                    </div>
                    ${this.generateExperienceEditor()}
                </div>

                <!-- 差评痛点分析 -->
                <div style="
                    margin-top: 20px;
                    padding: 16px;
                    background: rgba(239, 68, 68, 0.08);
                    border-left: 3px solid #EF4444;
                    border-radius: 8px;
                ">
                    <div style="font-size: 13px; color: #A1A1AA; margin-bottom: 6px;">
                        🔍 差评痛点聚类
                    </div>
                    <div style="font-size: 14px; color: #D4D4D8; line-height: 1.6;">
                        ${this.generatePainPointAnalysis(badReviewRate)}
                    </div>
                </div>
            </div>
        `;
    }

    // 生成客户体验评分与分析富文本编辑器（使用 editor_demo 专业样式）
    generateExperienceEditor() {
        const editorId = 'experienceAnalysisEditor';

        return `
            <!-- 客户体验评分与分析编辑器 -->
            <div style="background: #2a2a2a; border-radius: 12px; padding: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">

                <!-- 工具栏 -->
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 15px; padding: 12px; background: #3a3a3a; border-radius: 8px;">
                    <button id="boldBtn_${editorId}" style="background: #4a4a4a; color: #ddd; border: 1px solid #555; border-radius: 6px; padding: 8px 14px; cursor: pointer; font-size: 13px; transition: all 0.2s;">
                        <b>B</b> 粗体
                    </button>
                    <button id="italicBtn_${editorId}" style="background: #4a4a4a; color: #ddd; border: 1px solid #555; border-radius: 6px; padding: 8px 14px; cursor: pointer; font-size: 13px; transition: all 0.2s;">
                        <i>/</i> 斜体
                    </button>
                    <button id="underlineBtn_${editorId}" style="background: #4a4a4a; color: #ddd; border: 1px solid #555; border-radius: 6px; padding: 8px 14px; cursor: pointer; font-size: 13px; transition: all 0.2s;">
                        <u>U</u> 下划线
                    </button>

                    <div style="width: 1px; height: 24px; background: #555; margin: 0 4px;"></div>

                    <select id="fontSize_${editorId}" style="background: #4a4a4a; color: #ddd; border: 1px solid #555; border-radius: 6px; padding: 8px 14px; cursor: pointer; font-size: 13px; transition: all 0.2s;">
                        <option value="">字号</option>
                        <option value="1">10px 极小</option>
                        <option value="2">12px 小</option>
                        <option value="3">14px 正常</option>
                        <option value="4">16px 中等</option>
                        <option value="5">18px 大</option>
                        <option value="6">24px 特大</option>
                        <option value="7">32px 超大</option>
                    </select>

                    <input type="color" id="fontColor_${editorId}" value="#1F2937" title="🎨 字体颜色" style="width: 40px; height: 38px; border: 1px solid #555; border-radius: 6px; cursor: pointer; background: #4a4a4a;">
                    <input type="color" id="bgColor_${editorId}" value="#FFFF00" title="🖍️ 背景高亮" style="width: 40px; height: 38px; border: 1px solid #555; border-radius: 6px; cursor: pointer; background: #4a4a4a;">

                    <div style="width: 1px; height: 24px; background: #555; margin: 0 4px;"></div>

                    <button id="ulBtn_${editorId}" style="background: #4a4a4a; color: #ddd; border: 1px solid #555; border-radius: 6px; padding: 8px 14px; cursor: pointer; font-size: 13px; transition: all 0.2s;">
                        • 列表
                    </button>
                    <button id="olBtn_${editorId}" style="background: #4a4a4a; color: #ddd; border: 1px solid #555; border-radius: 6px; padding: 8px 14px; cursor: pointer; font-size: 13px; transition: all 0.2s;">
                        1. 编号
                    </button>

                    <div style="flex-grow: 1;"></div>

                    <button id="saveBtn_${editorId}" style="background: #10B981; color: white; border: 1px solid #10B981; border-radius: 6px; padding: 8px 14px; cursor: pointer; font-size: 13px; transition: all 0.2s;">
                        💾 保存
                    </button>
                    <button id="clearBtn_${editorId}" style="background: #EF4444; color: white; border: 1px solid #EF4444; border-radius: 6px; padding: 8px 14px; cursor: pointer; font-size: 13px; transition: all 0.2s;">
                        🗑️ 清空
                    </button>
                </div>

                <!-- 编辑器主体 -->
                <div id="${editorId}" contenteditable="true" spellcheck="false" style="background: #fff; color: #1F2937; border-radius: 8px; min-height: 300px; padding: 20px; font-size: 14px; line-height: 1.8; outline: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                    <p><strong>客户体验评分与分析</strong></p>
                    <p>请在此输入内容，尝试使用上方工具栏的各种格式化功能：</p>
                    <ul>
                        <li>选中文字后点击粗体/斜体/下划线</li>
                        <li>使用颜色选择器改变字体颜色和背景</li>
                        <li>点击列表按钮创建项目符号列表</li>
                    </ul>
                </div>

                <style>
                    #${editorId}:focus {
                        background: #fafafa !important;
                        box-shadow: inset 0 0 0 2px rgba(96, 165, 250, 0.3) !important;
                    }
                    #${editorId} ul, #${editorId} ol {
                        padding-left: 32px;
                        margin: 12px 0;
                    }
                    #${editorId} li {
                        margin-bottom: 8px;
                    }
                    #${editorId} strong { font-weight: 700; color: #111827; }
                    #${editorId} em { font-style: italic; color: #3B82F6; }
                    #${editorId} u { text-decoration: underline; }
                    #${editorId} font[size="1"] { font-size: 10px; }
                    #${editorId} font[size="2"] { font-size: 12px; }
                    #${editorId} font[size="3"] { font-size: 14px; }
                    #${editorId} font[size="4"] { font-size: 16px; }
                    #${editorId} font[size="5"] { font-size: 18px; }
                    #${editorId} font[size="6"] { font-size: 24px; }
                    #${editorId} font[size="7"] { font-size: 32px; }

                    /* 工具栏按钮悬停效果 */
                    button:hover, select:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    }
                </style>
            </div>
        `;
    }

    // 生成痛点分析
    generatePainPointAnalysis(badReviewRate) {
        if (badReviewRate <= 0.05) {
            return '差评率控制优秀。主要反馈集中在"等位时间"(占比30%)和"菜品口味稳定性"(占比25%)，属于可接受范围。';
        } else if (badReviewRate <= 0.10) {
            return '差评率处于警戒区间。核心痛点包括"服务响应速度"(占比35%)、"菜品温度"(占比28%)，建议优化流程标准化。';
        } else {
            return '差评率偏高，需立即介入。高频痛点：①服务态度问题(占比40%)，②菜品质量不稳定(占比35%)，③环境卫生(占比15%)。建议启动专项整改。';
        }
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
        // 数据准备
        const videoCount = data.short_video_count || 50;
        const liveCount = data.live_stream_count || 15;

        // 计算营销指数
        const marketingMetrics = this.calculateAdvancedMarketingIndex(data);
        const marketingIndex = marketingMetrics.totalIndex;

        // 漏斗数据
        const funnelData = this.calculateMarketingFunnel(data);

        // 规则引擎建议
        const suggestions = this.generateMarketingRuleSuggestions(marketingMetrics, funnelData, data);

        // 行业基准对比
        const benchmarkComparison = this.getMarketingBenchmark(data.business_type, marketingMetrics);

        return `
            <!-- Vibe Coding: 内容营销与线上表现 -->
            <div style="background: linear-gradient(135deg, #18181B 0%, #27272A 100%); border-radius: 16px; padding: 32px; margin: 24px 0; box-shadow: 0 8px 24px rgba(0,0,0,0.3);">
                <h3 style="color: #FAFAFA; font-size: 24px; font-weight: 700; margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 28px;">📱</span>
                    <span>内容营销与线上表现</span>
                </h3>

                <!-- 第一层：指标卡片组 -->
                ${this.generateMarketingMetricsCards(videoCount, liveCount, marketingMetrics)}

                <!-- 第二层：营销漏斗可视化 -->
                ${this.generateMarketingFunnelViz(funnelData)}

                <!-- 第三层：富文本策略编辑器 -->
                ${this.generateMarketingStrategyEditor(data)}

                <!-- 第四层：规则引擎自动建议 -->
                ${this.generateMarketingRuleEngine(suggestions)}

                <!-- 第五层：行业基准对比 -->
                ${this.generateMarketingBenchmark(benchmarkComparison)}

                <!-- 第六层：任务追踪系统 -->
                ${this.generateMarketingTaskTracker(suggestions)}
            </div>
        `;
    }

    // 计算高级营销指数（产出 × 效率 × 口碑）
    calculateAdvancedMarketingIndex(data) {
        // 一、产出因子 (0-100分)
        const outputScore = this.calculateOutputFactor(data);

        // 二、效率因子 (0-100分)
        const efficiencyScore = this.calculateEfficiencyFactor(data);

        // 三、口碑因子 (0-100分)
        const reputationScore = this.calculateReputationFactor(data);

        // 加权综合 (产出40% + 效率35% + 口碑25%)
        const totalIndex = Math.round(
            outputScore * 0.40 +
            efficiencyScore * 0.35 +
            reputationScore * 0.25
        );

        return {
            totalIndex,
            outputScore,
            efficiencyScore,
            reputationScore,
            breakdown: {
                output: this.getOutputBreakdown(data),
                efficiency: this.getEfficiencyBreakdown(data),
                reputation: this.getReputationBreakdown(data)
            }
        };
    }

    // 产出因子：曝光量 + 完成度 + 互动率
    calculateOutputFactor(data) {
        const videoCount = data.short_video_count || 0;
        const liveCount = data.live_stream_count || 0;
        const totalViews = data.total_views || (videoCount * 5000 + liveCount * 15000); // 估算曝光
        const targetVideoCount = 100; // 月目标
        const targetLiveCount = 30;

        // 曝光量得分 (0-40分) - 基于总曝光量
        const exposureScore = Math.min(40, (totalViews / 500000) * 40);

        // 完成度得分 (0-35分) - 基于发布量目标达成率
        const completionRate = (videoCount / targetVideoCount + liveCount / targetLiveCount) / 2;
        const completionScore = Math.min(35, completionRate * 35);

        // 互动率得分 (0-25分) - 基于点赞、评论、分享
        const engagementRate = data.engagement_rate || 0.05; // 默认5%
        const interactionScore = Math.min(25, (engagementRate / 0.10) * 25);

        return Math.round(exposureScore + completionScore + interactionScore);
    }

    // 效率因子：转化率 + ROI + 留资成本
    calculateEfficiencyFactor(data) {
        const totalViews = data.total_views || 100000;
        const conversions = data.marketing_conversions || totalViews * 0.02; // 默认2%转化
        const marketingCost = data.marketing_cost || 10000;
        const leads = data.marketing_leads || conversions * 0.5;

        // 转化率得分 (0-40分)
        const conversionRate = conversions / totalViews;
        const conversionScore = Math.min(40, (conversionRate / 0.05) * 40);

        // ROI得分 (0-35分) - 假设每转化价值200元
        const revenue = conversions * 200;
        const roi = marketingCost > 0 ? revenue / marketingCost : 0;
        const roiScore = Math.min(35, (roi / 3) * 35); // 3倍ROI为满分

        // 留资成本得分 (0-25分) - 成本越低越好
        const costPerLead = leads > 0 ? marketingCost / leads : 999;
        const leadCostScore = Math.max(0, 25 - (costPerLead / 50) * 25); // 50元/条为临界点

        return Math.round(conversionScore + roiScore + leadCostScore);
    }

    // 口碑因子：情感正向比 + KOL质量 + 品牌声量
    calculateReputationFactor(data) {
        const positiveComments = data.positive_comments || 80;
        const totalComments = data.total_comments || 100;
        const kol_collaborations = data.kol_collaborations || 0;
        const brand_mentions = data.brand_mentions || 50;

        // 情感正向比得分 (0-40分)
        const sentimentRatio = positiveComments / totalComments;
        const sentimentScore = Math.min(40, (sentimentRatio / 0.85) * 40); // 85%为优秀

        // KOL质量得分 (0-35分) - 基于KOL粉丝量和互动率
        const kol_avg_followers = data.kol_avg_followers || 100000;
        const kol_engagement = data.kol_engagement_rate || 0.03;
        const kolQuality = (kol_avg_followers / 500000) * 0.6 + (kol_engagement / 0.05) * 0.4;
        const kolScore = Math.min(35, kolQuality * 35);

        // 品牌声量得分 (0-25分)
        const brandVolumeScore = Math.min(25, (brand_mentions / 200) * 25);

        return Math.round(sentimentScore + kolScore + brandVolumeScore);
    }

    // 获取产出因子细分
    getOutputBreakdown(data) {
        const videoCount = data.short_video_count || 0;
        const liveCount = data.live_stream_count || 0;
        const totalViews = data.total_views || (videoCount * 5000 + liveCount * 15000);
        const engagementRate = data.engagement_rate || 0.05;

        return {
            exposure: totalViews,
            completion: Math.round((videoCount / 100 + liveCount / 30) / 2 * 100),
            interaction: (engagementRate * 100).toFixed(1)
        };
    }

    // 获取效率因子细分
    getEfficiencyBreakdown(data) {
        const totalViews = data.total_views || 100000;
        const conversions = data.marketing_conversions || totalViews * 0.02;
        const marketingCost = data.marketing_cost || 10000;
        const leads = data.marketing_leads || conversions * 0.5;
        const revenue = conversions * 200;
        const roi = marketingCost > 0 ? revenue / marketingCost : 0;
        const costPerLead = leads > 0 ? marketingCost / leads : 0;

        return {
            conversionRate: ((conversions / totalViews) * 100).toFixed(2),
            roi: roi.toFixed(2),
            costPerLead: Math.round(costPerLead)
        };
    }

    // 获取口碑因子细分
    getReputationBreakdown(data) {
        const positiveComments = data.positive_comments || 80;
        const totalComments = data.total_comments || 100;
        const sentimentRatio = (positiveComments / totalComments * 100).toFixed(1);
        const kol_avg_followers = data.kol_avg_followers || 100000;
        const brand_mentions = data.brand_mentions || 50;

        return {
            sentimentRatio,
            kolQuality: Math.round((kol_avg_followers / 500000) * 100),
            brandVolume: brand_mentions
        };
    }

    // 计算营销漏斗
    calculateMarketingFunnel(data) {
        const published = data.short_video_count + data.live_stream_count || 100;
        const exposure = data.total_views || published * 5000;
        const interaction = Math.round(exposure * (data.engagement_rate || 0.05));
        const conversion = Math.round(interaction * 0.15); // 15%互动转化为实际转化

        return {
            published: { value: published, label: '内容发布', unit: '条' },
            exposure: { value: exposure, label: '曝光触达', unit: '次' },
            interaction: { value: interaction, label: '互动参与', unit: '次' },
            conversion: { value: conversion, label: '实际转化', unit: '人' },
            rates: {
                exposureRate: ((exposure / published) / 1000).toFixed(1) + 'K',
                interactionRate: ((interaction / exposure) * 100).toFixed(2) + '%',
                conversionRate: ((conversion / interaction) * 100).toFixed(2) + '%'
            }
        };
    }

    // 生成营销指标卡片
    generateMarketingMetricsCards(videoCount, liveCount, metrics) {
        return `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
                <!-- 短视频发布量 -->
                <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 20px; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -20px; right: -20px; font-size: 80px; opacity: 0.1;">📹</div>
                    <div style="color: #60A5FA; font-size: 14px; font-weight: 600; margin-bottom: 8px;">短视频发布量</div>
                    <div style="color: #FAFAFA; font-size: 32px; font-weight: 700; margin-bottom: 4px;">${videoCount}</div>
                    <div style="color: #A1A1AA; font-size: 13px;">条/月</div>
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); color: #71717A; font-size: 12px;">
                        目标: 100条/月
                    </div>
                </div>

                <!-- 直播场次 -->
                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 20px; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -20px; right: -20px; font-size: 80px; opacity: 0.1;">📡</div>
                    <div style="color: #34D399; font-size: 14px; font-weight: 600; margin-bottom: 8px;">直播场次</div>
                    <div style="color: #FAFAFA; font-size: 32px; font-weight: 700; margin-bottom: 4px;">${liveCount}</div>
                    <div style="color: #A1A1AA; font-size: 13px;">场/月</div>
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); color: #71717A; font-size: 12px;">
                        目标: 30场/月
                    </div>
                </div>

                <!-- 营销指数 -->
                <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 20px; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -20px; right: -20px; font-size: 80px; opacity: 0.1;">🎯</div>
                    <div style="color: #FBBF24; font-size: 14px; font-weight: 600; margin-bottom: 8px;">营销指数</div>
                    <div style="color: #FAFAFA; font-size: 32px; font-weight: 700; margin-bottom: 4px;">${metrics.totalIndex}</div>
                    <div style="color: #A1A1AA; font-size: 13px;">/100分</div>
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
                        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                            <span style="color: #71717A;">产出 ${metrics.outputScore}</span>
                            <span style="color: #71717A;">效率 ${metrics.efficiencyScore}</span>
                            <span style="color: #71717A;">口碑 ${metrics.reputationScore}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 详细指标分解 -->
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <div style="color: #FAFAFA; font-size: 16px; font-weight: 600; margin-bottom: 16px;">📊 营销指数详细分解</div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
                    <!-- 产出因子 -->
                    <div>
                        <div style="color: #60A5FA; font-size: 14px; font-weight: 600; margin-bottom: 12px;">
                            产出因子 (${metrics.outputScore}/100)
                        </div>
                        <div style="color: #A1A1AA; font-size: 13px; line-height: 1.8;">
                            曝光量: ${metrics.breakdown.output.exposure.toLocaleString()}<br>
                            完成度: ${metrics.breakdown.output.completion}%<br>
                            互动率: ${metrics.breakdown.output.interaction}%
                        </div>
                    </div>

                    <!-- 效率因子 -->
                    <div>
                        <div style="color: #34D399; font-size: 14px; font-weight: 600; margin-bottom: 12px;">
                            效率因子 (${metrics.efficiencyScore}/100)
                        </div>
                        <div style="color: #A1A1AA; font-size: 13px; line-height: 1.8;">
                            转化率: ${metrics.breakdown.efficiency.conversionRate}%<br>
                            ROI: ${metrics.breakdown.efficiency.roi}倍<br>
                            留资成本: ¥${metrics.breakdown.efficiency.costPerLead}/条
                        </div>
                    </div>

                    <!-- 口碑因子 -->
                    <div>
                        <div style="color: #FBBF24; font-size: 14px; font-weight: 600; margin-bottom: 12px;">
                            口碑因子 (${metrics.reputationScore}/100)
                        </div>
                        <div style="color: #A1A1AA; font-size: 13px; line-height: 1.8;">
                            正向情感: ${metrics.breakdown.reputation.sentimentRatio}%<br>
                            KOL质量: ${metrics.breakdown.reputation.kolQuality}分<br>
                            品牌声量: ${metrics.breakdown.reputation.brandVolume}次
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 生成营销漏斗可视化
    generateMarketingFunnelViz(funnelData) {
        const stages = [funnelData.published, funnelData.exposure, funnelData.interaction, funnelData.conversion];
        const maxValue = funnelData.exposure.value;

        return `
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <div style="color: #FAFAFA; font-size: 16px; font-weight: 600; margin-bottom: 20px;">
                    🔄 营销转化漏斗（发布 → 曝光 → 互动 → 转化）
                </div>

                <div style="position: relative; padding: 20px 0;">
                    ${stages.map((stage, index) => {
                        const widthPercent = (stage.value / maxValue) * 100;
                        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
                        const prevValue = index > 0 ? stages[index - 1].value : null;
                        const conversionRate = prevValue ? ((stage.value / prevValue) * 100).toFixed(2) + '%' : '100%';

                        return `
                            <div style="margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <span style="color: #A1A1AA; font-size: 14px;">${stage.label}</span>
                                    <span style="color: #FAFAFA; font-weight: 600;">${stage.value.toLocaleString()}${stage.unit}</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.05); height: 40px; border-radius: 8px; overflow: hidden; position: relative;">
                                    <div style="background: ${colors[index]}; height: 100%; width: ${widthPercent}%; display: flex; align-items: center; justify-content: flex-end; padding-right: 12px; transition: width 0.5s ease; animation: breathe-funnel-${index} 3s ease-in-out infinite;">
                                        <span style="color: white; font-size: 12px; font-weight: 600;">${conversionRate}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- 转化率分析 -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div style="text-align: center;">
                        <div style="color: #60A5FA; font-size: 18px; font-weight: 700;">${funnelData.rates.exposureRate}</div>
                        <div style="color: #71717A; font-size: 12px;">平均曝光/条</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="color: #34D399; font-size: 18px; font-weight: 700;">${funnelData.rates.interactionRate}</div>
                        <div style="color: #71717A; font-size: 12px;">互动率</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="color: #FBBF24; font-size: 18px; font-weight: 700;">${funnelData.rates.conversionRate}</div>
                        <div style="color: #71717A; font-size: 12px;">转化率</div>
                    </div>
                </div>

                <style>
                    @keyframes breathe-funnel-0 { 0%, 100% { opacity: 1; } 50% { opacity: 0.85; } }
                    @keyframes breathe-funnel-1 { 0%, 100% { opacity: 1; } 50% { opacity: 0.85; } }
                    @keyframes breathe-funnel-2 { 0%, 100% { opacity: 1; } 50% { opacity: 0.85; } }
                    @keyframes breathe-funnel-3 { 0%, 100% { opacity: 1; } 50% { opacity: 0.85; } }
                </style>
            </div>
        `;
    }

    // 生成营销策略富文本编辑器
    // 生成营销策略编辑器（使用 editor_demo 专业样式）
    generateMarketingStrategyEditor(data) {
        const editorId = 'marketingStrategyEditor';

        return `
            <!-- 营销策略规划编辑器 -->
            <div style="background: #2a2a2a; border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">

                <!-- 工具栏 -->
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 15px; padding: 12px; background: #3a3a3a; border-radius: 8px;">
                    <button id="boldBtn_${editorId}" style="background: #4a4a4a; color: #ddd; border: 1px solid #555; border-radius: 6px; padding: 8px 14px; cursor: pointer; font-size: 13px; transition: all 0.2s;">
                        <b>B</b> 粗体
                    </button>
                    <button id="italicBtn_${editorId}" style="background: #4a4a4a; color: #ddd; border: 1px solid #555; border-radius: 6px; padding: 8px 14px; cursor: pointer; font-size: 13px; transition: all 0.2s;">
                        <i>/</i> 斜体
                    </button>
                    <button id="underlineBtn_${editorId}" style="background: #4a4a4a; color: #ddd; border: 1px solid #555; border-radius: 6px; padding: 8px 14px; cursor: pointer; font-size: 13px; transition: all 0.2s;">
                        <u>U</u> 下划线
                    </button>

                    <div style="width: 1px; height: 24px; background: #555; margin: 0 4px;"></div>

                    <select id="fontSize_${editorId}" style="background: #4a4a4a; color: #ddd; border: 1px solid #555; border-radius: 6px; padding: 8px 14px; cursor: pointer; font-size: 13px; transition: all 0.2s;">
                        <option value="">字体大小</option>
                        <option value="1">10px 极小</option>
                        <option value="2">12px 小</option>
                        <option value="3">14px 正常</option>
                        <option value="4">16px 中等</option>
                        <option value="5">18px 大</option>
                        <option value="6">24px 特大</option>
                        <option value="7">32px 超大</option>
                    </select>

                    <input type="color" id="fontColor_${editorId}" value="#1F2937" title="🎨 字体颜色" style="width: 40px; height: 38px; border: 1px solid #555; border-radius: 6px; cursor: pointer; background: #4a4a4a;">
                    <input type="color" id="bgColor_${editorId}" value="#FFFF00" title="🖍️ 背景高亮" style="width: 40px; height: 38px; border: 1px solid #555; border-radius: 6px; cursor: pointer; background: #4a4a4a;">

                    <div style="width: 1px; height: 24px; background: #555; margin: 0 4px;"></div>

                    <button id="ulBtn_${editorId}" style="background: #4a4a4a; color: #ddd; border: 1px solid #555; border-radius: 6px; padding: 8px 14px; cursor: pointer; font-size: 13px; transition: all 0.2s;">
                        • 列表
                    </button>
                    <button id="olBtn_${editorId}" style="background: #4a4a4a; color: #ddd; border: 1px solid #555; border-radius: 6px; padding: 8px 14px; cursor: pointer; font-size: 13px; transition: all 0.2s;">
                        1. 编号
                    </button>

                    <button id="templateBtn_${editorId}" style="background: #8B5CF6; color: white; border: 1px solid #8B5CF6; border-radius: 6px; padding: 8px 14px; cursor: pointer; font-size: 13px; transition: all 0.2s;">
                        📋 插入模板
                    </button>

                    <div style="flex-grow: 1;"></div>

                    <button id="saveBtn_${editorId}" style="background: #10B981; color: white; border: 1px solid #10B981; border-radius: 6px; padding: 8px 14px; cursor: pointer; font-size: 13px; transition: all 0.2s;">
                        💾 保存
                    </button>
                    <button id="clearBtn_${editorId}" style="background: #EF4444; color: white; border: 1px solid #EF4444; border-radius: 6px; padding: 8px 14px; cursor: pointer; font-size: 13px; transition: all 0.2s;">
                        🗑️ 清空
                    </button>
                </div>

                <!-- 编辑器主体 -->
                <div id="${editorId}" contenteditable="true" spellcheck="false" style="background: #fff; color: #1F2937; border-radius: 8px; min-height: 300px; padding: 20px; font-size: 14px; line-height: 1.8; outline: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                    <p><strong>营销策略内容规划</strong></p>
                    <p>这个编辑器提供了"插入模板"功能，点击可以快速生成营销计划模板。</p>
                </div>

                <style>
                    #${editorId}:focus {
                        background: #fafafa !important;
                        box-shadow: inset 0 0 0 2px rgba(96, 165, 250, 0.3) !important;
                    }
                    #${editorId} ul, #${editorId} ol {
                        padding-left: 32px;
                        margin: 12px 0;
                    }
                    #${editorId} li {
                        margin-bottom: 8px;
                    }
                    #${editorId} h3 {
                        color: #1F2937;
                        font-weight: 700;
                        margin-top: 20px;
                    }
                    #${editorId} p {
                        color: #1F2937;
                    }
                    #${editorId} strong { font-weight: 700; color: #111827; }
                    #${editorId} em { font-style: italic; color: #3B82F6; }
                    #${editorId} u { text-decoration: underline; }
                    #${editorId} font[size="1"] { font-size: 10px; }
                    #${editorId} font[size="2"] { font-size: 12px; }
                    #${editorId} font[size="3"] { font-size: 14px; }
                    #${editorId} font[size="4"] { font-size: 16px; }
                    #${editorId} font[size="5"] { font-size: 18px; }
                    #${editorId} font[size="6"] { font-size: 24px; }
                    #${editorId} font[size="7"] { font-size: 32px; }

                    /* 工具栏按钮悬停效果 */
                    button:hover, select:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    }
                </style>
            </div>
        `;
    }

    // 生成营销规则引擎建议
    generateMarketingRuleSuggestions(metrics, funnelData, data) {
        const suggestions = [];

        // 规则1: 产出不足
        if (metrics.outputScore < 60) {
            const impact = 85;
            const probability = 90;
            const cost = 20;
            const cycle = 2;
            const priority = (impact * probability) / (cost * cycle);

            suggestions.push({
                id: 'M001',
                title: '提升内容产出量',
                category: '产出优化',
                impact: impact,
                probability: probability,
                cost: cost,
                cycle: cycle,
                priority: Math.round(priority),
                problem: `当前产出因子仅${metrics.outputScore}分，低于行业平均水平（70分）。短视频发布量和直播场次未达标。`,
                solution: `1. 制定内容日历，确保每周发布15-20条短视频\n2. 增加直播频次至每周7-8场\n3. 建立内容素材库，提前储备30天内容\n4. 组建专职内容团队或外包给MCN机构`,
                expectedBenefit: '营销指数提升15-20分，曝光量增长50%',
                tasks: ['制定30天内容日历', '招聘/外包内容团队', '建立素材库系统']
            });
        }

        // 规则2: 转化效率低
        if (metrics.efficiencyScore < 60) {
            const impact = 90;
            const probability = 80;
            const cost = 30;
            const cycle = 3;
            const priority = (impact * probability) / (cost * cycle);

            suggestions.push({
                id: 'M002',
                title: '优化转化路径',
                category: '效率提升',
                impact: impact,
                probability: probability,
                cost: cost,
                cycle: cycle,
                priority: Math.round(priority),
                problem: `效率因子${metrics.efficiencyScore}分，转化率${funnelData.rates.conversionRate}偏低，营销ROI不足3倍。`,
                solution: `1. 在视频/直播中添加明确行动召唤（CTA）\n2. 优化落地页，减少转化步骤\n3. 建立私域流量池，提高留资转化\n4. 使用A/B测试优化转化文案和设计`,
                expectedBenefit: '转化率提升50%，ROI达到3-5倍',
                tasks: ['优化所有内容CTA设计', '重构落地页', '搭建私域运营体系']
            });
        }

        // 规则3: 口碑管理不足
        if (metrics.reputationScore < 60) {
            const impact = 75;
            const probability = 85;
            const cost = 15;
            const cycle = 2;
            const priority = (impact * probability) / (cost * cycle);

            suggestions.push({
                id: 'M003',
                title: '加强口碑建设',
                category: '口碑优化',
                impact: impact,
                probability: probability,
                cost: cost,
                cycle: cycle,
                priority: Math.round(priority),
                problem: `口碑因子${metrics.reputationScore}分，正向情感比例${metrics.breakdown.reputation.sentimentRatio}%，需要提升品牌美誉度。`,
                solution: `1. 建立用户评价回复机制，24小时内响应\n2. 邀请满意客户发布UGC内容\n3. 与2-3个头部KOL建立深度合作\n4. 策划口碑营销活动，鼓励用户分享`,
                expectedBenefit: '正向情感比提升至85%以上，品牌声量增长2倍',
                tasks: ['建立评价监控系统', '签约3个头部KOL', '策划口碑活动']
            });
        }

        // 规则4: 互动率低
        const interactionRate = parseFloat(funnelData.rates.interactionRate);
        if (interactionRate < 5) {
            const impact = 70;
            const probability = 90;
            const cost = 10;
            const cycle = 1;
            const priority = (impact * probability) / (cost * cycle);

            suggestions.push({
                id: 'M004',
                title: '提升内容互动',
                category: '互动优化',
                impact: impact,
                probability: probability,
                cost: cost,
                cycle: cycle,
                priority: Math.round(priority),
                problem: `互动率仅${funnelData.rates.interactionRate}，远低于行业标准（8-10%），内容缺乏吸引力。`,
                solution: `1. 优化内容选题，关注热点话题\n2. 在内容中设置互动钩子（提问、投票、抽奖）\n3. 及时回复评论，建立社区氛围\n4. 使用数据分析工具找到最佳发布时间`,
                expectedBenefit: '互动率提升至8%以上，粉丝粘性提高50%',
                tasks: ['分析爆款内容特征', '建立互动激励机制', '优化发布时间表']
            });
        }

        // 规则5: KOL合作不足
        const kolQuality = metrics.breakdown.reputation.kolQuality;
        if (kolQuality < 50) {
            const impact = 80;
            const probability = 75;
            const cost = 40;
            const cycle = 2;
            const priority = (impact * probability) / (cost * cycle);

            suggestions.push({
                id: 'M005',
                title: '建立KOL合作矩阵',
                category: '渠道拓展',
                impact: impact,
                probability: probability,
                cost: cost,
                cycle: cycle,
                priority: Math.round(priority),
                problem: `KOL质量得分${kolQuality}，缺乏头部达人背书，品牌曝光受限。`,
                solution: `1. 筛选3-5个垂直领域头部KOL（粉丝50万+）\n2. 建立长期合作关系，而非单次投放\n3. 混合使用头部（品牌曝光）+腰部（性价比）+素人（真实性）\n4. 建立KOL效果评估体系，优化投放ROI`,
                expectedBenefit: '品牌曝光提升3-5倍，口碑得分提升20分',
                tasks: ['筛选目标KOL清单', '制定合作方案', '建立效果追踪系统']
            });
        }

        // 按优先级排序
        suggestions.sort((a, b) => b.priority - a.priority);

        return suggestions;
    }

    // 生成规则引擎展示
    generateMarketingRuleEngine(suggestions) {
        if (suggestions.length === 0) {
            return `
                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                    <div style="color: #34D399; font-size: 16px; font-weight: 600; text-align: center;">
                        ✅ 营销表现优秀！暂无需要优化的建议
                    </div>
                </div>
            `;
        }

        return `
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <div style="color: #FAFAFA; font-size: 16px; font-weight: 600; margin-bottom: 16px;">
                    🤖 智能规则引擎建议（优先级排序）
                </div>

                <div style="color: #71717A; font-size: 13px; margin-bottom: 20px;">
                    基于"影响力 × 成功概率 ÷ (成本 × 周期)"算法自动生成，优先级分数越高越应优先执行
                </div>

                ${suggestions.map((sug, index) => {
                    const priorityColor = sug.priority > 200 ? '#EF4444' : sug.priority > 100 ? '#F59E0B' : '#10B981';
                    const priorityLabel = sug.priority > 200 ? '极高' : sug.priority > 100 ? '高' : '中';

                    return `
                        <div style="background: rgba(255,255,255,0.03); border-left: 4px solid ${priorityColor}; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
                            <!-- 头部 -->
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                                <div>
                                    <div style="color: #FAFAFA; font-size: 16px; font-weight: 600; margin-bottom: 8px;">
                                        ${index + 1}. ${sug.title}
                                    </div>
                                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                                        <span style="background: rgba(59, 130, 246, 0.2); color: #60A5FA; padding: 4px 10px; border-radius: 12px; font-size: 12px;">
                                            ${sug.category}
                                        </span>
                                        <span style="background: rgba(245, 158, 11, 0.2); color: #FBBF24; padding: 4px 10px; border-radius: 12px; font-size: 12px;">
                                            影响力 ${sug.impact}
                                        </span>
                                        <span style="background: rgba(16, 185, 129, 0.2); color: #34D399; padding: 4px 10px; border-radius: 12px; font-size: 12px;">
                                            成功率 ${sug.probability}%
                                        </span>
                                        <span style="background: rgba(239, 68, 68, 0.2); color: #F87171; padding: 4px 10px; border-radius: 12px; font-size: 12px;">
                                            成本 ${sug.cost}
                                        </span>
                                        <span style="background: rgba(168, 85, 247, 0.2); color: #C084FC; padding: 4px 10px; border-radius: 12px; font-size: 12px;">
                                            周期 ${sug.cycle}个月
                                        </span>
                                    </div>
                                </div>
                                <div style="text-align: center; background: ${priorityColor}; color: white; padding: 8px 16px; border-radius: 8px; min-width: 80px;">
                                    <div style="font-size: 20px; font-weight: 700;">${sug.priority}</div>
                                    <div style="font-size: 11px;">优先级 ${priorityLabel}</div>
                                </div>
                            </div>

                            <!-- 内容 -->
                            <div style="margin-bottom: 16px;">
                                <div style="color: #EF4444; font-size: 14px; font-weight: 600; margin-bottom: 8px;">❌ 问题诊断</div>
                                <div style="color: #A1A1AA; font-size: 13px; line-height: 1.8;">${sug.problem}</div>
                            </div>

                            <div style="margin-bottom: 16px;">
                                <div style="color: #10B981; font-size: 14px; font-weight: 600; margin-bottom: 8px;">✅ 解决方案</div>
                                <div style="color: #A1A1AA; font-size: 13px; line-height: 1.8; white-space: pre-line;">${sug.solution}</div>
                            </div>

                            <div style="margin-bottom: 16px;">
                                <div style="color: #FBBF24; font-size: 14px; font-weight: 600; margin-bottom: 8px;">💰 预期收益</div>
                                <div style="color: #A1A1AA; font-size: 13px; line-height: 1.8;">${sug.expectedBenefit}</div>
                            </div>

                            <!-- 任务清单 -->
                            <div style="margin-bottom: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
                                <div style="color: #60A5FA; font-size: 13px; font-weight: 600; margin-bottom: 8px;">📋 执行任务清单</div>
                                <div style="display: flex; flex-direction: column; gap: 6px;">
                                    ${sug.tasks.map(task => `
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <input type="checkbox" style="width: 16px; height: 16px; cursor: pointer;">
                                            <span style="color: #A1A1AA; font-size: 13px;">${task}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <!-- 操作按钮 -->
                            <div style="display: flex; gap: 12px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
                                <button onclick="createMarketingTask('${sug.id}')" style="background: #3B82F6; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; font-weight: 600;">
                                    ➕ 创建任务
                                </button>
                                <button style="background: rgba(255,255,255,0.1); color: #FAFAFA; border: 1px solid rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 6px; font-size: 13px; cursor: pointer;">
                                    📤 导出方案
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // 获取营销基准对比
    getMarketingBenchmark(businessType, metrics) {
        const benchmarks = {
            '快餐': { marketingIndex: 65, outputScore: 70, efficiencyScore: 65, reputationScore: 60 },
            '火锅': { marketingIndex: 75, outputScore: 75, efficiencyScore: 70, reputationScore: 80 },
            '正餐': { marketingIndex: 70, outputScore: 65, efficiencyScore: 75, reputationScore: 70 },
            '茶餐厅': { marketingIndex: 68, outputScore: 70, efficiencyScore: 65, reputationScore: 68 },
            '咖啡厅': { marketingIndex: 72, outputScore: 75, efficiencyScore: 68, reputationScore: 75 },
            '茶饮店': { marketingIndex: 78, outputScore: 80, efficiencyScore: 75, reputationScore: 75 },
            '其他': { marketingIndex: 70, outputScore: 70, efficiencyScore: 70, reputationScore: 70 }
        };

        const benchmark = benchmarks[businessType] || benchmarks['其他'];

        return {
            benchmark,
            comparison: {
                totalIndex: metrics.totalIndex - benchmark.marketingIndex,
                output: metrics.outputScore - benchmark.outputScore,
                efficiency: metrics.efficiencyScore - benchmark.efficiencyScore,
                reputation: metrics.reputationScore - benchmark.reputationScore
            },
            percentile: this.calculatePercentile(metrics.totalIndex, benchmark.marketingIndex)
        };
    }

    // 计算百分位
    calculatePercentile(actual, benchmark) {
        const ratio = actual / benchmark;
        if (ratio >= 1.2) return 90;
        if (ratio >= 1.1) return 75;
        if (ratio >= 1.0) return 60;
        if (ratio >= 0.9) return 40;
        if (ratio >= 0.8) return 25;
        return 10;
    }

    // 生成行业基准对比
    generateMarketingBenchmark(comparison) {
        return `
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <div style="color: #FAFAFA; font-size: 16px; font-weight: 600; margin-bottom: 16px;">
                    📊 行业基准对比分析
                </div>

                <div style="color: #71717A; font-size: 13px; margin-bottom: 20px;">
                    对比同业态餐饮的营销表现，评估您的市场竞争力（百分位：${comparison.percentile}%）
                </div>

                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
                    ${this.generateBenchmarkCard('营销指数', comparison.comparison.totalIndex, comparison.benchmark.marketingIndex)}
                    ${this.generateBenchmarkCard('产出因子', comparison.comparison.output, comparison.benchmark.outputScore)}
                    ${this.generateBenchmarkCard('效率因子', comparison.comparison.efficiency, comparison.benchmark.efficiencyScore)}
                    ${this.generateBenchmarkCard('口碑因子', comparison.comparison.reputation, comparison.benchmark.reputationScore)}
                </div>

                <!-- 竞争力评估 -->
                <div style="margin-top: 20px; padding: 16px; background: rgba(${comparison.percentile >= 60 ? '16, 185, 129' : '245, 158, 11'}, 0.1); border-radius: 8px;">
                    <div style="color: ${comparison.percentile >= 60 ? '#34D399' : '#FBBF24'}; font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                        ${comparison.percentile >= 75 ? '🏆 竞争力优秀' : comparison.percentile >= 60 ? '✅ 竞争力良好' : comparison.percentile >= 40 ? '⚠️ 竞争力一般' : '❌ 竞争力较弱'}
                    </div>
                    <div style="color: #A1A1AA; font-size: 13px; line-height: 1.8;">
                        ${this.getCompetitivenessAdvice(comparison.percentile)}
                    </div>
                </div>
            </div>
        `;
    }

    // 生成基准对比卡片
    generateBenchmarkCard(label, diff, benchmarkValue) {
        const isPositive = diff >= 0;
        const color = isPositive ? '#10B981' : '#EF4444';
        const icon = isPositive ? '↑' : '↓';
        const percent = ((Math.abs(diff) / benchmarkValue) * 100).toFixed(1);

        return `
            <div style="background: rgba(255,255,255,0.03); padding: 16px; border-radius: 8px; text-align: center;">
                <div style="color: #A1A1AA; font-size: 12px; margin-bottom: 8px;">${label}</div>
                <div style="color: ${color}; font-size: 24px; font-weight: 700; margin-bottom: 4px;">
                    ${icon} ${Math.abs(diff)}
                </div>
                <div style="color: #71717A; font-size: 11px;">
                    ${isPositive ? '优于' : '低于'}行业 ${percent}%
                </div>
                <div style="color: #52525B; font-size: 11px; margin-top: 4px;">
                    行业基准: ${benchmarkValue}
                </div>
            </div>
        `;
    }

    // 获取竞争力建议
    getCompetitivenessAdvice(percentile) {
        if (percentile >= 75) {
            return '您的营销表现处于行业前25%，建议继续保持优势并探索创新营销模式，可考虑打造品牌IP或拓展新渠道。';
        } else if (percentile >= 60) {
            return '您的营销表现处于行业中上游，建议在保持现有优势的基础上，重点优化薄弱环节，争取进入前25%。';
        } else if (percentile >= 40) {
            return '您的营销表现处于行业平均水平，建议参考行业最佳实践，在产出、效率、口碑三方面全面提升。';
        } else {
            return '您的营销表现低于行业平均，建议优先执行高优先级建议，快速补齐短板，避免在竞争中落后。';
        }
    }

    // 生成任务追踪系统
    generateMarketingTaskTracker(suggestions) {
        return `
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px;">
                <!-- 头部：标题 + 手动创建按钮 + 统计徽章 -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="color: #FAFAFA; font-size: 16px; font-weight: 600;">📌 营销任务追踪看板</span>
                        <button onclick="createCustomTask()" style="background: #3B82F6; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.background='#2563EB'" onmouseout="this.style.background='#3B82F6'">
                            ➕ 手动创建任务
                        </button>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <span style="color: #71717A; font-size: 13px; background: rgba(255,255,255,0.05); padding: 6px 12px; border-radius: 6px;">
                            待处理: <strong class="task-count-badge" style="color: #FAFAFA;">0</strong>
                        </span>
                        <span style="color: #71717A; font-size: 13px; background: rgba(59, 130, 246, 0.2); padding: 6px 12px; border-radius: 6px;">
                            进行中: <strong class="task-count-badge" style="color: #60A5FA;">0</strong>
                        </span>
                        <span style="color: #71717A; font-size: 13px; background: rgba(16, 185, 129, 0.2); padding: 6px 12px; border-radius: 6px;">
                            已完成: <strong class="task-count-badge" style="color: #34D399;">0</strong>
                        </span>
                    </div>
                </div>

                <!-- 使用说明 -->
                <div style="color: #71717A; font-size: 13px; margin-bottom: 20px; line-height: 1.6;">
                    💡 <strong style="color: #A1A1AA;">使用提示：</strong><br>
                    • 点击上方建议中的"创建任务"按钮快速创建任务<br>
                    • 点击"手动创建任务"可自定义任务内容<br>
                    • 双击任务标题可编辑，勾选复选框标记完成<br>
                    • 任务数据自动保存到本地，刷新页面不会丢失
                </div>

                <!-- 任务列表容器 -->
                <div id="marketingTaskList" style="min-height: 100px;">
                    <!-- 任务将通过 renderMarketingTasks() 函数动态渲染 -->
                </div>

                <!-- 快捷操作（禁用状态，等待后续开发） -->
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div style="color: #A1A1AA; font-size: 13px; margin-bottom: 12px;">💡 快捷操作（开发中）</div>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <button class="placeholder-action-btn" style="background: rgba(59, 130, 246, 0.1); color: #60A5FA; border: 1px solid rgba(59, 130, 246, 0.3); padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: not-allowed; opacity: 0.5;" disabled title="功能开发中，敬请期待">
                            @运营团队 提醒执行
                        </button>
                        <button class="placeholder-action-btn" style="background: rgba(16, 185, 129, 0.1); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: not-allowed; opacity: 0.5;" disabled title="功能开发中，敬请期待">
                            📅 设置截止日期
                        </button>
                        <button class="placeholder-action-btn" style="background: rgba(245, 158, 11, 0.1); color: #FBBF24; border: 1px solid rgba(245, 158, 11, 0.3); padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: not-allowed; opacity: 0.5;" disabled title="功能开发中，敬请期待">
                            📊 查看任务进度
                        </button>
                        <button class="placeholder-action-btn" style="background: rgba(168, 85, 247, 0.1); color: #C084FC; border: 1px solid rgba(168, 85, 247, 0.3); padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: not-allowed; opacity: 0.5;" disabled title="功能开发中，敬请期待">
                            📤 导出任务清单
                        </button>
                    </div>
                </div>

                <!-- 初始化任务列表渲染 -->
                <script>
                    (function() {
                        setTimeout(function() {
                            if (typeof renderMarketingTasks === 'function') {
                                renderMarketingTasks();
                                console.log('✓ 营销任务列表已渲染');
                            } else {
                                console.warn('⚠️ renderMarketingTasks 函数未定义');
                            }
                        }, 100);
                    })();
                </script>
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
        const marketingIndex = (kpi && kpi.content_marketing_index) || 0;
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
            profitability: this.calculateSimpleProfitabilityScore(kpi, benchmark),
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

    calculateSimpleProfitabilityScore(kpi, benchmark) {
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
