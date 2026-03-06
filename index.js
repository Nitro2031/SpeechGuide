let lastEdited = null;

// 入力要素を取得
const speedInput = document.getElementById('speed');
const timeInput = document.getElementById('time');
const textInput = document.getElementById("text");

// 文章入力イベントリスナーを追加
textInput.addEventListener("input", () => {
    lastEdited = "text";   // どの入力がトリガーかを記録
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

/**
 * 更新処理。どちらかの入力が変更されたときに呼び出される。
 * 文字数を取得し、変更された方に応じてもう一方を計算して更新する。
 * - speedが変更された場合、timeを計算して更新
 * - timeが変更された場合、speedを計算して更新
 * どちらも変更された場合は、最後に変更された方を優先する。
 */
function update() {
    const charCount = getCharCount();

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
    const totalMinutes = Number(document.getElementById('time').value);

    const blocks = text.split(/\n+/).filter(b => b.trim().length > 0);
    const resultEl = document.getElementById('result');
    const summaryEl = document.getElementById('summary');
    resultEl.innerHTML = '';

    let currentTime = 0;
    let totalSeconds = 0;

    const blockInfos = blocks.map(block => {
        const len = block.replace(/\s/g, '').length;
        const seconds = (len / speed) * 60;
        totalSeconds += seconds;
        return { block, len, seconds };
    });

    const totalMinutesNeeded = totalSeconds / 60;
    const diff = totalMinutesNeeded - totalMinutes;

    summaryEl.innerHTML = `
    想定合計時間: ${totalMinutesNeeded.toFixed(1)} 分<br>
    持ち時間との差: ${diff >= 0 ? '+' : ''}${diff.toFixed(1)} 分
`;

    blockInfos.forEach((info, index) => {
        const start = currentTime;
        const end = currentTime + info.seconds;
        currentTime = end;

        const div = document.createElement('div');
        div.className = 'block';
        div.innerHTML = `
      <div class="time">#${index + 1} ${formatTime(start)} 〜 ${formatTime(end)} （約 ${info.seconds.toFixed(1)} 秒）</div>
      <div>${info.block.substring(0, 80)}${info.block.length > 80 ? '…' : ''}</div>
    `;
        resultEl.appendChild(div);
    });

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
