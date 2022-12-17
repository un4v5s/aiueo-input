aiueo-input
====

[English README.md](README_en.md)

> **Note**
> This is Japanese vocalization app.

このアプリは、身内に向けて開発したものです。

諸事情により発声が困難になったユーザーとコミュニケーションを取るために、タブレット端末のインカメラの映像の口の形から母音を判別し、子音をタッチパネルで入力することで、日本語の五十音を自分の代わりに発声させることができるWebアプリを開発した。

<br>

## 背景（開発のきっかけ）

### 想定ユーザー
- スマホの入力が画面が小さいためうまくできない。
- 筆談を長時間する体力がない
- 口は動かせるが、発声ができない

### 検討

検討段階で参考にしたのは下記のようなプロジェクト。

- [「あかさたな」話法](https://www.youtube.com/watch?v=jup-p5GHd1c)
  
  入力に時間がかかる  

- [パクパくん](https://github.com/jphacks/TK_1916)
- フリック入力
- [九州工業大学の研究](https://www.asahi.com/articles/ASM1T00B5M1SUBQU01Y.html)

  アプリが公開されてない（20221217現在）

- VTuberのリップシンク技術

  音声から母音判別するのが主流なので対象外

### 条件定義と課題設定

- 母音は5種類（a, i, u, e, o）
- 子音は基本9種類（k, s, t, n, h, m, y, r, w）
- 人が話す時、多数の候補の中から瞬時に発したい音声の形に口を変形させている。

上記より、下記のように課題を設定した。

```
課題：訓練された「口の形」を、インプットとして利用した発声アプリを作る
```

### 基本設計

- タブレット端末のインカメラで顔認識をし、5種類の母音のどれなのかを判別する
- 画面に並べた10種類の子音ボタンが、判別された母音に対応して切り替わる。
- 任意のボタンを押すことで、タブレット端末がユーザーの代わりに発声する。

<br>

## 実装方法

### 顔認識

[face-api.js](https://github.com/justadudewhohacks/face-api.js)を採用。

採用理由は、Expression（表情）の判定ができ、「あ、お」はsurprized、「い、え」はhappyと判定されることがわかり、場合わけが楽になるから。

その後の実装は口を開いた大きさなどで行ったが、母音の認識精度には課題が残っており、体力が落ちている状態の人が利用できるレベルに達しているとは思えない。

深層学習等を用いて、母音検出部分の精度を上げることができたら、使い物になるのではないかと思っているがまだ取り組めていない。

### 発声

[Tone.js](https://github.com/Tonejs/Tone.js)を採用

HTML5 audioはiOS端末での音声再生に遅延があることがわかり、[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)を採用した。

Web audioのplaybackRateは、ピッチを維持できないことがわかり、pitchShiftを利用するためにTone.jsを採用した。

<br>

## デモ

Youtube:

[![aiueo-input demo](https://img.youtube.com/vi/0j6MAr7HJhk/0.jpg)](https://www.youtube.com/watch?v=0j6MAr7HJhk)

<br>

## 機能

### WebCamera（iPadのインカメラ）による母音判別

ユーザーの端末のカメラを使用して、リアルタイムで唇の形を認識し、母音を判別する。

![img](https://i.gyazo.com/77b2a14169f4490ac782ccae7d6ab60a.gif)

肝となる母音判別処理は下記の通り。[Source Code](https://github.com/un4v5s/aiueo-input/blob/main/public/js/script.js#L146)
```
// mouse closed: u
if (!mouthOpen) {
  resultVowel = "u";

// happy: i, e
} else if (highestExpression == "happy") {
  // judge i or e with vertical distance of mouth
  if (innerLipsOpenDistWithRatio < 0.17) {
    resultVowel = "i";
  } else {
    resultVowel = "e";
  }

// surprised: a, o
} else if (highestExpression == "surprised") {
  // judge a or u with multiply vertical and horizontal length of mouth
  if (innerLipsOpenDistWithRatio >= 0.2) {
    resultVowel = "a";
  } else {
    resultVowel = "o";
  }

// mouseOpen and neutral: o (2nd o)
} else {
  resultVowel = "o";
}
```

### ボタンを除く部分の左右スワイプでの母音の切り替え

![img](https://i.gyazo.com/e36f09592f58f7a7dfca1834544fd012.gif)

実際にテスト利用をした所、母音切り替えの手段が他にあってもいいと思い、ボタン以外の部分を左右スワイプすることで母音を切り替えることを可能にした。

画面右上のDebug Panelの中に、スワイプの感度を調節するスライダーを用意している。

なお、スタートボタンの下の母音をタップすることでも直接母音の変更が可能。

### 長押しで長音の発声

ボタンを長押しすると、長音の発声ができる。

### フォント

フォントは、弱視でも利用できるようユニバーサルフォントを利用している。

<br>

## インストール

`clone` して `npm start`してください

<br>

## コントリビューション

歓迎いたします。お願いいたします。

<br>

## 課題

- [ ] 母音判別精度の向上
- [ ] 大画面でのフリック入力と予測変換とかで作った方が、実際のコミュニケーションとして使えるものになる気がする。

<br>

## Licence

[MIT](https://github.com/tcnksm/tool/blob/master/LICENCE)

<br>

## Author

[un4v5s](https://github.com/un4v5s)
