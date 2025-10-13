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
    }

    initializeElements() {
        // Cache DOM elements for better performance
        this.elements = {
            apiUrl: document.getElementById('apiUrl'),
            adminKey: document.getElementById('adminKey'),
            loadData: document.getElementById('loadData'),
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
        const element = document.getElementById('reportExport');
        this.elements.exportImageBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>生成中...';
        this.elements.exportImageBtn.disabled = true;
        
        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            
            const link = document.createElement('a');
            link.download = `${this.currentRecord.store_name}_诊断报告_${new Date().toISOString().slice(0,10)}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            alert('导出失败: ' + error.message);
        } finally {
            this.elements.exportImageBtn.innerHTML = '<i class="fas fa-image mr-2"></i>保存长图';
            this.elements.exportImageBtn.disabled = false;
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

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new RestaurantSurveyApp();
    
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
