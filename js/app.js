let ALL_CARS = [];
let currentBrand = null;

document.addEventListener('DOMContentLoaded', async () => {
    await initDataLoading();

    const indexSearchInput = document.getElementById('searchInput');
    if (indexSearchInput) {
        indexSearchInput.addEventListener('input', (e) => handleIndexSearch(e.target.value));
    }

    const carsSearchInput = document.getElementById('carsSearchInput');
    if (carsSearchInput) {
        carsSearchInput.addEventListener('input', (e) => handleCatalogSearch(e.target.value));
    }
});

async function initDataLoading() {
    const container = document.getElementById('catalogContent');
    if (container) {
        container.innerHTML = '<div class="loading-spinner">Загрузка данных с Google Drive...</div>';
    }

    if (typeof fetchJsonFromDrive === 'function' && typeof DRIVE_CONFIG !== 'undefined') {
        const data = await fetchJsonFromDrive(DRIVE_CONFIG.files.cars);
        
        if (data && Array.isArray(data) && data.length > 0) {
            ALL_CARS = data;
            
            if (document.getElementById('catalogContent')) {
                routeCatalogView();
            }
            return;
        }
    }
    
    showError('Не удалось загрузить каталог с Google Drive. Проверьте настройки доступа или ID файла.');
}

function routeCatalogView() {
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');

    if (carId) {
        renderCarDetails(carId);
    } else {
        renderBrands();
    }
}

function renderBrands() {
    currentBrand = null;
    const container = document.getElementById('catalogContent');
    if (!container) return;

    const brands = [...new Set(ALL_CARS.map(car => car.brand))];

    if (brands.length === 0) {
        container.innerHTML = '<p class="empty-news">База авто пуста.</p>';
        return;
    }

    container.innerHTML = `
        <h2 style="margin-bottom: 15px; color: #1e3a8a;">Выберите марку автомобиля</h2>
        <div class="brands-grid">
            ${brands.map(brand => `
                <button class="brand-btn" onclick="renderModels('${brand}')">
                    🚗 ${brand}
                </button>
            `).join('')}
        </div>
    `;
}

function renderModels(brand) {
    currentBrand = brand;
    const container = document.getElementById('catalogContent');
    if (!container) return;

    const filteredCars = ALL_CARS.filter(car => car.brand === brand);

    container.innerHTML = `
        <div class="breadcrumb">
            <button class="btn-back" onclick="renderBrands()">⬅ Назад к маркам</button>
        </div>
        <h2 style="margin-bottom: 15px; color: #1e3a8a;">Модельный ряд ${brand}</h2>
        <div class="models-grid">
            ${filteredCars.map(car => `
                <button class="model-btn" onclick="renderCarDetails('${car.id}')">
                    ${car.model}
                </button>
            `).join('')}
        </div>
    `;
}

