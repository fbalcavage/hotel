// --- Navigation scroll effect ---
const nav = document.getElementById('nav');
const heroSection = document.getElementById('home');

function handleNavScroll() {
    if (window.scrollY > 60) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', handleNavScroll, { passive: true });

// --- Mobile menu ---
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuClose = document.getElementById('mobileMenuClose');
const mobileLinks = document.querySelectorAll('.mobile-link');

navToggle.addEventListener('click', () => {
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
});

mobileMenuClose.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// --- Intersection Observer for scroll reveal animations ---
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
});

revealElements.forEach(el => {
    revealObserver.observe(el);
});

// --- Smooth scroll for anchor links (fallback for older browsers) ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            const navHeight = nav.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// --- Active nav link highlighting ---
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__links a');

function highlightNavLink() {
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
            navLinks.forEach(link => {
                link.style.color = '';
                if (link.getAttribute('href') === '#' + id) {
                    link.style.color = 'var(--gold)';
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightNavLink, { passive: true });

// --- Contact form handler ---
// document.getElementById('contactForm').addEventListener('submit', function(e) {
//     e.preventDefault();
//     const form = this;
//     const data = new FormData(form);
//     fetch(form.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
//         .then(function() {
//             var fields = form.querySelectorAll('.form-row, .form-group, .btn');
//             fields.forEach(function(el) { el.style.display = 'none'; });
//             document.getElementById('contactSuccess').style.display = 'block';
//         });
// });

// --- Newsletter form handler ---
document.getElementById('newsletterForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var form = this;
    var data = new FormData(form);
    fetch(form.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
        .then(function() {
            form.innerHTML = '<p style="color: var(--gold); font-family: var(--font-body); font-size: 0.9rem;">Thank you for subscribing!</p>';
        });
});


var bookingStartDate = new Date();
var bookingEndDate = new Date();
bookingEndDate.setDate(bookingEndDate.getDate() + 7);
var bookingAdultCount = 2;
var bookingChildCount = 0;

Mews.Distributor({
    configurationIds: [
        'a45b2b13-ca16-4c8e-92a6-b41100c9ab41',
    ],
    openElements: '.book-now',
} , function(distributor) {
   $('#check-availability').click(function() {
        distributor.setStartDate(bookingStartDate);
        distributor.setEndDate(bookingEndDate);
        distributor.setAdultCount(bookingAdultCount);
        distributor.setChildCount(bookingChildCount);
        distributor.showRooms();
        distributor.open();
   });
});



const checkInDate = document.getElementById('checkInDate');
const checkOutDate = document.getElementById('checkOutDate');

checkInDate.value = bookingStartDate.toISOString().split('T')[0];
checkOutDate.value = bookingEndDate.toISOString().split('T')[0];

checkInDate.addEventListener('change', (event) => {
    bookingStartDate = new Date(event.target.value);
    if (bookingStartDate > bookingEndDate){
        bookingEndDate = new Date(bookingStartDate);
        bookingEndDate.setDate(bookingStartDate.getDate() + 7);
        checkOutDate.value = bookingEndDate.toISOString().split('T')[0];
    }
});
checkOutDate.addEventListener('change', (event) => {
    bookingEndDate = new Date(event.target.value);
});



// --- Booking-bar: clicking the custom calendar icon opens the date picker ---
document.querySelectorAll('.booking-bar__field').forEach(function(field) {
    var dateInput = field.querySelector('input[type="date"]');
    if (!dateInput) return;
    var icon = field.querySelector('.booking-bar__icon');
    if (!icon) return;

    icon.setAttribute('role', 'button');
    icon.setAttribute('tabindex', '0');
    icon.setAttribute('aria-label', 'Open date picker');

    function openPicker() {
        if (typeof dateInput.showPicker === 'function') {
            try { dateInput.showPicker(); return; } catch (e) { /* fall through */ }
        }
        dateInput.focus();
        dateInput.click();
    }

    icon.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openPicker();
    });
    icon.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPicker();
        }
    });
});

// --- Booking-bar guest steppers (adults / children) ---
document.querySelectorAll('.booking-bar__stepper').forEach(function(stepper) {
    var key = stepper.dataset.stepper;
    var min = parseInt(stepper.dataset.min, 10);
    var max = parseInt(stepper.dataset.max, 10);
    var valueEl = document.querySelector('[data-stepper-value="' + key + '"]');
    var upBtn = stepper.querySelector('.booking-bar__step--up');
    var downBtn = stepper.querySelector('.booking-bar__step--down');

    function syncBookingState(n) {
        if (key === 'adults') bookingAdultCount = n;
        else if (key === 'children') bookingChildCount = n;
    }

    // sync initial value from DOM into booking state
    syncBookingState(parseInt(valueEl.textContent, 10) || 0);

    function refresh() {
        var n = parseInt(valueEl.textContent, 10) || 0;
        upBtn.classList.toggle('is-disabled', n >= max);
        upBtn.setAttribute('aria-disabled', n >= max);
        downBtn.classList.toggle('is-disabled', n <= min);
        downBtn.setAttribute('aria-disabled', n <= min);
    }

    function step(delta) {
        var n = parseInt(valueEl.textContent, 10) || 0;
        var next = Math.max(min, Math.min(max, n + delta));
        if (next !== n) {
            valueEl.textContent = next;
            syncBookingState(next);
            refresh();
        }
    }

    stepper.querySelectorAll('.booking-bar__step').forEach(function(btn) {
        var delta = parseInt(btn.dataset.step, 10);
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            step(delta);
        });
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                step(delta);
            }
        });
    });

    refresh();
});