# Upload limit build-safe fix

Заменить файлы:

- `app/api/chat/route.js`
- `next.config.js`

Что исправлено:

- лимит входных данных увеличен до 10 MB на одного персонажа;
- общий лимит рассчитан под 6 персонажей + запас;
- убран `experimental.serverActions.bodySizeLimit`, который мог ломать Render/Turbopack build;
- `next.config.js` оставлен минимальным и совместимым.

После замены на Render:

`Manual Deploy → Clear build cache & deploy`
