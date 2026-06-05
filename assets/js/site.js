/* ============================================================
   THE MINERS 1928 — shared site script
   Loaded on every page. Every feature guards for the presence of
   its elements, so the same file works on pages with or without a
   booking bar, FAQ, etc.
   ============================================================ */
(function () {
    'use strict';

    /* --- Navigation scroll effect --- */
    var nav = document.getElementById('nav');
    if (nav) {
        var onScroll = function () {
            nav.classList.toggle('scrolled', window.scrollY > 60);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* --- Mobile menu --- */
    var navToggle = document.getElementById('navToggle');
    var mobileMenu = document.getElementById('mobileMenu');
    var mobileMenuClose = document.getElementById('mobileMenuClose');
    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', function () {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    if (mobileMenuClose && mobileMenu) {
        mobileMenuClose.addEventListener('click', function () {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    document.querySelectorAll('.mobile-link').forEach(function (link) {
        link.addEventListener('click', function () {
            if (mobileMenu) mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    /* --- Dropdown trigger: keyboard + touch toggle --- */
    document.querySelectorAll('.nav__item--dropdown').forEach(function (item) {
        var trigger = item.querySelector('.nav__trigger');
        if (!trigger) return;
        trigger.addEventListener('click', function (e) {
            e.preventDefault();
            var open = item.classList.toggle('is-tap-open');
            trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        trigger.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                trigger.click();
            }
        });
    });

    /* --- Active nav highlighting by current page --- */
    var path = window.location.pathname.split('/').pop() || 'index.html';
    var current = path.replace('.html', '') || 'index';
    document.querySelectorAll('.nav__links a[data-nav]').forEach(function (link) {
        var key = link.getAttribute('data-nav');
        var href = (link.getAttribute('href') || '').split('/').pop().replace('.html', '');
        if (href === current) {
            link.classList.add('is-active');
            // also light up a parent dropdown trigger
            var parent = link.closest('.nav__item--dropdown');
            if (parent) {
                var t = parent.querySelector('.nav__trigger');
                if (t) t.classList.add('is-active');
            }
        }
        // light the dropdown trigger when on one of its child pages
        if (key === 'dining' && (current === 'dining-lounge28' || current === 'dining-cafe')) {
            link.classList.add('is-active');
        }
        if (key === 'events' && (current === 'private-events' || current === 'events')) {
            link.classList.add('is-active');
        }
    });

    /* --- Scroll reveal animations --- */
    var revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if ('IntersectionObserver' in window && revealEls.length) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
        revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('visible'); });
    }

    /* --- Smooth scroll for in-page anchors --- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var hash = this.getAttribute('href');
            if (hash === '#' || hash.length < 2) return;
            var target = document.querySelector(hash);
            if (target) {
                e.preventDefault();
                var navHeight = nav ? nav.offsetHeight : 0;
                var top = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });

    /* --- FAQ accordion --- */
    document.querySelectorAll('.faq__q').forEach(function (q) {
        q.addEventListener('click', function () {
            var item = q.closest('.faq__item');
            if (!item) return;
            var answer = item.querySelector('.faq__a');
            var isOpen = item.classList.toggle('is-open');
            q.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            if (answer) {
                answer.style.maxHeight = isOpen ? answer.scrollHeight + 'px' : null;
            }
        });
    });

    /* --- Newsletter form (graceful AJAX submit) --- */
    var newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var form = this;
            fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            }).then(function () {
                form.innerHTML = '<p style="color: var(--gold); font-family: var(--font-body); font-size: 0.9rem;">Thank you for subscribing!</p>';
            });
        });
    }

    /* --- Mews booking (Book Now opens on every page) --- */
    var bookingStartDate = new Date();
    var bookingEndDate = new Date();
    bookingEndDate.setDate(bookingEndDate.getDate() + 7);
    var bookingAdultCount = 2;
    var bookingChildCount = 0;

    if (typeof Mews !== 'undefined') {
        Mews.Distributor({
            configurationIds: ['a45b2b13-ca16-4c8e-92a6-b41100c9ab41'],
            openElements: '.book-now'
        }, function (distributor) {
            var availBtn = document.getElementById('check-availability');
            if (availBtn && typeof $ !== 'undefined') {
                $('#check-availability').click(function () {
                    distributor.setStartDate(bookingStartDate);
                    distributor.setEndDate(bookingEndDate);
                    distributor.setAdultCount(bookingAdultCount);
                    distributor.setChildCount(bookingChildCount);
                    distributor.showRooms();
                    distributor.open();
                });
            }
        });
    }

    /* --- Booking-bar UI (only on pages that have it) --- */
    var checkInDate = document.getElementById('checkInDate');
    var checkOutDate = document.getElementById('checkOutDate');
    if (checkInDate && checkOutDate) {
        checkInDate.value = bookingStartDate.toISOString().split('T')[0];
        checkOutDate.value = bookingEndDate.toISOString().split('T')[0];

        checkInDate.addEventListener('change', function (event) {
            bookingStartDate = new Date(event.target.value);
            if (bookingStartDate > bookingEndDate) {
                bookingEndDate = new Date(bookingStartDate);
                bookingEndDate.setDate(bookingStartDate.getDate() + 7);
                checkOutDate.value = bookingEndDate.toISOString().split('T')[0];
            }
        });
        checkOutDate.addEventListener('change', function (event) {
            bookingEndDate = new Date(event.target.value);
        });
    }

    /* date-picker icons */
    document.querySelectorAll('.booking-bar__field').forEach(function (field) {
        var dateInput = field.querySelector('input[type="date"]');
        if (!dateInput) return;
        var icon = field.querySelector('.booking-bar__icon');
        if (!icon) return;
        icon.setAttribute('role', 'button');
        icon.setAttribute('tabindex', '0');
        icon.setAttribute('aria-label', 'Open date picker');
        var openPicker = function () {
            if (typeof dateInput.showPicker === 'function') {
                try { dateInput.showPicker(); return; } catch (e) { /* fall through */ }
            }
            dateInput.focus();
            dateInput.click();
        };
        icon.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); openPicker(); });
        icon.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPicker(); }
        });
    });

    /* guest steppers */
    document.querySelectorAll('.booking-bar__stepper').forEach(function (stepper) {
        var key = stepper.dataset.stepper;
        var min = parseInt(stepper.dataset.min, 10);
        var max = parseInt(stepper.dataset.max, 10);
        var valueEl = document.querySelector('[data-stepper-value="' + key + '"]');
        if (!valueEl) return;
        var upBtn = stepper.querySelector('.booking-bar__step--up');
        var downBtn = stepper.querySelector('.booking-bar__step--down');

        var syncBookingState = function (n) {
            if (key === 'adults') bookingAdultCount = n;
            else if (key === 'children') bookingChildCount = n;
        };
        syncBookingState(parseInt(valueEl.textContent, 10) || 0);

        var refresh = function () {
            var n = parseInt(valueEl.textContent, 10) || 0;
            if (upBtn) { upBtn.classList.toggle('is-disabled', n >= max); upBtn.setAttribute('aria-disabled', n >= max); }
            if (downBtn) { downBtn.classList.toggle('is-disabled', n <= min); downBtn.setAttribute('aria-disabled', n <= min); }
        };
        var step = function (delta) {
            var n = parseInt(valueEl.textContent, 10) || 0;
            var next = Math.max(min, Math.min(max, n + delta));
            if (next !== n) { valueEl.textContent = next; syncBookingState(next); refresh(); }
        };
        stepper.querySelectorAll('.booking-bar__step').forEach(function (btn) {
            var delta = parseInt(btn.dataset.step, 10);
            btn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); step(delta); });
            btn.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); step(delta); }
            });
        });
        refresh();
    });

    /* --- Photo-spot reference tags ---------------------------------------
       Draws a numbered tag over every photo location (data-photo="...") so a
       spot can be referenced by code, e.g. WED-3. ON for the whole site while
       we gather photos. To hide them, add ?photos=off to the address.
       See photo-spots.js / PHOTO-CHECKLIST.md. */
    var photosOn = !/[?&]photos=off\b/.test(window.location.search);
    var spots = photosOn ? document.querySelectorAll('[data-photo]') : [];
    if (spots.length) {
        var layer = document.createElement('div');
        layer.id = 'photo-id-layer';
        document.body.appendChild(layer);

        var tags = [];
        spots.forEach(function (el) {
            var badge = document.createElement('span');
            badge.className = 'photo-id-badge' +
                (el.hasAttribute('data-photo-empty') ? ' photo-id-badge--empty' : '');
            badge.textContent = el.getAttribute('data-photo');
            layer.appendChild(badge);
            tags.push({ el: el, badge: badge });
        });

        var placeTags = function () {
            tags.forEach(function (t) {
                var r = t.el.getBoundingClientRect();
                if (r.width === 0 && r.height === 0) {
                    t.badge.style.display = 'none';
                    return;
                }
                t.badge.style.display = '';
                t.badge.style.left = r.left + 'px';
                t.badge.style.top = r.top + 'px';
            });
        };
        placeTags();
        window.addEventListener('scroll', placeTags, { passive: true });
        window.addEventListener('resize', placeTags);
        window.addEventListener('load', placeTags);
    }
})();
