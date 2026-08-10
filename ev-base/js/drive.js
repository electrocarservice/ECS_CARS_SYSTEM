// Конфигурация Google Drive API
const DRIVE_CONFIG = {
    apiKey: 'AIzaSyAZ25D7JHjvYnj9bjiDUjG95kC2PUB7KYs', // Вставьте ваш ключ из Google Cloud
    files: {
        cars: 'https://drive.google.com/file/d/1RsOlqDKLV5f9kBC-CHq_yQQXgmblwwQA/view?usp=sharing',   // Вставьте ID файла cars.json
        tasks: 'https://drive.google.com/file/d/1kvjl-rp_cZcRfou4jYWcNwlWbhQCSGeS/view?usp=sharing'  // Вставьте ID файла tasks.json
    }
};

/**
 * Функция загрузки JSON-файла с Google Диска
 * @param {string} fileId - Уникальный идентификатор файла на Google Drive
 */
async function fetchJsonFromDrive(fileId) {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${DRIVE_CONFIG.apiKey}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки Google Drive: ${response.statusText}`);
        }
        const data = await response.json();
        updateDriveStatus(true);
        return data;
    } catch (error) {
        console.error('Ошибка при получении данных с Google Drive:', error);
        updateDriveStatus(false);
        return null;
    }
}

/**
 * Обновление визуального статуса подключения в шапке сайта
 */
function updateDriveStatus(isConnected) {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');

    if (statusDot && statusText) {
        if (isConnected) {
            statusDot.classList.remove('disconnected');
            statusDot.classList.add('connected');
            statusText.textContent = 'Drive: Подключен';
        } else {
            statusDot.classList.remove('connected');
            statusDot.classList.add('disconnected');
            statusText.textContent = 'Drive: Ошибка';
        }
    }
}

// Пример вызова загрузки автомобилей при старте
async function loadCarsData() {
    const carsData = await fetchJsonFromDrive(DRIVE_CONFIG.files.cars);
    if (carsData) {
        console.log('Данные автомобилей успешно загружены:', carsData);
        // Здесь будет функция отрисовки карточек на странице
    }
}
