let withBoxes = true;
let loaderRunning = false;
let intervalId = null;
let debugMode = false;
let canvas = null;
let streaming = false;
let stopFlag = false;

async function onPlay() {
  const video = document.getElementById("inputVideo");

  if (video.paused || video.ended || !isFaceDetectionModelLoaded()) {
    // if (video.ended || !isFaceDetectionModelLoaded()){
    if (video.ended) {
      console.log("video.ended is true, so clearInterval()");
      clearInterval(intervalId);
      stopFlag = true;
    }
    return;
  }

  // hide spinner and start progress bar
  if (streaming == false) {
    toggleStopBtnSpinner(false);
    toggleProgressBar(true);
    streaming = true;
  }

  const options = getFaceDetectorOptions();

  const result = await faceapi
    .detectSingleFace(video, options)
    .withFaceLandmarks()
    .withFaceExpressions();
  // const landmarks = await faceapi.detectFaceLandmarks(video)

  if (result) {
    if (canvas != null) {
      const dims = faceapi.matchDimensions(canvas, video, true);
      const resizedResult = faceapi.resizeResults(result, dims);

      const minConfidence = 0.05;
      faceapi.draw.drawDetections(canvas, resizedResult);
      faceapi.draw.drawFaceExpressions(canvas, resizedResult, minConfidence);
      faceapi.draw.drawFaceLandmarks(canvas, resizedResult);
    }

    // face recognization process
    detectVowel(result);
  }
}

async function start() {
  console.log("start()");
  stopFlag = false;

  toggleStopBtnSpinner(true);
  toggleStartStopBtn(true);
  // toggleProgressBar(true); // not this time

  // load face detection and face expression recognition models
  await changeFaceDetector(TINY_FACE_DETECTOR);
  await faceapi.loadFaceExpressionModel("/");
  await faceapi.loadFaceLandmarkModel("/");

  // try to access users webcam and stream the images to the video element
  const opt = {
    video: {
      frameRate: { ideal: 5, max: 15 },
      facingMode: "user",
    },
    audio: false,
  };
  const video = document.getElementById("inputVideo");
  const stream = await navigator.mediaDevices.getUserMedia(opt);
  window.localStream = stream;
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      console.log("onloadedmetadata");
      if (stopFlag == false) {
        video.play();
        intervalId = setInterval(() => onPlay(), 200);
        console.log("intervalId: ", intervalId);
      }
      resolve();
    };
  });
}

function toggleDebugMode() {
  notDebugMode = document
    .getElementById("debug-component")
    .classList.toggle("hidden");
  canvas = notDebugMode ? null : document.getElementById("overlay");
}

function toggleStartStopBtn(isRunning) {
  const startBtn = document.getElementById("start-btn");
  const stopBtn = document.getElementById("stop-btn");
  startBtn.classList.toggle("hidden", isRunning);
  stopBtn.classList.toggle("hidden", !isRunning);
}

function toggleStopBtnSpinner(bool) {
  const spinner = document.querySelector(".preloader-wrapper.small");
  spinner.classList.toggle("active", bool);
  spinner.classList.toggle("hidden", !bool);
  spinner.nextElementSibling.innerText = bool ? "" : "STOP"; //stop button
}

function toggleProgressBar(bool) {
  const runningLoader = document.getElementById("running-loader");
  runningLoader.classList.toggle("hidden", !bool);
}

async function stop() {
  console.log("stop()");
  stopFlag = true;
  toggleStartStopBtn(false);
  // toggleStopBtnSpinner(false); // already run when stream started
  toggleProgressBar(false);

  const video = document.getElementById("inputVideo");
  window.localStream?.getVideoTracks()?.[0].stop();
  video.src = "";
  streaming = false;
}

window.addEventListener("load", () => {
  // programmatically add video and canvas element
  const video = document.createElement("video");
  video.setAttribute("id", "inputVideo");
  // video.setAttribute('autoplay', ''); // autoplay auto pause video when element hidden
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  document.getElementById("video-wrapper").appendChild(video);

  const hideVideoDiv = document.createElement("div");
  hideVideoDiv.className = "hide-vide-div";
  document.getElementById("video-wrapper").appendChild(hideVideoDiv);

  const canvas = document.createElement("canvas");
  canvas.setAttribute("id", "overlay");
  document.getElementById("video-wrapper").appendChild(canvas);

  // add swipe events
  setSwipe();
});

