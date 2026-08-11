// Конфигурация Mistral AI
const MISTRAL_CONFIG = {
    model: 'mistral-small-latest',
    systemInstruction: `Ты — встроенный ИИ-эксперт базы знаний EVBase по китайским электромобилям (Zeekr, Lixiang, BYD, Voyah, Avatr, Xiaomi и др.). 
Твоя задача — давать четкие, технически грамотные ответы по:
- Диагностике программных ошибок и сбоев (OTA, мастер-аккаунты, русификация, сим-карты).
- Обслуживанию, замене расходников и подбору запчастей.
- Особенностям зарядки (GB/T, адаптеры, фазы, мощности).
Отвечай кратко, вежливо и по делу. Если не уверен в конкретном каталожном номере, честно предупреди об этом.`
};

// Массив истории сообщений для контекста
let chatHistory = [];

// Функция получения ключа из память браузера
function getApiKey() {
    return localStorage.getItem('mistral_api_key');
}

// Запрос ключа у пользователя
function promptForApiKey() {
    const currentKey = getApiKey() || '';
    const newKey = prompt('Введите ваш Mistral API Key (получить на console.mistral.ai):', currentKey);
    
    if (newKey !== null) {
        const trimmedKey = newKey.trim();
        if (trimmedKey) {
            localStorage.setItem('mistral_api_key', trimmedKey);
            appendMessage('✅ API-ключ Mistral сохранён в вашем браузере!', 'ai-message');
        } else {
            localStorage.removeItem('mistral_api_key');
            appendMessage('⚠️ API-ключ был удалён.', 'ai-message');
        }
    }
}

// Добавление сообщения в чат
function appendMessage(text, className) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return null;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msgDiv;
}

// Запрос к API Mistral
async function askMistral(userPrompt, apiKey) {
    const url = 'https://api.mistral.ai/v1/chat/completions';

    // Формируем сообщения с системной инструкцией и историей
    const messages = [
        { role: 'system', content: MISTRAL_CONFIG.systemInstruction },
        ...chatHistory,
        { role: 'user', content: userPrompt }
    ];

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: MISTRAL_CONFIG.model,
            messages: messages,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.error?.message || response.statusText;
        throw new Error(`Код ${response.status} (${errMsg})`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0]?.message?.content) {
        return data.choices[0].message.content;
    } else {
        return 'Не удалось получить текст ответа.';
    }
}

// Главная функция отправки сообщения
async function handleSendMessage() {
    const chatInput = document.getElementById('chatInput');
    if (!chatInput) return;
    
    const text = chatInput.value.trim();
    if (!text) return;

    const apiKey = getApiKey();
    if (!apiKey) {
        appendMessage('⚠️ Не задан API-ключ Mistral! Нажмите кнопку "🔑 Ключ" вверху чата.', 'ai-message');
        promptForApiKey();
        return;
    }

    // Показываем сообщение пользователя
    appendMessage(text, 'user-message');
    chatInput.value = '';

    const loadingMessage = appendMessage('Ассистент думает...', 'ai-message loading');

    try {
        const responseText = await askMistral(text, apiKey);
        
        // Сохраняем в историю контекста
        chatHistory.push({ role: 'user', content: text });
        chatHistory.push({ role: 'assistant', content: responseText });
        
        // Ограничиваем историю последними 10 сообщениями, чтобы не переполнять запрос
        if (chatHistory.length > 10) {
            chatHistory = chatHistory.slice(-10);
        }

        loadingMessage.remove();
        appendMessage(responseText, 'ai-message');
    } catch (error) {
        console.error('Ошибка Mistral API:', error);
        loadingMessage.remove();
        appendMessage(`❌ Ошибка: ${error.message}. Проверьте ваш API-ключ с помощью кнопки "🔑 Ключ".`, 'ai-message');
    }
}

// Инициализация событий после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chatWindow');
    const toggleChatBtn = document.getElementById('toggleChatBtn');
    const closeChatBtn = document.getElementById('closeChat');
    const chatInput = document.getElementById('chatInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');

    // Кнопка настройки ключа в шапке чата
    const chatHeader = document.querySelector('.chat-header');
    if (chatHeader && !document.getElementById('setKeyBtn')) {
        const keyBtn = document.createElement('button');
        keyBtn.id = 'setKeyBtn';
        keyBtn.textContent = '🔑 Ключ';
        keyBtn.title = 'Настроить Mistral API Key';
        keyBtn.style.cssText = 'background: rgba(255,255,255,0.1); border: 1px solid var(--border-color); color: #fff; border-radius: 6px; padding: 2px 8px; font-size: 0.75rem; cursor: pointer; margin-left: auto; margin-right: 8px;';
        keyBtn.addEventListener('click', promptForApiKey);
        if (closeChatBtn) {
            chatHeader.insertBefore(keyBtn, closeChatBtn);
        } else {
            chatHeader.appendChild(keyBtn);
        }
    }

    // Открытие/закрытие чата
    if (toggleChatBtn && chatWindow) {
        toggleChatBtn.addEventListener('click', () => {
            chatWindow.classList.toggle('hidden');
            if (!chatWindow.classList.contains('hidden') && !getApiKey()) {
                promptForApiKey();
            }
        });
    }

    if (closeChatBtn && chatWindow) {
        closeChatBtn.addEventListener('click', () => chatWindow.classList.add('hidden'));
    }

    // Отправка сообщений
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', handleSendMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSendMessage();
        });
    }
});
