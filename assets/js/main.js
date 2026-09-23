/* まめ訪問看護ステーション LP - main.js（ライブラリ不要） */
(function () {
  'use strict';

  var header = document.getElementById('header');
  var menuBtn = document.getElementById('menuBtn');
  var gnav = document.getElementById('gnav');
  var pagetop = document.getElementById('pagetop');
  var yearEl = document.getElementById('year');

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ヘッダー: スクロールで影＋ページトップ表示 */
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (pagetop) pagetop.classList.toggle('is-show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* モバイルメニュー */
  function closeMenu() {
    document.body.classList.remove('is-menu-open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      document.body.classList.add('menu-ready');
      var open = document.body.classList.toggle('is-menu-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    });
  }
  if (gnav) {
    gnav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }
  window.addEventListener('resize', function () {
    if (window.innerWidth > 960) closeMenu();
  });

  /* スクロールリビール */
  var reveals = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ナビの現在地ハイライト */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = gnav ? Array.prototype.slice.call(gnav.querySelectorAll('a[href^="#"]')) : [];
  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    var current = '';
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) current = e.target.id;
      });
      navLinks.forEach(function (a) {
        a.classList.toggle('is-current', a.getAttribute('href') === '#' + current);
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { so.observe(s); });
  }

  /* メールフォーム: mailto で送信（サーバー不要） */
  var mailForm = document.getElementById('mailForm');
  if (mailForm) {
    var errBox = document.getElementById('mailFormError');
    mailForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var ok = true;
      mailForm.querySelectorAll('[required]').forEach(function (f) {
        var bad = !f.value.trim() || (f.type === 'email' && f.validity && !f.validity.valid);
        f.classList.toggle('is-invalid', bad);
        if (bad) ok = false;
      });
      if (errBox) errBox.hidden = ok;
      if (!ok) { var first = mailForm.querySelector('.is-invalid'); if (first) first.focus(); return; }
      var v = function (n) { var el = mailForm.elements[n]; return el ? el.value.trim() : ''; };
      var subject = '【HPからのお問い合わせ】' + (v('subject') ? v('subject') + '／' : '') + v('name') + ' 様';
      var body = 'お名前: ' + v('name') + '\n' +
        'お電話番号: ' + (v('tel') || '未記入') + '\n' +
        'メールアドレス: ' + v('email') + '\n\n' +
        '■お問い合わせ内容\n' + v('body') + '\n';
      window.location.href = 'mailto:omamecp@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
    mailForm.querySelectorAll('[required]').forEach(function (f) {
      f.addEventListener('input', function () { f.classList.remove('is-invalid'); });
    });
  }

  /* Xフィード: 画像付き投稿の末尾に自動で付く t.co リンク（画像へのリンク）を消す。
     本文中にご自身で貼ったリンクは、後ろに文字が続くので残る。 */
  function stripMediaLinks(root) {
    var items = root.querySelectorAll('.eapps-twitter-feed-posts-item');
    Array.prototype.forEach.call(items, function (item) {
      if (item.getAttribute('data-mame-stripped') === '1') return;
      if (!item.querySelector('[class*="posts-item-media"]')) return;
      var text = item.querySelector('[class*="posts-item-text"]');
      if (!text) return;
      var links = text.querySelectorAll('a[href^="https://t.co/"]');
      if (!links.length) return;
      var last = links[links.length - 1];
      var after = '', n = last.nextSibling;
      while (n) { after += (n.textContent || ''); n = n.nextSibling; }
      if (after.trim() !== '') return;
      while (last.nextSibling) last.parentNode.removeChild(last.nextSibling);
      last.parentNode.removeChild(last);
      var tail = text.lastChild;
      if (tail && tail.nodeType === 3) tail.textContent = tail.textContent.replace(/\s+$/, '');
      item.setAttribute('data-mame-stripped', '1');
    });
  }
  var xRoot = document.querySelector('.topics-x');
  if (xRoot && 'MutationObserver' in window) {
    stripMediaLinks(xRoot);
    new MutationObserver(function () { stripMediaLinks(xRoot); })
      .observe(xRoot, { childList: true, subtree: true });
  }

  /* FAQ: 1つ開いたら他を閉じる（任意） */
  var faqs = document.querySelectorAll('.faq__item');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) {
        faqs.forEach(function (o) { if (o !== d && o.open) o.open = false; });
      }
    });
  });
})();
