// Глобальный массив для хранения загруженных данных
let ALL_CARS = [];

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Инициализируем загрузку данных из Google Drive
    await initDataLoading();

    // 2. Настраиваем поиск
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => filterCars(e.target.value));
    }
});

/**
 * Загрузка данных с Google Drive и их первичное отображение
 */
async function initDataLoading() {
    const container = document.getElementById('carsContainer');
    if (container) {
        container.innerHTML = '<div class="loading-spinner">Загрузка данных с Google Drive...</div>';
    }

    // Вызываем функцию из js/drive.js
    if (typeof fetchJsonFromDrive === 'function') {
        const data = await fetchJsonFromDrive(DRIVE_CONFIG.files.cars);
        if (data && Array.isArray(data)) {
            ALL_CARS = data;
            renderCars(ALL_CARS);
        } else {
            showError('Не удалось загрузить данные или файл cars.json пуст.');
        }
    } else {
        showError('Ошибка: Модуль js/drive.js не подключен.');
    }
}

/**
 * Отрисовка списка автомобилей и запчастей
 */
function renderCars(cars) {
    const container = document.getElementById('carsContainer');
    if (!container) return;

    if (cars.length === 0) {
        container.innerHTML = '<p class="no-results">По вашему запросу ничего не найдено.</p>';
        return;
    }

    container.innerHTML = cars.map(car => `
        <div class="car-card" id="car-${car.id}">
            <div class="car-header">
                <h2>${car.brand} ${car.model}</h2>
                <span class="car-year">${car.year}</span>
            </div>
            
            <div class="car-specs">
                <p><strong>Батарея:</strong> ${car.batteryType}</p>
                <p><strong>Версия ПО:</strong> ${car.osVersion}</p>
            </div>

            <!-- Раздел: Программные особенности / Решения -->
            ${car.softwareIssues && car.softwareIssues.length > 0 ? `
                <div class="info-section">
                    <h3>💻 ПО и Диагностика</h3>
                    <ul class="issues-list">
                        ${car.softwareIssues.map(issue => `
                            <li>
                                <strong>${issue.title}:</strong> ${issue.solution}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}

            <!-- Раздел: Расходники и Запчасти -->
            ${car.parts && car.parts.length > 0 ? `
                <div class="info-section">
                    <h3>🔧 Запчасти и Расходники</h3>
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
    `).join('');
}

/**
 * Фильтрация автомобилей по поисковой строке
 */
function filterCars(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
        renderCars(ALL_CARS);
        return;
    }

    const filtered = ALL_CARS.filter(car => {
        const matchBrand = car.brand.toLowerCase().includes(q);
        const matchModel = car.model.toLowerCase().includes(q);
        const matchPart = car.parts && car.parts.some(p => 
            p.name.toLowerCase().includes(q) || 
            p.partNumber.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
        return matchBrand || matchModel || matchPart;
    });

    renderCars(filtered);
}

function showError(message) {
    const container = document.getElementById('carsContainer');
    if (container) {
        container.innerHTML = `<div class="error-message">⚠️ ${message}</div>`;
    }
}
