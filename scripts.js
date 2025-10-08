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

// Inicializar EmailJS con tu Public Key (para v4 - REEMPLAZA CON EL REAL)
emailjs.init("IKUkRhnZ6eu1NSnBO");  // Tu Public Key de emailjs.com

// Lista de dominios reales permitidos (para validar emails "reales")
const allowedDomains = [
  'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com',
  'protonmail.com', 'aol.com', 'live.com', 'msn.com'
];

// Función para validar dominio real
function isValidDomain(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return allowedDomains.some(allowed => domain === allowed || domain?.endsWith('.' + allowed));
}

// Navegación móvil
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
        });
    })
    .then(() => {
        alert('Registro exitoso. Se ha enviado un email de verificación. Revisa tu bandeja (incluyendo spam).');
        registerForm.reset();
        hideModal();
    })
    .catch((error) => {
        console.error('Error en registro:', error.code, error.message);
        let message = 'Error desconocido.';
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'El email ya está registrado.';
                break;
            case 'auth/invalid-email':
                message = 'Email inválido.';
                break;
            case 'auth/weak-password':
                message = 'Contraseña débil. Usa al menos 6 caracteres.';
                break;
            default:
                message = error.message;
        }
        showError(errorEl, message);
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

// Efecto parallax en hero section (opcional)
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    hero.style.backgroundPosition = `center ${rate}px`;
});

// Animación de aparición para secciones (opcional)
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

document.querySelectorAll('.gallery, .contact').forEach(section => {
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
    if (modal) {
        modal.classList.add('active');
        console.log('Modal abierto:', modalId);
    }
}

function hideModal() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
}

function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        element.classList.add('show');
        setTimeout(() => {
            element.style.display = 'none';
            element.classList.remove('show');
        }, 5000);
    }
}

// Actualizar header para usuario logueado (con verificación)
function updateHeaderForLoggedIn(user) {
    const loginLink = document.getElementById('login-link');
    if (loginLink && user) {
        let headerText = '';
        if (user.emailVerified) {
            // Verificado: Muestra nombre y logout
            const name = user.email.split('@')[0];
            headerText = `<a href="#">Hola, ${name} (Cerrar Sesión)</a>`;
            loginLink.innerHTML = headerText;
            const logoutLink = loginLink.querySelector('a');
            if (logoutLink) {
                logoutLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    auth.signOut().then(() => {
                        alert('Sesión cerrada correctamente.');
                    }).catch((error) => {
                        console.error('Error al cerrar sesión:', error);
                        alert('Error al cerrar sesión.');
                    });
                });
            }
            // Cargar nombre completo de Firestore
            db.collection('users').doc(user.uid).get().then((doc) => {
                if (doc.exists) {
                    const fullName = doc.data().name;
                    loginLink.innerHTML = `<a href="#">Hola, ${fullName} (Cerrar Sesión)</a>`;
                    const newLogoutLink = loginLink.querySelector('a');
                    if (newLogoutLink) {
                        newLogoutLink.addEventListener('click', (e) => {
                            e.preventDefault();
                            auth.signOut().then(() => {
                                alert('Sesión cerrada correctamente.');
                            }).catch((error) => {
                                console.error('Error al cerrar sesión:', error);
                                alert('Error al cerrar sesión.');
                            });
                        });
                    }
                }
            }).catch((error) => {
                console.error('Error cargando nombre de Firestore:', error);
            });
        } else {
            // No verificado: Muestra mensaje y botón reenvío
            const name = user.email.split('@')[0];
            headerText = `Hola, ${name} - <span style="color: orange;">Email no verificado</span> <button id="resend-verification" style="background: none; border: none; color: blue; cursor: pointer; text-decoration: underline;">Reenviar Verificación</button> | <a href="#" style="color: red;">Cerrar Sesión</a>`;
            loginLink.innerHTML = headerText;
            // Event listener para reenvío (agregado dinámicamente)
            setTimeout(() => {
                const resendBtn = document.getElementById('resend-verification');
                if (resendBtn) {
                    resendBtn.addEventListener('click', () => {
                        user.sendEmailVerification().then(() => {
                            alert('Email de verificación reenviado. Revisa tu bandeja (incluyendo spam).');
                        }).catch((error) => {
                            console.error('Error reenviando verificación:', error);
                            alert('Error al reenviar. Intenta más tarde o contacta soporte.');
                        });
                    });
                }
            }, 100);
            // Logout link
            const logoutLink = loginLink.querySelector('a');
            if (logoutLink) {
                logoutLink.addEventListener('click', (e) => {
                    if (e.target.tagName !== 'BUTTON') {
                        e.preventDefault();
                        auth.signOut().then(() => {
                            alert('Sesión cerrada correctamente.');
                        }).catch((error) => {
                            console.error('Error al cerrar sesión:', error);
                            alert('Error al cerrar sesión.');
                        });
                    }
                });
            }
        }
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

