/**
 * Spaceliner - Dynamic Space Warp Background Engine
 * Scroll-responsive speed boost & inertia.
 */
(function () {
  'use strict';

  const canvas = document.getElementById('js-space-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // --- 設定パラメータ ---
  const PARTICLE_COUNT = 300;     // 粒子の数
  const BASE_SPEED = 5.0;         // 通常時の基本速度
  const MAX_BOOST = 12.0;         // スクリュー加速時の最大追加速度
  const FRICTION = 0.92;          // 減速の滑らかさ (1に近いほど滑らかに慣性が残る)

  let width = 0;
  let height = 0;
  let centerX = 0;
  let centerY = 0;

  // スクロール検知用の変数
  let lastScrollY = window.scrollY;
  let scrollVelocity = 0; // 現在のスクロール由来の追加速度
  let currentSpeed = BASE_SPEED;

  // 粒子データ構造
  const particles = [];

  function initCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    centerX = width / 2;
    centerY = height / 2;
  }

  function createParticle() {
    return {
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 2,
      z: Math.random() * width,
      prevZ: 0,
      size: Math.random() * 1.5 + 0.5,
      // サイバー感のあるネオンブルー〜シアン系のカラー
      color: Math.random() > 0.3 ? '#00f3ff' : '#0066ff'
    };
  }

  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = createParticle();
      p.prevZ = p.z;
      particles.push(p);
    }
  }

  // --- スクロールイベントの監視 ---
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    // 下スクロールで加速、上スクロールで減速（または逆噴射）
    // Math.abs(delta) にすると上下どちらのスクロールでも加速感を出せます
    scrollVelocity += delta * 0.15;

    // 加速の上限値を制御
    if (scrollVelocity > MAX_BOOST) scrollVelocity = MAX_BOOST;
    if (scrollVelocity < -MAX_BOOST) scrollVelocity = -MAX_BOOST;
  }, { passive: true });

  // 画面リサイズ対応
  window.addEventListener('resize', () => {
    initCanvas();
  });

  // --- 描画ループ ---
  function render() {
    // 慣性処理：スクロールが止まったら徐々に元の速度に戻る
    scrollVelocity *= FRICTION;
    currentSpeed = BASE_SPEED + scrollVelocity;

    // 残像効果を伴う背景クリア
    ctx.fillStyle = 'rgba(5, 7, 15, 0.35)';
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];

      p.prevZ = p.z;
      p.z -= currentSpeed;

      // 画面手前に突き抜けた、または奥に引っ込みすぎた場合のループ処理
      if (p.z <= 0 || p.z > width) {
        p.z = width;
        p.x = (Math.random() - 0.5) * width * 2;
        p.y = (Math.random() - 0.5) * height * 2;
        p.prevZ = p.z;
      }

      // 3D透視投影の計算
      const k = 256 / p.z;
      const px = p.x * k + centerX;
      const py = p.y * k + centerY;

      const prevK = 256 / p.prevZ;
      const prevPx = p.x * prevK + centerX;
      const prevPy = p.y * prevK + centerY;

      // 画面外判定
      if (px < 0 || px > width || py < 0 || py > height) {
        continue;
      }

      // スクロール加速具合に応じてライン（光の尾）を長く伸ばす
      ctx.beginPath();
      ctx.moveTo(prevPx, prevPy);
      ctx.lineTo(px, py);

      // 速度が速いほど光を強く・太く演出
      const speedAlpha = Math.min(1, Math.abs(currentSpeed) / BASE_SPEED * 0.4);
      ctx.strokeStyle = p.color;
      ctx.globalAlpha = speedAlpha;
      ctx.lineWidth = p.size * (1 + Math.abs(scrollVelocity) * 0.1);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    requestAnimationFrame(render);
  }

  // 初期化と開始
  initCanvas();
  initParticles();
  render();
})();