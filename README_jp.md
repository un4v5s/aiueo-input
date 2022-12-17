aiueo-input
====

このアプリは、日本語話者で声帯に障害があるなどの理由で発声が難しいユーザーに向けて、簡単にコミュニケーションを取れるために作られました。

身内向けに作っているもので、publicですがまだ開発中です。

タブレット端末のインカメラの映像から取得した口の形から母音を判別し、子音をタッチパネルで入力することで、日本語の五十音を自分の代わりに発声させることができます。

## 背景（開発のきっかけ）

このウェブアプリケーションは、一時的に発声が困難な状況になった身内とコミュニケーションを取るために開発した。

下記のようなユーザーを想定している。
- スマホの入力が画面が小さいためうまくできない。
- 筆談を長時間する体力がない
- 口は動かせるが、発声ができない

参考や検討したのは下記のような試みです。

- 「あかさたな」話法
  - https://www.youtube.com/watch?v=jup-p5GHd1c
  - 入力に時間がかかる  
- パクパくん
  - https://github.com/jphacks/TK_1916
- フリック入力
- 九州工業大学の研究
  - https://www.asahi.com/articles/ASM1T00B5M1SUBQU01Y.html
  - アプリが公開されてない（20221217現在）
- VTuberのリップシンク技術
  音声から母音判別しているので対象外

### 検討

- 母音は5種類（a, i, u, e, o）
- 子音は基本9種類（k, s, t, n, h, m, y, r, w）
- 人が話す時、多数の候補の中から瞬時に発したい音声の形に口を変形させている。

このことから、下記のように課題を設定しました。

課題：訓練された「口の形」を、インプットとして利用したい。

### 実装方針

タブレット端末のインカメラで顔認識をし、5種類の母音のどれなのかを判別する

画面に並べた10種類の子音ボタンが、判別された母音に対応して切り替わる。

任意のボタンを押すことで、タブレット端末がユーザーの代わりに発声する。

## 実装方法

### 顔認識

[face-api.js](https://github.com/justadudewhohacks/face-api.js)を採用。

理由は、Expression（表情）の判定ができ、「あ、お」はsurprized、「い、え」はhappyと判定されることがわかったから。

ただし、認識精度には課題が残っており、体力が落ちている状態の人が利用できるレベルに達しているとは思えない

深層学習技術等を用いて、母音検出部分の精度を上げることができたら、使い物になるのではないかと思っているが、専門外。

### 発声

[Tone.js](https://github.com/Tonejs/Tone.js)を採用

HTML5 audioはiOS端末での音声再生に遅延がある。

それを回避し、かつ、長押しした時に長音を再生するためにpitchShiftとplaybackRateをwebAudioで扱えるライブラリを採用した。


## デモ

<iframe width="560" height="315" src="https://www.youtube.com/embed/0j6MAr7HJhk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## 機能

### WebCamera（iPadのインカメラ）による母音判別

ユーザーの端末のカメラを使用して、リアルタイムで唇の形を認識し、母音を判別する。

![img](https://i.gyazo.com/77b2a14169f4490ac782ccae7d6ab60a.gif)

判別方法は下の通りです。[Source Code](https://github.com/un4v5s/aiueo-input/blob/main/public/js/script.js#L146)
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

### 画面のボタンを除く部分の左右スワイプでの母音の切り替え

![img](https://i.gyazo.com/e36f09592f58f7a7dfca1834544fd012.gif)

実際にテスト利用をした所、母音切り替えの手段が他にあってもいいと思い、ボタン以外の部分を左右スワイプすることで母音を切り替えることを可能にした。

画面右上のDebug Panelの中に、スワイプの感度を調節するスライダーを用意している。

なお、スタートボタンの下の母音をタップすることでも直接母音の変更が可能。

### 長押しで長音の発声

ボタンを長押しすると、長音の発声ができる。

### フォント

フォントは、弱視でも利用できるようユニバーサルフォントを利用している。

## Install

Just `clone` this repository and `npm start`

## Contribution

Insanely welcome.

Show below

## Feature to improve

- Vowel recognition algorythum.
- 慶應大学の増井氏の研究領域の予測変換とかで作った方が、実際のコミュニケーションとして使えるものになる気がする。
- 


## Licence

[MIT](https://github.com/tcnksm/tool/blob/master/LICENCE)

## Author

[un4v5s](https://github.com/un4v5s)

## References and Inspiration

[face-api.js](https://github.com/justadudewhohacks/face-api.js)

[Tone.js](https://github.com/Tonejs/Tone.js)

[パクパくん](https://github.com/jphacks/TK_1916)