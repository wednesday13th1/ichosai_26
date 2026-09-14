# A NEW PERSPECTIVE — Wonderland WebAR

文化祭向けのモバイルファーストWebARフォト体験です。ライブカメラ映像の上にThree.jsで構成した4つのWonderlandを重ね、DeviceOrientationによる奥行き別パララックスと静かなアニメーションを加えます。

現実を約55〜65%、ARを約35〜45%残し、中央の人物撮影領域を空けたエディトリアルな構図を基本としています。床検出、マーカー、空間アンカーを使用しているように見せるUIはありません。

## 起動

Node.js 22以降とpnpmを用意してください。実機カメラとDeviceOrientationの利用にはHTTPSが必要です。

```sh
pnpm install
pnpm dev
pnpm test
pnpm build
```

## 体験の流れ

1. ウェルカム画面から開始
2. カメラ利用目的を確認して権限を許可
3. 約3秒の「LOOK AROUND」コーチング
4. World 01からAR撮影を開始
5. 画面下の番号または横スワイプでWorldを切り替え
6. シャッターでカメラ映像とWebGLを合成
7. 撮り直し、保存、対応端末では共有

DeviceOrientationが利用できない、または許可されない場合も、タッチ操作と自律アニメーションで継続します。

## 4 Worlds

| ID | World | AR構成 |
| --- | --- | --- |
| 01 | DOWN THE HOLE | 浮遊カード、ページ、額縁、アンティーク時計、透けたチェッカーボード |
| 02 | QUEEN'S COURT | ハートカード、ベルベット、バラ、王冠の気配、赤い粒子 |
| 03 | LOST IN TIME | サイズと速度の異なる時計、時計針、ローマ数字、チェーン |
| 04 | MAD TEA PARTY | ティーカップ、ティーポット、花、ケーキ、テーブル、蒸気 |

各WorldはFAR・MID・NEARの深度、FULL・Y-axis・FIXEDのビルボード方式、優先度別レスポンシブ削減を持ちます。切り替えは750msのフェードと約3vwの水平ドリフトです。

## 現行アーキテクチャ

| パス | 責務 |
| --- | --- |
| `index.html` | カメラ映像、オンボーディング、最小限の固定カメラUI |
| `css/style.css` | デザイントークン、safe area、レスポンシブ配置 |
| `js/main.js` | カメラ権限、World選択、スワイプ、撮影、保存、カメラ反転 |
| `js/ar.js` | Three.js renderer、カメラ、照明、World接続 |
| `js/scene-manager.js` | Worldライフサイクルとエディトリアル遷移 |
| `js/interaction.js` | DeviceOrientationとタッチフォールバック |
| `js/scenes/world-config.js` | 4 Worldのパレット、密度、正規化オブジェクト定義 |
| `js/scenes/composition.js` | 深度、ビルボード、パララックス、優先度、共通アニメーション |
| `js/scenes/world01.js` | DOWN THE HOLEの生成と更新 |
| `js/scenes/world02.js` | QUEEN'S COURTの生成と更新 |
| `js/scenes/world03.js` | LOST IN TIMEの生成と更新 |
| `js/scenes/world04.js` | MAD TEA PARTYの生成と更新 |
| `js/objects.js` | 再利用する軽量Three.jsオブジェクト |

旧来の巨大化・縮小・重力崩壊を順番に再生するモノリシックな状態機械は削除済みです。視覚表現の責務は4つのWorldモジュールだけが持ちます。

## レスポンシブと性能

- `svh`、`clamp()`、safe-area inset、viewport相対値を使用
- 中央 x 28〜72%、y 24〜74%を人物用セーフゾーンとして保護
- 幅390px未満ではpriority 3の装飾を先に非表示
- 端末pixel ratioは最大2
- 透明平面は各World 40未満、粒子は最大30
- Canvas captureにはライブカメラとWebGLだけを含み、HTML UIは含めない

## 技術的制限

これは端末の向きによる疑似ARです。平面検出、位置追跡、空間アンカー、人物セグメンテーション、録画は行いません。そのためARオブジェクトを人物の背後へ正確に遮蔽することはできません。本番前にiPhone SafariとAndroid Chromeの実機で、権限、safe area、カメラ反転、長時間のフレームレートを確認してください。
