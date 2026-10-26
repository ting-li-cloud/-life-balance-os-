# Life Balance OS · 今日總覽

React + TypeScript (Vite) implementation of the Claude Design prototype `project/今日總覽 v2.dc.html`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

## Startup options (the prototype's Tweaks panel)

Pass as URL query params, e.g. `/?view=week&scenario=nodata&hero=fox&work=3`.

| Param      | Values                                   | Default     |
|------------|------------------------------------------|-------------|
| `view`     | `today` `week` `month` `year` `goals`    | `today`     |
| `scenario` | `overload` `normal` `nodata`             | `overload`  |
| `hero`     | `botanical` `fox`                        | `botanical` |
| `work`     | 3–8 (工作待辦 shown before 顯示全部)        | `5`         |

## Layout

- `src/ds/` — design-system components (Button, Badge, Checkbox, Tabs, Dialog…) ported from the DS bundle; icons are Lucide 0.460 via `lucide-react`.
- `src/styles/tokens.css` — design tokens copied from the design system.
- `src/data/sample.ts` — all sample content (placeholder, not real 天意能創 data). Replace with real data sources.
- `src/views/` — 今日 / 本週 / 本月 / 今年 / 目標管理.
- `src/components/RescheduleDialog.tsx` — 重新安排今日 dialog.
