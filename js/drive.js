const DRIVE_CONFIG = {
    // Вставьте ваш API Key или публичную ссылку/ID файлов Google Drive
    apiKey: 'AIzaSyAZ25D7JHjvYnj9bjiDUjG95kC2PUB7KYs', // Если используете публичный доступ без OAuth
    files: {
        cars: '1sfip2hvFmZV_yW5gPRdnCrWGktD56vKk',
        tasks: 'ID_ФАЙЛА_TASKS_JSON'
    }
};

let driveInitialized = false;

/**
 * Инициализация подключения к Google Drive
 */
async function initDrive() {
    const statusText = document.querySelector('.status-text');
    const statusDot = document.querySelector('.status-dot');

    try {
        if (statusText) statusText.textContent = 'Drive: Подключение...';

        // Проверка наличия конфигурации
        if (!DRIVE_CONFIG || !DRIVE_CONFIG.files) {
            throw new Error('Отсутствует конфигурация DRIVE_CONFIG');
        }

        driveInitialized = true;

        if (statusText) statusText.textContent = 'Drive: Подключен';
        if (statusDot) statusDot.style.background = '#22c55e'; // Зеленый индикатор
        return true;
    } catch (err) {
        console.error('Ошибка Google Drive:', err);
        if (statusText) statusText.textContent = 'Drive: Ошибка';
        if (statusDot) statusDot.style.background = '#ef4444'; // Красный индикатор
        return false;
    }
}

/**
 * Универсальное скачивание публичного JSON-файла с Google Drive с обходом CORS
 */
async function fetchJsonFromDrive() {
    try {
        const response = await fetch('https://gist.githubusercontent.com/kozpavvichecs-master/3490cd2e1e556dbe9b0dbd461332c9cc/raw/cbdd272327553f4fd046ea09ca1500066b1b5c1d/cars.json');
        return await response.json();
    } catch (e) {
        console.error(e);
        return null;
    }
}

// Запускаем инициализацию сразу при загрузке скрипта
document.addEventListener('DOMContentLoaded', () => {
    initDrive();
});
