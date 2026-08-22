# Ruthy Fun Mandarin 網站

這個儲存庫是 Ruthy Fun Mandarin 網站的版本控制來源。目前為不需要建置工具的靜態網站，可直接預覽，也容易部署到 GitHub Pages、Cloudflare Pages、Netlify 或其他靜態網站服務。

## 本機預覽

在專案資料夾執行：

```powershell
python -m http.server 4173
```

然後開啟 `http://localhost:4173`。請勿直接雙擊 `index.html` 作為正式測試方式。

## 更新 Podcast 或 YouTube

編輯 `content.js`：

- `podcasts`：Podcast 集數；最新一集放最上方。
- `videos`：YouTube 影片；最新影片放最上方。

每次更新後先預覽網站，再提交 Git 版本：

```powershell
git add .
git commit -m "更新 Podcast 與影片"
```

## 學生課後筆記

請先閱讀 `private/README.md`。學生個資與筆記不可放進公開網站或 Git；`private/student-notes/` 已設定忽略。未來如需學生登入區，應使用具備登入與權限控管的後端服務。

## 上線前待確認

- Ruthy 的正式照片與品牌 Logo
- 是否提供 Email、LINE 或預約表單
- 網站正式網域
- 隱私權政策（若加入表單、分析或會員功能）
