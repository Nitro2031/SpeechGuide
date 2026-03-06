
// 入力要素を取得
const speedInput = document.getElementById('speed');
const timeInput = document.getElementById('time');
const textInput = document.getElementById("text");
const lengthEl = document.getElementById("length");

let lastEdited = "text";
let timer = null;
let currentSec = 0;

/**
 * ハイライト処理。現在の秒数に応じて、該当する文字をハイライトする。
 * @param {number} sec - 現在の秒数
 */
function highlightCurrentChar(sec) {
    const chars = document.querySelectorAll(".char");

    chars.forEach(span => {
        const start = Number(span.dataset.start);
        const end = start + (60 / Number(speedInput.value));

        if (sec >= start && sec < end) {
            span.style.backgroundColor = "#ffe9a8";
        } else {
            span.style.backgroundColor = "";
        }
    });
}

/**
 * 文字数と速度から時間を計算する。
 * @param {number} charCount - 文字数
 * @param {number} speed - 速度（文字/分）
 * @returns {number} 時間（分）
 */
function calcTimeFromSpeed(charCount, speed) {
    return charCount / speed; // 分
}

/**
 * 文字数と時間を使用して速度を計算する。
 * @param {number} charCount - 文字数
 * @param {number} timeMinutes - 時間（分）
 * @returns {number} 速度（文字/分）
 */
function calcSpeedFromTime(charCount, timeMinutes) {
    return charCount / timeMinutes; // 文字/分
}

/**
 * 秒数を「分:秒」形式の文字列に変換する。
 * @param {number} seconds - 秒数
 * @returns {string} 「分:秒」形式の文字列
 */
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * 文字数を取得する。
 * @returns {number} 文字数
 */
function getCharCount() {
    const text = document.getElementById("text").value;
    return text.replace(/\s/g, "").length;
}

/**
 * 更新処理。どちらかの入力が変更されたときに呼び出される。
 * 文字数を取得し、変更された方に応じてもう一方を計算して更新する。
 * - speedが変更された場合、timeを計算して更新
 * - timeが変更された場合、speedを計算して更新
 * どちらも変更された場合は、最後に変更された方を優先する。
 */
function update() {
    const charCount = getCharCount();
    lengthEl.textContent = `（${charCount} 文字）`;

    if (lastEdited === "text" || lastEdited === "speed") {
        const speed = Number(speedInput.value);
        timeInput.value = calcTimeFromSpeed(charCount, speed).toFixed(2);
    }

    if (lastEdited === 'time') {
        const time = Number(timeInput.value);
        speedInput.value = calcSpeedFromTime(charCount, time).toFixed(0);
    }

    const text = document.getElementById('text').value.trim();
    const speed = Number(document.getElementById('speed').value);

    const blocks = text.split(/\n+/).filter(b => b.trim().length > 0);
    const resultEl = document.getElementById('result');
    resultEl.innerHTML = '';

    let currentTime = 0;
    let totalSeconds = 0;

    const blockInfos = blocks.map(block => {
        const len = block.replace(/\s/g, '').length;
        const seconds = (len / speed) * 60;
        totalSeconds += seconds;
        return { block, len, seconds };
    });

    blockInfos.forEach((info, index) => {
        const start = currentTime;
        const end = currentTime + info.seconds;
        currentTime = end + 180 / speed; // ブロック間の空白時間（3字相当）

        const div = document.createElement('div');
        div.className = 'block';

        // 文字ごとに span を生成
        const chars = info.block.split('');
        let charHtml = '';
        let charStart = start;
        const secPerChar = 60 / speed;

        chars.forEach((ch, i) => {
            const span = `<span class="char" data-start="${charStart}">${ch}</span>`;
            charHtml += span;
            charStart += secPerChar;
        });

        div.innerHTML = `
        <div class="time">#${index + 1} ${formatTime(start)} 〜 ${formatTime(end)} （約 ${info.seconds.toFixed(1)} 秒）</div>
        <div class="text">${charHtml}</div>
    `;

        resultEl.appendChild(div);
    });
}

// 文章入力イベントリスナーを追加
textInput.addEventListener("input", () => {
    lastEdited = "text";   // どの入力がトリガーかを記録
    localStorage.setItem("SpeechGuideText", textInput.value);
    update();
});

// 速度入力イベントリスナーを追加
speedInput.addEventListener('input', () => {
    lastEdited = 'speed';
    update();
});

// 時間入力イベントリスナーを追加
timeInput.addEventListener('input', () => {
    lastEdited = 'time';
    update();
});

document.getElementById("play").addEventListener("click", () => {
    currentSec = 0;

    if (timer) clearInterval(timer);

    timer = setInterval(() => {
        highlightCurrentChar(currentSec);
        currentSec += 0.05; // 精度を上げる
    }, 50);
});

window.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("SpeechGuideText");
    if (saved !== null) {
        textInput.value = saved;
    }
    update(); // 復元後に計算も反映
});
