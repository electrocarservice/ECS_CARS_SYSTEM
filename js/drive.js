// Конфигурация источников данных
const DATA_CONFIG = {
    // Вставьте вашу прямую ссылка (Raw) с GitHub Gist
    carsUrl: 'https://gist.githubusercontent.com/username/1234567890abcdef/raw/cars.json'
};

let dataStatusInitialized = false;

/**
 * Инициализация статуса подключения
 */
async function initDrive() {
    const statusText = document.querySelector('.status-text');
    const statusDot = document.querySelector('.status-dot');

    try {
        if (statusText) statusText.textContent = 'База: Подключение...';

        if (!DATA_CONFIG || !DATA_CONFIG.carsUrl) {
            throw new Error('Не указан URL файла в DATA_CONFIG');
        }

        dataStatusInitialized = true;

        if (statusText) statusText.textContent = 'База: Подключена';
        if (statusDot) statusDot.style.background = '#22c55e';
        return true;
    } catch (err) {
        console.error('Ошибка инициализации базы данных:', err);
        if (statusText) statusText.textContent = 'База: Ошибка';
        if (statusDot) statusDot.style.background = '#ef4444';
        return false;
    }
}

/**
 * Загрузка JSON напрямую с GitHub Gist / Raw
 */
async function fetchJsonFromDrive() {
    if (!dataStatusInitialized) {
        await initDrive();
    }

    try {
        // Добавляем timestamp, чтобы браузер не кэшировал старую версию при обновлениях
        const cacheBuster = `?t=${new Date().getTime()}`;
        const response = await fetch(DATA_CONFIG.carsUrl + cacheBuster);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка загрузки JSON с GitHub:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initDrive();
});
