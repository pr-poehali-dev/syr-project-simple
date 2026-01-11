-- Обновляем значения настроек на корректный JSONB формат
UPDATE site_settings SET value = '"\ud83e\uddc0"'::jsonb WHERE key = 'logo';
UPDATE site_settings SET value = '"default"'::jsonb WHERE key = 'theme';
UPDATE site_settings SET value = '[]'::jsonb WHERE key IN ('farm_photos', 'farmPhotos');

-- Добавляем недостающие настройки
INSERT INTO site_settings (key, value) 
VALUES 
    ('minDeliveryAmount', '2500'::jsonb),
    ('siteDescription', '"\u0421\u044b\u0440\u043e\u0432\u0430\u0440\u043d\u044f SOBKO \u2014 \u043d\u0430\u0442\u0443\u0440\u0430\u043b\u044c\u043d\u044b\u0435 \u043f\u0440\u043e\u0434\u0443\u043a\u0442\u044b \u0441 \u043b\u044e\u0431\u043e\u0432\u044c\u044e \u0438 \u0437\u0430\u0431\u043e\u0442\u043e\u0439 \u043e \u0432\u0430\u0448\u0435\u043c \u0437\u0434\u043e\u0440\u043e\u0432\u044c\u0435!"'::jsonb),
    ('telegramBotToken', '"8530330128:AAH7zYq7jWo-TdGIZStP3AMDL5s_-Jzbkcg"'::jsonb),
    ('telegramChatId', '"6368037525, 295345720"'::jsonb)
ON CONFLICT (key) DO NOTHING;