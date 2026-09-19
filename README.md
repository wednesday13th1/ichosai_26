# A NEW PERSPECTIVE — Wonderland WebAR

文化祭向けのモバイルファースト空間WebAR体験です。対応するAndroid ChromeではWebXR `immersive-ar` / `hit-test`で床を検出し、4つのWonderlandを同じworld anchorへ固定します。WebXR非対応環境でも、ライブカメラとDeviceOrientation / DeviceMotionを使い、同じThree.js実3Dシーンを表示します。

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

1. `ENTER WONDERLAND`からカメラ・モーションを許可
2. WebXR対応端末では床をスキャンし、検出位置へWonderlandを配置
3. 非対応端末では背面カメラ上の空間ビューへ配置
4. World 01からAR撮影を開始
5. Camera内の`NEXT WORLD`で、Sessionを維持したままWorldを切り替え
6. シャッターでカメラ映像とWebGLを合成
7. 撮り直し、保存、対応端末では共有

DeviceOrientationが利用できない、または許可されない場合も、タッチ操作と自律アニメーションで継続します。

## Time Adaptive Wonderland

現地時刻を連続値として扱い、各区分の終了30分前から次のテーマへpalette、照明、rim light、particle opacity、haze、shadow、animation speedを補間します。UIだけでなく各WorldのPBR material・emissive・particleにも同じtheme stateを渡します。

| 時間 | Theme | 表現 |
| --- | --- | --- |
| 06:00–10:59 | Morning | Victorian ivory、dust blue、低いglow、ゆっくりした浮遊 |
| 11:00–15:59 | Day | 高いcontrast、subtle rim light、標準速度 |
| 16:00–18:29 | Golden | amber light、burgundy、暖色highlight |
| 18:30–05:59 | After Dark | moon ivory、midnight blue、強めのrim light、深いhaze |

開発時は `?time=08`、`?time=13`、`?time=17:15`、`?time=20` で時刻を固定できます。`&preview=1&world=3` を追加すると、カメラ権限なしで指定Worldをvisual QAできます。queryがない本番では実時間を使用し、1分ごとに更新します。

## 4 Worlds

| ID | World | AR構成 |
| --- | --- | --- |
| 01 | DOWN THE HOLE | 浮遊カード、建築断片、浮遊チェス駒、分割チェス盤 |
| 02 | QUEEN'S COURT | ハートカード、バラ、空中で崩れたチェス盤と駒、赤い粒子 |
| 03 | LOST IN TIME | サイズと速度の異なる時計、時計針、ローマ数字、チェーン |
| 04 | MAD TEA PARTY | 一体構図の浮遊カップ、ティーポット、花、ケーキ、テーブル断片、蒸気 |

各WorldはFAR・MID・NEARの深度、FULL・Y-axis・FIXEDのビルボード方式、優先度別レスポンシブ削減を持ちます。切り替えは750msのフェードと約3vwの水平ドリフトです。

## 現行アーキテクチャ

| パス | 責務 |
| --- | --- |
| `index.html` | 1アクション起動、配置ガイド、最小限のAR Camera UI |
| `css/style.css` | 写真映えするエディトリアルUI、safe area、レスポンシブ配置 |
| `js/main.js` | 起動、fallback camera、World切替、撮影、保存、カメラ反転 |
| `js/ar.js` | WebXR Session、hit-test、world anchor、renderer、照明、World接続 |
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

WebXR対応環境では6DoF位置追跡、hit-test、world anchorを使用します。iOS SafariなどWebXR非対応環境では、カメラ + 端末センサーによる3D fallbackになります。人物セグメンテーション・depth occlusion・録画は未対応です。またWebXRのpassthrough映像はブラウザの保護領域にあるため、WebXR中の標準Canvas撮影では背景カメラを直接取得できない場合があります。本番前に対象端末で権限、配置、撮影、safe area、長時間フレームレートを確認してください。
