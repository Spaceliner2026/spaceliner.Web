// Main JavaScript for Spaceliner Site

document.addEventListener('DOMContentLoaded', () => {
  initNews();
  initMusic();
  initModal();
  initBgm(); // BGM処理を一括呼び出し
});

// ==========================================
// Render News
// ==========================================
function initNews() {
  const topNewsContainer = document.getElementById('js-top-news');
  const fullNewsContainer = document.getElementById('js-news-full-list');

  if (typeof NEWS_DATA === 'undefined') return;

  // Render Top Page News (Latest 5)
  if (topNewsContainer) {
    const latestNews = NEWS_DATA.slice(0, 5);
    topNewsContainer.innerHTML = latestNews.map((item, index) => `
      <div class="news-item" onclick="openNewsModal(${index})">
        <span class="news-item__date">${item.date}</span>
        <span class="news-item__title">${item.title}</span>
      </div>
    `).join('');
  }

  // Render Full News Page
  if (fullNewsContainer) {
    fullNewsContainer.innerHTML = NEWS_DATA.map((item, index) => `
      <div class="news-item" onclick="openNewsModal(${index})">
        <span class="news-item__date">${item.date}</span>
        <span class="news-item__title">${item.title}</span>
      </div>
    `).join('');
  }
}

// ==========================================
// Render Music List & Search
// ==========================================
function initMusic() {
  const topMusicContainer = document.getElementById('js-top-music');
  const musicTableBody = document.getElementById('js-music-table-body');
  const musicSearchInput = document.getElementById('js-music-search');
  const musicGridContainer = document.getElementById('js-music-grid');
  const clearBtn = document.getElementById('js-music-search-clear');

  // --- 1. トップページ用プレビュー描画 ---
  if (topMusicContainer && typeof MUSIC_DATA !== 'undefined') {
    const featured = MUSIC_DATA.slice(0, 6);
    topMusicContainer.innerHTML = featured.map(item => `
      <div class="p-top-topics__card">
        <div class="tag">MUSIC</div>
        <div class="title">${item.title}</div>
        <p>Artist: ${item.artist}</p>
        <div style="margin-top: 8px; font-size: 0.75rem; color: var(--color-primary);">
          ST:${item.ST} / FD:${item.FD} / OD:${item.OD} ${item.UL ? '/ UL:' + item.UL : ''}
        </div>
      </div>
    `).join('');
  }

  // --- 2. テーブル形式（旧Music一覧）描画 ---
  if (musicTableBody && typeof MUSIC_DATA !== 'undefined') {
    const renderTable = (data) => {
      musicTableBody.innerHTML = data.map(item => `
        <tr>
          <td>
            <strong>${item.title}</strong>
            <span class="artist">${item.artist}</span>
          </td>
          <td class="col-diff" style="color: var(--diff-st);">${item.ST || '-'}</td>
          <td class="col-diff" style="color: var(--diff-fd);">${item.FD || '-'}</td>
          <td class="col-diff" style="color: var(--diff-od);">${item.OD || '-'}</td>
          <td class="col-diff" style="color: var(--diff-ul);">${item.UL || '-'}</td>
        </tr>
      `).join('');
    };

    renderTable(MUSIC_DATA);

    if (musicSearchInput) {
      musicSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = MUSIC_DATA.filter(item => 
          item.title.toLowerCase().includes(query) || 
          item.artist.toLowerCase().includes(query)
        );
        renderTable(filtered);
      });
    }
  }

  // --- 3. カード型 音楽一覧描画 (musicData 変数使用) ---
  if (musicGridContainer && typeof musicData !== 'undefined') {
    const renderMusicCards = (data) => {
      musicGridContainer.innerHTML = data.map(song => `
        <div class="c-music-card">
          <div class="c-music-card__jackWrap">
            <img src="${song.jacket}" alt="${song.title}" class="c-music-card__jack" loading="lazy">
            ${song.previewUrl ? `
              <a href="${song.previewUrl}" target="_blank" rel="noopener" class="c-music-card__listenBtn" title="試聴する">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </a>
            ` : ''}
          </div>
          
          <div class="c-music-card__body">
            <h3 class="c-music-card__title">${song.title}</h3>
            <p class="c-music-card__artist">${song.artist}</p>
            
            <div class="c-music-card__levels">
              <span class="level-badge st">ST <strong>${song.levels.st || '-'}</strong></span>
              <span class="level-badge fd">FD <strong>${song.levels.fd || '-'}</strong></span>
              <span class="level-badge od">OD <strong>${song.levels.od || '-'}</strong></span>
              ${song.levels.ul ? `<span class="level-badge ul">UL <strong>${song.levels.ul}</strong></span>` : ''}
            </div>

            <details class="c-music-card__charters">
              <summary>NOTES DESIGNER</summary>
              <ul>
                <li><span>ST/FD:</span> ${song.charters.st || '-'}</li>
                <li><span>OD:</span> ${song.charters.od || '-'}</li>
                ${song.charters.ul ? `<li><span>UL:</span> ${song.charters.ul}</li>` : ''}
              </ul>
            </details>
          </div>
        </div>
      `).join('');
    };

    renderMusicCards(musicData);

    if (musicSearchInput) {
      musicSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = musicData.filter(song => {
          const matchTitle = song.title.toLowerCase().includes(query);
          const matchArtist = song.artist.toLowerCase().includes(query);
          const matchCharter = Object.values(song.charters).some(c => c && c.toLowerCase().includes(query));
          return matchTitle || matchArtist || matchCharter;
        });
        renderMusicCards(filtered);
      });
    }
  }

  // --- 検索クリアボタンの制御 ---
  if (musicSearchInput && clearBtn) {
    musicSearchInput.addEventListener('input', () => {
      clearBtn.style.display = musicSearchInput.value ? 'block' : 'none';
    });

    clearBtn.addEventListener('click', () => {
      musicSearchInput.value = '';
      clearBtn.style.display = 'none';
      musicSearchInput.focus();
      musicSearchInput.dispatchEvent(new Event('input'));
    });
  }
}

