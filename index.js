function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

document.getElementById('calc').addEventListener('click', () => {
    const text = document.getElementById('text').value.trim();
    const speed = Number(document.getElementById('speed').value); // chars per minute
    const totalMinutes = Number(document.getElementById('totalMinutes').value);

    const blocks = text.split(/\n+/).filter(b => b.trim().length > 0); // 段落ごと
    const resultEl = document.getElementById('result');
    const summaryEl = document.getElementById('summary');
    resultEl.innerHTML = '';

    let currentTime = 0;
    let totalSeconds = 0;

    const blockInfos = blocks.map(block => {
        const len = block.replace(/\s/g, '').length; // 空白除去した文字数
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
});
