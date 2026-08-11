const DRIVE_CONFIG = {
    apiKey: 'AIzaSyAZ25D7JHjvYnj9bjiDUjG95kC2PUB7KYs',
    files: {
        cars: '1RsOlqDKLV5f9kBC-CHq_yQQXgmblwwQA',
        tasks: 'ВАШ_ID_ФАЙЛА_TASKS' // Вставьте чистый ID файла tasks.json
    }
};

/**
 * Извлекает чистый ID файла из строки или ссылки Google Drive
 */
function extractFileId(input) {
    if (!input) return '';
    // Если передана полная ссылка Google Drive, вырезаем ID с помощью регулярного выражения
    const match = input.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : input.trim();
}

/**
 * Загрузка JSON-файла с Google Drive
 */
async function fetchJsonFromDrive(fileInput) {
    const fileId = extractFileId(fileInput);

    if (!DRIVE_CONFIG.apiKey) {
        console.error('⚠️ Ошибка: Не указан API-ключ в DRIVE_CONFIG.apiKey');
        updateDriveStatus(false);
        return null;
    }

    if (!fileId || fileId.includes('ВАШ_')) {
        console.error('⚠️ Ошибка: Не указан корректный ID файла.');
        updateDriveStatus(false);
        return null;
    }

    // Чистый URL без вложенных ссылок
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${DRIVE_CONFIG.apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorJson = await response.json().catch(() => ({}));
            console.error(`⚠️ Ошибка Google Drive API (${response.status}):`, errorJson);
            updateDriveStatus(false);
            return null;
        }

        const data = await response.json();
        updateDriveStatus(true);
        return data;
    } catch (error) {
        console.error('Ошибка при получении данных с Google Drive:', error.message);
        updateDriveStatus(false);
        return null;
    }
}

/**
 * Обновление индикатора статуса подключения в шапке
 */
function updateDriveStatus(isConnected) {
    const statusText = document.querySelector('.status-text');
    const statusDot = document.querySelector('.status-dot');

    if (statusText && statusDot) {
        if (isConnected) {
            statusText.textContent = 'Drive: Подключен';
            statusDot.style.background = '#10b981'; // Зеленый
        } else {
            statusText.textContent = 'Drive: Ошибка';
            statusDot.style.background = '#ef4444'; // Красный
        }
    }
}
