/* ─────────────────────────────────────────────────────────────
   main.js — Kimyot
───────────────────────────────────────────────────────────── */

/* ── Admin: sidebar navigation ── */
document.querySelectorAll('.aside-item[data-sec]').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.aside-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.panel-sec').forEach(s => s.classList.remove('active'));
    item.classList.add('active');
    const sec = document.getElementById(item.dataset.sec);
    if (sec) sec.classList.add('active');
  });
});

/* ── Admin: confirm delete ── */
function confirmDelete(formId, name) {
  if (confirm(`Delete "${name}"? This cannot be undone.`)) {
    document.getElementById(formId)?.submit();
  }
}

/* ─────────────────────────────────────────────────────────────
   Video thumbnails — seek to 10% for a consistent still frame
   
   preload="metadata" is set in the HTML so the browser starts
   loading immediately (same as before — that's why it worked).
   We just add a seek on loadedmetadata so the frame is always
   from 10% in rather than whatever random frame the browser
   happens to pick.
───────────────────────────────────────────────────────────── */
(function initVideoThumbnails() {
  const SEEK_FRACTION = 0.1;
  const SEEK_MIN_S    = 2;

  function seekToFrame(video) {
    // Already seeked — skip
    if (video.dataset.seeked) return;
    video.dataset.seeked = '1';

    const doSeek = () => {
      const target = Math.max(SEEK_MIN_S, video.duration * SEEK_FRACTION);
      video.currentTime = Math.min(target, video.duration - 0.05);
    };

    if (video.readyState >= 1) {
      // Metadata already available (fast load / cached)
      doSeek();
    } else {
      video.addEventListener('loadedmetadata', doSeek, { once: true });
    }
  }

  function init() {
    document.querySelectorAll('.vthumb-seek').forEach(seekToFrame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ─────────────────────────────────────────────────────────────
   Admin: Add/Edit Video form
   — live preview + auto duration detection
───────────────────────────────────────────────────────────── */
(function initAdminForm() {
  function getRawVideoUrl(embedUrl) {
    try {
      const u = new URL(embedUrl);
      return u.searchParams.get('url') || embedUrl;
    } catch { return embedUrl; }
  }

  function formatDuration(seconds) {
    if (!isFinite(seconds) || seconds <= 0) return '';
    const s   = Math.round(seconds);
    const h   = Math.floor(s / 3600);
    const m   = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    return `${m}:${String(sec).padStart(2,'0')}`;
  }

  function fetchDuration(rawUrl, onResult) {
    const vid   = document.createElement('video');
    vid.preload = 'metadata';
    vid.muted   = true;

    const timer = setTimeout(() => {
      vid.src = '';
      onResult(null, 'Timed out — enter manually');
    }, 15000);

    vid.addEventListener('loadedmetadata', () => {
      clearTimeout(timer);
      const dur = vid.duration;
      vid.src = '';
      onResult(dur, null);
    }, { once: true });

    vid.addEventListener('error', () => {
      clearTimeout(timer);
      vid.src = '';
      onResult(null, 'Could not load — enter manually');
    }, { once: true });

    vid.src = rawUrl;
    vid.load();
  }

  function updatePreview(embedUrl) {
    const wrap = document.getElementById('thumb-preview-wrap');
    const vid  = document.getElementById('thumb-preview-vid');
    if (!wrap || !vid) return;
    if (embedUrl) {
      vid.src            = embedUrl;
      wrap.style.display = '';
    } else {
      wrap.style.display = 'none';
      vid.src            = '';
    }
  }

  function triggerDurationFetch(embedUrl) {
    const input = document.getElementById('duration_input');
    const hint  = document.getElementById('duration-hint');
    if (!input || !hint || !embedUrl) return;

    // Respect manual edits
    if (input.value && input.value !== input.dataset.autoValue) return;

    const rawUrl = getRawVideoUrl(embedUrl);
    hint.textContent = '⏳ Detecting duration…';
    hint.style.color = 'var(--text3)';

    fetchDuration(rawUrl, (seconds, err) => {
      if (err) {
        hint.textContent = '⚠️ ' + err;
        hint.style.color = 'var(--accent)';
        return;
      }
      const formatted = formatDuration(seconds);
      if (formatted) {
        input.value             = formatted;
        input.dataset.autoValue = formatted;
        hint.textContent        = '✅ Auto-detected: ' + formatted;
        hint.style.color        = '#22c55e';
      } else {
        hint.textContent = '⚠️ Could not parse — enter manually';
        hint.style.color = 'var(--accent)';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const embedInput = document.getElementById('embed_url_input');
    if (!embedInput) return;

    if (embedInput.value) {
      updatePreview(embedInput.value);
      triggerDurationFetch(embedInput.value);
    }

    let debounceTimer;

    embedInput.addEventListener('input', function () {
      updatePreview(this.value);
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (this.value) triggerDurationFetch(this.value);
      }, 700);
    });

    embedInput.addEventListener('paste', function () {
      setTimeout(() => {
        updatePreview(this.value);
        triggerDurationFetch(this.value);
      }, 60);
    });
  });
})();
