let withBoxes = true;
let stopFlag = false;
let loaderRunning = false;
// function onChangeHideBoundingBoxes(e) {
//   withBoxes = !$(e.target).prop("checked");
// }
let intervalId = null;
let debugMode = false;
let canvas = null;
let streaming = false;

async function onPlay() {
  console.log("onPlay()");
  // console.log("intervalId: ", intervalId);
  const video = document.getElementById("inputVideo");

  if (video.paused || video.ended || !isFaceDetectionModelLoaded()){
    return;
  }

  // hide spinner and start progress bar
  if(streaming==false && stopFlag==false){
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
    if(canvas!=null){
      const dims = faceapi.matchDimensions(canvas, video, true);
      const resizedResult = faceapi.resizeResults(result, dims);

      const minConfidence = 0.05;
      faceapi.draw.drawDetections(canvas, resizedResult)
      faceapi.draw.drawFaceExpressions(canvas, resizedResult, minConfidence)
      faceapi.draw.drawFaceLandmarks(canvas, resizedResult);
    }

    // custom process
    detectVowel(result);
  }

  if(stopFlag){
    clearInterval(intervalId);
    return;
  }
}

async function start() {
  console.log("run()");
  stopFlag = false;

  toggleStopBtnSpinner(true);
  toggleStartStopBtn(true);
  // toggleProgressBar(true); // not this time

  // load face detection and face expression recognition models
  await changeFaceDetector(TINY_FACE_DETECTOR);
  await faceapi.loadFaceExpressionModel("/");
  await faceapi.loadFaceLandmarkModel("/");

  // changeInputSize(224);

  // try to access users webcam and stream the images to the video element
  const opt = {
    video: { 
      frameRate: { ideal: 5, max: 15 },
      facingMode: "user"
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
      if(stopFlag==false){
        intervalId = setInterval(() => onPlay(), 200)
      }
      resolve();
    };
  });
}

function toggleDebugMode(){
  notDebugMode = document.getElementById("debug-component").classList.toggle("hidden");
  canvas = notDebugMode ? null : document.getElementById("overlay");
}

function toggleStartStopBtn(isRunning){
  const startBtn = document.getElementById("start-btn");
  const stopBtn = document.getElementById("stop-btn");
  startBtn.classList.toggle("hidden", isRunning);
  stopBtn.classList.toggle("hidden", !isRunning);
}

function toggleStopBtnSpinner(bool){
  const spinner = document.querySelector(".preloader-wrapper.small");
  spinner.classList.toggle("active", bool);
  spinner.classList.toggle("hidden", !bool);
  spinner.nextElementSibling.innerText = bool ? "" : "STOP"; //stop button  
}

function toggleProgressBar(bool){
  const runningLoader = document.getElementById("running-loader");
  runningLoader.classList.toggle("hidden", !bool);
}

async function stop() {
  stopFlag = true;

  toggleStartStopBtn(false);
  // toggleStopBtnSpinner(false); // already run when stream started
  toggleProgressBar(false);

  const video = document.getElementById("inputVideo");
  localStream.getVideoTracks()[0].stop();
  video.src = '';
  streaming = false;
}

window.addEventListener("load", () => {
  const video = document.createElement("video"); 
  video.setAttribute('id', 'inputVideo');
  video.setAttribute('autoplay', 'muted');
  document.getElementById("video-wrapper").appendChild(video);
  // document.getElementById("inputVideo").style.display = "none";
  // video.style.display = "none";

  const canvas = document.createElement("canvas"); 
  canvas.setAttribute('id', 'overlay');
  document.getElementById("video-wrapper").appendChild(canvas);
  // document.getElementById("inputVideo").style.display = "none";
  // canvas.style.display = "none";
  // initFaceDetectionControls();
  // run();
  setSwipe();
});


