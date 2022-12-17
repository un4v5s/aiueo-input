aiueo-input
====

[日本語 README.md](README.md)

> **Note**
> This is Japanese vocalization app.

This app was developed for my friend.

In order to communicate with users who have difficulty speaking due to various circumstances, the Japanese syllabary can be reproduced by distinguishing vowels from the shape of the mouth in the in-camera image of the tablet terminal and inputting the consonants on the touch panel. I developed a web application that can be spoken on behalf of myself.

<br>

## Background

### Expected User

- People who can't type well on my smartphone because the screen is small.
- People who do not have the physical strength to communicate in writing for a long time
- People who can move their mouths, but can't speak

### Consideration

The following projects were considered during the review stage.

- ["Akasatana" speech](https://www.youtube.com/watch?v=jup-p5GHd1c)(Japanese)
  
  input takes a long time

- [Pakupa-kun](https://github.com/jphacks/TK_1916)(Japanese)
- Japanese flick input keyboard
- [Research at Kyushu Institute of Technology](https://www.asahi.com/articles/ASM1T00B5M1SUBQU01Y.html)(Japanese)

  The project is not published (as of 20221217)

- VTuber lip sync technology

  Not applicable because it is mainstream to distinguish vowels from speech recognition

### Condition definition and task setting

- 5 vowels (a, i, u, e, o)
- 9 basic consonants (k, s, t, n, h, m, y, r, w)
- When a person speaks, the mouth is instantly transformed into the shape of the desired voice from among many candidates.

Based on the above, I set the following goal.

```
Goal: Create a vocalization application that uses the trained "mouth shape" as an input
```

### Basic design

- Face recognition with the tablet's in-camera to determine which of the 5 types of vowels.
- 10 types of consonant buttons arranged on the screen are switched according to the identified vowels.
- By pressing any button, the tablet terminal speaks on behalf of the user.

<br>

##　Implementation

### Face Recognition

I use [face-api.js](https://github.com/justadudewhohacks/face-api.js).

The reason for using it is that this library has a function to judge facial expressions, and it was found that "A" and "O" are judged as surprised, and "I" and "E" are judged as happy.

In the additional implementation, we used indicators such as how wide the mouth was opened vertically, but there are still issues with the accuracy of vowel recognition, and I don't think it has reached a level that can be used by people who got ill.

If I can improve the accuracy of the vowel detection part by using deep learning, but I have not worked on it yet.

### Vocalization

I use [Tone.js](https://github.com/Tonejs/Tone.js)

I found that HTML5 audio has a delay in audio playback on iOS devices, so we adopted [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).

Later, I found that the Web Audio API's playbackRate could not preserve the pitch, so I use Tone.js and pitchShift.

<br>

## Demo

YouTube link below:

[![aiueo-input demo](https://img.youtube.com/vi/0j6MAr7HJhk/0.jpg)](https://www.youtube.com/watch?v=0j6MAr7HJhk)

<br>

## Features

### Vowel discrimination by WebCamera (inside camera of iPad)

Use the in-camera of the user's device to recognize lip shapes and identify vowels in real time.

![img](https://i.gyazo.com/77b2a14169f4490ac782ccae7d6ab60a.gif)

Here is the code that handles vowel discrimination. [Source Code](https://github.com/un4v5s/aiueo-input/blob/main/public/js/script.js#L146)
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

### Switch vowels by left/right swipe except buttons

![img](https://i.gyazo.com/e36f09592f58f7a7dfca1834544fd012.gif)

When I used it, I thought it would be nice to have another means of switching vowels, so I made it possible to switch vowels by swiping left and right on the part other than the button.

In the Debug Panel on the upper right of the screen, there is a slider to adjust the swipe sensitivity.

You can also change the vowel directly by tapping the vowel under the start button.

### Press and hold to pronounce long vowels

Press and hold the button to make long sounds.

### Fonts

Use universal fonts so that even people with low vision can use.

<br>

## install

`clone` and `npm start`

<br>

## Contribution

Welcome. Please.

<br>

## Tasks

- [ ] Improve vowel recognition accuracy
- [ ] I feel that flick input and predictive conversion would be more useful for actual communication

<br>

## License

[MIT](https://github.com/tcnksm/tool/blob/master/LICENCE)

<br>

## Author

[un4v5s](https://github.com/un4v5s)