function renderCarDetails(carId) {
    const container = document.getElementById('catalogContent');
    if (!container) return;

    const car = ALL_CARS.find(c => c.id === carId || String(c.id).toLowerCase() === String(carId).toLowerCase());
    
    if (!car) {
        container.innerHTML = `
            <div class="breadcrumb">
                <button class="btn-back" onclick="renderBrands()">⬅ В каталог</button>
            </div>
            <p class="empty-news">Автомобиль не найден в базе.</p>
        `;
        return;
    }

    window.history.replaceState(null, '', `cars.html?id=${car.id}`);

    const mainImg = car.image || 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80';
    const specs = car.specs || {};
    const software = car.software || {};

    container.innerHTML = `
        <div class="breadcrumb">
            <button class="btn-back" onclick="renderModels('${car.brand}')">⬅ Назад к моделям ${car.brand}</button>
        </div>
        
        <div class="car-header-layout">
            <img src="${mainImg}" alt="${car.brand} ${car.model}" class="car-main-image" />
            <div class="car-header-info">
                <h2 class="car-title">${car.brand} ${car.model}</h2>
                <p style="color: var(--text-muted); margin-bottom: 10px;">Годы выпуска: <strong>${car.year || 'н/д'}</strong></p>
                <div class="car-specs-grid" style="margin:0; padding:10px;">
                    <div class="spec-item"><strong>Привод</strong> ${specs.drive || 'н/д'}</div>
                    <div class="spec-item"><strong>Мощность</strong> ${specs.power || 'н/д'}</div>
                    <div class="spec-item"><strong>Батарея</strong> ${specs.battery || 'н/д'}</div>
                    <div class="spec-item"><strong>Запас хода</strong> ${specs.range || 'н/д'}</div>
                </div>
            </div>
        </div>

        <div class="tabs-header">
            <button class="tab-btn active" onclick="switchTab('tab-specs', this)">📋 ТТХ и Описание</button>
            <button class="tab-btn" onclick="switchTab('tab-software', this)">💻 ПО и Прошивка</button>
            <button class="tab-btn" onclick="switchTab('tab-manuals', this)">📄 Руководства и файлы</button>
            <button class="tab-btn" onclick="switchTab('tab-parts', this)">🔧 Запчасти и ТО</button>
            <button class="tab-btn" onclick="switchTab('tab-issues', this)">⚠️ Известные проблемы</button>
        </div>

        <div class="tabs-content">
            <div id="tab-specs" class="tab-pane active">
                <div class="car-details-card">
                    <h3 style="color:#1e3a8a; margin-bottom:15px;">Технические характеристики</h3>
                    <div class="car-specs-grid">
                        <div class="spec-item"><strong>Порты зарядки</strong> ${specs.chargePorts || 'н/д'}</div>
                        <div class="spec-item"><strong>Подвеска</strong> ${specs.suspension || 'н/д'}</div>
                        <div class="spec-item"><strong>Тип аккумулятора</strong> ${specs.battery || 'н/д'}</div>
                        <div class="spec-item"><strong>Привод</strong> ${specs.drive || 'н/д'}</div>
                    </div>
                </div>
            </div>

            <div id="tab-software" class="tab-pane">
                <div class="car-details-card">
                    <h3 style="color:#1e3a8a; margin-bottom:15px;">Информация о мультимедиа и ПО</h3>
                    <ul style="line-height: 2; padding-left: 20px;">
                        <li><strong>Текущая версия ОС:</strong> ${software.currentOs || 'н/д'}</li>
                        <li><strong>Русификация:</strong> ${software.ruLanguage || 'н/д'}</li>
                        <li><strong>Мастер-аккаунт:</strong> ${software.masterAccount || 'н/д'}</li>
                        <li><strong>OTA Обновления:</strong> ${software.otaUpdates || 'н/д'}</li>
                    </ul>
                </div>
            </div>

            <div id="tab-manuals" class="tab-pane">
                <div class="car-details-card">
                    <h3 style="color:#1e3a8a; margin-bottom:15px;">Документация и мануалы</h3>
                    ${car.manuals && car.manuals.length > 0 ? car.manuals.map(doc => {
                        const viewUrl = `https://drive.google.com/file/d/${doc.fileId}/view`;
                        const downloadUrl = `https://drive.google.com/uc?export=download&id=${doc.fileId}`;
                        return `
                            <div class="manual-card">
                                <div class="manual-info">
                                    <div class="manual-icon">📑</div>
                                    <div>
                                        <div class="manual-title">${doc.title}</div>
                                        <div class="manual-meta">${doc.type || 'PDF'} • ${doc.size || 'Файл'} • Добавлено: ${doc.date || '-'}</div>
                                    </div>
                                </div>
                                <div class="manual-actions">
                                    <a href="${viewUrl}" target="_blank" class="btn-manual btn-manual-outline">👁 Просмотр</a>
                                    <a href="${downloadUrl}" class="btn-manual btn-manual-primary">⬇ Скачать</a>
                                </div>
                            </div>
                        `;
                    }).join('') : '<p>Руководства и инструкции пока не загружены.</p>'}
                </div>
            </div>

            <div id="tab-parts" class="tab-pane">
                <div class="car-details-card">
                    <h3 style="color:#1e3a8a; margin-bottom:15px;">Расходники и каталожные номера</h3>
                    ${car.parts && car.parts.length > 0 ? `
                        <table class="parts-table">
                            <thead>
                                <tr>
                                    <th>Категория</th>
                                    <th>Наименование</th>
                                    <th>Артикул</th>
                                    <th>Заметка</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${car.parts.map(part => `
                                    <tr>
                                        <td><span class="badge">${part.category}</span></td>
                                        <td><strong>${part.name}</strong></td>
                                        <td>
                                            <code class="part-number">${part.partNumber}</code>
                                            <button class="btn-copy-part" onclick="copyToClipboard('${part.partNumber}', this)">📋</button>
                                        </td>
                                        <td>${part.note || '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p>Запчасти пока не добавлены.</p>'}
                </div>
            </div>

            <div id="tab-issues" class="tab-pane">
                <div class="car-details-card">
                    <h3 style="color:#1e3a8a; margin-bottom:15px;">Частые неисправности и решения</h3>
                    ${car.issues && car.issues.length > 0 ? car.issues.map(issue => `
                        <div class="issue-card">
                            <div class="issue-title">⚠️ ${issue.title}</div>
                            <p><strong>Симптом:</strong> ${issue.symptom}</p>
                            <p style="margin-top:5px; color:#166534;"><strong>Решение:</strong> ${issue.solution}</p>
                        </div>
                    `).join('') : '<p>Известных типовых проблем не зарегистрировано.</p>'}
                </div>
            </div>
        </div>
    `;
}

function switchTab(tabId, btnElement) {
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    const activePane = document.getElementById(tabId);
    if (activePane) activePane.classList.add('active');
    if (btnElement) btnElement.classList.add('active');
}

function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.textContent;
        btn.textContent = '✓ Скопировано';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 1500);
    });
}

function handleIndexSearch(query) {
    const q = query.toLowerCase().trim();
    const searchBlock = document.getElementById('searchResultsBlock');
    const newsSection = document.getElementById('newsSection');

    if (!q) {
        if (searchBlock) searchBlock.classList.add('hidden');
        if (newsSection) newsSection.classList.remove('hidden');
        return;
    }

    if (newsSection) newsSection.classList.add('hidden');
    if (searchBlock) searchBlock.classList.remove('hidden');

    const filtered = ALL_CARS.filter(car => {
        const matchBrand = car.brand.toLowerCase().includes(q);
        const matchModel = car.model.toLowerCase().includes(q);
        const matchPart = car.parts && car.parts.some(p => 
            p.name.toLowerCase().includes(q) || p.partNumber.toLowerCase().includes(q)
        );
        return matchBrand || matchModel || matchPart;
    });

    if (filtered.length === 0) {
        searchBlock.innerHTML = '<p class="empty-news">По вашему запросу ничего не найдено в базе.</p>';
        return;
    }

    searchBlock.innerHTML = `
        <h3 style="margin-bottom:15px; color:#1e3a8a;">Результаты поиска в базе (${filtered.length}):</h3>
        <div class="models-grid">
            ${filtered.map(car => `
                <a href="cars.html?id=${car.id}" class="model-btn" style="text-decoration:none; display:block;">
                    ${car.brand} ${car.model}
                </a>
            `).join('')}
        </div>
    `;
}

function handleCatalogSearch(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
        renderBrands();
        return;
    }

    const container = document.getElementById('catalogContent');
    const filtered = ALL_CARS.filter(car => 
        car.brand.toLowerCase().includes(q) || 
        car.model.toLowerCase().includes(q) ||
        (car.parts && car.parts.some(p => p.name.toLowerCase().includes(q) || p.partNumber.toLowerCase().includes(q)))
    );

    if (filtered.length === 0) {
        container.innerHTML = '<p class="empty-news">Ничего не найдено.</p>';
        return;
    }

    container.innerHTML = `
        <h3 style="margin-bottom:15px; color:#1e3a8a;">Результаты поиска (${filtered.length}):</h3>
        <div class="models-grid">
            ${filtered.map(car => `
                <button class="model-btn" onclick="renderCarDetails('${car.id}')">
                    ${car.brand} ${car.model}
                </button>
            `).join('')}
        </div>
    `;
}

function showError(msg) {
    const container = document.getElementById('catalogContent');
    if (container) container.innerHTML = `<p style="color:red;" class="empty-news">⚠️ ${msg}</p>`;
}
