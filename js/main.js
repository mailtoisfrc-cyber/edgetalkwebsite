/* ═══════════════════════════════════════════════════════
   EdgeTalk — Main JS
   Particle Network · Voice Waveform · Scroll Reveal
   ═══════════════════════════════════════════════════════ */

(function () {
    'use strict';

    /* ─── HEADER SCROLL ─── */
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 60);
    });

    /* ─── MOBILE NAV ─── */
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');
    if (toggle) {
        toggle.addEventListener('click', () => links.classList.toggle('active'));
        links.querySelectorAll('a').forEach(a =>
            a.addEventListener('click', () => links.classList.remove('active'))
        );
    }

    /* ═══════════════════════════════════════
       PARTICLE NETWORK (hero background)
       ═══════════════════════════════════════ */
    const pCanvas = document.getElementById('particle-canvas');
    if (pCanvas) {
        const ctx = pCanvas.getContext('2d');
        let particles = [];
        const PARTICLE_COUNT = 80;
        const MAX_DIST = 150;

        function resizeCanvas() {
            pCanvas.width = pCanvas.offsetWidth;
            pCanvas.height = pCanvas.offsetHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * pCanvas.width;
                this.y = Math.random() * pCanvas.height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.r = Math.random() * 2 + 0.5;
                this.opacity = Math.random() * 0.5 + 0.2;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > pCanvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > pCanvas.height) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(96,165,250,${this.opacity})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

        function drawLines() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < MAX_DIST) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(37,99,235,${0.12 * (1 - dist / MAX_DIST)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, pCanvas.width, pCanvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            drawLines();
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    /* ═══════════════════════════════════════
       VOICE WAVEFORM VISUALIZATION
       ═══════════════════════════════════════ */
    const wCanvas = document.getElementById('waveform-canvas');
    if (wCanvas) {
        const wCtx = wCanvas.getContext('2d');
        let wTime = 0;

        function resizeWaveCanvas() {
            const container = wCanvas.parentElement;
            const size = Math.min(container.offsetWidth, container.offsetHeight) * 0.7;
            wCanvas.width = size;
            wCanvas.height = size;
        }
        resizeWaveCanvas();
        window.addEventListener('resize', resizeWaveCanvas);

        function drawWaveform() {
            const w = wCanvas.width;
            const h = wCanvas.height;
            const cx = w / 2;
            const cy = h / 2;
            wCtx.clearRect(0, 0, w, h);

            // Draw multiple circular waveforms
            for (let ring = 0; ring < 3; ring++) {
                const baseRadius = 60 + ring * 35;
                const amplitude = 12 - ring * 3;
                const segments = 128;
                const speed = 0.02 + ring * 0.005;
                const opacity = 0.6 - ring * 0.15;

                const gradient = wCtx.createLinearGradient(0, 0, w, h);
                gradient.addColorStop(0, `rgba(37,99,235,${opacity})`);
                gradient.addColorStop(1, `rgba(6,182,212,${opacity})`);

                wCtx.beginPath();
                for (let i = 0; i <= segments; i++) {
                    const angle = (i / segments) * Math.PI * 2;
                    // Combine multiple sine waves for organic feel
                    const wave =
                        Math.sin(angle * 6 + wTime * speed * 60) * amplitude * 0.5 +
                        Math.sin(angle * 4 - wTime * speed * 40) * amplitude * 0.3 +
                        Math.sin(angle * 8 + wTime * speed * 80) * amplitude * 0.2;
                    const r = baseRadius + wave;
                    const x = cx + Math.cos(angle) * r;
                    const y = cy + Math.sin(angle) * r;
                    i === 0 ? wCtx.moveTo(x, y) : wCtx.lineTo(x, y);
                }
                wCtx.closePath();
                wCtx.strokeStyle = gradient;
                wCtx.lineWidth = 1.5;
                wCtx.stroke();
            }

            // Center glow
            const glowGrad = wCtx.createRadialGradient(cx, cy, 0, cx, cy, 40);
            glowGrad.addColorStop(0, 'rgba(37,99,235,0.15)');
            glowGrad.addColorStop(1, 'rgba(37,99,235,0)');
            wCtx.fillStyle = glowGrad;
            wCtx.beginPath();
            wCtx.arc(cx, cy, 40, 0, Math.PI * 2);
            wCtx.fill();

            // Tiny center dot
            wCtx.beginPath();
            wCtx.arc(cx, cy, 3, 0, Math.PI * 2);
            wCtx.fillStyle = '#22d3ee';
            wCtx.fill();

            wTime += 0.016;
            requestAnimationFrame(drawWaveform);
        }
        drawWaveform();
    }

    /* ═══════════════════════════════════════
       EQUALIZER BARS (About section)
       ═══════════════════════════════════════ */
    const eqContainer = document.getElementById('equalizer');
    if (eqContainer) {
        const BAR_COUNT = 24;
        for (let i = 0; i < BAR_COUNT; i++) {
            const bar = document.createElement('div');
            bar.classList.add('eq-bar');
            const minH = 20 + Math.random() * 30;
            const maxH = 80 + Math.random() * 100;
            const duration = 0.5 + Math.random() * 1;
            bar.style.setProperty('--min-h', minH + 'px');
            bar.style.setProperty('--max-h', maxH + 'px');
            bar.style.setProperty('--duration', duration + 's');
            bar.style.animationDelay = (Math.random() * 1) + 's';
            eqContainer.appendChild(bar);
        }
    }

    /* ═══════════════════════════════════════
       SCROLL REVEAL
       ═══════════════════════════════════════ */
    const revealEls = document.querySelectorAll('.reveal');
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObs.observe(el));

    /* ═══════════════════════════════════════
       COUNTER ANIMATION
       ═══════════════════════════════════════ */
    const counters = document.querySelectorAll('.counter');
    const counterObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = +el.dataset.target;
                const duration = 2000;
                const startTime = performance.now();

                function step(now) {
                    const progress = Math.min((now - startTime) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                    el.textContent = Math.floor(target * eased);
                    if (progress < 1) requestAnimationFrame(step);
                    else el.textContent = target;
                }
                requestAnimationFrame(step);
                counterObs.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObs.observe(c));

})();
