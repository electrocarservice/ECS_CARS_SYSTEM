let ALL_CARS = [];

document.addEventListener('DOMContentLoaded', async () => {
    await initDataLoading();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    }
});

async function initDataLoading() {
    if (typeof fetchJsonFromDrive === 'function') {
        const data = await fetchJsonFromDrive(DRIVE_CONFIG.files.cars);
        if (data && Array.isArray(data)) {
            ALL_CARS = data;
        }
    }
}

/**
 * Глобальный поиск на главной странице
 */
function handleSearch(query) {
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
