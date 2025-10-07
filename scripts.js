// Inicializar EmailJS con tu Public Key
emailjs.init("IKUkRhnZ6eu1NSnBO");

// Navegación móvil
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
    });
});

// Smooth scroll para enlaces de navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Efecto parallax en hero section
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    hero.style.backgroundPosition = `center ${rate}px`;
});

// Animación de aparición para secciones
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target); // Para optimizar
        }
    });
}, observerOptions);

// Aplicar animación a las secciones
document.querySelectorAll('.types-grid, .steps, .gallery-grid, .contact-form').forEach(section => {
    section.style.opacity = 0;
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Validación y envío del formulario con EmailJS
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const inputs = contactForm.querySelectorAll('input, textarea');
        const emailInput = contactForm.querySelector('input[type="email"]');
        let isValid = true;

        // Regex simple para validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = 'red';
                isValid = false;
            } else {
                input.style.borderColor = '#ddd';
                if (input === emailInput && !emailRegex.test(input.value)) {
                    input.style.borderColor = 'red';
                    isValid = false;
                }
            }
        });

        if (isValid) {
            // Enviar formulario con EmailJS
            emailjs.sendForm('service_etfwtmm', 'template_g0u3p8s', contactForm)
                .then(() => {
                    alert('¡Mensaje enviado con éxito! Te contactaremos pronto.');
                    contactForm.reset();
                    inputs.forEach(input => input.style.borderColor = '#ddd');
                }, (error) => {
                    console.error('Error al enviar:', error);
                    alert('Error al enviar el mensaje. Inténtalo de nuevo.');
                });
        } else {
            alert('Por favor, completa todos los campos correctamente.');
        }
    });
}

// Precarga de imágenes para mejor rendimiento
function preloadImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (src && !img.complete) {
            new Image().src = src;
        }
    });
}

// Inicializar cuando el documento esté cargado
document.addEventListener('DOMContentLoaded', () => {
    preloadImages();

    // Asegurar que el hero section se muestre correctamente
    setTimeout(() => {
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.opacity = 1;
        }
    }, 100);

    // Sistema de Autenticación
    let currentUser  = null; // Para rastrear sesión activa

    // Función para mostrar/ocultar modales
    function showModal(modalId) {
        document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
        document.getElementById(modalId).classList.add('active');
    }

    function hideModal() {
        document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
    }

    // Funciones auxiliares para localStorage ("BD")
    function getUsersFromStorage() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    }

    function saveUsersToStorage(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    function showError(element, message) {
        element.innerHTML = message;
        element.classList.add('show');
        // Limpiar error después de 5s
        setTimeout(() => element.classList.remove('show'), 5000);
    }

    function updateHeaderForLoggedIn() {
        const loginLink = document.getElementById('login-link');
        if (loginLink && currentUser ) {
            loginLink.innerHTML = `<a href="#">Hola, ${currentUser .name} (Cerrar Sesión)</a>`;
            const logoutLink = loginLink.querySelector('a');
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                currentUser  = null;
                localStorage.removeItem('currentUser ');
                loginLink.innerHTML = '<a href="#" id="show-login">Iniciar Sesión</a>';
                // Re-asignar event listener al nuevo botón
                const newShowLogin = document.getElementById('show-login');
                if (newShowLogin) {
                    newShowLogin.addEventListener('click', (e) => {
                        e.preventDefault();
                        showModal('login-modal');
                    });
                }
                alert('Sesión cerrada.');
            });
        }
    }

    // Event listeners para modales y autenticación
    // Botón para mostrar login
    const showLoginBtn = document.getElementById('show-login');
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showModal('login-modal');
        });
    }

    // Cerrar modales al clic en X
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', hideModal);
    });

    // Cerrar modal al clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideModal();
        });
    });

    // Enlace de registro desde login
    const showRegFromLogin = document.getElementById('show-register');
    if (showRegFromLogin) {
        showRegFromLogin.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal();
            showModal('register-modal');
        });
    }

    // Enlace de login desde registro
    const showLoginFromReg = document.getElementById('show-login-from-reg');
    if (showLoginFromReg) {
        showLoginFromReg.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal();
            showModal('login-modal');
        });
    }

    // Lógica de Registro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const confirmEmail = document.getElementById('reg-confirm-email').value.trim();
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm-password').value;

            const errorEl = document.getElementById('register-error');

            // Validaciones
            if (!name || !email || !confirmEmail || !password || !confirmPassword) {
                showError(errorEl, 'Todos los campos son obligatorios.');
                return;
            }

            if (email !== confirmEmail) {
                showError(errorEl, 'Los correos electrónicos no coinciden.');
                return;
            }

            if (password.length < 6) {
                showError(errorEl, 'La contraseña debe tener al menos 6 caracteres.');
                return;
            }

            if (password !== confirmPassword) {
                showError(errorEl, 'Las contraseñas no coinciden.');
                return;
            }

            // Verificar si email ya existe (consulta "BD")
            const users = getUsersFromStorage();
            if (users.find(user => user.email === email)) {
                showError(errorEl, 'Este correo ya está registrado. Inicia sesión.');
                return;
            }

            // Guardar nuevo usuario en localStorage
            const newUser  = { name, email, password }; // En producción: hashear password
            users.push(newUser );
            saveUsersToStorage(users);

            alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
            registerForm.reset();
            hideModal();
            showModal('login-modal');
        });
    }

    // Lógica de Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            const errorEl = document.getElementById('login-error');

            if (!email || !password) {
                showError(errorEl, 'Correo y contraseña son obligatorios.');
                return;
            }

            // Consultar "BD" localStorage
            const users = getUsersFromStorage();
            const user = users.find(u => u.email === email && u.password === password);

            if (!user) {
                let errorMsg = 'Correo o contraseña incorrectos.';
                if (!document.getElementById('show-register-error')) {
                    errorMsg += ' ¿No estás registrado? <a href="#" id="show-register-error">Regístrate aquí</a>';
                }
                showError(errorEl, errorMsg);

                // Agregar enlace dinámico si no existe
                const existingLink = document.getElementById('show-register-error');
                if (!existingLink) {
                    const link = document.createElement('a');
                    link.href = '#';
                    link.id = 'show-register-error';
                    link.innerHTML = 'Regístrate aquí';
                    link.style.color = '#8B4513'; // Usar primary-color
                    link.style.textDecoration = 'none';
                    link.style.cursor = 'pointer';
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        hideModal();
                        showModal('register-modal');
                    });
                    errorEl.appendChild(document.createTextNode(' '));
                    errorEl.appendChild(link);
                }
                return;
            }

            // Login exitoso
            currentUser  = user;
            localStorage.setItem('currentUser ', JSON.stringify(currentUser )); // Persistencia
            alert(`¡Bienvenido, ${user.name}!`);
            loginForm.reset();
            hideModal();
            updateHeaderForLoggedIn();
        });
    }

    // Cargar sesión si existe (persistencia)
    const savedUser  = localStorage.getItem('currentUser ');
    if (savedUser ) {
        currentUser  = JSON.parse(savedUser );
        updateHeaderForLoggedIn();
    }
});