function detectVowel(resizedResult) {
  // const landmarkPositions = resizedResult.landmarks.positions;
  const expressions = resizedResult.expressions;
  const highestExpression = Object.keys(expressions).reduce((a, b) =>
    expressions[a] > expressions[b] ? a : b
  );
  document.getElementById("highestExpression").value = highestExpression;
  document.getElementById("surprised").value = _.round(
    expressions.surprised,
    2
  );
  document.getElementById("happy").value = _.round(expressions.happy, 2);

  const mouth = resizedResult.landmarks.getMouth();

  // eye width / lips width
  const rightEye = resizedResult.landmarks.getRightEye();
  const leftEye = resizedResult.landmarks.getLeftEye();
  const eyeOuterWidthDist = faceapi.euclideanDistance(
    [rightEye[3].x, rightEye[3].y],
    [leftEye[0].x, leftEye[0].y]
  );
  const lipsOuterWidthDist = faceapi.euclideanDistance(
    [mouth[0].x, mouth[0].y],
    [mouth[6].x, mouth[6].y]
  );
  // document.getElementById("eyeOuterWidthDist").value = _.round(eyeOuterWidthDist, 3);
  // document.getElementById("lipsOuterWidthDist").value = _.round(lipsOuterWidthDist, 3);

  // detect mouthOpen
  const innerLipsOpenDist = faceapi.euclideanDistance(
    [mouth[18].x, mouth[18].y],
    [mouth[14].x, mouth[14].y]
  );
  const outerLipsOpenDist = faceapi.euclideanDistance(
    [mouth[9].x, mouth[9].y],
    [mouth[3].x, mouth[3].y]
  );
  const innerLipsOpenDistWithRatio = innerLipsOpenDist / eyeOuterWidthDist;
  const outerLipsOpenDistWithRatio = outerLipsOpenDist / eyeOuterWidthDist;
  const mouthOpen = innerLipsOpenDistWithRatio > 0.1;

  document.getElementById("lipsOuterWidthDist-eyeOuterWidthDist").value =
    _.round(lipsOuterWidthDist / eyeOuterWidthDist, 2);

  const outerLipsRhombus = outerLipsOpenDist * lipsOuterWidthDist; //rhombus = ひし形 外唇
  const outerLipsRhombusWithRatio = outerLipsRhombus / eyeOuterWidthDist;

  // debug logs
  document.getElementById("mouthOpen").value = mouthOpen;
  // document.getElementById("innerLipsOpenDist").value = _.round(innerLipsOpenDist, 2);
  // document.getElementById("outerLipsOpenDist").value = _.round(outerLipsOpenDist, 2);
  document.getElementById("innerLipsOpenDistWithRatio").value = _.round(
    innerLipsOpenDistWithRatio,
    2
  );
  document.getElementById("outerLipsOpenDistWithRatio").value = _.round(
    outerLipsOpenDistWithRatio,
    2
  );

  if (mouthOpen) {
    document.getElementById("outerLipsRhombusWithRatio").value = _.round(
      outerLipsRhombusWithRatio,
      2
    );
  }

  let resultVowel = "",
    resultVowelJp = "";
  const currentVowel = document.querySelector(
    'input[name="currentVowel"]:checked'
  ).value;

  if (!mouthOpen) {
    resultVowelJp = "う";
    resultVowel = "u";

    // happy: i, e
  } else if (highestExpression == "happy") {
    // judge i or e with vertical distance of mouth
    if (innerLipsOpenDistWithRatio < 0.17) {
      resultVowelJp = "い";
      resultVowel = "i";
    } else {
      resultVowelJp = "え";
      resultVowel = "e";
    }

    // surprised: a, o
  } else if (highestExpression == "surprised") {
    // judge a or u with multiply vertical and horizontal length of mouth
    if (innerLipsOpenDistWithRatio >= 0.2) {
      resultVowelJp = "あ";
      resultVowel = "a";
    } else {
      resultVowelJp = "お";
      resultVowel = "o";
    }

    // mouseOpen and neutral: o
  } else {
    resultVowelJp = "お";
    resultVowel = "o";
  }

  // console.log("resultVowelJp: ", resultVowelJp);
  if (currentVowel != resultVowelJp) {
    changeKeyTop(resultVowel);
    document.getElementById(`char-${resultVowel}`).click();
  }

  // draw point number indecies for test
  // rightEye.forEach((point,idx) => {
  //   // context.fillText(idx, point.x, point.y, 5)
  // })
  // leftEye.forEach((point,idx) => {
  //   context.fillText(idx, point.x, point.y, 5)
  // })
  // mouth.forEach((point,idx) => {
  //   context.fillText(idx, point.x, point.y, 5)
  // })
}

