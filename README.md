# A NEW PERSPECTIVE — Wonderland

文化祭向けのスマートフォン用WebARフォトスポットです。周囲の物体サイズと重力が自動で変化し、自分自身が巨大化・縮小したように感じる体験をThree.jsとカメラ映像の合成で表現します。

## 起動

Node.js 22以降とpnpmを用意してください。実機カメラの利用にはHTTPSが必要です。

```sh
pnpm install
pnpm dev
pnpm test
pnpm build
```

## 体験の流れ

`NORMAL → GROWING → GIANT → SHRINKING → TINY → GRAVITY_BREAK → WONDERLAND`

- GROWINGでは周囲が小さく遠ざかり、ユーザーの巨大化を表現します。
- SHRINKINGとTINYでは時計、カップ、キノコ、カードが画面からはみ出すほど巨大化します。
- GRAVITY_BREAKからカードと粒子が浮き始めます。
- WONDERLANDは前景・中景・背景のカードを浮遊させ、中央を人物撮影用に空けたまま終了せず継続します。
- DeviceOrientationが利用できない場合はスワイプで視点を動かせます。

## ファイル構成

| パス | 役割 |
| --- | --- |
| `index.html` | エントリー画面、カメラ映像、体験中HUD |
| `css/style.css` | モバイル優先レイアウトとセーフエリア |
| `js/main.js` | カメラ権限、開始・終了、ライフサイクル |
| `js/ar.js` | Three.js描画、視点、Wonderland進行との接続 |
| `js/wonderland.js` | カード、扉、時計、カップ、キノコ、粒子と各状態の演出 |
| `js/scenes.js` | 自動進行するWonderland状態機械 |
| `js/interaction.js` | DeviceOrientationとタッチ操作 |
| `js/door.js` | 再利用可能な小さな扉のGeometry |
| `tests/wonderland.test.js` | 状態遷移、リセット、最終状態の継続テスト |

映像の録画・保存・送信、床・壁検出、位置追跡、空間アンカー、人による遮蔽は行いません。端末の向きだけを使う疑似ARです。本番前にiPhone SafariとAndroid Chromeで確認してください。
