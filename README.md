# NeuroCine Online Studio — Full Site v2

Полный Next.js проект со структурой:

- `/app/page.js` — главный экран
- `/app/chat/page.js` — чат/генератор сценария
- `/app/storyboard/page.js` — Storyboard Studio
- `/app/api/chat/route.js` — API чат-генерации
- `/app/api/storyboard/route.js` — API storyboard JSON
- `/engine/sceneEngine.js` — локальный fallback pipeline + нормализация
- `/components/*` — UI компоненты студии

## Запуск

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Открыть:

```txt
http://localhost:3000
```

## Важно

Если API ключ не задан, storyboard всё равно работает через локальный fallback pipeline.
