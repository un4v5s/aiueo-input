const a = "あ い う え お".split(" ");
const k = "か き く け こ".split(" ");
const ky = "きゃ  きゅ  きょ".split(" ");
const g = "が ぎ ぐ げ ご".split(" ");
const gy = "ぎゃ  ぎゅ  ぎょ".split(" ");
const s = "さ し す せ そ".split(" ");
const sy = "しゃ  しゅ しぇ しょ".split(" ");
const z = "ざ じ ず ぜ ぞ".split(" ");
const jy = "じゃ  じゅ じぇ じょ".split(" ");
const t = "た ち つ て と".split(" ");
const tx = " てぃ とぅ  ".split(" ");
const ty = "ちゃ  ちゅ ちぇ ちょ".split(" ");
const d = "だ でぃ どぅ で ど".split(" ");
const n = "な に ぬ ね の".split(" ");
const ny = "にゃ  にゅ  にょ".split(" ");
const h = "は ひ ふ へ ほ".split(" ");
const hy = "ひゃ  ひゅ  ひょ".split(" ");
const f = "ふぁ ふぃ  ふぇ ふぉ".split(" ");
const b = "ば び ぶ べ ぼ".split(" ");
const by = "びゃ  びゅ  びょ".split(" ");
const p = "ぱ ぴ ぷ ぺ ぽ".split(" ");
const py = "ぴゃ  ぴゅ  ぴょ".split(" ");
const m = "ま み む め も".split(" ");
const my = "みゃ  みゅ  みょ".split(" ");
const y = "や  ゆ  よ".split(" ");
const r = "ら り る れ ろ".split(" ");
const ry = "りゃ  りゅ  りょ".split(" ");
const w = "わ  ん  を".split(" ");

const a_en = "a i u e o".split(" ");
const k_en = "ka ki ku ke ko".split(" ");
const ky_en = "kya  kyu  kyo".split(" ");
const g_en = "ga gi gu ge go".split(" ");
const gy_en = "gya  gyu  gyo".split(" ");
const s_en = "sa si su se so".split(" ");
const sy_en = "sya  syu sye syo".split(" ");
const z_en = "za zi zu ze zo".split(" ");
const jy_en = "jya  jyu jye jyo".split(" ");
const t_en = "ta ti tu te to".split(" ");
const tx_en = " txi txu  ".split(" ");
const ty_en = "tya  tyu tye tyo".split(" ");
const d_en = "da di du de do".split(" ");
const n_en = "na ni nu ne no".split(" ");
const ny_en = "nya  nyu  nyo".split(" ");
const h_en = "ha hi hu he ho".split(" ");
const hy_en = "hya  hyu  hyo".split(" ");
const f_en = "fa fi  fe fo".split(" ");
const b_en = "ba bi bu be bo".split(" ");
const by_en = "bya  byu  byo".split(" ");
const p_en = "pa pi pu pe po".split(" ");
const py_en = "pya  pyu  pyo".split(" ");
const m_en = "ma mi mu me mo".split(" ");
const my_en = "mya  myu  myo".split(" ");
const y_en = "ya  yu  yo".split(" ");
const r_en = "ra ri ru re ro".split(" ");
const ry_en = "rya  ryu  ryo".split(" ");
const w_en = "wa  N  wo".split(" ");

const dic = { a, k, ky, g, gy, s, sy, z, jy, t, tx, ty, d, n, ny, h, hy, f, b, by, p, py, m, my, y, r, ry, w };
const dic_en = {
  a: a_en,
  k: k_en,
  ky: ky_en,
  g: g_en,
  gy: gy_en,
  s: s_en,
  sy: sy_en,
  z: z_en,
  jy: jy_en,
  t: t_en,
  tx: tx_en,
  ty: ty_en,
  d: d_en,
  n: n_en,
  ny: ny_en,
  h: h_en,
  hy: hy_en,
  f: f_en,
  b: b_en,
  by: by_en,
  p: p_en,
  py: py_en,
  m: m_en,
  my: my_en,
  y: y_en,
  r: r_en,
  ry: ry_en,
  w: w_en,
};

let buttons;
window.addEventListener("load", () => {
  // get current vowels elements and set eventlistener
  const currentVowels = document.querySelectorAll('input[type=radio][name="currentVowel"]');
  Array.prototype.forEach.call(currentVowels, function(radio) {
    radio.addEventListener('change', (event) => {
      // console.log("event.target.value: ", event.target.value);
      changeKeyTop(event.target.value);
    });
  });

  // get akstn buttons and set event
  buttons = document.querySelectorAll(".flex.consonants button");
  buttons.forEach((e) => {
    handleClickEvent(e);
  });

  // set key top to default
  changeKeyTop('a');
});

function playSound(fileName, playbackRate = 0) {
  console.log(fileName);
  const audio = new Audio(`sounds/${fileName}_1.wav`);
  if(playbackRate){
    audio.playbackRate = playbackRate;
  }
  // audio.play();
  audio.cloneNode().play();  
}

function changeKeyTop(detectedVowel) {
  const idx = "a i u e o".split(" ").indexOf(detectedVowel);
  // console.log("idx: ", idx);

  if (buttons == undefined){
    buttons = document.querySelectorAll(".flex.consonants button");
  }

  buttons.forEach((e) => {
    const d = dic[e.value];
    const d_en = dic_en[e.value];
    if (d && d_en) {
      if(d[idx] == ''){
        e.classList.add("empty");
        e.innerText = '';
        e.setAttribute("char", '');
        e.setAttribute("disabled", 'true');
      }else{
        e.classList.remove("empty");
        e.innerText = d[idx];
        e.setAttribute("char", d_en[idx]);
        e.removeAttribute("disabled");
      }
    }
  });
}

function handleClickEvent(target) {
  let pressTimer, flag = true, pressTime = 500;

  // not working with addEventlistener
  // not working with $(target).touchend()
  $(target).on('touchstart', () => {
    console.log("touchstart");
    clearTimeout(pressTimer);
    flag=true;
    pressTimer = window.setTimeout(function() {
      console.log("long click");
      playSound(target.getAttribute('char'), 0.3);
      flag=false;
    }, pressTime);
    return false; 
  }).on('touchend', () => {
    console.log("touchend");
    console.log("short click");
    clearTimeout(pressTimer);
    if(flag) playSound(target.getAttribute('char'));
    return false;
  })

  $(target).on('mousedown', () => {
    console.log("touchstart");
    clearTimeout(pressTimer);
    flag=true;
    pressTimer = window.setTimeout(function() {
      console.log("long click");
      playSound(target.getAttribute('char'), 0.3);
      flag=false;
    }, pressTime);
    return false; 
  }).on('mouseup', () => {
    console.log("touchend");
    console.log("short click");
    clearTimeout(pressTimer);
    if(flag) playSound(target.getAttribute('char'));
    return false;
  })
}


function isiOS(){
  console.log("navigator.userAgent: ", navigator.userAgent);
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  ///Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}