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
async function fetchJsonFromDrive(fileId) {
    if (!driveInitialized) {
        await initDrive();
    }

    // Используем CORS-прокси и прямой экспорт из Google Drive
    const targetUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Ошибка загрузки файла ${fileId} с Drive:`, error);
        return null;
    }
}

// Запускаем инициализацию сразу при загрузке скрипта
document.addEventListener('DOMContentLoaded', () => {
    initDrive();
});
