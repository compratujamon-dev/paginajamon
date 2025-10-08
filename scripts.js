// Inicializar Firebase (REEMPLAZA CON TU firebaseConfig REAL de Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyD...TU_API_KEY_AQUI",  // Ejemplo: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
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
            observer.unobserve(entry.target);
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

// Función para mostrar/ocultar modales
function showModal(modalId) {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function hideModal() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
}

// Función para mostrar errores
function showError(element, message) {
    if (element) {
        element.innerHTML = message;
        element.classList.add('show');
        setTimeout(() => element.classList.remove('show'), 5000);
    }
}

// Función para actualizar header con usuario (adaptada a Firebase)
function updateHeaderForLoggedIn(user) {
    const loginLink = document.getElementById('login-link');
    if (loginLink && user) {
        // Recupera nombre de Firestore
        db.collection('users').doc(user.uid).get().then((doc) => {
            const name = doc.exists ? doc.data().name : user.email.split('@')[0];
            loginLink.innerHTML = `<a href="#">Hola, ${name} (Cerrar Sesión)</a>`;
            const logoutLink = loginLink.querySelector('a');
            if (logoutLink) {
                logoutLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    auth.signOut().then(() => {
                        alert('Sesión cerrada.');
                    }).catch((error) => {
                        console.error('Error al cerrar sesión:', error);
                        alert('Error al cerrar sesión.');
                    });
                });
            }
        }).catch((error) => {
            console.error('Error al obtener datos de usuario:', error);
            // Fallback: Usa email como nombre
            loginLink.innerHTML = `<a href="#">Hola, ${user.email.split('@')[0]} (Cerrar Sesión)</a>`;
            // Agrega listener de logout igual
            const logoutLink = loginLink.querySelector('a');
            if (logoutLink) {
                logoutLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    auth.signOut().then(() => alert('Sesión cerrada.')).catch(() => alert('Error al cerrar sesión.'));
                });
            }
        });
    } else if (loginLink) {
        loginLink.innerHTML = '<a href="#" id="show-login">Iniciar Sesión</a>';
        const showLoginBtn = document.getElementById('show-login');
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showModal('login-modal');
            });
        }
    }
}

// Función para habilitar/deshabilitar formulario de contacto basado en sesión (adaptada a Firebase)
function toggleContactForm() {
    const user = auth.currentUser ;
    console.log('toggleContactForm: Usuario autenticado:', !!user);
    const contactForm = document.getElementById('contact-form-restricted');
    const contactLock = document.getElementById('contact-lock');
    const inputs = contactForm ? contactForm.querySelectorAll('input, textarea') : [];
    const submitBtn = document.getElementById('contact-submit');

    if (user) {
        // Habilitar: Permitir enviar mensajes
        console.log('Habilitando formulario');
        inputs.forEach(input => input.disabled = false);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Mensaje';
        }
        if (contactLock) {
            contactLock.classList.add('hidden'); // Ocultar mensaje
        }
        if (contactForm) contactForm.reset();
    } else {
        // Deshabilitar: Bloquear envío de mensajes
        console.log('Deshabilitando formulario');
        inputs.forEach(input => input.disabled = true);
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Inicia Sesión para Enviar';
        }
        if (contactLock) {
            contactLock.classList.remove('hidden'); // Mostrar mensaje
        }
    }
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

    // Listener para cambios de estado de auth (persistencia automática de Firebase)
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('Usuario logueado:', user.email);
            updateHeaderForLoggedIn(user);
            toggleContactForm(); // Habilitar si logueado
        } else {
            console.log('No hay usuario logueado');
            updateHeaderForLoggedIn(null);
            toggleContactForm(); // Deshabilitar
        }
    });

    // Event listeners para modales
    const showLoginBtn = document.getElementById('show-login');
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showModal('login-modal');
        });
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
            hideModal();
            showModal('register-modal');
        });
    }

    const showLoginFromReg = document.getElementById('show-login-from-reg');
    if (showLoginFromReg) {
        showLoginFromReg.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal();
            showModal('login-modal');
        });
    }

    // Lógica de Registro con Firebase
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

            // Crear usuario en Firebase Auth
            auth.createUser WithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    // Guardar datos adicionales en Firestore
                    db.collection('users').doc(user.uid).set({
                        name: name,
                        email: email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(() => {
                        alert('¡Registro exitoso! Bienvenido.');
                        registerForm.reset();
                        hideModal();
                        // El onAuthStateChanged se activará automáticamente para habilitar formulario y header
                    }).catch((error) => {
                        console.error('Error al guardar en Firestore:', error);
                        showError(errorEl, 'Error al guardar datos de usuario.');
                    });
                })
                .catch((error) => {
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

    // Lógica de Login con Firebase
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

            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    alert(`¡Bienvenido!`);
                    loginForm.reset();
                    hideModal();
                    // onAuthStateChanged maneja el header y formulario automáticamente
                })
                .catch((error) => {
                    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                        showError(errorEl, 'Correo o contraseña incorrectos.');
                    } else {
                        showError(errorEl, 'Error en login: ' + error.message);
                    }
                });
        });
    }

    // Event listener para enlace "iniciar sesión" en mensaje de bloqueo
    const contactLoginLink = document.getElementById('contact-login-link');
    if (contactLoginLink) {
        contactLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showModal('login-modal');
        });
    }

    // Validación y envío del formulario con EmailJS (adaptado a Firebase)
    const contactFormRestricted = document.getElementById('contact-form-restricted');
    if (contactFormRestricted) {
        contactFormRestricted.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!auth.currentUser ) {
                alert('Debes iniciar sesión para enviar mensajes.');
                showModal('login-modal');
                return;
            }

            const inputs = contactFormRestricted.querySelectorAll('input, textarea');
            const emailInput = contactFormRestricted.querySelector('input[type="email"]');
            let isValid = true;

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
                emailjs.sendForm('service_etfwtmm', 'template_g0u3p8s', contactFormRestricted)
                    .then(() => {
                        alert('¡Mensaje enviado con éxito! Te contactaremos pronto.');
                        contactFormRestricted.reset();
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

    // Inicializar estado del formulario (se llamará via onAuthStateChanged)
    toggleContactForm();
});