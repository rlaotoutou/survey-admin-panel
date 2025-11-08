// Optimized Restaurant Survey Admin Panel
// Performance optimizations: lazy loading, caching, efficient DOM manipulation

class RestaurantSurveyApp {
    constructor() {
        this.currentData = [];
        this.currentPage = 1;
        this.totalRecords = 0;
        this.limit = 25;
        this.currentRecord = null;
        this.cache = new Map();
        this.diagnosis = new RestaurantDiagnosisAdvanced();

        this.initializeElements();
        this.bindEvents();
        this.initializeDiagnosis();

        // 自动恢复登录状态
        this.restoreLoginState();
    }

    initializeElements() {
        // Cache DOM elements for better performance
        this.elements = {
            apiUrl: document.getElementById('apiUrl'),
            adminKey: document.getElementById('adminKey'),
            loadData: document.getElementById('loadData'),
            logoutBtn: document.getElementById('logoutBtn'),
            statusDisplay: document.getElementById('statusDisplay'),
            statusIndicator: document.getElementById('statusIndicator'),
            statusText: document.getElementById('statusText'),
            statsSection: document.getElementById('statsSection'),
            paginationSection: document.getElementById('paginationSection'),
            dataContainer: document.getElementById('dataContainer'),
            totalCount: document.getElementById('totalCount'),
            currentCount: document.getElementById('currentCount'),
            latestRecord: document.getElementById('latestRecord'),
            exportCSV: document.getElementById('exportCSV'),
            limitSelect: document.getElementById('limitSelect'),
            prevPage: document.getElementById('prevPage'),
            nextPage: document.getElementById('nextPage'),
            pageInfo: document.getElementById('pageInfo'),
            detailModal: document.getElementById('detailModal'),
            closeModal: document.getElementById('closeModal'),
            exportImageBtn: document.getElementById('exportImageBtn'),
            detailsContent: document.getElementById('detailsContent'),
            diagnosisContent: document.getElementById('diagnosisContent')
        };
    }

    bindEvents() {
        // Use event delegation for better performance
        this.elements.loadData.addEventListener('click', () => this.loadSurveyData());
        this.elements.logoutBtn.addEventListener('click', () => {
            if (confirm('确定要退出登录吗？这将清除已保存的登录信息。')) {
                this.clearLoginState();
            }
        });
        this.elements.exportCSV.addEventListener('click', () => this.exportToCSV());
        this.elements.limitSelect.addEventListener('change', (e) => {
            this.limit = parseInt(e.target.value);
            this.currentPage = 1;
            this.loadSurveyData();
        });
        this.elements.prevPage.addEventListener('click', () => {
            this.currentPage--;
            this.loadSurveyData();
        });
        this.elements.nextPage.addEventListener('click', () => {
            this.currentPage++;
            this.loadSurveyData();
        });
        this.elements.closeModal.addEventListener('click', () => this.closeModal());
        this.elements.detailModal.addEventListener('click', (e) => {
            if (e.target === this.elements.detailModal) this.closeModal();
        });
        this.elements.exportImageBtn.addEventListener('click', () => this.exportToImage());

        // Tab switching with event delegation
        document.addEventListener('click', (e) => {
            if (e.target.matches('.tab-button')) {
                this.switchTab(e.target.dataset.tab);
            }
        });
    }

    initializeDiagnosis() {
        // Initialize diagnosis system
        this.diagnosis = new RestaurantDiagnosisAdvanced();
    }

    // 保存登录状态到 localStorage
    saveLoginState(apiUrl, adminKey) {
        try {
            const loginState = {
                apiUrl: apiUrl,
                adminKey: adminKey,
                timestamp: new Date().getTime()
            };
            localStorage.setItem('restaurantSurveyLogin', JSON.stringify(loginState));
            console.log('✓ 登录状态已保存');
        } catch (error) {
            console.error('保存登录状态失败:', error);
        }
    }

    // 恢复登录状态
    restoreLoginState() {
        try {
            const savedState = localStorage.getItem('restaurantSurveyLogin');
            if (savedState) {
                const loginState = JSON.parse(savedState);

                // 检查凭据是否过期（7天有效期）
                const daysValid = 7;
                const now = new Date().getTime();
                const daysPassed = (now - loginState.timestamp) / (1000 * 60 * 60 * 24);

                if (daysPassed < daysValid) {
                    // 自动填充凭据
                    this.elements.apiUrl.value = loginState.apiUrl;
                    this.elements.adminKey.value = loginState.adminKey;

                    // 显示提示信息
                    this.showStatus('checking', '检测到已保存的登录信息，正在自动加载...');

                    // 自动加载数据（延迟200ms确保DOM完全就绪）
                    setTimeout(() => {
                        this.loadSurveyData();
                    }, 200);

                    console.log('✓ 已恢复登录状态');
                } else {
                    // 凭据过期，清除
                    localStorage.removeItem('restaurantSurveyLogin');
                    console.log('登录凭据已过期，已清除');
                }
            }
        } catch (error) {
            console.error('恢复登录状态失败:', error);
        }
    }

