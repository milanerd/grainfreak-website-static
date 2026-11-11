document.addEventListener('DOMContentLoaded', function () {
  /* ------ MOBILE NAV ------ */
  var navBtn = document.querySelector('.nav-btn');
  var navLinks = document.querySelector('.nav-links');
  var isNavOpen = false;

  function openNav() {
    isNavOpen = true;
    navLinks.classList.add('open');
    navBtn.setAttribute('aria-expanded', 'true');
    navBtn.setAttribute('aria-label', 'Close menu');
    navBtn.innerHTML = '&#10005;';
    document.body.style.overflow = 'hidden';
    navBtn.focus();
  }

  function closeNav() {
    isNavOpen = false;
    navLinks.classList.remove('open');
    navBtn.setAttribute('aria-expanded', 'false');
    navBtn.setAttribute('aria-label', 'Open menu');
    navBtn.innerHTML = '&#9776;';
    document.body.style.overflow = '';
  }

  if (navBtn) {
    navBtn.addEventListener('click', function () {
      if (isNavOpen) { closeNav(); } else { openNav(); }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isNavOpen) {
      closeNav();
    }
  });

  /* ------ SMOOTH SCROLL + CLOSE NAV ------ */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (a.getAttribute('href') === '#') return;
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        if (isNavOpen) closeNav();
      }
    });
  });

  /* ------ TABS ------ */
  var tabs = document.querySelectorAll('.tab');
  var contents = document.querySelectorAll('.tab-content');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = this.dataset.tab;
      tabs.forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      contents.forEach(function (c) { c.classList.remove('active'); });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      var el = document.getElementById(target);
      if (el) el.classList.add('active');
    });
    tab.addEventListener('keydown', function (e) {
      var idx = Array.prototype.indexOf.call(tabs, this);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        var next = tabs[(idx + 1) % tabs.length];
        next.focus(); next.click();
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        var prev = tabs[(idx - 1 + tabs.length) % tabs.length];
        prev.focus(); prev.click();
      }
    });
  });

  /* ------ CONTACT FORM ------ */
  var form = document.getElementById('contact-form');
  var statusEl = document.getElementById('form-status');
  var submitBtn = form ? form.querySelector('.form-submit') : null;

  function showFieldError(fieldId, message) {
    var input = document.getElementById(fieldId);
    var errorEl = document.getElementById(fieldId + '-error');
    if (input) input.classList.add('input-error');
    if (errorEl) { errorEl.textContent = message; errorEl.classList.add('visible'); }
  }

  function clearFieldError(fieldId) {
    var input = document.getElementById(fieldId);
    var errorEl = document.getElementById(fieldId + '-error');
    if (input) input.classList.remove('input-error');
    if (errorEl) { errorEl.textContent = ''; errorEl.classList.remove('visible'); }
  }

  function clearAllErrors() {
    ['contact-name', 'contact-email', 'contact-message'].forEach(clearFieldError);
    statusEl.className = 'form-status';
    statusEl.textContent = '';
  }

  function validateForm() {
    var valid = true;
    var name = document.getElementById('contact-name');
    var email = document.getElementById('contact-email');
    var message = document.getElementById('contact-message');

    if (!name || !name.value.trim() || name.value.trim().length < 2) {
      showFieldError('contact-name', 'Please enter your name (at least 2 characters).');
      valid = false;
    }

    if (!email || !email.value.trim() || !/^\S+@\S+\.\S+$/.test(email.value.trim())) {
      showFieldError('contact-email', 'Please enter a valid email address.');
      valid = false;
    }

    if (!message || !message.value.trim() || message.value.trim().length < 10) {
      showFieldError('contact-message', 'Please enter a message (at least 10 characters).');
      valid = false;
    }

    return valid;
  }

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearAllErrors();

      if (!validateForm()) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      var payload = {
        name: document.getElementById('contact-name').value.trim(),
        email: document.getElementById('contact-email').value.trim(),
        company: document.getElementById('contact-company').value.trim(),
        message: document.getElementById('contact-message').value.trim(),
        interest: document.getElementById('contact-interest').value,
      };

      try {
        var res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          statusEl.className = 'form-status success';
          statusEl.textContent = 'Thanks! We\'ll be in touch within 2 business days.';
          form.reset();
        } else {
          var data = await res.json().catch(function () { return null; });
          statusEl.className = 'form-status error';
          statusEl.textContent = (data && data.message) ? data.message : 'Something went wrong. Please email us at info@grainfreak.com.';
        }
      } catch (err) {
        statusEl.className = 'form-status error';
        statusEl.textContent = 'Network error. Please try again or email info@grainfreak.com.';
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send message';
      }
    });

    /* Clear errors on input */
    form.querySelectorAll('input, textarea').forEach(function (el) {
      el.addEventListener('input', function () {
        clearFieldError(el.id);
      });
    });
  }

  /* ------ ACTIVE NAV HIGHLIGHT ON SCROLL ------ */
  var sections = document.querySelectorAll('section[id]');
  var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  var observerOptions = { rootMargin: '-40% 0px -55% 0px' };

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        navAnchors.forEach(function (a) {
          a.style.color = a.getAttribute('href') === '#' + entry.target.id ? 'var(--amber)' : '';
        });
      }
    });
  }, observerOptions);

  sections.forEach(function (s) { observer.observe(s); });
});