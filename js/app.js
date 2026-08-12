let ALL_CARS = [];
let currentBrand = null;

document.addEventListener('DOMContentLoaded', async () => {
    await initDataLoading();

    // Логика для страницы main / index.html (поиск на главной)
    const indexSearchInput = document.getElementById('searchInput');
    if (indexSearchInput) {
        indexSearchInput.addEventListener('input', (e) => handleIndexSearch(e.target.value));
    }

    // Логика для страницы cars.html (поиск в каталоге)
    const carsSearchInput = document.getElementById('carsSearchInput');
    if (carsSearchInput) {
        carsSearchInput.addEventListener('input', (e) => handleCatalogSearch(e.target.value));
    }
});

async function initDataLoading() {
    if (typeof fetchJsonFromDrive === 'function') {
        const data = await fetchJsonFromDrive(DRIVE_CONFIG.files.cars);
        if (data && Array.isArray(data)) {
            ALL_CARS = data;
            
            // Проверяем, на какой мы странице и есть ли ID авто в URL
            if (document.getElementById('catalogContent')) {
                routeCatalogView();
            }
        } else {
            showError('Не удалось загрузить данные из cars.json.');
        }
    } else {
        showError('Модуль js/drive.js не подключен.');
    }
}

/**
 * Маршрутизация на странице cars.html
 */
function routeCatalogView() {
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');

    if (carId) {
        // Если перешли напрямую по ссылке на конкретный авто (например из поиска)
        renderCarDetails(carId);
    } else {
        // По умолчанию показываем марки
        renderBrands();
    }
}

/**
 * Уровень 1: Отображение марок
 */
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

/**
 * Уровень 2: Модельный ряд выбранной марки
 */
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

/**
 * Уровень 3: Карточка автомобиля
 */
function renderCarDetails(carId) {
    const container = document.getElementById('catalogContent');
    if (!container) return;

    const car = ALL_CARS.find(c => c.id === carId || String(c.id).toLowerCase() === String(carId).toLowerCase());
    
    if (!car) {
        container.innerHTML = `
            <div class="breadcrumb">
                <button class="btn-back" onclick="renderBrands()">⬅ В каталог</button>
            </div>
            <p class="empty-news">Автомобиль с указанным ID не найден в базе.</p>
        `;
        return;
    }

    // Обновляем адресную строку без перезагрузки, чтобы ссылкой можно было поделиться
    window.history.replaceState(null, '', `cars.html?id=${car.id}`);

    container.innerHTML = `
        <div class="breadcrumb">
            <button class="btn-back" onclick="renderModels('${car.brand}')">⬅ Назад к моделям ${car.brand}</button>
        </div>
        
        <div class="car-details-card">
            <h2 class="car-title">${car.brand} ${car.model}</h2>
            
            <div class="car-specs-grid">
                <div class="spec-item"><strong>Год выпуска</strong> ${car.year || 'н/д'}</div>
                <div class="spec-item"><strong>Батарея</strong> ${car.batteryType || 'н/д'}</div>
                <div class="spec-item"><strong>Версия ПО</strong> ${car.osVersion || 'н/д'}</div>
            </div>

            ${car.softwareIssues && car.softwareIssues.length > 0 ? `
                <div style="margin-top:20px;">
                    <h3 style="color:#1e3a8a;">💻 ПО и Сервисные особенности</h3>
                    <ul style="margin-top:10px; padding-left:20px;">
                        ${car.softwareIssues.map(issue => `<li><strong>${issue.title}:</strong> ${issue.solution}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            ${car.parts && car.parts.length > 0 ? `
                <div style="margin-top:25px;">
                    <h3 style="color:#1e3a8a;">🔧 Расходники и Запчасти</h3>
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
                                    <td><code class="part-number">${part.partNumber}</code></td>
                                    <td>${part.note || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Глобальный поиск на главной (index.html)
 */
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

/**
 * Поиск непосредственно на странице каталога (cars.html)
 */
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
