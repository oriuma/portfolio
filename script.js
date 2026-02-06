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
            console.error('Không tìm thấy #tools-container');
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
                console.error('Không thể sao chép: ', err);
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
        const journeyCard = document.querySelector('.card-journey');
        const coffeeCard = document.querySelector('.card-coffee');
        const nowCard = document.querySelector('.card-now');
        const skillsCard = document.querySelector('.card-skills');
        const toolsColumn = document.querySelector('.column-tools');
        if (profileCard && socialCard) {
            profileCard.style.height = 'auto';
            socialCard.style.height = 'auto';
            const profileHeight = profileCard.offsetHeight;
            const socialHeight = socialCard.offsetHeight;
            const maxHeightProfile = Math.max(profileHeight, socialHeight);
            profileCard.style.height = `${maxHeightProfile}px`;
            socialCard.style.height = `${maxHeightProfile}px`;
        }
        if (journeyCard && coffeeCard) {
            journeyCard.style.height = 'auto';
            coffeeCard.style.height = 'auto';
            const journeyHeight = journeyCard.offsetHeight;
            const coffeeHeight = coffeeCard.offsetHeight;
            const maxHeightJourney = Math.max(journeyHeight, coffeeHeight);
            journeyCard.style.height = `${maxHeightJourney}px`;
            coffeeCard.style.height = `${maxHeightJourney}px`;
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

});