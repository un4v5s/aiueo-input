aiueo-input
====

This app was created to facilitate communication for Japanese speakers who have difficulty vocalizing due to problems with their vocal cords.

By identifying the vowels from the shape of the mouth obtained from the image of the in-camera of tablet terminal and inputting the consonants on the touch panel, you can make the Japanese syllabary speak on your behalf.

## Development Status

In Progress (20221216)

## Issues I am working on

- iOSでvideo要素が非表示になると顔認識が停止する
- カメラ使用時のパフォーマンスが悪い
- カメラ開始までの時間が遅い
- 長押しで長音だが、音声ファイルの頭のカットが甘く長音っぽくならない
- renderにデプロイしたが読み込みがかなり遅い
- ボタンを押してから音声の再生までのラグがiosかなりある。Audiocontextを使ってみる？

## Features

- 顔認識で母音を判別する
- ボタンを押すと発話する
- ボタン以外の部分を左右にスワイプすると手動でも母音の切り替えができる
  - スワイプ感度をdebug modeから調節できる。
- 長押しで長音になる

## Problems

- 母音の認識精度があまり良くない。正直実際に使ってもらえそうにない。

機械学習とかでやってほうがいいのかもしれないけど現状知識不足。

現在は、face-api.jsのExpressionを活用している。

- a: expression: neutralの口の大きさ一定以上
- i: expression: happyで口の大きさ一定以下
- u: mouth close
- e: expression: happyで口の大きさ一定以上
- o: expression: neutralで口の大きさ一定以下




## Demo

## Requirement

[face-api.js](https://github.com/justadudewhohacks/face-api.js)

## Usage

## Install

## Contribution

## Licence

[MIT](https://github.com/tcnksm/tool/blob/master/LICENCE)

## Author

[un4v5s](https://github.com/un4v5s)

