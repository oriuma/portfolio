document.addEventListener('DOMContentLoaded', () => {

    const userLang = navigator.language || navigator.userLanguage;
    const lang = userLang.startsWith('vi') ? 'vi' : 'en';

    function applyTranslations() {
        if (typeof translations === 'undefined') {
            console.error('Translations object not found.');
            return;
        }
        const trans = translations[lang];
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (trans[key]) {
                el.innerText = trans[key];
            }
        });
        document.querySelectorAll('[data-translate-content]').forEach(el => {
            const key = el.getAttribute('data-translate-content');
            if (trans[key]) {
                el.setAttribute('content', trans[key]);
            }
        });
        document.querySelectorAll('[data-translate-title]').forEach(el => {
            const key = el.getAttribute('data-translate-title');
            if (trans[key]) {
                el.setAttribute('title', trans[key]);
            }
        });
        document.querySelectorAll('[data-translate-alt]').forEach(el => {
            const key = el.getAttribute('data-translate-alt');
            if (trans[key]) {
                el.setAttribute('alt', trans[key]);
            }
        });
    }

    function renderTools() {
        const toolsContainer = document.getElementById('tools-container');
        if (!toolsContainer) {
            console.error('Kh\u00f4ng t\u00ecm th\u1ea5y #tools-container');
            return;
        }
        if (typeof toolsData === 'undefined' || toolsData.length === 0) {
            toolsContainer.innerHTML = `<div class="bento-item">
                <p>${translations[lang].toolsLoading}</p>
            </div>`;
            return;
        }
        toolsData.forEach(tool => {
            const toolCard = document.createElement('div');
            toolCard.className = 'bento-item card-tool';
            const toolLang = tool[lang] || tool['en'];
            toolCard.innerHTML = `
                <div class="card-tool-image">
                    <img src="${tool.icon}" alt="${tool.alt}">
                </div>
                <div class="card-tool-content">
                    <h3 class="card-tool-title">${toolLang.title}</h3>
                    <p class="card-tool-description">${toolLang.description}</p>
                </div>
                <a href="${tool.link}" class="card-tool-button" target="_blank" rel="noopener noreferrer">
                    ${toolLang.buttonText}
                </a>
            `;
            toolsContainer.appendChild(toolCard);
        });
    }

    applyTranslations();
    renderTools();

    setTimeout(() => {
        const toolsContainer = document.getElementById('tools-container');
        if (toolsContainer && typeof toolsData === 'undefined') {
            toolsContainer.innerHTML = `<div class="bento-item">
                <p>${translations[lang].toolsLoading}</p>
            </div>`;
        }
    }, 100);

    const bentoItems = document.querySelectorAll('.bento-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    bentoItems.forEach(item => {
        observer.observe(item);
    });

    const background = document.querySelector('.background-aurora');
    if (background) {
        let rafId = null;
        let mouseX = 0;
        let mouseY = 0;
        const updateAurora = () => {
            const { innerWidth, innerHeight } = window;
            const xPercent = (mouseX / innerWidth - 0.5) * 2;
            const yPercent = (mouseY / innerHeight - 0.5) * 2;
            background.style.transform = `translate(${xPercent * -20}px, ${yPercent * -20}px)`;
            rafId = null;
        };
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!rafId) {
                rafId = requestAnimationFrame(updateAurora);
            }
        });
    }

    const bioElement = document.getElementById('typing-bio');
    if (bioElement) {
        const trans = translations[lang];
        const bioLines = [
            trans.bioLine1,
            trans.bioLine2,
            trans.bioLine3,
        ];
        let lineIndex = 0;
        let charIndex = 0;
        let isWaiting = false;
        function typeBio() {
            if (isWaiting) {
                bioElement.textContent = '';
                lineIndex = (lineIndex + 1) % bioLines.length;
                charIndex = 0;
                isWaiting = false;
                setTimeout(typeBio, 500);
                return;
            }
            const currentLine = bioLines[lineIndex];
            const displayText = currentLine.substring(0, charIndex + 1);
            bioElement.textContent = displayText;
            charIndex++;
            let typeSpeed = 25;
            if (charIndex > currentLine.length) {
                isWaiting = true;
                typeSpeed = 2000;
            }
            setTimeout(typeBio, typeSpeed);
        }
        typeBio();
    }

    const qrBankTrigger = document.getElementById('qr-bank-trigger');
    const qrBankModal = document.getElementById('qr-bank-modal');
    if (qrBankTrigger && qrBankModal) {
        qrBankTrigger.addEventListener('click', () => {
            qrBankModal.classList.add('active');
        });
        qrBankModal.addEventListener('click', (event) => {
            if (event.target === qrBankModal) {
                qrBankModal.classList.remove('active');
            }
        });
    }

    const qrUsdtTrigger = document.getElementById('qr-usdt-trigger');
    const qrUsdtModal = document.getElementById('qr-usdt-modal');
    if (qrUsdtTrigger && qrUsdtModal) {
        qrUsdtTrigger.addEventListener('click', () => {
            qrUsdtModal.classList.add('active');
        });
        qrUsdtModal.addEventListener('click', (event) => {
            if (event.target === qrUsdtModal) {
                qrUsdtModal.classList.remove('active');
            }
        });
    }

    const usdtButton = document.getElementById('usdt-copy-button');
    if (usdtButton) {
        const trans = translations[lang];
        const originalButtonHTML = `<i class="${trans.copyIconDefault}"></i> <span>${trans.copyDefault}</span>`;
        usdtButton.innerHTML = originalButtonHTML;
        usdtButton.addEventListener('click', () => {
            if (usdtButton.classList.contains('copied')) {
                return;
            }
            const addressToCopy = usdtButton.getAttribute('data-address');
            const tempTextArea = document.createElement('textarea');
            tempTextArea.value = addressToCopy;
            tempTextArea.style.position = 'absolute';
            tempTextArea.style.left = '-9999px';
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            tempTextArea.setSelectionRange(0, 99999);
            try {
                document.execCommand('copy');
                usdtButton.innerHTML = `<i class="${trans.copyIconSuccess}"></i> <span>${trans.copySuccess}</span>`;
                usdtButton.classList.add('copied');
            } catch (err) {
                console.error('Kh\u00f4ng th\u1ec3 sao ch\u00e9p: ', err);
                usdtButton.innerHTML = `<i class="${trans.copyIconError}"></i> <span>${trans.copyError}</span>`;
            }
            document.body.removeChild(tempTextArea);
            setTimeout(() => {
                usdtButton.innerHTML = originalButtonHTML;
                usdtButton.classList.remove('copied');
            }, 2000);
        });
    }

    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
        window.addEventListener('mousemove', (e) => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        });
        const interactiveElements = document.querySelectorAll('a, button, .social-link, .coffee-qr, .profile-cta, .project-link, .coffee-button, .card-tool-button');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }

    function equalizeCardHeights() {
        const profileCard = document.querySelector('.card-profile');
        const socialCard = document.querySelector('.card-social-links');
        const nowCard = document.querySelector('.card-now');
        const skillsCard = document.querySelector('.card-skills');
        if (profileCard && socialCard) {
            profileCard.style.height = 'auto';
            socialCard.style.height = 'auto';
            const profileHeight = profileCard.offsetHeight;
            const socialHeight = socialCard.offsetHeight;
            const maxHeightProfile = Math.max(profileHeight, socialHeight);
            profileCard.style.height = `${maxHeightProfile}px`;
            socialCard.style.height = `${maxHeightProfile}px`;
        }
        if (nowCard && skillsCard) {
            nowCard.style.height = 'auto';
            skillsCard.style.height = 'auto';
            const nowHeight = nowCard.offsetHeight;
            const skillsHeight = skillsCard.offsetHeight;
            const maxHeightNow = Math.max(nowHeight, skillsHeight);
            nowCard.style.height = `${maxHeightNow}px`;
            skillsCard.style.height = `${maxHeightNow}px`;
        }
    }

    if (window.innerWidth > 768) {
        setTimeout(equalizeCardHeights, 100);
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 768) {
                equalizeCardHeights();
            } else {
                const profileCard = document.querySelector('.card-profile');
                const socialCard = document.querySelector('.card-social-links');
                const journeyCard = document.querySelector('.card-journey');
                const coffeeCard = document.querySelector('.card-coffee');
                const nowCard = document.querySelector('.card-now');
                const skillsCard = document.querySelector('.card-skills');
                if (profileCard) profileCard.style.height = 'auto';
                if (socialCard) socialCard.style.height = 'auto';
                if (journeyCard) journeyCard.style.height = 'auto';
                if (coffeeCard) coffeeCard.style.height = 'auto';
                if (nowCard) nowCard.style.height = 'auto';
                if (skillsCard) skillsCard.style.height = 'auto';
            }
        }, 250);
    });

    // ── Pendulum crystal ──────────────────────────────────────────────────────
    function initPendulum() {
        const canvas = document.getElementById('pendulum-canvas');
        const pendant = document.getElementById('crystal-pendant');
        if (!canvas || !pendant) return;

        const ctx = canvas.getContext('2d');
        const img = pendant.querySelector('img');

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Pivot = bottom-center of .card-skills
        function getPivot() {
            const card = document.querySelector('.card-skills');
            if (!card) return { x: 200, y: 300 };
            const r = card.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.bottom };
        }

        const L = 140;          // rope length px
        let angle = 0.04;       // tiny initial displacement so it sways gently
        let angVel = 0;         // angular velocity
        let isDragging = false;
        let history = [];       // for release-velocity calculation

        function physicsStep() {
            if (isDragging) return;
            const acc = -0.0085 * Math.sin(angle);  // pendulum formula: -(g/L)*sin(θ)
            angVel += acc;
            angVel *= 0.993;                         // damping
            angle += angVel;
        }

        function crystalPos(pivot) {
            return {
                x: pivot.x + Math.sin(angle) * L,
                y: pivot.y + Math.cos(angle) * L
            };
        }

        function drawRope(pivot, pos) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.moveTo(pivot.x, pivot.y);
            // slight curve for more natural look
            const mx = (pivot.x + pos.x) / 2 + Math.sin(angle) * 8;
            const my = (pivot.y + pos.y) / 2;
            ctx.quadraticCurveTo(mx, my, pos.x, pos.y);
            ctx.strokeStyle = 'rgba(200, 190, 220, 0.55)';
            ctx.lineWidth = 1.2;
            ctx.setLineDash([4, 5]);
            ctx.stroke();
            ctx.setLineDash([]);

            // small anchor dot at pivot
            ctx.beginPath();
            ctx.arc(pivot.x, pivot.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(200, 190, 220, 0.6)';
            ctx.fill();
        }

        function loop() {
            physicsStep();
            const pivot = getPivot();
            const pos = crystalPos(pivot);

            drawRope(pivot, pos);

            // position the pendant div (centered on crystal)
            pendant.style.left = pos.x + 'px';
            pendant.style.top  = pos.y + 'px';

            // subtle rotation of the image based on swing angle
            if (img) img.style.transform = `rotate(${angle * 14}deg)`;

            requestAnimationFrame(loop);
        }

        // ── Drag (mouse) ─────────────────────────────
        pendant.addEventListener('mousedown', (e) => {
            isDragging = true;
            history = [];
            pendant.style.cursor = 'grabbing';
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const pivot = getPivot();
            const dx = e.clientX - pivot.x;
            const dy = e.clientY - pivot.y;
            angle = Math.atan2(dx, dy);
            history.push({ a: angle, t: performance.now() });
            if (history.length > 8) history.shift();
        });

        window.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            pendant.style.cursor = 'grab';
            if (history.length >= 2) {
                const f = history[0], l = history[history.length - 1];
                const dt = (l.t - f.t) / 1000;
                if (dt > 0.01) angVel = (l.a - f.a) / dt / 60;
            }
        });

        // ── Drag (touch) ─────────────────────────────
        pendant.addEventListener('touchstart', (e) => {
            isDragging = true;
            history = [];
            e.preventDefault();
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const t = e.touches[0];
            const pivot = getPivot();
            angle = Math.atan2(t.clientX - pivot.x, t.clientY - pivot.y);
            history.push({ a: angle, t: performance.now() });
            if (history.length > 8) history.shift();
            e.preventDefault();
        }, { passive: false });

        window.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            if (history.length >= 2) {
                const f = history[0], l = history[history.length - 1];
                const dt = (l.t - f.t) / 1000;
                if (dt > 0.01) angVel = (l.a - f.a) / dt / 60;
            }
        });

        loop();
    }

    // Delay so layout is fully rendered before reading getBoundingClientRect
    setTimeout(initPendulum, 200);

});