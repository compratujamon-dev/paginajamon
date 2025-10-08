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
    if (modal) modal.classList.add('active');
    console.log('Modal abierto:', modalId);
}

function hideModal() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
}

function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        element.classList.add('show');  // Asume CSS para .show { opacity: 1; }
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
            // Event listener para reenvío
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
            // Chequea verificación periódicamente si pendiente
            if (!user.emailVerified) {
                const checkInterval = setInterval(() => {
                    user.reload().then(() => {
                        const updatedUser  = auth.currentUser ;
                        if (updatedUser  && updatedUser .emailVerified) {
                            clearInterval(checkInterval);
                            alert('¡Email verificado! Recargando página...');
                            location.reload();
                        }
                    }).catch((error) => {
                        console.error('Error recargando usuario:', error);
                    });
                }, 10000);  // Cada 10 segundos
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
                e.preventDefault();
                showModal('login-modal');
            });
        }
    });