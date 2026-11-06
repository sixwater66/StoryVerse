# StoryVerse · 旧书店的来信

React + TypeScript + Vite 的本地双端互动叙事课程原型。创作者端编辑作品，读者端观看、探索并保存平行版本。无后端、无真实 AI 调用。

## 运行

需要 Node.js 22+ 与 npm（本次使用 Node 24.22.1 / npm 11.9.0）。

```sh
npm ci
npm run dev
```

在本机浏览器打开 Vite 输出的地址（默认 5173 端口）。

```sh
npm run typecheck
npm test
npm run build
npx vite preview --host 0.0.0.0
```

生产部署需要将未知路径回退至 index.html，以支持 React Router 刷新。

## 目录

- `src/pages/`：工作台 Studio、作品 Work、探索 Explore、平行创作 Branches。
- `src/components/`：应用导航 Layout、模拟/HTML5 播放器 Player。
- `src/store.tsx`：共享状态、本地持久化和独立版本创建。
- `src/data/story.json`：唯一测试故事，含三个角色、六条客观线索、六段分镜、三种行动结果。
- `src/core.test.tsx`：基础 DOM 交互与状态测试。
- `public/assets/characters/`：三个可替换 SVG 角色头像。
- `public/assets/scenes/bookshop.svg`：书店场景占位插画。
- `public/assets/props/`：六个道具占位图。
- `public/assets/video/`：后续 MP4 素材位置。

## 已实现

- 四个独立路由，作品页内嵌播放器构成五类界面；桌面优先、窄屏适配。
- 工作台编辑标题、手稿和世界设定，作品预览显示修改；角色卡呈现预置人物。
- 90 秒分镜模拟播放/暂停/进度定位；45 秒自动进入探索，每轮首次跨越节点触发。拖回节点前会重新启用触发。
- 六个道具热点与统一客观线索卡；三个视角的叙事和已知信息不同。客观卡为读者全知资料，不代表角色知道秘密。
- 三种行动即时显示预制结局；质疑分支独有三句台词；每次保存生成独立 UUID，原作不被覆盖；保存列表可展开和删除。
- 探索返回恢复进入前的时间及播放状态，探索途中可以进入平行创作再返回探索。
- 旧版 localStorage `storyverse-v1`（现由统一服务迁移至 `storyverse-db-v2`）保存手稿、世界、进度、播放状态、角色、已查看线索、探索返回点、行动与版本。刷新可恢复这些状态；浏览器清除站点数据会删除它们，无云端同步。

## 素材替换与视频

可以直接替换上述 SVG（保持文件名），或修改组件引用。场景建议 16:10，播放器使用 16:9 裁切；热点坐标在 JSON 中以百分比配置。分镜目前共用书店插画，按时间切换标题、旁白字幕；并非最终动画。

将 90 秒 MP4 放入 `public/assets/video/story.mp4`，把 JSON 的 `videoSrc` 设为 `/assets/video/story.mp4`，即默认使用 HTML5 视频。建议 H.264/AAC。也可通过播放器的文件输入临时导入本机 MP4/WebM；导入文件保存在 IndexedDB，localStorage 保存文件引用和元数据，刷新后可恢复；浏览器清理本地存储后需重新导入。没有内置 MP4，不会冒充真实视频。HTML5 视频使用同一时间控制与探索节点；浏览器若阻止自动续播，点击播放继续。

`story.json` 是预置数据；浏览器中的编辑保存在 localStorage，不写回磁盘 JSON。剧情分支及分镜仍使用预制内容，编辑手稿不会自动更新这些内容。需要恢复初始数据时，在浏览器站点存储中删除 `storyverse-db-v2`、对应备份及旧 `storyverse-v1`。

## 概念演示与后续范围

AI 辅助创作、AI 平行生成均为明确标注的概念演示，结果来自预制文本。后续可完善最终六幅分镜、人物立绘、90 秒视频、音轨/台词配音、无障碍与完整浏览器兼容验证。本轮未进行第三、第四阶段的完整浏览器验收及视觉精修。

## 基础验收

`npm test` 使用 Vitest + jsdom 验证角色切换、客观卡一致、分支差异与独立保存、重新挂载恢复版本、手稿编辑、探索返回和手动进入的进度/播放状态、损坏 JSON 回退。它不代替真实浏览器中的视频解码、自动播放政策和最终 MP4 测试。