function detectVowel(resizedResult){
  const landmarkPositions = resizedResult.landmarks.positions;
  const expressions = resizedResult.expressions;
  const highestExpression = Object.keys(expressions).reduce((a, b) =>
    expressions[a] > expressions[b] ? a : b
  );
  document.getElementById("highestExpression").value = highestExpression;
  document.getElementById("surprised").value = _.round(expressions.surprised, 2);
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
  document.getElementById("innerLipsOpenDistWithRatio").value = _.round(innerLipsOpenDistWithRatio, 2);
  document.getElementById("outerLipsOpenDistWithRatio").value = _.round(outerLipsOpenDistWithRatio, 2);

  if (mouthOpen) {
    // document.getElementById("outerLipsRhombus").value = _.round(outerLipsRhombus, 2);
    document.getElementById("outerLipsRhombusWithRatio").value = _.round(outerLipsRhombusWithRatio, 2);
  }

  let resultVowel = "", resultVowelJp = "";
  // const currentVowel = document.getElementById("result-top").innerText;
  const currentVowel = document.querySelector('input[name="currentVowel"]:checked').value;

  if (!mouthOpen) {
    // console.log("う");
    resultVowelJp = "う"
    resultVowel = "u";

  // happyは「い」「え」
  } else if (highestExpression == "happy") {
    if (innerLipsOpenDistWithRatio < 0.17) {
      // console.log("い");
      resultVowelJp = "い";
      resultVowel = "i";
    } else {
      // console.log("え");
      resultVowelJp = "え";
      resultVowel = "e";
    }

  // surprisedは「あ」「お」
  } else if (highestExpression == "surprised") {
    // 「あ」「う」の判断は唇上下中央、唇左右端の4点をひし形として計算。（対角線 * 対角線 / 2）
    if (innerLipsOpenDistWithRatio >= 0.2) {
      // console.log("あ");
      resultVowelJp = "あ";
      resultVowel = "a";
    } else {
      // console.log("お");
      resultVowelJp = "お";
      resultVowel = "o";
    }

  // mouseOpenでneutralは「お」
  } else {
    resultVowelJp = "お";
    resultVowel = "o";
  }

  if(currentVowel!=resultVowelJp){
    changeKeyTop(resultVowel);
    document.getElementById(`char-${resultVowel}`).checked = true
    // document.getElementById("result").value = resultVowel;
    document.getElementById("result-top").innerText = resultVowelJp;
  }

  // old 20221210 16:35
  // if (mouthOpen && expressions.surprised > 0.80) {
  //   // 「あ」「う」の判断は唇上下中央、唇左右端の4点をひし形として計算。（対角線 * 対角線 / 2）
  //   // if (outerLipsRhombusWithRatio > 25) {
  //   //   // console.log("あ");
  //   //   document.getElementById("result").innerText = "あ";
  //   //   changeKeyTop("a");

  //   // } else {
  //     // console.log("お");
  //     document.getElementById("result").innerText = "お";
  //     changeKeyTop("o");

  //   // }
  // } else if (mouthOpen && expressions.happy > 0.80) {
  //   if (innerLipsOpenDist / eyeOuterWidthDist < 0.20) {
  //     // console.log("い");
  //     document.getElementById("result").innerText = "い";
  //     changeKeyTop("i");

  //   } else {
  //     // console.log("え");
  //     document.getElementById("result").innerText = "え";
  //     changeKeyTop("e");

  //   }
  // }else if(!mouthOpen){
  //   // console.log("う");
  //   document.getElementById("result").innerText = "う";
  //   changeKeyTop("u");

  // } else {
  //   document.getElementById("result").innerText = "あ";
  //   changeKeyTop("a");

  // }

  // define number index
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

// change current vowel with swipe
function setSwipe() {
  let t = document.querySelector(".swipearea-overlay");
  // console.log("t: ", t);
  let aiueo = "a i u e o".split(" ");
  let startX, startY;		// タッチ開始 x, y座標
  let moveX, moveY;	// スワイプ中の x, y座標
  let tmpCurrentVowel = '', tmpIdx;
  const sensitivity = 50; // スワイプを感知する最低距離（ピクセル単位）
  
  ///// マウス
  // タッチ開始時： xy座標を取得
  t.addEventListener("mousedown", function(e) {
    e.preventDefault();
    startX = e.pageX;
    startY = e.pageY;
    // tmpCurrentVowel = document.getElementById("result-top").innerText;
    tmpCurrentVowel = document.querySelector('input[name="currentVowel"]:checked').value;
    tmpIdx = aiueo.indexOf(tmpCurrentVowel);
    // console.log("tmpCurrentVowel: ", tmpCurrentVowel);
    // console.log("tmpIdx: ", tmpIdx);

    // マウスクリックしながら移動中： xy座標を取得
    t.onmousemove = (n) => {
      n.preventDefault();
      moveX = n.pageX;
      moveY = n.pageY;
      onMove(moveX, startX);
    }
  });
  
  // マウスアップ： イベントを削除
  t.addEventListener("mouseup", function(e) {
    t.onmousemove = null;
  });

  /// タッチ
  // タッチ開始時： xy座標を取得
  t.addEventListener("touchstart", function(e) {
    e.preventDefault();
    startX = e.touches[0].pageX;
    startY = e.touches[0].pageY;
    tmpCurrentVowel = document.getElementById("result-top").innerText;
    tmpIdx = aiueo.indexOf(tmpCurrentVowel);

    // スワイプ中： xy座標を取得
    t.ontouchmove = (n) => {
      n.preventDefault();
      moveX = n.changedTouches[0].pageX;
      moveY = n.changedTouches[0].pageY;
      onMove(moveX, startX);
    }
  });
  
  // タッチ終了時： イベントを削除
  t.addEventListener("touchend", function(e) {
    t.ontouchmove = null;
  });

  function onMove(moveX, startX){
    const dist = moveX - startX;
    const distNum = Math.floor(dist / sensitivity);
    const newIdx = Math.min(Math.max(tmpIdx + distNum, 0), 4); // min 0 to max 5
    const currentCheckedVowel = document.querySelector('input[name="currentVowel"]:checked').value;
    const currentIdx = aiueo.indexOf(currentCheckedVowel);
    if(newIdx!=currentIdx){
      console.log("currentVowel change")
      document.querySelectorAll(".char")[newIdx].click();
    }
  };
}


// ios?
// async function start(){
//   initFaceDetectionControls();

//   await changeFaceDetector(TINY_FACE_DETECTOR)
//   await faceapi.loadFaceExpressionModel('/')
//   await faceapi.loadFaceLandmarkModel('/')

//   changeInputSize(224)

//   await setupCamera();
//   // const deviceInfos = await navigator.mediaDevices.enumerateDevices();
// 	// deviceInfos.forEach(deviceInfo=>{
// 	// 	console.log(deviceInfo.kind, deviceInfo.label, deviceInfo.deviceId);
// 	// })
// 	// const constraints = await navigator.mediaDevices.getSupportedConstraints();
// 	// for (const [key, value] of Object.entries(constraints)) {
//   //   console.log(`${key}: ${value}`);
//   // }
//   // navigator.mediaDevices.ondevicechange = function(event) {
//   //   console.log("ondevicechange", event)
//   // }
// }

// async function setupCamera() {
//   const stream = await navigator.mediaDevices.getUserMedia({'audio': false, 'video': {facingMode:'user'}});
// 	const video = document.getElementById('inputVideo');
//   video.style.width = document.width + 'px';
//   video.style.height = document.height + 'px';
//   video.setAttribute('autoplay', '');
//   video.setAttribute('muted', '');
//   video.setAttribute('playsinline', '');
//   video.srcObject = stream;
//   return new Promise((resolve) => {
//     video.onloadedmetadata = () => {
//       console.log("onloadedmetadata");
//       onPlay();
// 			resolve();
//     };
//   });
// }
