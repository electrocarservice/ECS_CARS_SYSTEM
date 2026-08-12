let ALL_CARS = [];

document.addEventListener('DOMContentLoaded', async () => {
    initAddFormLogic();
    await loadCarsForSelector();
});

/**
 * Загрузка текущих авто с Google Drive для заполнения селектора запчастей
 */
async function loadCarsForSelector() {
    const select = document.getElementById('selectCar');
    
    if (typeof fetchJsonFromDrive === 'function') {
        const data = await fetchJsonFromDrive(DRIVE_CONFIG.files.cars);
        if (data && Array.isArray(data)) {
            ALL_CARS = data;
            populateCarSelect(ALL_CARS);
        } else if (select) {
            select.innerHTML = '<option value="">Ошибка загрузки списка авто</option>';
        }
    }
}

function populateCarSelect(cars) {
    const select = document.getElementById('selectCar');
    if (!select) return;

    if (cars.length === 0) {
        select.innerHTML = '<option value="">В базе нет автомобилей</option>';
        return;
    }

    select.innerHTML = '<option value="">-- Выберите автомобиль из списка --</option>' +
        cars.map(car => `<option value="${car.id}">${car.brand} ${car.model} (${car.year || 'н/д'})</option>`).join('');
}

/**
 * Логика переключения вкладок и отправки форм
 */
function initAddFormLogic() {
    const tabCarBtn = document.getElementById('tabCarBtn');
    const tabPartBtn = document.getElementById('tabPartBtn');
    const addCarForm = document.getElementById('addCarForm');
    const addPartForm = document.getElementById('addPartForm');

    const jsonResultBlock = document.getElementById('jsonResultBlock');
    const jsonOutput = document.getElementById('jsonOutput');
    const copyJsonBtn = document.getElementById('copyJsonBtn');

    // Переключение между "Новый автомобиль" и "Новая запчасть"
    if (tabCarBtn && tabPartBtn) {
        tabCarBtn.addEventListener('click', () => {
            tabCarBtn.classList.add('active');
            tabPartBtn.classList.remove('active');
            addCarForm.classList.remove('hidden');
            addPartForm.classList.add('hidden');
            if (jsonResultBlock) jsonResultBlock.classList.add('hidden');
        });

        tabPartBtn.addEventListener('click', () => {
            tabPartBtn.classList.add('active');
            tabCarBtn.classList.remove('active');
            addPartForm.classList.remove('hidden');
            addCarForm.classList.add('hidden');
            if (jsonResultBlock) jsonResultBlock.classList.add('hidden');
        });
    }

    // Обработка формы: Новый автомобиль
    if (addCarForm) {
        addCarForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const brand = document.getElementById('carBrand').value.trim();
            const model = document.getElementById('carModel').value.trim();

            const newCarObject = {
                id: `${brand.toLowerCase()}-${model.toLowerCase()}-${Date.now().toString().slice(-4)}`,
                brand: brand,
                model: model,
                year: document.getElementById('carYear').value.trim() || '2024',
                batteryType: document.getElementById('carBattery').value.trim() || 'Не указано',
                osVersion: document.getElementById('carOs').value.trim() || 'Не указано',
                softwareIssues: [],
                parts: []
            };

            showGeneratedJson(newCarObject);
        });
    }

    // Обработка формы: Новая запчасть
    if (addPartForm) {
        addPartForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const selectedCarId = document.getElementById('selectCar').value;

            const newPartObject = {
                targetCarId: selectedCarId,
                part: {
                    category: document.getElementById('partCategory').value,
                    name: document.getElementById('partName').value.trim(),
                    partNumber: document.getElementById('partNumber').value.trim(),
                    note: document.getElementById('partNote').value.trim() || ''
                }
            };

            showGeneratedJson(newPartObject);
        });
    }

    // Копирование JSON
    if (copyJsonBtn) {
        copyJsonBtn.addEventListener('click', () => {
            const textToCopy = jsonOutput.textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {
                copyJsonBtn.textContent = '✅ Скопировано в буфер!';
                setTimeout(() => copyJsonBtn.textContent = '📋 Скопировать', 2000);
            });
        });
    }
}

function showGeneratedJson(data) {
    const jsonResultBlock = document.getElementById('jsonResultBlock');
    const jsonOutput = document.getElementById('jsonOutput');

    if (jsonResultBlock && jsonOutput) {
        jsonOutput.textContent = JSON.stringify(data, null, 2);
        jsonResultBlock.classList.remove('hidden');
        jsonResultBlock.scrollIntoView({ behavior: 'smooth' });
    }
}
