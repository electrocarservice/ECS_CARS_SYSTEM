document.addEventListener('DOMContentLoaded', () => {
    initModalLogic();
});

function initModalLogic() {
    const modal = document.getElementById('addModal');
    const openBtn = document.getElementById('openModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const overlay = document.getElementById('modalOverlay');

    const tabCarBtn = document.getElementById('tabCarBtn');
    const tabPartBtn = document.getElementById('tabPartBtn');
    const addCarForm = document.getElementById('addCarForm');
    const addPartForm = document.getElementById('addPartForm');

    const jsonResultBlock = document.getElementById('jsonResultBlock');
    const jsonOutput = document.getElementById('jsonOutput');
    const copyJsonBtn = document.getElementById('copyJsonBtn');

    // Открытие / Закрытие
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            populateCarSelect(); // Подтягиваем текущий список авто для выборки
        });
    }

    const closeModal = () => {
        modal.classList.add('hidden');
        if (jsonResultBlock) jsonResultBlock.classList.add('hidden');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    // Переключение вкладок (Авто / Запчасть)
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

    // Копирование JSON в буфер обмена
    if (copyJsonBtn) {
        copyJsonBtn.addEventListener('click', () => {
            const textToCopy = jsonOutput.textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {
                copyJsonBtn.textContent = '✅ Скопировано!';
                setTimeout(() => copyJsonBtn.textContent = '📋 Копировать', 2000);
            });
        });
    }
}

/**
 * Заполнение выпадающего списка селектора авто из глобального массива ALL_CARS
 */
function populateCarSelect() {
    const select = document.getElementById('selectCar');
    if (!select) return;

    select.innerHTML = '<option value="">-- Выберите из базы --</option>';

    if (window.ALL_CARS && window.ALL_CARS.length > 0) {
        window.ALL_CARS.forEach(car => {
            const option = document.createElement('option');
            option.value = car.id;
            option.textContent = `${car.brand} ${car.model} (${car.year})`;
            select.appendChild(option);
        });
    }
}

/**
 * Отображение сгенерированного JSON в окне
 */
function showGeneratedJson(data) {
    const jsonResultBlock = document.getElementById('jsonResultBlock');
    const jsonOutput = document.getElementById('jsonOutput');

    if (jsonResultBlock && jsonOutput) {
        jsonOutput.textContent = JSON.stringify(data, null, 2);
        jsonResultBlock.classList.remove('hidden');
        jsonResultBlock.scrollIntoView({ behavior: 'smooth' });
    }
}
