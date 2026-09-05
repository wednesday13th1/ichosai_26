# FOLLOW THE WHITE RABBIT — Phase 1

文化祭向けのスマートフォン用カメラ合成体験。HTML / CSS / JavaScript と Three.js、開発・配信用に Vite のみを使用します。

## 起動

Node.js 22以降とpnpmを用意して実行します。

```sh
pnpm install
pnpm dev
```

PCでは表示されたlocalhostを開きます。スマートフォンの実カメラ確認にはHTTPSで配信してください。LANの `http://192.168...` ではカメラは利用できません。`file://` からも起動しないでください。

```sh
pnpm build
pnpm preview
```

`dist/` をHTTPS対応の静的ホスティングに配置し、その公開URLをQRコードにしてください。Sitesの非公開プレビューは所有者確認が入るため、文化祭用QRには匿名アクセスできる公開配信先が必要です。

## 実装済み

- 開始ボタンを押したときのみカメラ権限を要求。背面カメラを優先、音声は要求しません。
- `muted` / `autoplay` / `playsinline` の動画を全画面に表示。
- 透明なThree.jsレイヤーに基本Geometryで白うさぎを生成。外部モデル、画像、CDNへの実行時依存はありません。
- 白うさぎの移動・停止・振り向き。動きを減らす端末設定では跳躍を抑制。
- 権限拒否、カメラ不在、カメラ使用中、HTTPS不足、WebGL障害の案内。
- 終了、ページ離脱、バックグラウンド移行時にカメラを解放。再開は開始ボタンから。
- 映像の録画・保存・送信は実装していません。

## ファイル構成

| パス | 役割 |
| --- | --- |
| `index.html` | 開始画面、カメラ動画、体験中UI |
| `css/style.css` | モバイル優先レイアウト・セーフエリア |
| `js/main.js` | 開始・終了、権限、ライフサイクル |
| `js/ar.js` | 透過レンダラー、サイズ追従、照明、リソース解放 |
| `js/rabbit.js` | 仮うさぎの生成。GLB差し替えの入口 |
| `js/scenes.js` | Phase 1の時間ベースアニメーション |
| `assets/` | 将来のmodels / textures / images / audio |

## 動作確認

1. iPhone Safari / Android ChromeそれぞれでHTTPSのURLを開く。
2. 初回表示では権限要求が出ないことを確認。
3. Enter Wonderland → カメラ許可 → 背面映像、白うさぎ、Follow me...を確認。
4. 権限を拒否し、案内が出ることを確認。サイト設定で許可後に再試行。
5. 縦横回転後も動画とレイヤーが全画面で、うさぎが見えることを確認。
6. ×、アプリ切り替え、画面ロックでカメラが停止し、戻って再開できることを確認。
7. 本番会場の照明・Wi-Fi・モバイル回線で読み込み時間と発熱を確認。

この作業環境での実端末カメラ確認は未実施です。公開前に上記の実機確認が必要です。

## Phase 1の限界と次の実装

これはカメラ映像への画面相対の3D合成です。床・壁の検出、位置追跡、現実空間への固定、人による遮蔽は行いません。スマートフォンを動かしても、白うさぎは現実の同じ位置に留まりません。現在のアニメーションは実際の歩行を促す追跡機能ではありません。

次はPhase 2として、会場導線を決め、iOSも含むマーカー追跡などの方式を選定し、うさぎを現実空間で追う仕組みを追加します。Tiny Door / Portal / 巨大・縮小オブジェクトは未実装です。

## 参照

- [MDN: getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [Three.js: WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)
