# Kota-kun LIFF App

LINE LIFFアプリケーションです。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の内容を設定してください：

```env
# LIFF設定
NEXT_PUBLIC_LIFF_ID=YOUR_LIFF_ID_HERE

# LINE Bot設定（必要に応じて）
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
LINE_CHANNEL_SECRET=your_channel_secret

# その他の設定
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. LIFF IDの取得

1. [LINE Developers Console](https://developers.line.biz/console/)にアクセス
2. プロバイダーを作成
3. チャンネルを作成（LIFFアプリ）
4. LIFF IDを取得して環境変数に設定

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 機能

- LINE LIFF認証
- ユーザープロフィール取得
- ログイン/ログアウト機能

## 技術スタック

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- LINE LIFF SDK

## デプロイ

### Vercel

1. Vercelにプロジェクトをインポート
2. 環境変数を設定
3. デプロイ

### Firebase Hosting

```bash
npm run build
npm run export
firebase deploy
```