let sensitivity;
window.addEventListener("load", () => {
  // get or set sensitivity from localStorage
  const sensitivityElm = document.getElementById("swipe-sensitivity");
  sensitivityElm.addEventListener("change", (evt) => {
    localStorage.setItem("sensitivity", evt.target.value);
    sensitivity = evt.target.value;
  });
  const lsSensitivity = localStorage.getItem("sensitivity");
  if (lsSensitivity == null) {
    localStorage.setItem("sensitivity", "50");
    lsSensitivity = 50;
  }
  sensitivityElm.value = lsSensitivity;
  sensitivity = lsSensitivity;

  // add reset button event
  const resetSensitivityBtn = document.getElementById("reset-sensitivity-btn");
  resetSensitivityBtn.addEventListener("click", () => {
    localStorage.setItem("sensitivity", "50");
    sensitivityElm.value = 50;
    sensitivity = 50;
  });
});

// change current vowel with swipe
function setSwipe() {
  let t = document.querySelector(".swipearea-overlay");
  let aiueo = "a i u e o".split(" ");
  let startX, startY;
  let moveX, moveY;
  let tmpCurrentVowel = "",
    tmpIdx;
  sensitivity = document.getElementById("swipe-sensitivity").value; // default 50
  // console.log("sensitivity: ", sensitivity);

  ///// mouse
  t.addEventListener("mousedown", function (e) {
    e.preventDefault();
    startX = e.pageX;
    startY = e.pageY;
    tmpCurrentVowel = document.querySelector(
      'input[name="currentVowel"]:checked'
    ).value;
    tmpIdx = aiueo.indexOf(tmpCurrentVowel);
    // console.log("tmpCurrentVowel: ", tmpCurrentVowel);
    // console.log("tmpIdx: ", tmpIdx);

    t.onmousemove = (n) => {
      n.preventDefault();
      moveX = n.pageX;
      moveY = n.pageY;
      onMove(moveX, startX, "mouse");
    };
  });

  t.addEventListener("mouseup", function (e) {
    t.onmousemove = null;
  });

  /// touch
  t.addEventListener("touchstart", function (e) {
    e.preventDefault();
    startX = e.touches[0].pageX;
    startY = e.touches[0].pageY;
    tmpCurrentVowel = document.querySelector(
      'input[name="currentVowel"]:checked'
    ).value;
    tmpIdx = aiueo.indexOf(tmpCurrentVowel);

    t.ontouchmove = (n) => {
      n.preventDefault();
      moveX = n.changedTouches[0].pageX;
      moveY = n.changedTouches[0].pageY;
      onMove(moveX, startX, "touch");
    };
  });

  t.addEventListener("touchend", function (e) {
    t.ontouchmove = null;
  });

  function onMove(moveX, startX, type) {
    const dist = moveX - startX;
    const distNum = Math.floor(dist / sensitivity);
    const newIdx = Math.min(Math.max(tmpIdx + distNum, 0), 4); // min 0 to max 5
    const currentCheckedVowel = document.querySelector(
      'input[name="currentVowel"]:checked'
    ).value;
    const currentIdx = aiueo.indexOf(currentCheckedVowel);
    if (newIdx != currentIdx) {
      console.log("type: ", type);
      // console.log("currentVowel change")
      document.querySelectorAll(".char")[newIdx].click();
    }
  }
}