## GitHub Pages 自动部署

仓库 https://github.com/sixwater66/StoryVerse ，默认分支 main。
在仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。
每次推送 main 自动运行 `.github/workflows/deploy-pages.yml`；也可在 Actions 中选择 Deploy StoryVerse to GitHub Pages → Run workflow 手动运行。
工作流使用内置 GITHUB_TOKEN 与 OIDC，无需设置个人密钥；构建只有 contents: read，部署任务拥有 pages: write 和 id-token: write。若组织策略禁用 Actions 或限制 github-pages 环境部署，需要管理员放行。
预期地址为 https://sixwater66.github.io/StoryVerse/#/work ，以成功部署任务的输出网址为准。

Vite base 为 /StoryVerse/，静态资源使用 BASE_URL；HashRouter 让刷新和深层页面通过 #/studio、#/explore、#/branches 访问，无需服务器回退（取代上文的生产回退要求）。本地 Vite 也使用 /StoryVerse/ 路径。localStorage 键不变，但公网与 localhost 不同源，已有本机数据不会自动迁移。未来视频配置保留 /assets/video/story.mp4，由播放器添加部署 base；临时文件的 blob URL 不受影响。

## 数据模型（验收补齐）

- `src/data/types.ts`：故事、世界、角色、客观事实、线索、分镜、条件台词、分支的显式 TypeScript 契约。
- `src/data/index.ts`：统一导入 JSON，并通过 `Story` 类型赋值检查必需字段与结构；不使用强制类型断言，也不调用 AI。
- `src/data/story.json`：补齐简介、背景、主题、完整作家叙事原文、独立线性版本、三角色完整第一人称叙事、结构化世界、六段画面与旁白、质疑分支台词条件。
- `src/data/story.test.ts`：校验 ID 唯一、事实引用、时间连续、人物知识边界和条件台词。

`facts` 是行动选择前的客观事实；`characters[].knowledge.factIds` 是角色知道的事实引用，`unknownFactIds` 明确未知项，`subjectivePerceptions` 是观察与主观认知。`known` 是人物面板用的第一人称已知信息，`narrative` 保留用户原始人物叙事；线索为读者全知资料，不赋予角色额外知识。`synopsis` 与 `theme` 为依据原文的内容归纳，不是新增情节。

为保持页面兼容，原有 `text`（简写原作主线）、`world`（世界摘要）、`caption`（模拟分镜字幕）保留；`originalText` 与 `linearNarrative` 保存完整作家叙事源文，`narration` 单独保存用户原始视频旁白，允许空字符串表示无旁白。条件台词在第 5 个行动选择分镜关联，未指定原文没有给出的逐句时间。视频播放仍是已有概念模拟，不增加自动生成或语音功能。

localStorage 键、已有编辑内容和已保存版本不迁移、不覆盖；旧存档中的文本仍按用户保存时的快照显示。分支新建版本使用补齐后的预制文本。基础工程、路由和部署配置保持不变。

## 双端页面架构

当前默认首页改为作品发现，创作者入口为 `#/creator`。完整十页路由、布局、职责边界与测试规范见 [双端架构文档](docs/application-architecture.md)。作品详情与播放已分离；旧 `#/work` 仍重定向至详情，播放器入口位于 `#/watch`。新建页面仅为明确标记的骨架，不包含推荐、收藏、自动解析、权限编辑或发布业务。

## 统一数据与存储服务

当前使用带版本和恢复机制的 `storyverse-db-v2`、IndexedDB 文件库及草稿/正式快照隔离。完整八类对象、服务 API、迁移、授权规则和容量限制见 [数据存储说明](docs/data-storage.md)。旧文档中的单一共享手稿规则已由此版本取代。当前仅提供数据服务，不新增多作品管理或发布页面业务。

## C1 / C2 创作流程

C1（`#/creator`）现支持多作品创建、类型/模板、状态筛选、最近编辑、重命名、复制、归档和删除未发布草稿。C2（`#/creator/story?work=<ID>`）支持文本/构思/TXT 导入与完整静态结构编辑；改动自动保存，完整性检查通过后进入 C3。示例解析为本地预设概念演示，对其他文本不会自动套用示例。C3/C4 提供返回同一作品 C2 的入口，其他阶段仍保持骨架。详见架构与存储文档。