// ==========================================
// Modal handling
// ==========================================
function initModal() {
  const modal = document.getElementById('js-news-modal');
  const closeBtn = document.getElementById('js-modal-close');
  const bg = document.getElementById('js-modal-bg');

  if (!modal) return;

  const closeModal = () => modal.classList.remove('is-open');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (bg) bg.addEventListener('click', closeModal);
}

function openNewsModal(index) {
  const modal = document.getElementById('js-news-modal');
  if (!modal || typeof NEWS_DATA === 'undefined') return;

  const item = NEWS_DATA[index];
  if (!item) return;

  document.getElementById('js-modal-date').innerText = item.date;
  document.getElementById('js-modal-title').innerText = item.title;
  document.getElementById('js-modal-body').innerText = item.body;

  const linkContainer = document.getElementById('js-modal-link');
  if (item.linkUrl) {
    linkContainer.innerHTML = `<a href="${item.linkUrl}" target="_blank" class="c-btn c-btn--primary"><span>関連リンクを開く</span></a>`;
  } else {
    linkContainer.innerHTML = '';
  }

  modal.classList.add('is-open');
}

// ==========================================
// BGM Controller
// ==========================================
function initBgm() {
  const bgmModal = document.getElementById('js-bgm-modal');
  const btnYes = document.getElementById('js-bgm-yes');
  const btnNo = document.getElementById('js-bgm-no');
  const bgmTrigger = document.getElementById('js-bgm-trigger');
  const bgmAudio = document.getElementById('js-bgm-audio');

  if (!bgmAudio || !bgmTrigger) return;

  bgmAudio.volume = 0.1; // デフォルト音量 (30%)

  // UI表示更新関数
  function updateBgmUI(isPlaying) {
    const textEl = bgmTrigger.querySelector('.c-bgm-btn__text');
    if (isPlaying) {
      bgmTrigger.classList.add('is-playing');
      if (textEl) textEl.textContent = 'BGM ON';
    } else {
      bgmTrigger.classList.remove('is-playing');
      if (textEl) textEl.textContent = 'BGM OFF';
    }
  }

  // BGM再生の実行（再生位置の復元 & エラー制御）
  function playBgm() {
    const savedTime = sessionStorage.getItem('spaceliner_bgm_time');

    const startPlay = () => {
      if (savedTime && !isNaN(savedTime) && bgmAudio.duration) {
        bgmAudio.currentTime = parseFloat(savedTime);
      }

      const promise = bgmAudio.play();
      if (promise !== undefined) {
        promise.then(() => {
          updateBgmUI(true);
          localStorage.setItem('spaceliner_bgm_pref', 'enabled');
        }).catch(err => {
          console.warn('自動再生が制限されました。ボタンを押して再生してください:', err);
          updateBgmUI(false);
        });
      }
    };

    // メタデータロードを安全に待ち受けてから時間をセットして再生
    if (bgmAudio.readyState >= 1) {
      startPlay();
    } else {
      bgmAudio.addEventListener('loadedmetadata', startPlay, { once: true });
    }
  }

  // BGM停止
  function pauseBgm() {
    bgmAudio.pause();
    updateBgmUI(false);
    localStorage.setItem('spaceliner_bgm_pref', 'disabled');
  }

  // ページ移動直前に再生秒数を保存
  window.addEventListener('beforeunload', () => {
    if (!bgmAudio.paused) {
      sessionStorage.setItem('spaceliner_bgm_time', bgmAudio.currentTime.toString());
    }
  });

  // 初回訪問 / 設定の判定
  const bgmPref = localStorage.getItem('spaceliner_bgm_pref');

  if (bgmPref === null) {
    if (bgmModal) bgmModal.style.display = 'flex';
  } else if (bgmPref === 'enabled') {
    playBgm();
  } else {
    updateBgmUI(false);
  }

  // モーダルボタンの制御
  if (btnYes) {
    btnYes.addEventListener('click', () => {
      if (bgmModal) bgmModal.style.display = 'none';
      playBgm();
    });
  }

  if (btnNo) {
    btnNo.addEventListener('click', () => {
      if (bgmModal) bgmModal.style.display = 'none';
      pauseBgm();
    });
  }

  // トグルボタンクリック時の制御
  bgmTrigger.addEventListener('click', () => {
    if (bgmAudio.paused) {
      playBgm();
    } else {
      pauseBgm();
    }
  });
}


