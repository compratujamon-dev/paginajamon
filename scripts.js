// Inicializar Firebase (REEMPLAZA CON TU firebaseConfig REAL de Firebase Console - ¡OBLIGATORIO!)
const firebaseConfig = {
 apiKey: "AIzaSyBaLo-MYL1r_2dskPwhvs922f07lZNGIvo",
  authDomain: "solocorte-auth.firebaseapp.com",
  projectId: "solocorte-auth",
  storageBucket: "solocorte-auth.firebasestorage.app",
  messagingSenderId: "567755213765",
  appId: "1:567755213765:web:30c6d1586048f5a78119ac",
  measurementId: "G-VVCV84Y6W4"	
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

// Inicializar EmailJS con tu Public Key (para v4)
emailjs.init("IKUkRhnZ6eu1NSnBO");  // Reemplaza con tu Public Key real

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

// Efecto parallax en hero section (opcional, ajusta si no lo quieres)
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

// Actualizar header para usuario logueado (con verificación)
function updateHeaderForLoggedIn(user) {
    const loginLink = document.getElementById('login-link');
    if (loginLink && user) {
        let headerText = '';
        if (user.emailVerified) {
            // Verificado: Muestra nombre y logout
            const name = user.email.split('@')[0];
            headerText = `<a href="#">Hola, ${name} (Cerrar Sesión)</a>`;
            const logoutLink = loginLink.querySelector('a');
            if (logoutLink) {
                logoutLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    auth.signOut().then(() => alert('Sesión cerrada.')).catch(() => alert('Error.'));
                });
            }
            // Cargar nombre completo de Firestore
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
        } else {
            // No verificado: Muestra mensaje y botón reenvío
            const name = user.email.split('@')[0];
            headerText = `Hola, ${name} - <span style="color: orange;">Email no verificado</span> <button id="resend-verification" style="background: none; border: none; color: blue; cursor: pointer;">Reenviar Verificación</button>`;
            loginLink.innerHTML = headerText;
            // Event listener para reenvío
            const resendBtn = document.getElementById('resend-verification');
            if (resendBtn) {
                resendBtn.addEventListener('click', () => {
                    user.sendEmailVerification().then(() => {
                        alert('Email de verificación reenviado. Revisa tu bandeja.');
                    }).catch((error) => {
                        console.error('Error reenviando:', error);
                        alert('Error al reenviar. Intenta más tarde.');
                    });
                });
            }
            // Logout funcional
            const logoutPart = loginLink.querySelector('a');
            if (logoutPart) {
                logoutPart.addEventListener('click', (e) => {
                    if (e.target.tagName !== 'BUTTON') {
                        e.preventDefault();
                        auth.signOut().then(() => alert('Sesión cerrada.')).catch(() => alert('Error.'));
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
    const user = auth.currentUser ;
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
        if (contactLock) contactLock.style.display = 'none';  // Oculta lock
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
            contactLock.innerHTML = user ? 
                '<p>🔒 Verifica tu email para enviar mensajes. <a href="#" id="contact-login-link">Reenviar Verificación</a></p>' :
                '<p>🔒 Debes <a href="#" id="contact-login-link">iniciar sesión</a> para enviar mensajes.</p>';
        }
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

    // Auth state change (con verificación)
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('Usuario logueado:', user.email, 'Verificado:', user.emailVerified);
            updateHeaderForLoggedIn(user);
            toggleContactForm();
            // Recarga verificación si es necesario (Firebase actualiza en ~1 min)
            if (!user.emailVerified) {
                setTimeout(() => {
                    user.reload().then(() => {
                        const updatedUser  = auth.currentUser ;
                        if (updatedUser  && updatedUser .emailVerified !== user.emailVerified) {
                            location.reload();  // Recarga página para actualizar UI
                        }
                    });
                }, 5000);  // Chequea cada 5s hasta verificar
            }
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

    // Lógica de Registro (con validación de dominio y envío de verificación)
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
                        url: window.location.origin + '/#inicio',  // Redirige a tu sitio después de verificar
                        handleCodeInApp: true
                    }).then(() => {
                        console.log('Email de verificación enviado');
                        return db.collection('users').doc(user.uid).set({
                            name: name,
                            email: email,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    });
                })
                .then(() => {
                    console.log('Datos guardados en Firestore exitosamente');
                    alert('¡Registro exitoso! Revisa tu email para verificar tu cuenta y poder enviar mensajes.');
                    registerForm.reset();
                    hideModal();
                    // No habilita form hasta verificación
                })
                .catch((error) => {
                    console.error('Error en registro:', error.code, error.message);
                    if (error.code === 'auth/email-already-in-use') {
                        showError(errorEl, 'Este correo ya está registrado. Inicia sesión.');
                    } else if (error.code === 'auth/weak-password') {
                        showError(errorEl, 'La contraseña es débil. Usa al menos 6 caracteres.');
                                } else if (error.code === 'auth/invalid-email') {
                                        showError(errorEl, 'El correo electrónico no es válido.');
                                    } else {
                                        showError(errorEl, 'Error en el registro: ' + error.message);
                                    }
                                });
                    });
                    
                        // Listener para contacto login link (en lock)
                        document.addEventListener('click', (e) => {
                            if (e.target && e.target.id === 'contact-login-link') {
                                e.preventDefault();
                                e.stopPropagation();
                                hideModal();
                                showModal('login-modal');
                            }
                        });
                    
                        // Lógica de Login
                        const loginForm = document.getElementById('login-form');
                        if (loginForm) {
                            loginForm.addEventListener('submit', (e) => {
                                e.preventDefault();
                                const email = document.getElementById('login-email').value.trim();
                                const password = document.getElementById('login-password').value;
                                const errorEl = document.getElementById('login-error');
                    
                                if (!email || !password) {
                                    showError(errorEl, 'Completa ambos campos.');
                                    return;
                                }
                                auth.signInWithEmailAndPassword(email, password)
                                    .then((userCredential) => {
                                        const user = userCredential.user;
                                        if (!user.emailVerified) {
                                            showError(errorEl, 'Verifica tu email antes de enviar mensajes.');
                                        }
                                        loginForm.reset();
                                        hideModal();
                                    })
                                    .catch((error) => {
                                        if (error.code === 'auth/wrong-password') {
                                            showError(errorEl, 'Contraseña incorrecta.');
                                        } else if (error.code === 'auth/user-not-found') {
                                            showError(errorEl, 'Usuario no encontrado.');
                                        } else if (error.code === 'auth/invalid-email') {
                                            showError(errorEl, 'Email inválido.');
                                        } else {
                                            showError(errorEl, 'Error: ' + error.message);
                                        }
                                    });
                            });
                        }
                    
                        // Lógica de envío de contacto (solo si verificado)
                        const contactForm = document.getElementById('contact-form-restricted');
                        if (contactForm) {
                            contactForm.addEventListener('submit', (e) => {
                                e.preventDefault();
                                const user = auth.currentUser;
                                const name = document.getElementById('contact-name').value.trim();
                                const email = document.getElementById('contact-email').value.trim();
                                const message = document.getElementById('contact-message').value.trim();
                                const errorEl = document.getElementById('contact-error');
                    
                                if (!user || !user.emailVerified) {
                                    showError(errorEl, 'Debes iniciar sesión y verificar tu email.');
                                    return;
                                }
                                if (!name || !email || !message) {
                                    showError(errorEl, 'Completa todos los campos.');
                                    return;
                                }
                                if (!isValidDomain(email)) {
                                    showError(errorEl, 'Usa un email real de un proveedor conocido.');
                                    return;
                                }
                    
                                // Envía con EmailJS
                                emailjs.send("service_etfwtmm", "template_g0u3p8s", {
                                    from_name: name,
                                    from_email: email,
                                    message: message
                                })
                                .then(() => {
                                    alert('Mensaje enviado correctamente.');
                                    contactForm.reset();
                                })
                                .catch((error) => {
                                    showError(errorEl, 'Error al enviar: ' + error.text || error.message);
                                });
                            });
                        }
                    });