# NeuroCine Upscale Pipeline через Replicate

Добавлено:
- `/api/upscale` — server endpoint для Replicate `google/upscaler`
- `app/storyboard/page.js` — блок **Upscale Pipeline · Replicate**
- `.env.local.example` — `REPLICATE_API_TOKEN`

Render → Environment:
```env
REPLICATE_API_TOKEN=твой_replicate_token
```
Потом Manual Deploy.

Как пользоваться:
1. Открой `/storyboard`
2. В блоке **Upscale Pipeline · Replicate** выбери `x2` или `x4`
3. Вставь URL изображения или загрузи файл до 10MB
4. Нажми `Upscale`
5. Открой или скопируй URL улучшенного изображения

Модель: `google/upscaler`; поля: `image`, `upscale_factor`, `compression_quality`.
