// Конфигурация Gemini API
const GEMINI_CONFIG = {
    model: 'gemini-1.5-flash',
    systemInstruction: `Ты — встроенный ИИ-эксперт базы знаний EVBase по китайским электромобилям (Zeekr, Lixiang, BYD, Voyah, Avatr, Xiaomi и др.). 
Твоя задача — давать четкие, технически грамотные ответы по:
- Диагностике программных ошибок и сбоев (OTA, мастер-аккаунты, русификация, сим-карты).
- Обслуживанию, замене расходников и подбору запчастей.
- Особенностям зарядки (GB/T, адаптеры, фазы, мощности).
Отвечай кратко, вежливо и по делу. Если не уверен в конкретном каталожном номере, честно предупреди об этом.`
};

// Функция получения ключа из памяти браузера
function getApiKey() {
    return localStorage.getItem('gemini_api_key');
}

// Элементы интерфейса чата
const chatWindow = document.getElementById('chatWindow');
const toggleChatBtn = document.getElementById('toggleChatBtn');
const closeChatBtn = document.getElementById('closeChat');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Добавляем кнопку настройки ключа в шапку чата
    const chatHeader = document.querySelector('.chat-header');
    if (chatHeader && !document.getElementById('setKeyBtn')) {
        const keyBtn = document.createElement('button');
        keyBtn.id = 'setKeyBtn';
        keyBtn.textContent = '🔑 Ключ';
        keyBtn.title = 'Настроить Gemini API Key';
        keyBtn.style.cssText = 'background: rgba(255,255,255,0.1); border: 1px solid var(--border-color); color: #fff; border-radius: 6px; padding: 2px 8px; font-size: 0.75rem; cursor: pointer; margin-left: auto; margin-right: 8px;';
        keyBtn.addEventListener('click', promptForApiKey);
        chatHeader.insertBefore(keyBtn, closeChatBtn);
    }
});

// Открытие / закрытие чата
if (toggleChatBtn) {
    toggleChatBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
        if (!chatWindow.classList.contains('hidden') && !getApiKey()) {
            promptForApiKey();
        }
    });
}

if (closeChatBtn) {
    closeChatBtn.addEventListener('click', () => chatWindow.classList.add('hidden'));
}

// Запрос ключа у пользователя
function promptForApiKey() {
    const currentKey = getApiKey() || '';
    const newKey = prompt('Введите ваш Gemini API Key (получить на aistudio.google.com):', currentKey);
    
    if (newKey !== null) {
        const trimmedKey = newKey.trim();
        if (trimmedKey) {
            localStorage.setItem('gemini_api_key', trimmedKey);
            appendMessage('✅ API-ключ сохранён в вашем браузере!', 'ai-message');
        } else {
            localStorage.removeItem('gemini_api_key');
            appendMessage('⚠️ API-ключ был удалён.', 'ai-message');
        }
    }
}

// Отправка сообщений
if (sendMessageBtn && chatInput) {
    sendMessageBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });
}

async function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    const apiKey = getApiKey();
    if (!apiKey) {
        appendMessage('⚠️ Не задан API-ключ Gemini! Нажмите кнопку "🔑 Ключ" вверху чата.', 'ai-message');
        promptForApiKey();
        return;
    }

    appendMessage(text, 'user-message');
    chatInput.value = '';

    const loadingMessage = appendMessage('Ассистент думает...', 'ai-message loading');

    try {
        const responseText = await askGemini(text, apiKey);
        loadingMessage.remove();
        appendMessage(responseText, 'ai-message');
    } catch (error) {
        console.error('Ошибка Gemini API:', error);
        loadingMessage.remove();
        appendMessage(`❌ Ошибка: ${error.message}. Проверьте ваш API-ключ с помощью кнопки "🔑 Ключ".`, 'ai-message');
    }
}

function appendMessage(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msgDiv;
}

async function askGemini(userPrompt, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CONFIG.model}:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [
            {
                role: 'user',
                parts: [{ text: userPrompt }]
            }
        ],
        systemInstruction: {
            parts: [{ text: GEMINI_CONFIG.systemInstruction }]
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.error?.message || response.statusText;
        throw new Error(`Код ${response.status} (${errMsg})`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text;
    } else {
        return 'Не удалось получить текст ответа.';
    }
}