    // 清除登录状态（用于退出登录）
    clearLoginState() {
        try {
            localStorage.removeItem('restaurantSurveyLogin');
            this.elements.apiUrl.value = '';
            this.elements.adminKey.value = '';
            this.currentData = [];
            this.elements.statsSection.classList.add('hidden');
            this.elements.paginationSection.classList.add('hidden');
            this.elements.dataContainer.innerHTML = `
                <div class="p-8 text-center text-gray-500">
                    <i class="fas fa-inbox text-4xl mb-4"></i>
                    <p>请先连接API加载数据</p>
                </div>
            `;
            this.showStatus('error', '已退出登录');
            console.log('✓ 已清除登录状态');
        } catch (error) {
            console.error('清除登录状态失败:', error);
        }
    }

    async loadSurveyData() {
        const api = this.elements.apiUrl.value.trim();
        const key = this.elements.adminKey.value.trim();

        if (!api || !key) {
            this.showStatus('error', '请输入API地址和管理员密钥');
            return;
        }

        // Check cache first
        const cacheKey = `${api}_${key}_${this.currentPage}_${this.limit}`;
        if (this.cache.has(cacheKey)) {
            const cachedData = this.cache.get(cacheKey);
            this.currentData = cachedData.rows;
            this.totalRecords = cachedData.total;
            this.displayData();
            this.updateStats();
            this.updatePagination();
            this.showStatus('connected', `从缓存加载 ${this.currentData.length} 条记录`);
            return;
        }

        this.toggleLoading(true);
        this.showStatus('checking', '正在加载数据...');

        try {
            const offset = (this.currentPage - 1) * this.limit;
            const response = await fetch(`${api}/api/surveys?limit=${this.limit}&offset=${offset}`, {
                method: 'GET',
                headers: {
                    'x-admin-key': key,
                    'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(30000)
            });

            if (response.ok) {
                const data = await response.json();
                this.currentData = data.rows || [];
                this.totalRecords = data.total || 0;

                // Cache the result
                this.cache.set(cacheKey, data);

                // 保存登录凭据到 localStorage（首次成功登录时）
                this.saveLoginState(api, key);

                this.displayData();
                this.updateStats();
                this.updatePagination();
                this.showStatus('connected', `成功加载 ${this.currentData.length} 条记录`);

                this.elements.statsSection.classList.remove('hidden');
                this.elements.paginationSection.classList.remove('hidden');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('加载数据失败:', error);
            let errorMessage = '加载失败: ';
            
            if (error.name === 'AbortError' || error.name === 'TimeoutError') {
                errorMessage += '请求超时';
            } else if (error.message.includes('401')) {
                errorMessage += '管理员密钥错误';
            } else {
                errorMessage += error.message;
            }
            
            this.showStatus('error', errorMessage);
        } finally {
            this.toggleLoading(false);
        }
    }

    displayData() {
        if (this.currentData.length === 0) {
            this.elements.dataContainer.innerHTML = `
                <div class="p-8 text-center text-gray-500">
                    <i class="fas fa-inbox text-4xl mb-4"></i>
                    <p>暂无数据</p>
                </div>
            `;
            return;
        }

        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        const table = document.createElement('table');
        table.className = 'data-table w-full';

        // Create table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>ID</th>
                <th>提交时间</th>
                <th>门店识别码</th>
                <th>门店名称</th>
                <th>业态类型</th>
                <th>月营收</th>
                <th>日均客流</th>
                <th>更新次数</th>
                <th>操作</th>
            </tr>
        `;
        table.appendChild(thead);

        // Create table body with optimized rendering
        const tbody = document.createElement('tbody');
        this.currentData.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.id}</td>
                <td>${this.formatDate(record.timestamp)}</td>
                <td><span class="font-mono text-blue-600">${record.store_identifier || '-'}</span></td>
                <td>${record.store_name || '-'}</td>
                <td>${record.business_type || '-'}</td>
                <td>${this.formatNumber(record.monthly_revenue)}</td>
                <td>${record.daily_customers || '-'}</td>
                <td><span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">${record.update_count || 0}次</span></td>
                <td>
                    <button onclick="app.viewRecord(${record.id})" class="text-blue-500 hover:text-blue-700 mr-2" title="查看详情">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="app.viewDiagnosis(${record.id})" class="text-purple-500 hover:text-purple-700" title="AI诊断">
                        <i class="fas fa-stethoscope"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        fragment.appendChild(table);

        this.elements.dataContainer.innerHTML = '';
        this.elements.dataContainer.appendChild(fragment);
    }

    viewRecord(id) {
        const record = this.currentData.find(r => r.id === id);
        if (!record) return;
        this.currentRecord = record;

        document.getElementById('modalTitle').textContent = '数据详情';
        this.switchTab('details');
        this.elements.exportImageBtn.classList.add('hidden');

        this.renderDetailsContent(record);
        this.elements.detailModal.classList.add('active');
    }

    viewDiagnosis(id) {
        const record = this.currentData.find(r => r.id === id);
        if (!record) return;
        this.currentRecord = record;

        document.getElementById('modalTitle').textContent = 'AI诊断报告';
        this.switchTab('diagnosis');
        this.elements.exportImageBtn.classList.remove('hidden');

        // Lazy load diagnosis content
        this.renderDiagnosisContent(record);
        this.elements.detailModal.classList.add('active');
    }

    renderDetailsContent(record) {
        const sections = [
            {
                title: '基本信息',
                icon: 'fa-info-circle',
                color: 'blue',
                fields: [
                    { label: '记录ID', value: record.id },
                    { label: '提交时间', value: this.formatDate(record.timestamp) },
                    { label: '门店识别码', value: record.store_identifier },
                    { label: '门店名称', value: record.store_name },
                    { label: '业态类型', value: record.business_type },
                    { label: '门店面积', value: this.formatNumber(record.store_area) + ' 平方米' },
                    { label: '商圈情况', value: record.business_circle },
                    { label: '装修档次', value: record.decoration_level },
                    { label: '更新次数', value: record.update_count || 0 }
                ]
            },
            {
                title: '财务数据',
                icon: 'fa-money-bill-wave',
                color: 'green',
                fields: [
                    { label: '月营业收入', value: '¥' + this.formatNumber(record.monthly_revenue) },
                    { label: '线上营收', value: '¥' + this.formatNumber(record.online_revenue) },
                    { label: '食材成本', value: '¥' + this.formatNumber(record.food_cost) },
                    { label: '人力成本', value: '¥' + this.formatNumber(record.labor_cost) },
                    { label: '租金成本', value: '¥' + this.formatNumber(record.rent_cost) },
                    { label: '水电气成本', value: '¥' + this.formatNumber(record.utility_cost) },
                    { label: '营销费用', value: '¥' + this.formatNumber(record.marketing_cost) }
                ]
            },
            {
                title: '运营数据',
                icon: 'fa-chart-line',
                color: 'purple',
                fields: [
                    { label: '日均客流', value: record.daily_customers + ' 人/天' },
                    { label: '座位数', value: record.seats + ' 个' },
                    { label: '总客流', value: this.formatNumber(record.total_customers) + ' 人/月' },
                    { label: '复购老客户', value: this.formatNumber(record.repeat_customers) + ' 人/月' },
                    { label: '线上主营平台', value: record.main_platforms },
                    { label: '营销情况', value: record.marketing_situation }
                ]
            },
            {
                title: '体验数据',
                icon: 'fa-star',
                color: 'orange',
                fields: [
                    { label: '平均评分', value: record.average_rating },
                    { label: '总评论数', value: this.formatNumber(record.total_reviews) + ' 条/月' },
                    { label: '差评数', value: this.formatNumber(record.bad_reviews) + ' 条/月' },
                    { label: '服务差评', value: this.formatNumber(record.service_bad_reviews) + ' 条/月' },
                    { label: '口味差评', value: this.formatNumber(record.taste_bad_reviews) + ' 条/月' },
                    { label: '短视频发布量', value: this.formatNumber(record.short_video_count) + ' 条/月' },
                    { label: '直播场次', value: record.live_stream_count + ' 场/月' }
                ]
            }
        ];

        let html = '';
        sections.forEach(section => {
            html += `
                <div class="mb-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <i class="fas ${section.icon} text-${section.color}-500 mr-2"></i>
                        ${section.title}
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${section.fields.map(field => `
                            <div class="flex justify-between py-2 border-b border-gray-100">
                                <span class="text-gray-600">${field.label}:</span>
                                <span class="font-medium">${field.value || '-'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        this.elements.detailsContent.innerHTML = html;
    }

    async renderDiagnosisContent(record) {
        // Show loading state
        this.elements.diagnosisContent.innerHTML = `
            <div class="text-center py-8">
                <div class="spinner mx-auto mb-4"></div>
                <p>正在生成AI诊断报告...</p>
            </div>
        `;

        try {
        // 立即执行而不是等待 requestIdleCallback
        setTimeout(() => {
            try {
                this.generateDiagnosisReport(record);
            } catch (error) {
                console.error('❌ 生成诊断报告失败:', error);
                this.showDiagnosisError(error);
            }
        }, 100); // 给UI一点时间显示加载状态
    } catch (error) {
        console.error('❌ 渲染诊断内容失败:', error);
        this.showDiagnosisError(error);
    }
}

    generateDiagnosisReport(record) {
        const kpi = this.diagnosis.calculateKPI(record);
        const benchmark = this.diagnosis.industryBenchmarks[record.business_type] || this.diagnosis.industryBenchmarks['其他'];

        // Generate comprehensive diagnosis report
        let html = this.diagnosis.generateReport(record, kpi, benchmark);
        this.elements.diagnosisContent.innerHTML = html;

        // 初始化富文本编辑器（在DOM渲染后）
        initAllRichTextEditors();
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }

    closeModal() {
        this.elements.detailModal.classList.remove('active');
    }

    async exportToImage() {
        // 使用正确的诊断内容容器
        const element = document.getElementById('diagnosisContent');

        if (!element || !element.innerHTML.trim()) {
            alert('❌ 没有可导出的诊断报告内容');
            return;
        }

        this.elements.exportImageBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>生成长图中...';
        this.elements.exportImageBtn.disabled = true;

        // 记录原始样式，用于恢复
        const originalStyles = {
            width: element.style.width,
            maxWidth: element.style.maxWidth,
            minWidth: element.style.minWidth,
            overflow: element.style.overflow
        };

        try {
            // 固定导出宽度（与诊断页面一致）
            const EXPORT_WIDTH = 1400;
            const SCALE = 2;

            console.log('🔄 准备导出...');

            // ✅ 步骤1: 等待字体加载完成
            await document.fonts.ready;
            console.log('✓ 字体加载完成');

            // ✅ 步骤2: 等待异步数据和图表渲染完成
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log('✓ 渲染等待完成');

            // ✅ 步骤3: 添加导出模式类（用于临时移除特效）
            element.classList.add('export-mode');

            // ✅ 步骤4: 锁定宽度，展开滚动内容
            element.style.width = `${EXPORT_WIDTH}px`;
            element.style.maxWidth = `${EXPORT_WIDTH}px`;
            element.style.minWidth = `${EXPORT_WIDTH}px`;
            element.style.overflow = 'visible'; // 展开所有滚动内容

            console.log('✓ 样式预处理完成');

            // ✅ 步骤5: 优化的html2canvas配置
            const canvas = await html2canvas(element, {
                scale: SCALE, // 高清导出 (2800px 实际输出)
                useCORS: true, // 支持跨域图片
                allowTaint: false, // 安全模式
                backgroundColor: '#18181B', // 固定深色背景，避免透明层叠导致灰雾
                logging: false, // 关闭日志
                width: EXPORT_WIDTH,
                height: element.scrollHeight,
                windowWidth: EXPORT_WIDTH,
                windowHeight: element.scrollHeight,
                scrollY: -window.scrollY,
                scrollX: -window.scrollX,
                // 确保正确渲染样式
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.getElementById('diagnosisContent');
                    if (clonedElement) {
                        // 强制设置固定宽度和深色背景
                        clonedElement.style.width = `${EXPORT_WIDTH}px`;
                        clonedElement.style.maxWidth = `${EXPORT_WIDTH}px`;
                        clonedElement.style.minWidth = `${EXPORT_WIDTH}px`;
                        clonedElement.style.backgroundColor = '#18181B';
                        clonedElement.style.display = 'block';
                        clonedElement.style.visibility = 'visible';
                        clonedElement.style.opacity = '1';
                        clonedElement.style.boxSizing = 'border-box';
                        clonedElement.style.overflow = 'visible';

                        // 移除可能导致渲染问题的CSS特效
                        const allElements = clonedElement.querySelectorAll('*');
                        allElements.forEach(el => {
                            // 保留基本样式，但移除可能不兼容的特效
                            if (el.style) {
                                // 移除 backdrop-filter（canvas不支持）
                                el.style.backdropFilter = 'none';
                                el.style.webkitBackdropFilter = 'none';

                                // 确保文字可见性
                                if (el.style.color === 'transparent') {
                                    el.style.color = '#FAFAFA';
                                }

                                // 确保百分比宽度元素正确显示
                                if (!el.style.width || el.style.width.includes('%')) {
                                    el.style.maxWidth = '100%';
                                }
                            }
                        });

                        console.log('✓ onclone 样式处理完成');
                    }
                }
            });

            console.log('✓ Canvas 生成完成');

            // ✅ 步骤6: 转换为高质量PNG并下载
            const link = document.createElement('a');
            const storeName = this.currentRecord?.store_name || '餐厅';
            const date = new Date().toISOString().slice(0, 10);
            link.download = `${storeName}_AI诊断报告_${date}.png`;
            link.href = canvas.toDataURL('image/png', 1.0); // 最高质量
            link.click();

            // 成功提示（显示实际导出尺寸）
            const actualWidth = canvas.width / SCALE;
            const actualHeight = canvas.height / SCALE;
            console.log(`✅ 导出成功 - 尺寸: ${actualWidth}px × ${actualHeight}px (${canvas.width}px × ${canvas.height}px @${SCALE}x)`);

            setTimeout(() => {
                alert(`✅ 诊断报告长图已保存！\n\n逻辑尺寸: ${actualWidth}px × ${actualHeight}px\n实际分辨率: ${canvas.width}px × ${canvas.height}px\n文件大小: ~${(link.href.length / 1024 / 1024).toFixed(2)}MB`);
            }, 100);

        } catch (error) {
            console.error('❌ 导出失败:', error);
            alert(`❌ 导出失败: ${error.message}\n\n可能原因：\n1. html2canvas库未加载\n2. 内容过大超出内存限制\n3. 跨域图片加载失败\n\n请查看控制台获取详细信息`);
        } finally {
            // ✅ 步骤7: 恢复原始样式
            element.classList.remove('export-mode');
            element.style.width = originalStyles.width;
            element.style.maxWidth = originalStyles.maxWidth;
            element.style.minWidth = originalStyles.minWidth;
            element.style.overflow = originalStyles.overflow;

            this.elements.exportImageBtn.innerHTML = '<i class="fas fa-image mr-2"></i>保存长图';
            this.elements.exportImageBtn.disabled = false;

            console.log('✓ 样式恢复完成');
        }
    }

    exportToCSV() {
        if (this.currentData.length === 0) {
            alert('没有数据可导出');
            return;
        }

        const headers = ['ID', '提交时间', '门店识别码', '门店名称', '业态类型', '月营收', '日均客流', '更新次数'];
        const csvContent = [
            headers.join(','),
            ...this.currentData.map(record => [
                record.id,
                this.formatDate(record.timestamp),
                record.store_identifier || '',
                record.store_name || '',
                record.business_type || '',
                record.monthly_revenue || 0,
                record.daily_customers || 0,
                record.update_count || 0
            ].join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `survey_data_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
    }

    updateStats() {
        this.elements.totalCount.textContent = this.totalRecords;
        this.elements.currentCount.textContent = this.currentData.length;
        this.elements.latestRecord.textContent = this.currentData.length > 0 ? 
            this.formatDate(this.currentData[0].timestamp) : '-';
    }

    updatePagination() {
        const totalPages = Math.ceil(this.totalRecords / this.limit);
        this.elements.pageInfo.textContent = `第 ${this.currentPage} 页，共 ${totalPages} 页`;
        this.elements.prevPage.disabled = this.currentPage <= 1;
        this.elements.nextPage.disabled = this.currentPage >= totalPages;
    }

    showStatus(type, message) {
        this.elements.statusDisplay.classList.remove('hidden');
        this.elements.statusIndicator.className = `flex items-center p-3 rounded-md ${this.getStatusClass(type)}`;
        this.elements.statusText.textContent = message;
        
        const icon = this.elements.statusIndicator.querySelector('i');
        icon.className = `fas ${this.getStatusIcon(type)} text-sm mr-2`;
    }

    getStatusClass(type) {
        const classes = {
            'checking': 'bg-yellow-50 text-yellow-800',
            'connected': 'bg-green-50 text-green-800',
            'error': 'bg-red-50 text-red-800'
        };
        return classes[type] || classes['error'];
    }

    getStatusIcon(type) {
        const icons = {
            'checking': 'fa-spinner fa-spin',
            'connected': 'fa-check-circle',
            'error': 'fa-exclamation-circle'
        };
        return icons[type] || icons['error'];
    }

    toggleLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        const text = document.querySelector('.loading-text');
        
        if (show) {
            spinner.classList.add('active');
            text.classList.add('hidden');
        } else {
            spinner.classList.remove('active');
            text.classList.remove('hidden');
        }
    }

    formatDate(timestamp) {
        return new Date(timestamp).toLocaleString('zh-CN');
    }

    formatNumber(num) {
        if (!num) return '0';
        return new Intl.NumberFormat('zh-CN').format(num);
    }
}

// ============================================
// 全局函数 - 营销模块相关（完整任务管理系统）
// ============================================

// 任务数据存储（全局）
let marketingTaskList = [];

// 加载任务列表
function loadMarketingTasks() {
    const saved = localStorage.getItem('marketingTasks');
    if (saved) {
        try {
            marketingTaskList = JSON.parse(saved);
            console.log('✓ 已加载任务列表:', marketingTaskList.length, '个任务');
        } catch (error) {
            console.error('❌ 任务列表解析失败:', error);
            marketingTaskList = [];
        }
    }
}

// 保存任务列表
function saveMarketingTasks() {
    localStorage.setItem('marketingTasks', JSON.stringify(marketingTaskList));
    console.log('✓ 任务列表已保存:', marketingTaskList.length, '个任务');
}

// 保存营销策略编辑器内容
function saveMarketingStrategy() {
    const editor = document.getElementById('marketingStrategyEditor');
    if (editor) {
        localStorage.setItem('marketingStrategyContent', editor.innerHTML);
        alert('✅ 营销策略已保存');
        console.log('✓ 营销策略已保存到 localStorage');
    } else {
        console.error('❌ 找不到营销策略编辑器元素');
        alert('❌ 保存失败：找不到编辑器');
    }
}

// 创建营销任务（从规则引擎建议）
function createMarketingTask(suggestionId) {
    // 弹出输入框让用户自定义任务名称
    const title = prompt('📝 请输入任务名称：\n（可直接使用建议标题或自定义）', `执行建议 #${suggestionId}`);

    if (!title || title.trim() === '') {
        console.log('❌ 用户取消创建任务');
        return;
    }

    // 生成唯一任务ID
    const taskId = `M${Date.now().toString().slice(-6)}`;

    // 创建任务对象
    const newTask = {
        id: taskId,
        title: title.trim(),
        suggestionId: suggestionId,
        status: 'pending', // pending / ongoing / completed
        checked: false,
        deleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // 添加到任务列表
    marketingTaskList.push(newTask);

    // 保存到localStorage
    saveMarketingTasks();

    // 重新渲染任务列表
    renderMarketingTasks();

    console.log(`✅ 任务创建成功:`, newTask);
    alert(`✅ 任务"${title}"已添加到追踪看板`);
}

// 创建自定义任务（用户手动创建）
function createCustomTask() {
    const title = prompt('📝 请输入新任务名称：');

    if (!title || title.trim() === '') {
        return;
    }

    const taskId = `M${Date.now().toString().slice(-6)}`;

    const newTask = {
        id: taskId,
        title: title.trim(),
        suggestionId: 'custom',
        status: 'pending',
        checked: false,
        deleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    marketingTaskList.push(newTask);
    saveMarketingTasks();
    renderMarketingTasks();

    console.log(`✅ 自定义任务创建成功:`, newTask);
}

// 渲染任务列表
function renderMarketingTasks() {
    const taskListContainer = document.getElementById('marketingTaskList');

    if (!taskListContainer) {
        console.warn('⚠️ 任务列表容器未找到，等待DOM加载');
        return;
    }

    // 过滤掉已删除的任务
    const visibleTasks = marketingTaskList.filter(t => !t.deleted);

    if (visibleTasks.length === 0) {
        // 显示空状态
        taskListContainer.innerHTML = `
            <div style="text-align: center; color: #52525B; padding: 40px 0; border: 2px dashed rgba(255,255,255,0.1); border-radius: 8px;">
                <div style="font-size: 48px; margin-bottom: 12px;">📋</div>
                <div style="font-size: 14px; margin-bottom: 16px;">暂无营销任务</div>
                <button onclick="createCustomTask()" style="background: #3B82F6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;">
                    ➕ 创建第一个任务
                </button>
            </div>
        `;
    } else {
        // 渲染任务卡片
        taskListContainer.innerHTML = visibleTasks.map(task => {
            const statusColors = {
                'pending': '#52525B',
                'ongoing': '#3B82F6',
                'completed': '#10B981'
            };
            const borderColor = statusColors[task.status] || '#52525B';
            const checkboxChecked = task.checked ? 'checked' : '';
            const titleStyle = task.checked ? 'text-decoration: line-through; opacity: 0.6;' : '';

            return `
                <div class="task-card" data-task-id="${task.id}" style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 3px solid ${borderColor}; animation: slideIn 0.3s ease-out;">
                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                        <!-- 复选框 -->
                        <input type="checkbox" ${checkboxChecked} onchange="toggleTaskChecked('${task.id}')" style="width: 18px; height: 18px; cursor: pointer; margin-top: 2px; accent-color: #10B981;">

                        <!-- 任务内容 -->
                        <div style="flex: 1;">
                            <div class="task-title" ondblclick="editTaskTitle('${task.id}')" style="color: #FAFAFA; font-weight: 600; margin-bottom: 8px; cursor: text; ${titleStyle}">
                                ${task.title}
                            </div>
                            <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                                <span style="color: #A1A1AA; font-size: 12px;">ID: ${task.id}</span>
                                <span style="color: #71717A; font-size: 12px;">创建: ${new Date(task.createdAt).toLocaleString('zh-CN', {month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'})}</span>
                            </div>
                        </div>

                        <!-- 状态选择器 -->
                        <select onchange="updateTaskStatus('${task.id}', this.value)" style="background: #3F3F46; color: #FAFAFA; border: 1px solid #52525B; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 13px;">
                            <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>待处理</option>
                            <option value="ongoing" ${task.status === 'ongoing' ? 'selected' : ''}>进行中</option>
                            <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>已完成</option>
                        </select>

                        <!-- 删除按钮 -->
                        <button onclick="deleteMarketingTask('${task.id}')" style="background: rgba(239, 68, 68, 0.1); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.2)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'">
                            🗑️ 删除
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 更新任务计数
    updateTaskCounts();
}

// 勾选/取消任务完成
function toggleTaskChecked(taskId) {
    const task = marketingTaskList.find(t => t.id === taskId);
    if (!task) return;

    task.checked = !task.checked;
    task.status = task.checked ? 'completed' : 'pending';
    task.updatedAt = new Date().toISOString();

    saveMarketingTasks();
    renderMarketingTasks();

    console.log(`✓ 任务 ${taskId} 勾选状态:`, task.checked);
}

// 更新任务状态
function updateTaskStatus(taskId, newStatus) {
    const task = marketingTaskList.find(t => t.id === taskId);
    if (!task) return;

    task.status = newStatus;
    task.checked = (newStatus === 'completed');
    task.updatedAt = new Date().toISOString();

    saveMarketingTasks();
    renderMarketingTasks();

    console.log(`✓ 任务 ${taskId} 状态更新为:`, newStatus);
}

// 删除任务
function deleteMarketingTask(taskId) {
    const task = marketingTaskList.find(t => t.id === taskId);
    if (!task) return;

    if (!confirm(`确定要删除任务"${task.title}"吗？\n\n此操作无法撤销。`)) {
        return;
    }

    task.deleted = true;
    task.updatedAt = new Date().toISOString();

    saveMarketingTasks();
    renderMarketingTasks();

    console.log(`✓ 任务 ${taskId} 已删除`);
}

// 编辑任务标题（双击编辑）
function editTaskTitle(taskId) {
    const task = marketingTaskList.find(t => t.id === taskId);
    if (!task) return;

    const newTitle = prompt('✏️ 编辑任务名称：', task.title);

    if (newTitle && newTitle.trim() !== '' && newTitle.trim() !== task.title) {
        task.title = newTitle.trim();
        task.updatedAt = new Date().toISOString();

        saveMarketingTasks();
        renderMarketingTasks();

        console.log(`✓ 任务 ${taskId} 标题已更新为:`, task.title);
    }
}

// 更新任务计数
function updateTaskCounts() {
    const visibleTasks = marketingTaskList.filter(t => !t.deleted);

    const counts = {
        pending: visibleTasks.filter(t => t.status === 'pending').length,
        ongoing: visibleTasks.filter(t => t.status === 'ongoing').length,
        completed: visibleTasks.filter(t => t.status === 'completed').length
    };

    // 更新UI中的计数徽章
    const badges = document.querySelectorAll('.task-count-badge');
    if (badges.length >= 3) {
        badges[0].textContent = counts.pending;
        badges[1].textContent = counts.ongoing;
        badges[2].textContent = counts.completed;
    }

    console.log('✓ 任务统计:', counts);
    return counts;
}

// 禁用未实现的功能按钮
function disablePlaceholderButtons() {
    const placeholderButtons = document.querySelectorAll('.placeholder-action-btn');
    placeholderButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
        btn.title = '功能开发中，敬请期待';
    });
}

// ============================================
// 富文本编辑器事件绑定初始化
// ============================================

/**
 * 初始化客户体验分析编辑器
 */
function initExperienceEditor() {
    const editorId = 'experienceAnalysisEditor';
    const editor = document.getElementById(editorId);

    if (!editor) {
        console.warn('客户体验编辑器未找到');
        return;
    }

    // 确保编辑器可编辑
    editor.setAttribute('contenteditable', 'true');
    editor.style.color = '#1F2937';

    // 封装执行命令函数（遵循最佳实践）
    function exec(command, value = null) {
        document.execCommand(command, false, value);
        editor.focus();
    }

    // --- 格式化功能 ---

    // 粗体按钮
    const boldBtn = document.getElementById(`boldBtn_${editorId}`);
    if (boldBtn) {
        boldBtn.onclick = (e) => {
            e.preventDefault();
            exec('bold');
        };
    }

    // 斜体按钮
    const italicBtn = document.getElementById(`italicBtn_${editorId}`);
    if (italicBtn) {
        italicBtn.onclick = (e) => {
            e.preventDefault();
            exec('italic');
        };
    }

    // 下划线按钮
    const underlineBtn = document.getElementById(`underlineBtn_${editorId}`);
    if (underlineBtn) {
        underlineBtn.onclick = (e) => {
            e.preventDefault();
            exec('underline');
        };
    }

    // 无序列表按钮
    const ulBtn = document.getElementById(`ulBtn_${editorId}`);
    if (ulBtn) {
        ulBtn.onclick = (e) => {
            e.preventDefault();
            exec('insertUnorderedList');
        };
    }

    // 有序列表按钮
    const olBtn = document.getElementById(`olBtn_${editorId}`);
    if (olBtn) {
        olBtn.onclick = (e) => {
            e.preventDefault();
            exec('insertOrderedList');
        };
    }

    // --- 字体大小 ---
    const fontSizeSelect = document.getElementById(`fontSize_${editorId}`);
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', function(e) {
            if (this.value) {
                exec('fontSize', this.value);
                this.selectedIndex = 0; // 重置选择器
            }
        });
    }

    // --- 字体颜色 ---
    const fontColorInput = document.getElementById(`fontColor_${editorId}`);
    if (fontColorInput) {
        fontColorInput.addEventListener('change', function(e) {
            exec('foreColor', this.value);
        });
    }

    // --- 背景高亮 ---
    const bgColorInput = document.getElementById(`bgColor_${editorId}`);
    if (bgColorInput) {
        bgColorInput.addEventListener('change', function(e) {
            // 尝试 hiliteColor，如果失败则尝试 backColor（兼容不同浏览器）
            const executed = document.execCommand('hiliteColor', false, this.value) ||
                           document.execCommand('backColor', false, this.value);
            editor.focus();
            if (!executed) {
                console.warn('背景颜色命令执行失败');
            }
        });
    }

    // --- 保存按钮 ---
    const saveBtn = document.getElementById(`saveBtn_${editorId}`);
    if (saveBtn) {
        saveBtn.onclick = () => {
            const content = editor.innerHTML;
            localStorage.setItem('experienceAnalysisContent', content);
            alert('✅ 客户体验分析内容已保存！');
        };
    }

    // --- 清空按钮 ---
    const clearBtn = document.getElementById(`clearBtn_${editorId}`);
    if (clearBtn) {
        clearBtn.onclick = () => {
            if (confirm('确定要清空编辑器内容吗？')) {
                editor.innerHTML = '<p>在此输入客户体验评分与分析内容...</p>';
                localStorage.removeItem('experienceAnalysisContent');
            }
        };
    }

    // --- 页面加载时恢复上次保存的内容 ---
    const savedContent = localStorage.getItem('experienceAnalysisContent');
    if (savedContent) {
        editor.innerHTML = savedContent;
    }

    console.log('✓ 客户体验编辑器初始化完成');
}

/**
 * 初始化营销策略编辑器
 */
function initMarketingStrategyEditor() {
    const editorId = 'marketingStrategyEditor';
    const editor = document.getElementById(editorId);

    if (!editor) {
        console.warn('营销策略编辑器未找到');
        return;
    }

    // 确保编辑器可编辑
    editor.setAttribute('contenteditable', 'true');

    // 封装执行命令函数（遵循最佳实践）
    function exec(command, value = null) {
        document.execCommand(command, false, value);
        editor.focus();
    }

    // --- 格式化功能 ---

    // 粗体按钮
    const boldBtn = document.getElementById(`boldBtn_${editorId}`);
    if (boldBtn) {
        boldBtn.onclick = (e) => {
            e.preventDefault();
            exec('bold');
        };
    }

    // 斜体按钮
    const italicBtn = document.getElementById(`italicBtn_${editorId}`);
    if (italicBtn) {
        italicBtn.onclick = (e) => {
            e.preventDefault();
            exec('italic');
        };
    }

    // 下划线按钮
    const underlineBtn = document.getElementById(`underlineBtn_${editorId}`);
    if (underlineBtn) {
        underlineBtn.onclick = (e) => {
            e.preventDefault();
            exec('underline');
        };
    }

    // 无序列表按钮
    const ulBtn = document.getElementById(`ulBtn_${editorId}`);
    if (ulBtn) {
        ulBtn.onclick = (e) => {
            e.preventDefault();
            exec('insertUnorderedList');
        };
    }

    // 有序列表按钮
    const olBtn = document.getElementById(`olBtn_${editorId}`);
    if (olBtn) {
        olBtn.onclick = (e) => {
            e.preventDefault();
            exec('insertOrderedList');
        };
    }

    // --- 字体大小 ---
    const fontSizeSelect = document.getElementById(`fontSize_${editorId}`);
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', function(e) {
            if (this.value) {
                exec('fontSize', this.value);
                this.selectedIndex = 0; // 重置选择器
            }
        });
    }

    // --- 字体颜色 ---
    const fontColorInput = document.getElementById(`fontColor_${editorId}`);
    if (fontColorInput) {
        fontColorInput.addEventListener('change', function(e) {
            exec('foreColor', this.value);
        });
    }

    // --- 背景高亮 ---
    const bgColorInput = document.getElementById(`bgColor_${editorId}`);
    if (bgColorInput) {
        bgColorInput.addEventListener('change', function(e) {
            // 尝试 hiliteColor，如果失败则尝试 backColor（兼容不同浏览器）
            const executed = document.execCommand('hiliteColor', false, this.value) ||
                           document.execCommand('backColor', false, this.value);
            editor.focus();
            if (!executed) {
                console.warn('背景颜色命令执行失败');
            }
        });
    }

    // --- 插入模板按钮 ---
    const templateBtn = document.getElementById(`templateBtn_${editorId}`);
    if (templateBtn) {
        templateBtn.onclick = (e) => {
            e.preventDefault();
            const template = `
                <h3 style="color: #1F2937; font-weight: 700; margin-top: 20px;">📅 本月营销目标</h3>
                <ul>
                    <li>短视频发布：100条</li>
                    <li>直播场次：30场</li>
                    <li>目标曝光：500万次</li>
                    <li>转化目标：5000人</li>
                </ul>

                <h3 style="color: #1F2937; font-weight: 700; margin-top: 20px;">🎯 重点策略</h3>
                <ol>
                    <li>与3-5个头部KOL建立合作</li>
                    <li>每周发布2-3条爆款内容</li>
                    <li>建立粉丝社群，提升互动率</li>
                </ol>

                <h3 style="color: #1F2937; font-weight: 700; margin-top: 20px;">💰 预算分配</h3>
                <ul>
                    <li>KOL合作：40%</li>
                    <li>信息流广告：30%</li>
                    <li>内容制作：20%</li>
                    <li>活动运营：10%</li>
                </ul>

                <h3 style="color: #1F2937; font-weight: 700; margin-top: 20px;">📊 评估指标</h3>
                <p style="color: #1F2937;">营销指数目标：80分以上，ROI目标：3倍以上，转化率目标：3%以上</p>
            `;
            editor.innerHTML = template;
        };
    }

    // --- 保存按钮 ---
    const saveBtn = document.getElementById(`saveBtn_${editorId}`);
    if (saveBtn) {
        saveBtn.onclick = () => {
            const content = editor.innerHTML;
            localStorage.setItem('marketingStrategyContent', content);
            alert('✅ 营销策略内容已保存！');
        };
    }

    // --- 清空按钮 ---
    const clearBtn = document.getElementById(`clearBtn_${editorId}`);
    if (clearBtn) {
        clearBtn.onclick = () => {
            if (confirm('确定要清空编辑器内容吗？')) {
                editor.innerHTML = '<p>在此输入营销策略内容...</p>';
                localStorage.removeItem('marketingStrategyContent');
            }
        };
    }

    // --- 页面加载时恢复上次保存的内容 ---
    const savedContent = localStorage.getItem('marketingStrategyContent');
    if (savedContent) {
        editor.innerHTML = savedContent;
    }

    console.log('✓ 营销策略编辑器初始化完成');
}

/**
 * 初始化所有富文本编辑器
 * 在诊断报告生成后调用
 */
function initAllRichTextEditors() {
    // 延迟执行确保DOM完全渲染
    setTimeout(function() {
        initExperienceEditor();
        initMarketingStrategyEditor();
        console.log('✓ 所有富文本编辑器已初始化');
    }, 200);
}

// 动画CSS（如果需要）
if (!document.getElementById('marketingTaskAnimations')) {
    const style = document.createElement('style');
    style.id = 'marketingTaskAnimations';
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new RestaurantSurveyApp();

    // 加载营销任务列表
    loadMarketingTasks();
    console.log('✓ 营销任务管理系统已初始化');
    
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
});
