document.addEventListener('DOMContentLoaded', function() {
    // Inicjalizacje (AOS, Dark Mode, Nawigacja, etc.)
    AOS.init({ duration: 800, once: true, offset: 50 });
    const themeToggle = document.getElementById('themeToggleCheckbox');
    const navbar = document.getElementById('navbar');
    const backToTopBtn = document.getElementById('backToTopBtn');

    // Logika Trybu Ciemnego
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.body.classList.add(currentTheme);
        if (currentTheme === 'dark-mode') themeToggle.checked = true;
    }
    themeToggle.addEventListener('change', function() {
        document.body.classList.toggle('dark-mode');
        let theme = document.body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode';
        localStorage.setItem('theme', theme);
    });

    // Logika UI
    window.onscroll = () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) backToTopBtn.style.display = "block";
        else backToTopBtn.style.display = "none";
    };
    backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Logika FAQ
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const faqItem = button.parentElement;
            faqItem.classList.toggle('active');
        });
    });

    // --- OSTATECZNA LOGIKA DLA STRONY DOSTĘPU ---
    const checkCodeBtn = document.getElementById('checkCodeBtn');
    if (checkCodeBtn) {
        const codeInput = document.getElementById('codeInput');
        const downloadContainer = document.getElementById('downloadContainer');
        const errorMessage = document.getElementById('errorMessage');
        const fileToDownload = 'pliki/szablon-pro.zip';

        async function handleCodeCheck() {
            const enteredCode = codeInput.value.trim();
            if (!enteredCode) {
                errorMessage.textContent = "Proszę wpisać kod.";
                errorMessage.style.display = 'block';
                return;
            }

            checkCodeBtn.disabled = true;
            checkCodeBtn.textContent = 'Sprawdzanie...';
            errorMessage.style.display = 'none';
            downloadContainer.style.display = 'none';

            try {
                // "Dzwonimy" do naszej funkcji na Netlify
                const response = await fetch('/api/verifyCode', {
                    method: 'POST',
                    // --- OTO KLUCZOWA POPRAWKA ---
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ code: enteredCode })
                });

                const data = await response.json();

                if (response.ok) { // Status 2xx (sukces)
                    downloadContainer.style.display = 'block';
                    const downloadLink = downloadContainer.querySelector('a');
                    downloadLink.href = fileToDownload;
                } else { // Status 4xx lub 5xx (błąd)
                    errorMessage.textContent = data.message || 'Wystąpił nieznany błąd.';
                    errorMessage.style.display = 'block';
                }

            } catch (error) {
                console.error('Błąd podczas komunikacji z serwerem:', error);
                errorMessage.textContent = 'Błąd połączenia. Spróbuj ponownie później.';
                errorMessage.style.display = 'block';
            } finally {
                checkCodeBtn.disabled = false;
                checkCodeBtn.textContent = 'Pobierz szablon';
            }
        }

        checkCodeBtn.addEventListener('click', handleCodeCheck);
        codeInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') handleCodeCheck();
        });
    }
});