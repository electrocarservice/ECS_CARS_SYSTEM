// Конфигурация Mistral AI
const MISTRAL_CONFIG = {
    model: 'mistral-small-latest', // Для чат-ботов отлично подходит mistral-small-latest или mistral-large-latest
    systemInstruction: `Ты — встроенный ИИ-эксперт базы знаний EVBase по китайским электромобилям (Zeekr, Lixiang, BYD, Voyah, Avatr, Xiaomi и др.). 
Твоя задача — давать четкие, технически грамотные ответы по:
- Диагностике программных ошибок и сбоев (OTA, мастер-аккаунты, русификация, сим-карты).
- Обслуживанию, замене расходников и подбору запчастей.
- Особенностям зарядки (GB/T, адаптеры, фазы, мощности).
Отвечай кратко, вежливо и по делу. Если не уверен в конкретном каталожном номере, честно предупреди об этом.`
};

// Функция отправки сообщения в Mistral API
async function sendToMistral(userMessage, apiKey) {
    const url = 'https://api.mistral.ai/v1/chat/completions';

    // Формируем историю сообщений с учетом системного промпта
    const messages = [
        { role: 'system', content: MISTRAL_CONFIG.systemInstruction },
        ...chatHistory, // Ваш массив с предыдущими сообщениями [{role: 'user'|'assistant', content: '...'}]
        { role: 'user', content: userMessage }
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
        throw new Error(`Ошибка Mistral API (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}
