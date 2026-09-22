/* ============================================================
   Template by Deniz Ergin
   https://denizergin.com  ·  https://github.com/adergin/website-template
   MIT licensed. Please keep this notice and the LICENSE file.
   ============================================================ */
/* ============================================================
   Your Name — site.js

   1. Missing images become a grey block with the filename printed in it.
   2. Clickable photos get a label built from their alt text.
   3. The carousels work with arrows, keyboard and swipe.
   4. The lightbox: clicking a photo in a strip opens it large.
   5. The map: drag to pan, buttons to zoom, pins that link into the page.
   6. The contact page: click to copy, and chips that write the subject line.
   7. The menu button, which only exists on a narrow screen.
   8. The year in the footer keeps itself current.

   Nothing here animates anything on scroll.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- 1. missing images ----------
     Runs in the capture phase because image error events do not bubble.
     Drop the real file into images/ and this stops firing on its own. */

  document.addEventListener('error', function (event) {
    var img = event.target;
    if (!img || img.tagName !== 'IMG' || img.dataset.replaced) return;
    img.dataset.replaced = '1';

    var src = img.getAttribute('src') || '';
    var block = document.createElement('div');
    block.className = 'placeholder';
    // A local file that is not there yet shows its filename, so you can see
    // what to drop in. A remote one that fails is almost always a bad ISBN.
    block.textContent = /^https?:/.test(src)
      ? 'No cover found — check the ISBN'
      : (src || 'image missing');
    img.replaceWith(block);
  }, true);

  /* ---------- 2. labels on clickable photos ----------
     Write a real alt on the image and it doubles as the label that rises out
     of the bottom on hover. Leave alt empty and no label is added. */

  document.querySelectorAll('.media a > img[alt]').forEach(function (img) {
    var text = img.getAttribute('alt').trim();
    if (!text) return;
    var label = document.createElement('span');
    label.className = 'media-label';
    label.textContent = text;
    img.parentNode.appendChild(label);
  });

  /* ---------- 3. carousels ---------- */

  function setUpCarousel(carousel) {
    var track = carousel.querySelector('.carousel-track');
    var controls = carousel.querySelector('.carousel-controls');
    var count = carousel.querySelector('.carousel-count');
    var buttons = Array.prototype.slice.call(carousel.querySelectorAll('.carousel-btn'));
    if (!track || !controls) return;

    var slides = Array.prototype.slice.call(track.children);
    if (!slides.length) { controls.hidden = true; return; }

    // How wide one slide is, how many fit at once, and how many pages that makes.
    function metrics() {
      var step = slides.length > 1
        ? slides[1].offsetLeft - slides[0].offsetLeft
        : slides[0].offsetWidth;
      if (!step) step = track.clientWidth || 1;
      var per = Math.max(1, Math.round(track.clientWidth / step));
      return { step: step, per: per, pages: Math.max(1, Math.ceil(slides.length / per)) };
    }

    function atEnd() {
      return track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    }

    function currentPage(m) {
      if (atEnd()) return m.pages - 1;
      var slide = Math.round(track.scrollLeft / m.step);
      return Math.max(0, Math.min(m.pages - 1, Math.floor(slide / m.per)));
    }

    function refresh() {
      var m = metrics();
      var page = currentPage(m);
      controls.hidden = m.pages < 2;
      if (count) count.textContent = (page + 1) + ' / ' + m.pages;
      buttons.forEach(function (button) {
        var dir = Number(button.dataset.dir);
        button.disabled = (dir < 0 && page <= 0) || (dir > 0 && page >= m.pages - 1);
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var m = metrics();
        var page = Math.max(0, Math.min(m.pages - 1, currentPage(m) + Number(button.dataset.dir)));
        var slide = Math.min(page * m.per, slides.length - 1);
        track.scrollTo({ left: slides[slide].offsetLeft - slides[0].offsetLeft });
      });
    });

    var pending;
    track.addEventListener('scroll', function () {
      window.clearTimeout(pending);
      pending = window.setTimeout(refresh, 80);
    });

    window.addEventListener('resize', refresh);
    window.addEventListener('load', refresh);
    refresh();
  }

  document.querySelectorAll('.carousel').forEach(setUpCarousel);

  /* ---------- 4. the lightbox ----------
     Clicking a photo in a strip opens it large. The arrows walk that strip and
     nothing else, so each group of photos stays its own set. Nothing is built
     until the first click, and the images are collected at click time so a
     photo added later, or one that arrived as a grey block, is handled. */

  (function lightbox() {
    if (!document.querySelector('.strip')) return;

    var box, stage, prev, next, count, close;
    var photos = [], at = 0, opener = null;

    function chevron(d) {
      return '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>';
    }

    function build() {
      box = document.createElement('div');
      box.className = 'lightbox';
      box.hidden = true;
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');
      box.setAttribute('aria-label', 'Photo');
      box.innerHTML =
        '<button type="button" class="lightbox-btn lightbox-close" aria-label="Close">' +
          chevron('M3 3l10 10M13 3L3 13') + '</button>' +
        '<div class="lightbox-stage"><img alt=""></div>' +
        '<div class="lightbox-bar">' +
          '<button type="button" class="lightbox-btn" data-dir="-1" aria-label="Previous photo">' + chevron('M10 2 4 8l6 6') + '</button>' +
          '<span class="lightbox-count" aria-live="polite"></span>' +
          '<button type="button" class="lightbox-btn" data-dir="1" aria-label="Next photo">' + chevron('M6 2l6 6-6 6') + '</button>' +
        '</div>';
      document.body.appendChild(box);

      stage = box.querySelector('.lightbox-stage img');
      count = box.querySelector('.lightbox-count');
      close = box.querySelector('.lightbox-close');
      prev = box.querySelector('[data-dir="-1"]');
      next = box.querySelector('[data-dir="1"]');

      prev.addEventListener('click', function () { go(at - 1); });
      next.addEventListener('click', function () { go(at + 1); });
      close.addEventListener('click', shut);
      box.addEventListener('click', function (event) {
        if (event.target === box || event.target.parentNode === stage.parentNode) shut();
      });
    }

    function show() {
      var photo = photos[at];
      stage.src = photo.currentSrc || photo.src;
      stage.alt = photo.alt || '';
      count.textContent = (at + 1) + ' / ' + photos.length;
      prev.disabled = at === 0;
      next.disabled = at === photos.length - 1;
      box.querySelector('.lightbox-bar').hidden = photos.length < 2;
    }

    function go(i) {
      if (i < 0 || i >= photos.length) return;
      at = i;
      show();
    }

    function open(strip, photo) {
      if (!box) build();
      photos = Array.prototype.slice.call(strip.querySelectorAll('img'));
      at = photos.indexOf(photo);
      if (at < 0) return;
      opener = photo;
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      show();
      close.focus();
    }

    function shut() {
      box.hidden = true;
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    }

    document.addEventListener('click', function (event) {
      var photo = event.target.closest('.strip img');
      if (!photo) return;
      open(photo.closest('.strip'), photo);
    });

    // Photos in a strip are not links, so make them reachable by keyboard.
    document.querySelectorAll('.strip img').forEach(function (photo) {
      photo.tabIndex = 0;
      photo.setAttribute('role', 'button');
      photo.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open(photo.closest('.strip'), photo);
        }
      });
    });

    document.addEventListener('keydown', function (event) {
      if (!box || box.hidden) return;
      if (event.key === 'Escape') { shut(); }
      else if (event.key === 'ArrowLeft') { go(at - 1); }
      else if (event.key === 'ArrowRight') { go(at + 1); }
      else if (event.key === 'Tab') { event.preventDefault(); } // keep focus inside
    });
  })();

  /* ---------- 5. the map ----------
     Drag to pan, buttons to zoom. The pins counter-scale so they stay the same
     size on screen however far in you go, and a drag never counts as a click,
     so moving the map does not follow a pin's link. */

  (function map() {
    var root = document.querySelector('[data-map]');
    if (!root) return;

    var viewport = root.querySelector('.map-viewport');
    var canvas = root.querySelector('.map-canvas');
    if (!viewport || !canvas) return;

    var MIN = 1, MAX = 16;
    var scale = 1, x = 0, y = 0;

    function clamp() {
      // never let the map pull away from the edges of its frame
      var w = viewport.clientWidth, h = viewport.clientHeight;
      var limitX = w * (scale - 1), limitY = h * (scale - 1);
      x = Math.min(0, Math.max(-limitX, x));
      y = Math.min(0, Math.max(-limitY, y));
    }

    function draw() {
      clamp();
      canvas.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + scale + ')';
      canvas.style.setProperty('--inv', 1 / scale);
    }

    function zoomTo(next, originX, originY) {
      next = Math.min(MAX, Math.max(MIN, next));
      if (next === scale) return;
      // keep whatever is under that point under it after the zoom
      var k = next / scale;
      x = originX - (originX - x) * k;
      y = originY - (originY - y) * k;
      scale = next;
      draw();
    }

    root.querySelectorAll('[data-zoom]').forEach(function (button) {
      button.addEventListener('click', function () {
        var dir = Number(button.dataset.zoom);
        if (dir === 0) { scale = 1; x = 0; y = 0; draw(); return; }
        zoomTo(scale * (dir > 0 ? 1.6 : 1 / 1.6), viewport.clientWidth / 2, viewport.clientHeight / 2);
      });
    });

    viewport.addEventListener('dblclick', function (event) {
      var box = viewport.getBoundingClientRect();
      zoomTo(scale * 1.6, event.clientX - box.left, event.clientY - box.top);
    });

    var dragging = false, moved = 0, lastX = 0, lastY = 0, id = null;

    viewport.addEventListener('pointerdown', function (event) {
      if (event.button !== 0) return;
      dragging = true; moved = 0;
      lastX = event.clientX; lastY = event.clientY; id = event.pointerId;
      viewport.setPointerCapture(id);
      viewport.classList.add('is-dragging');
    });

    viewport.addEventListener('pointermove', function (event) {
      if (!dragging) return;
      var dx = event.clientX - lastX, dy = event.clientY - lastY;
      moved += Math.abs(dx) + Math.abs(dy);
      x += dx; y += dy;
      lastX = event.clientX; lastY = event.clientY;
      draw();
    });

    function stop() {
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove('is-dragging');
      if (id !== null) { try { viewport.releasePointerCapture(id); } catch (e) {} id = null; }
    }
    viewport.addEventListener('pointerup', stop);
    viewport.addEventListener('pointercancel', stop);

    // On a touch screen there is no hover, so a tap would follow the pin's link
    // before its card had ever been read — and the card itself gets clipped by
    // the edge of the map. There, a tap writes the city out underneath the map
    // instead, carrying the link on, so nothing is cut off and nothing jumps
    // away unasked. With a mouse, hover still shows the card and a click goes
    // straight through.
    var touch = window.matchMedia('(hover: none)').matches;
    var detail = null;

    function clearDetail() {
      root.querySelectorAll('.pin.is-open').forEach(function (p) { p.classList.remove('is-open'); });
      if (detail) detail.className = 'map-detail';
    }

    function showDetail(pin) {
      var card = pin.querySelector('.pin-card');
      if (!card) return;
      if (!detail) {
        detail = document.createElement('div');
        detail.className = 'map-detail';
        root.appendChild(detail);
      }
      var accent = (pin.className.match(/accent-[a-z]+/) || [''])[0];
      detail.className = 'map-detail is-shown ' + accent;
      detail.innerHTML = card.innerHTML;
      var go = document.createElement('a');
      go.className = 'map-detail-go';
      go.href = pin.getAttribute('href');
      go.textContent = 'Read more';
      detail.appendChild(go);
    }

    // A drag that ends over a pin should not count as clicking it.
    root.querySelectorAll('.pin').forEach(function (pin) {
      pin.addEventListener('click', function (event) {
        if (moved > 6) { event.preventDefault(); return; }
        if (!touch) return;
        event.preventDefault();
        clearDetail();
        pin.classList.add('is-open');
        showDetail(pin);
      });
      pin.addEventListener('dragstart', function (event) { event.preventDefault(); });
    });

    // panning the map, or tapping it anywhere but on a pin, puts the panel away
    viewport.addEventListener('pointerdown', function (event) {
      if (!event.target.closest('.pin')) clearDetail();
    });

    window.addEventListener('resize', draw);
    draw();
  })();

  /* ---------- 6. contact page ---------- */

  // Click to copy. The button says what happened, then goes back to normal.
  document.querySelectorAll('.copy-btn').forEach(function (button) {
    var original = button.textContent;
    button.addEventListener('click', function () {
      var value = button.dataset.copy || '';
      var done = function (ok) {
        button.textContent = ok ? 'Copied' : 'Select and copy';
        button.dataset.state = ok ? 'done' : '';
        window.setTimeout(function () {
          button.textContent = original;
          button.removeAttribute('data-state');
        }, 1600);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value).then(function () { done(true); }, function () { done(false); });
      } else {
        done(false);
      }
    });
  });

  // The form posts to api/contact.js, which emails the message on. If that
  // fails for any reason the old behaviour is the fallback: hand the whole
  // thing to the visitor's own mail app, already filled in. A message is
  // never lost without the visitor being told.
  (function contactForm() {
    var form = document.querySelector('.contact-form');
    if (!form) return;

    var chips = Array.prototype.slice.call(form.querySelectorAll('.chip'));
    var note = form.querySelector('.form-note');
    var address = form.dataset.address || '';

    // Only one subject at a time; clicking the chosen one again clears it.
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var already = chip.getAttribute('aria-pressed') === 'true';
        chips.forEach(function (other) { other.setAttribute('aria-pressed', 'false'); });
        chip.setAttribute('aria-pressed', String(!already));
      });
    });

    function value(field) {
      var el = form.elements[field];
      return el ? el.value.trim() : '';
    }

    function say(text) { if (note) note.textContent = text; }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var name = value('name');
      var email = value('email');
      var message = value('message');

      if (!name || !email || !message) {
        say('Please fill in your name, your email and a message.');
        return;
      }
      if (email.indexOf('@') < 1 || email.indexOf('.', email.indexOf('@')) < 0) {
        say('That email address does not look right — check it and try again.');
        return;
      }
      if (!address) {
        say('This form is not connected to an address yet.');
        if (window.console) {
          console.warn('site.js: no email address set. Put it in data-address on the form in contact.html.');
        }
        return;
      }

      var chosen = chips.filter(function (chip) {
        return chip.getAttribute('aria-pressed') === 'true';
      })[0];
      var subject = chosen ? chosen.dataset.subject : 'Hello';

      function openMailApp(reason) {
        var body = message + '\n\n—\n' + name + '\n' + email;
        say(reason);
        window.location.href = 'mailto:' + address +
          '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(body);
      }

      var endpoint = form.dataset.endpoint;
      if (!endpoint || !window.fetch) {
        openMailApp('Opening your mail app with this message ready to send. If nothing happens, copy the address above.');
        return;
      }

      var button = form.querySelector('button[type="submit"]');
      var label = button ? button.textContent : '';
      if (button) { button.disabled = true; button.textContent = 'Sending…'; }
      say('Sending…');

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          subject: subject,
          message: message,
          website: value('website'),
        }),
      }).then(function (response) {
        return response.json().catch(function () { return {}; })
          .then(function (data) { return { ok: response.ok && data.ok, data: data }; });
      }).then(function (result) {
        if (button) { button.disabled = false; button.textContent = label; }
        if (result.ok) {
          form.reset();
          chips.forEach(function (chip) { chip.setAttribute('aria-pressed', 'false'); });
          say('Thank you, that has reached me. I will reply to ' + email + '.');
        } else {
          openMailApp('Something went wrong sending that. Opening your mail app instead, with the message ready to go.');
        }
      }).catch(function () {
        if (button) { button.disabled = false; button.textContent = label; }
        openMailApp('Something went wrong sending that. Opening your mail app instead, with the message ready to go.');
      });
    });
  })();

  /* ---------- 7. the menu button ----------
     Only visible once the sidebar has become a top bar. Opens the same
     grouped list underneath it. */

  (function menu() {
    var sidebar = document.querySelector('.sidebar');
    var toggle = document.querySelector('.nav-toggle');
    if (!sidebar || !toggle) return;

    function set(open) {
      sidebar.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    }

    toggle.addEventListener('click', function () {
      set(!sidebar.classList.contains('is-open'));
    });

    // Following a link inside the panel should close it, including a link to
    // a section of the page you are already on.
    sidebar.addEventListener('click', function (event) {
      if (event.target.closest('.site-nav a')) set(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && sidebar.classList.contains('is-open')) {
        set(false);
        toggle.focus();
      }
    });
  })();

  /* ---------- 8. footer year ---------- */

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