// Toggle formulario de contacto (solo si verificado)
function toggleContactForm() {
    const user = auth.currentUser;
    console.log('toggleContactForm: Usuario autenticado:', !!user, 'Verificado:', user ? user.emailVerified : false);
    const contactForm = document.getElementById('contact-form-restricted');
    const contactLock = document.getElementById('contact-lock');
    const inputs = contactForm ? contactForm.querySelectorAll('input, textarea') : [];
    const submitBtn = document.getElementById('contact-submit');

    if (user && user.emailVerified) {
        console.log('Habilitando formulario (verificado)');
        inputs.forEach(input => input.disabled = false);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Mensaje';
        }
        if (contactLock) contactLock.style.display = 'none';
        if (contactForm) contactForm.reset();
    } else {
        console.log('Deshabilitando formulario (no logueado o no verificado)');
        inputs.forEach(input => input.disabled = true);
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = user ? 'Verifica tu Email para Enviar' : 'Inicia Sesión para Enviar';
        }
        if (contactLock) {
            contactLock.style.display = 'block';
            if (user && !user.emailVerified) {
                contactLock.innerHTML = '<p>🔒 Verifica tu email para enviar mensajes. <a href="#" id="contact-login-link">Reenviar Verificación</a></p>';
            } else {
                contactLock.innerHTML = '<p>🔒 Debes <a href="#" id="contact-login-link">iniciar sesión</a> para enviar mensajes.</p>';
            }
        }
    }
}

// Lógica de Login (completa)
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');

        if (!email || !password) {
            showError(errorEl, 'Email y contraseña son obligatorios.');
            return;
        }

        console.log('Iniciando login con email:', email);

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log('Login exitoso:', user.email, 'Verificado:', user.emailVerified);
                if (!user.emailVerified) {
                    alert('Login exitoso, pero verifica tu email para usar el formulario de contacto.');
                } else {
                    alert('¡Bienvenido! Puedes enviar mensajes ahora.');
                }
                loginForm.reset();
                hideModal();
            })
            .catch((error) => {
                console.error('Error en login:', error.code, error.message);
                let message = 'Error desconocido.';
                switch (error.code) {
                    case 'auth/user-not-found':
                        message = 'Usuario no encontrado. Regístrate primero.';
                        break;
                    case 'auth/wrong-password':
                        message = 'Contraseña incorrecta.';
                        break;
                    case 'auth/invalid-email':
                        message = 'Email inválido.';
                        break;
                    case 'auth/too-many-requests':
                        message = 'Demasiados intentos. Espera un momento.';
                        break;
                    default:
                        message = error.message;
                }
                showError(errorEl, message);
            });
    }
}

// Lógica de Registro (completa, con catch y switch completos)
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

        // Validaciones básicas
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
        // Validación de dominio real
        if (!isValidDomain(email)) {
            showError(errorEl, 'Usa un email real de un proveedor conocido (ej. @gmail.com, @outlook.com).');
            return;
        }

        console.log('Iniciando registro con email:', email);

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log('Usuario creado en Auth:', user.uid);
                // Enviar email de verificación
                return user.sendEmailVerification({
                    url: window.location.origin,  // Redirige a tu sitio después de verificar
                    handleCodeInApp: true
                }).then(() => {
                    // Guardar nombre en Firestore
                    return db.collection('users').doc(user.uid).set({
                        name: name,
                        email: email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                });