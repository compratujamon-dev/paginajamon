// Inicializar Firebase (REEMPLAZA CON TU firebaseConfig REAL de Firebase Console - ¡OBLIGATORIO!)
const firebaseConfig = {
  apiKey: "AIzaSyD...TU_API_KEY_AQUI",  // COPIA EL REAL AQUÍ (de Project Settings)
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Inicializar Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase inicializado correctamente');
} catch (error) {
  console.error('Error al inicializar Firebase:', error);
}
const auth = firebase.auth();
const db = firebase.firestore();

// Inicializar EmailJS con tu Public Key
emailjs.init("IKUkRhnZ6eu1NSnBO");

// Navegación móvil
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
}

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
    });
});

// Smooth scroll para enlaces de navegación (excluye modales)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const modalLinkIds = ['show-login', 'show-register', 'show-login-from-reg', 'contact-login-link'];
        if (modalLinkIds.includes(this.id) || this.getAttribute('href') === '#') {
            return;
        }
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
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
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.types-grid, .steps, .gallery-grid, .contact-form').forEach(section => {
    section.style.opacity = 0;
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Precarga de imágenes
function preloadImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (src && !img.complete) {
            new Image().src = src;
        }
    });
}

// Funciones para modales
function showModal(modalId) {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
    console.log('Modal abierto:', modalId);
}

function hideModal() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
}

function showError(element, message) {
    if (element) {
        element.innerHTML = message;
        element.classList.add('show');
        setTimeout(() => element.classList.remove('show'), 5000);
    }
}

// Actualizar header para usuario logueado
function updateHeaderForLoggedIn(user) {
    const loginLink = document.getElementById('login-link');
    if (loginLink && user) {
        const name = user.email.split('@')[0];
        loginLink.innerHTML = `<a href="#">Hola, ${name} (Cerrar Sesión)</a>`;
        const logoutLink = loginLink.querySelector('a');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                auth.signOut().then(() => alert('Sesión cerrada.')).catch(() => alert('Error.'));
            });
        }
        db.collection('users').doc(user.uid).get().then((doc) => {
            if (doc.exists) {
                const fullName = doc.data().name;
                loginLink.innerHTML = `<a href="#">Hola, ${fullName} (Cerrar Sesión)</a>`;
                const newLogoutLink = loginLink.querySelector('a');
                if (newLogoutLink) newLogoutLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    auth.signOut().then(() => alert('Sesión cerrada.')).catch(() => alert('Error.'));
                });
            }
        }).catch((error) => console.error('Error Firestore:', error));
    } else if (loginLink) {
        loginLink.innerHTML = '<a href="#" id="show-login">Iniciar Sesión</a>';
        const showLoginBtn = document.getElementById('show-login');
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                showModal('login-modal');
            });
        }
    }
}

// Toggle formulario de contacto
function toggleContactForm() {
    const user = auth.currentUser ;
    console.log('toggleContactForm: Usuario autenticado:', !!user);
    const contactForm = document.getElementById('contact-form-restricted');
    const contactLock = document.getElementById('contact-lock');
    const inputs = contactForm ? contactForm.querySelectorAll('input, textarea') : [];
    const submitBtn = document.getElementById('contact-submit');

    if (user) {
        console.log('Habilitando formulario');
        inputs.forEach(input => input.disabled = false);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Mensaje';
        }
        if (contactLock) contactLock.classList.add('hidden');
        if (contactForm) contactForm.reset();
    } else {
        console.log('Deshabilitando formulario');
        inputs.forEach(input => input.disabled = true);
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Inicia Sesión para Enviar';
        }
        if (contactLock) contactLock.classList.remove('hidden');
    }
}

// DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, inicializando...');
    preloadImages();

    setTimeout(() => {
        const hero = document.querySelector('.hero');
        if (hero) hero.style.opacity = 1;
    }, 100);

    // Auth state change
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('Usuario logueado:', user.email);
            updateHeaderForLoggedIn(user);
            toggleContactForm();
        } else {
            console.log('No hay usuario logueado');
            updateHeaderForLoggedIn(null);
            toggleContactForm();
        }
    });

    // Listeners para modales
    console.log('Agregando listeners de modales...');
    const showLoginBtn = document.getElementById('show-login');
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            console.log('Clic en show-login detectado');
            e.preventDefault();
            e.stopPropagation();
            showModal('login-modal');
        });
    } else {
        console.error('Elemento #show-login no encontrado');
    }

    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', hideModal);
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideModal();
        });
    });

    const showRegFromLogin = document.getElementById('show-register');
    if (showRegFromLogin) {
        showRegFromLogin.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            hideModal();
            showModal('register-modal');
        });
    }

    const showLoginFromReg = document.getElementById('show-login-from-reg');
    if (showLoginFromReg) {
        showLoginFromReg.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
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

            console.log('Iniciando registro con email:', email);

            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    console.log('Usuario creado en Auth:', user.uid);
                    return db.collection('users').doc(user.uid).set({
                        name: name,
                        email: email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                })
                .then(() => {
                    console.log('Datos guardados en Firestore exitosamente');
                    alert('¡Registro exitoso! Bienvenido.');
                    registerForm.reset();
                    hideModal();
                })
                .catch((error) => {
                    console.error('Error en registro:', error.code, error.message);
                    if (error.code === 'auth/email-already-in-use') {
                        showError(errorEl, 'Este correo ya está registrado. Inicia sesión.');
                    } else if (error.code === 'auth/weak-password') {
                        showError(errorEl, 'La contraseña es débil. Usa al menos 6 caracteres.');
                    } else {
                        showError(errorEl, 'Error en registro: ' + error.message);
                    }
                });
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

            console.log('Iniciando login con email:', email);

            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    console.log('Login exitoso:', user.email);
                    alert('¡Bienvenido!');
                    loginForm.reset();
                    hideModal();
                })
                .catch((error) => {
                    console.error('Error en login:', error.code, error.message);
                    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                        showError(errorEl, 'Correo o contraseña incorrectos.');
                    } else {
                        showError(errorEl, 'Error en login: ' + error.message);
                    }
                });
        });
    }

    // Enlace en contacto
    const contactLoginLink = document.getElementById('contact-login-link');
    if (contactLoginLink) {
        contactLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showModal('login-modal');
        });
    }

    // Submit de contacto (FIX COMPLETO: Envía mensaje con datos de usuario)
    const contactFormRestricted = document.getElementById('contact-form-restricted');
    if (contactFormRestricted) {
        contactFormRestricted.addEventListener('submit', (e) => {
            e.preventDefault();

            const user = auth.currentUser ;
            if (!user) {
                alert('Debes iniciar sesión para enviar mensajes.');
                showModal('login-modal');
                return;
            }

            // Obtener datos del formulario
            const fromName = contactFormRestricted.querySelector('input[name="from_name"]').value.trim();
            const fromEmail = contactFormRestricted.querySelector('input[name="from_email"]').value.trim();
            const message = contactFormRestricted.querySelector('textarea[name="message"]').value.trim();

            // Validación
            if (!fromName || !fromEmail || !message) {
                alert('Por favor, completa todos los campos correctamente.');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(fromEmail)) {
                alert('Email inválido