// TOP ヒーロースライドショー制御 (横スライド)
function initHeroSlider() {
  const track = document.getElementById('js-slider-track');
  const slides = track ? track.querySelectorAll('.p-hero-slider__item') : [];
  const btnPrev = document.getElementById('js-slider-prev');
  const btnNext = document.getElementById('js-slider-next');
  const dotsContainer = document.getElementById('js-slider-dots');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  let autoSlideTimer = null;
  const INTERVAL = 5000; // 自動切替間隔（5秒）

  // --- 1. ドットの動的生成 ---
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.classList.add('p-hero-slider__dot');
      if (index === 0) dot.classList.add('is-active');
      dot.setAttribute('aria-label', `スライド ${index + 1} へ`);
      dot.addEventListener('click', () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });
  }

  const dots = dotsContainer ? dotsContainer.querySelectorAll('.p-hero-slider__dot') : [];

  // --- 2. 指定インデックスへのスライド処理 ---
  function goToSlide(index) {
    // 範囲外のインデックスのループ処理
    if (index < 0) {
      currentIndex = slides.length - 1;
    } else if (index >= slides.length) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    // トラックを横方向に移動
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // ドットのactive状態を更新
    dots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === currentIndex);
    });

    // 手動操作されたら自動再生タイマーを再設定
    resetAutoSlide();
  }

  // --- 3. 自動再生タイマー ---
  function startAutoSlide() {
    autoSlideTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, INTERVAL);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    startAutoSlide();
  }

  // --- 4. イベントリスナーの設定 ---
  if (btnPrev) {
    btnPrev.addEventListener('click', () => goToSlide(currentIndex - 1));
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => goToSlide(currentIndex + 1));
  }

  // 開始
  startAutoSlide();
}

// DOMContentLoaded 内で実行
document.addEventListener('DOMContentLoaded', () => {
  // 既存の処理...
  initHeroSlider();
});