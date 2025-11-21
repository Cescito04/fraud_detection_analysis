// JavaScript for Fraud Detection System

// Configuration
// Détecter automatiquement l'URL de base (local ou production)
const API_BASE_URL = window.location.origin;
let transactionHistory = JSON.parse(localStorage.getItem('transactionHistory')) || [];

// DOM Elements - Will be initialized after DOM is loaded
let predictionForm;
let resultsSection;
let historyBody;
let loadingModalElement;
let navToggle;
let navMenu;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM chargé, initialisation de l\'application...');
    initializeApp();
});

function initializeApp() {
    // Initialize DOM elements
    predictionForm = document.getElementById('predictionForm');
    resultsSection = document.getElementById('resultsSection');
    historyBody = document.getElementById('historyBody');
    loadingModalElement = document.getElementById('loadingModal');
    navToggle = document.getElementById('navToggle');
    navMenu = document.getElementById('navMenu');
    
    // Check if essential elements exist
    if (!predictionForm) {
        console.error('❌ predictionForm non trouvé ! Vérifiez que le formulaire existe dans le HTML.');
        return;
    }
    
    if (!resultsSection) {
        console.error('❌ resultsSection non trouvé !');
    }
    
    if (!historyBody) {
        console.error('❌ historyBody non trouvé !');
    }
    
    console.log('✅ Éléments DOM initialisés');
    console.log('   - predictionForm:', !!predictionForm);
    console.log('   - resultsSection:', !!resultsSection);
    console.log('   - historyBody:', !!historyBody);
    console.log('   - loadingModalElement:', !!loadingModalElement);
    
    // Set default values
    setDefaultValues();
    
    // Load transaction history
    loadTransactionHistory();
    
    // Add form event listeners
    addFormEventListeners();
    
    // Initialize upload form
    initializeUploadForm();
    
    // Check API status
    checkAPIStatus();
    
    // Initialize scroll effects
    initScrollEffects();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize parallax effects
    initParallaxEffects();
    
    // Initialize interactive elements
    initInteractiveElements();
    
    console.log('✅ Application initialisée avec succès');
}

function initMobileMenu() {
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
}

function initScrollEffects() {
    // Navbar scroll effect with performance optimization
    let ticking = false;
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                const navbar = document.getElementById('mainNavbar');
                const scrollToTopBtn = document.getElementById('scrollToTop');
                const scrollY = window.scrollY;
                
                if (scrollY > 50 && navbar) {
                    navbar.style.boxShadow = '0 5px 30px rgba(0, 0, 0, 0.8)';
                } else if (navbar) {
                    navbar.style.boxShadow = '0 5px 30px rgba(0, 0, 0, 0.5)';
                }
                
                // Show/hide scroll to top button
                if (scrollToTopBtn) {
                if (scrollY > 300) {
                    scrollToTopBtn.style.display = 'flex';
                } else {
                    scrollToTopBtn.style.display = 'none';
                    }
                }
                
                // Update active nav link based on scroll position
                updateActiveNavLink();
                
                ticking = false;
            });
            
            ticking = true;
        }
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 100;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Update active nav
                updateActiveNavOnClick(this);
            }
        });
    });
    
    // Update active nav link based on scroll position
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 150;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    function updateActiveNavOnClick(clickedLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        clickedLink.classList.add('active');
    }
}

function initParallaxEffects() {
    // Parallax effect for geometric shapes
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const shapes = document.querySelectorAll('.geometric-shape');
        
        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.3;
            shape.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.05}deg)`;
        });
        
        // Parallax for hero content
        const heroContent = document.querySelector('.hero-content');
        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.2}px)`;
            heroContent.style.opacity = 1 - (scrolled / window.innerHeight) * 0.3;
        }
    });
}

function initInteractiveElements() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.stat-card, .feature-item, .form-container, .upload-container');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
    
    // Add focus effects to form inputs
    const formInputs = document.querySelectorAll('.form-input');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
            this.parentElement.style.transition = 'transform 0.3s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
}

// Particles removed - using CSS animations instead

function setDefaultValues() {
    // Set default values for form fields
    document.getElementById('gender').value = '1';
    document.getElementById('age').value = '37';
    document.getElementById('houseType').value = '0';
    document.getElementById('contactAvailable').value = '1';
    document.getElementById('homeCountry').value = '1';
    document.getElementById('accountNo').value = '12345';
    document.getElementById('cardExpiry').value = '202512';
    document.getElementById('cif').value = '67890';
    document.getElementById('amount').value = '0.00';
    document.getElementById('transactionCountry').value = '1';
    document.getElementById('currencyCode').value = '1';
    document.getElementById('largePurchase').value = '0';
    document.getElementById('productId').value = '3';
}

function addFormEventListeners() {
    if (!predictionForm) {
        console.error('❌ predictionForm non disponible pour ajouter les event listeners');
        return;
    }
    
    console.log('✅ Ajout des event listeners au formulaire');
    predictionForm.addEventListener('submit', handleFormSubmit);
    
    // Add real-time validation
    const inputs = predictionForm.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'Ce champ est requis');
        return false;
    }
    
    // Specific validations
    if (field.id === 'age' && (value < 18 || value > 100)) {
        showFieldError(field, 'L\'âge doit être entre 18 et 100 ans');
        return false;
    }
    
    if (field.id === 'amount' && value < 0) {
        showFieldError(field, 'Le montant ne peut pas être négatif');
        return false;
    }
    
    if (field.id === 'cardExpiry' && value < 202501) {
        showFieldError(field, 'La carte doit être valide');
        return false;
    }
    
    clearFieldError(event);
    return true;
}

function showFieldError(field, message) {
    clearFieldError({ target: field });
    field.classList.add('is-invalid');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(event) {
    const field = event.target;
    field.classList.remove('is-invalid');
    
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    console.log('📤 Soumission du formulaire de prédiction...');
    
    if (!predictionForm) {
        console.error('❌ predictionForm non disponible');
        showNotification('Erreur: formulaire non trouvé', 'error');
        return;
    }
    
    // Validate all fields
    const isValid = validateForm();
    if (!isValid) {
        showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
        return;
    }
    
    // Show loading modal
    if (loadingModalElement) {
        loadingModalElement.style.display = 'flex';
    }
    
    try {
        // Collect form data
        const transactionData = collectFormData();
        
        // Make API request
        const result = await analyzeTransaction(transactionData);
        
        // Display results
        displayResults(result, transactionData);
        
        // Add to history
        addToHistory(result, transactionData);
        
        // Show success notification
        showNotification('Analyse terminée avec succès', 'success');
        
    } catch (error) {
        console.error('Error analyzing transaction:', error);
        
        // Gérer les différents types d'erreurs
        let errorMessage = 'Erreur lors de l\'analyse';
        let errorType = 'error';
        
        if (error.message === 'MODEL_LOADING_TIMEOUT') {
            errorMessage = '⏳ Le modèle est en cours de chargement. Veuillez patienter quelques secondes et réessayer.';
            errorType = 'warning';
        } else if (error.message.startsWith('MODEL_LOAD_ERROR')) {
            errorMessage = '❌ Erreur lors du chargement du modèle: ' + error.message.replace('MODEL_LOAD_ERROR: ', '');
            errorType = 'error';
        } else if (error.message.includes('Modèle en cours de chargement') || error.message.includes('loading')) {
            errorMessage = '⏳ Le modèle est en cours de chargement. Veuillez patienter quelques secondes et réessayer.';
            errorType = 'warning';
        } else {
            errorMessage = 'Erreur lors de l\'analyse: ' + error.message;
        }
        
        showNotification(errorMessage, errorType);
        
        // Afficher un message dans la section résultats
        if (resultsSection) {
            resultsSection.style.display = 'block';
            resultsSection.innerHTML = `
                <div class="card">
                    <div class="card-header bg-warning text-dark">
                        <h5 class="mb-0"><i class="bi bi-hourglass-split"></i> Modèle en cours de chargement</h5>
                    </div>
                    <div class="card-body">
                        <p>Le modèle de détection de fraude est en cours de chargement en arrière-plan.</p>
                        <p class="mb-3">Cela peut prendre 10-30 secondes selon votre système.</p>
                        <button class="btn btn-primary" onclick="location.reload()">
                            <i class="bi bi-arrow-clockwise"></i> Actualiser la page
                        </button>
                        <button class="btn btn-outline-secondary ms-2" onclick="document.getElementById('predictionForm').dispatchEvent(new Event('submit'))">
                            <i class="bi bi-arrow-repeat"></i> Réessayer
                        </button>
                    </div>
                </div>
            `;
        }
    } finally {
        // Hide loading modal
        setTimeout(() => {
            if (loadingModalElement) {
                loadingModalElement.style.display = 'none';
            }
        }, 500); // Petit délai pour s'assurer que les résultats sont affichés
    }
}

function validateForm() {
    const requiredFields = predictionForm.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

function collectFormData() {
    // IMPORTANT: L'ordre des features doit correspondre exactement à celui du modèle
    // Ordre attendu: Gender, Age, HouseTypeID, ContactAvaliabilityID, HomeCountry, 
    // AccountNo, CardExpiryDate, TransactionAmount, TransactionCountry, LargePurchase, 
    // ProductID, CIF, TransactionCurrencyCode
    
    const data = {
        Gender: parseInt(document.getElementById('gender').value),
        Age: parseInt(document.getElementById('age').value),
        HouseTypeID: parseInt(document.getElementById('houseType').value),
        ContactAvaliabilityID: parseInt(document.getElementById('contactAvailable').value),
        HomeCountry: parseInt(document.getElementById('homeCountry').value),
        AccountNo: parseInt(document.getElementById('accountNo').value),
        CardExpiryDate: parseInt(document.getElementById('cardExpiry').value),
        TransactionAmount: parseFloat(document.getElementById('amount').value),
        TransactionCountry: parseInt(document.getElementById('transactionCountry').value),
        LargePurchase: parseInt(document.getElementById('largePurchase').value),
        ProductID: parseInt(document.getElementById('productId').value),
        CIF: parseInt(document.getElementById('cif').value),
        TransactionCurrencyCode: parseInt(document.getElementById('currencyCode').value)
    };
    
    // Vérification que toutes les valeurs sont valides
    for (const [key, value] of Object.entries(data)) {
        if (isNaN(value)) {
            throw new Error(`Valeur invalide pour ${key}: ${value}`);
        }
    }
    
    return data;
}

async function checkModelStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
        return { model_loaded: false, status: 'unknown' };
    }
}

async function analyzeTransaction(transactionData, retryCount = 0) {
    console.log('Données envoyées:', transactionData);
    
    // Vérifier d'abord si le modèle est chargé
    const modelStatus = await checkModelStatus();
    if (!modelStatus.model_loaded) {
        if (modelStatus.status === 'loading') {
            // Le modèle est en cours de chargement
            if (retryCount < 5) {
                // Attendre 3 secondes et réessayer
                await new Promise(resolve => setTimeout(resolve, 3000));
                return analyzeTransaction(transactionData, retryCount + 1);
            } else {
                throw new Error('MODEL_LOADING_TIMEOUT');
            }
        } else if (modelStatus.status === 'error') {
            throw new Error('MODEL_LOAD_ERROR: ' + (modelStatus.error || 'Erreur inconnue'));
        }
    }
    
    const response = await fetch(`${API_BASE_URL}/predict`, {
        credentials: 'include',  // Inclure les cookies de session
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur API:', errorData);
        
        // Gérer spécifiquement le cas 503 (Service Unavailable)
        if (response.status === 503 && errorData.status === 'loading') {
            if (retryCount < 5) {
                // Attendre 3 secondes et réessayer
                await new Promise(resolve => setTimeout(resolve, 3000));
                return analyzeTransaction(transactionData, retryCount + 1);
            } else {
                throw new Error('MODEL_LOADING_TIMEOUT');
            }
        }
        
        throw new Error(errorData.error || 'Erreur lors de l\'analyse');
    }
    
    const result = await response.json();
    console.log('Résultat reçu:', result);
    return result;
}

function displayResults(result, transactionData) {
    const prediction = result.predictions[0];
    const fraudProbability = prediction.confidence.fraud;
    const noFraudProbability = prediction.confidence.no_fraud;
    
    // Update prediction text
    const predictionText = document.getElementById('predictionText');
    if (predictionText) {
        predictionText.textContent = 
        prediction.prediction_label === 'fraud' ? '🚨 TRANSACTION SUSPECTE' : '✅ TRANSACTION LÉGITIME';
        predictionText.style.color = prediction.prediction_label === 'fraud' ? 'var(--color-danger)' : 'var(--color-success)';
    }
    
    // Update probabilities
    const fraudProbEl = document.getElementById('fraudProbability');
    if (fraudProbEl) {
        fraudProbEl.textContent = `${(fraudProbability * 100).toFixed(1)}%`;
    }
    
    const confidenceEl = document.getElementById('confidence');
    if (confidenceEl) {
        confidenceEl.textContent = `${(Math.max(fraudProbability, noFraudProbability) * 100).toFixed(1)}%`;
    }
    
    // Update risk bar with animation
    const riskBar = document.getElementById('riskBar');
    if (riskBar) {
    const riskPercentage = fraudProbability * 100;
    riskBar.style.width = '0%';
        
        // Set color based on risk
        if (fraudProbability > 0.5) {
            riskBar.style.background = 'var(--color-danger)';
        } else if (fraudProbability > 0.3) {
            riskBar.style.background = 'var(--color-warning)';
        } else {
            riskBar.style.background = 'var(--color-success)';
        }
    
    // Animate progress bar
    setTimeout(() => {
        riskBar.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        riskBar.style.width = `${riskPercentage}%`;
    }, 100);
    }
    
    // Update risk level
    const riskLevel = document.getElementById('riskLevel');
    if (riskLevel) {
    riskLevel.textContent = getRiskText(fraudProbability);
        
        // Set styling based on risk
        if (fraudProbability > 0.5) {
            riskLevel.style.color = 'var(--color-danger)';
            riskLevel.style.borderColor = 'var(--color-danger)';
        } else if (fraudProbability > 0.3) {
            riskLevel.style.color = 'var(--color-warning)';
            riskLevel.style.borderColor = 'var(--color-warning)';
        } else {
            riskLevel.style.color = 'var(--color-success)';
            riskLevel.style.borderColor = 'var(--color-success)';
        }
    }
    
    // Update recommendations
    updateRecommendations(fraudProbability, prediction);
    
    // Show results section with animation
    if (resultsSection) {
    resultsSection.style.display = 'block';
    resultsSection.style.opacity = '0';
    resultsSection.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
        resultsSection.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        resultsSection.style.opacity = '1';
        resultsSection.style.transform = 'translateY(0)';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
    }
    
    // Add confetti effect for low risk
    if (fraudProbability < 0.3) {
        createConfetti();
    }
}

function createConfetti() {
    const colors = ['#00f3ff', '#ff00ff', '#8b5cf6', '#00ff88', '#ffd700'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 8 + 4;
        const left = Math.random() * 100;
        const duration = Math.random() * 2 + 2;
        const delay = Math.random() * 0.5;
        
        confetti.style.position = 'fixed';
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        confetti.style.background = color;
        confetti.style.left = left + '%';
        confetti.style.top = '-10px';
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '10000';
        confetti.style.boxShadow = `0 0 ${size * 2}px ${color}`;
        confetti.style.animation = `confettiFall ${duration}s ease-in forwards`;
        confetti.style.animationDelay = delay + 's';
        
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), (duration + delay) * 1000);
    }
    
    // Add CSS for confetti animation
    if (!document.getElementById('confettiAnimation')) {
        const style = document.createElement('style');
        style.id = 'confettiAnimation';
        style.textContent = `
            @keyframes confettiFall {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh) rotate(720deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

function getRiskClass(fraudProbability) {
    if (fraudProbability > 0.5) return 'danger';
    if (fraudProbability > 0.3) return 'warning';
    return 'success';
}

function getRiskBarClass(fraudProbability) {
    if (fraudProbability > 0.5) return 'danger';
    if (fraudProbability > 0.3) return 'warning';
    return 'success';
}

function getRiskText(fraudProbability) {
    if (fraudProbability > 0.5) return '🔴 RISQUE ÉLEVÉ';
    if (fraudProbability > 0.3) return '🟡 RISQUE MODÉRÉ';
    return '🟢 RISQUE FAIBLE';
}

function getRiskBadgeClass(risk) {
    if (risk > 0.5) return 'danger';
    if (risk > 0.3) return 'warning';
    return 'success';
}

function updateRecommendations(fraudProbability, prediction) {
    const recommendationsDiv = document.getElementById('recommendations');
    if (!recommendationsDiv) return;
    
    let recommendations = '';
    
    if (prediction.prediction === 1) {
        recommendations = `
            <div style="background: rgba(251, 86, 7, 0.1); border-left: 4px solid var(--color-danger); padding: 1.5rem;">
                <h6 style="font-family: 'JetBrains Mono', monospace; color: var(--color-danger); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 2px;">
                    ⚠️ ACTIONS IMMÉDIATES REQUISES
                </h6>
                <ul style="list-style: none; padding: 0; margin: 0; color: var(--text-secondary);">
                    <li style="margin-bottom: 0.5rem;">• Bloquer temporairement la transaction</li>
                    <li style="margin-bottom: 0.5rem;">• Contacter le client immédiatement</li>
                    <li style="margin-bottom: 0.5rem;">• Vérifier l'historique des transactions</li>
                    <li>• Signaler au service de sécurité</li>
                </ul>
            </div>
        `;
    } else if (fraudProbability > 0.3) {
        recommendations = `
            <div style="background: rgba(255, 190, 11, 0.1); border-left: 4px solid var(--color-warning); padding: 1.5rem;">
                <h6 style="font-family: 'JetBrains Mono', monospace; color: var(--color-warning); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 2px;">
                    🛡️ SURVEILLANCE RENFORCÉE
                </h6>
                <ul style="list-style: none; padding: 0; margin: 0; color: var(--text-secondary);">
                    <li style="margin-bottom: 0.5rem;">• Analyser les patterns de transaction</li>
                    <li style="margin-bottom: 0.5rem;">• Vérifier l'historique du client</li>
                    <li style="margin-bottom: 0.5rem;">• Surveiller les transactions futures</li>
                    <li>• Considérer une vérification manuelle</li>
                </ul>
            </div>
        `;
    } else {
        recommendations = `
            <div style="background: rgba(6, 255, 165, 0.1); border-left: 4px solid var(--color-success); padding: 1.5rem;">
                <h6 style="font-family: 'JetBrains Mono', monospace; color: var(--color-success); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 2px;">
                    ✅ TRANSACTION APPROUVÉE
                </h6>
                <ul style="list-style: none; padding: 0; margin: 0; color: var(--text-secondary);">
                    <li style="margin-bottom: 0.5rem;">• Approuver la transaction</li>
                    <li style="margin-bottom: 0.5rem;">• Continuer la surveillance normale</li>
                    <li style="margin-bottom: 0.5rem;">• Enregistrer dans l'historique</li>
                    <li>• Maintenir le niveau de confiance</li>
                </ul>
            </div>
        `;
    }
    
    recommendationsDiv.innerHTML = recommendations;
}

function addToHistory(result, transactionData) {
    const prediction = result.predictions[0];
    const historyItem = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('fr-FR'),
        amount: transactionData.TransactionAmount,
        country: transactionData.TransactionCountry,
        prediction: prediction.prediction_label,
        risk: prediction.confidence.fraud,
        data: transactionData
    };
    
    transactionHistory.unshift(historyItem);
    
    // Keep only last 50 transactions
    if (transactionHistory.length > 50) {
        transactionHistory = transactionHistory.slice(0, 50);
    }
    
    // Save to localStorage
    localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
    
    // Update history display
    loadTransactionHistory();
}

function loadTransactionHistory() {
    if (historyBody) {
        historyBody.innerHTML = '';
        
        if (transactionHistory.length === 0) {
            historyBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        <i class="bi bi-inbox"></i> Aucune transaction analysée
                    </td>
                </tr>
            `;
            return;
        }
        
        transactionHistory.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.timestamp}</td>
                <td>${item.amount.toFixed(2)}€</td>
                <td>${getCountryName(item.country)}</td>
                <td>
                    <span style="padding: 0.5rem 1rem; border-radius: 0; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; border: 2px solid ${item.prediction === 'fraud' ? 'var(--color-danger)' : 'var(--color-success)'}; color: ${item.prediction === 'fraud' ? 'var(--color-danger)' : 'var(--color-success)'}; background: ${item.prediction === 'fraud' ? 'rgba(251, 86, 7, 0.1)' : 'rgba(6, 255, 165, 0.1)'};">
                        ${item.prediction === 'fraud' ? '🚨 Fraude' : '✅ Légitime'}
                    </span>
                </td>
                <td>
                    <span style="padding: 0.5rem 1rem; border-radius: 0; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; border: 2px solid ${getRiskBadgeClass(item.risk) === 'danger' ? 'var(--color-danger)' : getRiskBadgeClass(item.risk) === 'warning' ? 'var(--color-warning)' : 'var(--color-success)'}; color: ${getRiskBadgeClass(item.risk) === 'danger' ? 'var(--color-danger)' : getRiskBadgeClass(item.risk) === 'warning' ? 'var(--color-warning)' : 'var(--color-success)'};">
                        ${(item.risk * 100).toFixed(1)}%
                    </span>
                </td>
                <td>
                    <button style="padding: 0.5rem 1rem; background: transparent; border: 2px solid var(--color-primary); color: var(--color-primary); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.background='var(--color-primary)'; this.style.color='var(--text-primary)'" onmouseout="this.style.background='transparent'; this.style.color='var(--color-primary)'" onclick="viewTransactionDetails(${item.id})">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            `;
            historyBody.appendChild(row);
        });
    }
}

function getCountryName(countryCode) {
    const countries = {
        1: 'France',
        2: 'États-Unis',
        3: 'Royaume-Uni',
        4: 'Allemagne',
        5: 'Autre'
    };
    return countries[countryCode] || 'Inconnu';
}


function viewTransactionDetails(transactionId) {
    const transaction = transactionHistory.find(item => item.id === transactionId);
    if (!transaction) {
        console.error('Transaction non trouvée:', transactionId);
        showNotification('Transaction non trouvée', 'error');
        return;
    }
    
    // Create minimalist and compact modal
    const isFraud = transaction.prediction === 'fraud';
    const riskPercent = (transaction.risk * 100).toFixed(1);
    
    const modalHtml = `
        <div class="modal-custom" id="transactionModal" style="display: flex;">
            <div class="modal-content-minimal" style="background: rgba(26, 31, 53, 0.95) !important; color: #FFFFFF !important; border: 3px solid #FF006E !important;">
                <div class="modal-header-minimal" style="background: rgba(10, 14, 39, 0.5) !important; border-bottom: 2px solid #FF006E !important;">
                    <h2 style="color: #FF006E !important; font-family: 'JetBrains Mono', monospace !important; text-transform: uppercase !important;">Détails Transaction</h2>
                    <button type="button" class="btn-close-minimal" onclick="closeTransactionModal()" style="border: 2px solid #FF006E !important; color: #FF006E !important;">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                
                <div class="modal-body-minimal" style="background: rgba(10, 14, 39, 0.3) !important; color: #FFFFFF !important;">
                    <div class="result-minimal ${isFraud ? 'fraud' : 'legitimate'}" style="border: 3px solid ${isFraud ? '#FB5607' : '#06FFA5'} !important; background: rgba(10, 14, 39, 0.5) !important; color: ${isFraud ? '#FB5607' : '#06FFA5'} !important;">
                        <span class="result-icon-minimal">${isFraud ? '🚨' : '✅'}</span>
                        <div>
                            <div class="result-text-minimal" style="color: ${isFraud ? '#FB5607' : '#06FFA5'} !important;">${isFraud ? 'FRAUDE' : 'LÉGITIME'}</div>
                            <div class="result-percent-minimal" style="color: rgba(255, 255, 255, 0.7) !important;">${riskPercent}%</div>
                        </div>
                    </div>
                    
                    <div class="info-minimal">
                        <div class="info-line" style="background: rgba(10, 14, 39, 0.4) !important; border: 2px solid rgba(255, 0, 110, 0.2) !important; color: #FFFFFF !important;">
                            <span class="info-label-minimal" style="color: rgba(255, 255, 255, 0.6) !important;">Montant</span>
                            <span class="info-value-minimal" style="color: #FFFFFF !important;">${transaction.data.TransactionAmount.toFixed(2)}€</span>
                        </div>
                        <div class="info-line" style="background: rgba(10, 14, 39, 0.4) !important; border: 2px solid rgba(255, 0, 110, 0.2) !important; color: #FFFFFF !important;">
                            <span class="info-label-minimal" style="color: rgba(255, 255, 255, 0.6) !important;">Pays</span>
                            <span class="info-value-minimal" style="color: #FFFFFF !important;">${getCountryName(transaction.data.TransactionCountry)}</span>
                        </div>
                        <div class="info-line" style="background: rgba(10, 14, 39, 0.4) !important; border: 2px solid rgba(255, 0, 110, 0.2) !important; color: #FFFFFF !important;">
                            <span class="info-label-minimal" style="color: rgba(255, 255, 255, 0.6) !important;">Client</span>
                            <span class="info-value-minimal" style="color: #FFFFFF !important;">${transaction.data.Gender === 1 ? 'Homme' : 'Femme'}, ${transaction.data.Age} ans</span>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer-minimal" style="background: rgba(10, 14, 39, 0.5) !important; border-top: 2px solid #FF006E !important;">
                    <button type="button" class="btn-close-minimal-footer" onclick="closeTransactionModal()" style="background: #FF006E !important; color: #FFFFFF !important; border: 3px solid #FF006E !important;">Fermer</button>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('transactionModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Close on background click
    const modal = document.getElementById('transactionModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeTransactionModal();
            }
        });
    }
}

function closeTransactionModal() {
    const modal = document.getElementById('transactionModal');
    if (modal) {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    }
}

function getHouseTypeName(houseTypeId) {
    const types = {
        1: 'Maison',
        2: 'Appartement',
        3: 'Villa'
    };
    return types[houseTypeId] || 'Inconnu';
}

function getCurrencyName(currencyCode) {
    const currencies = {
        1: 'EUR',
        2: 'USD',
        3: 'GBP',
        4: 'Autre'
    };
    return currencies[currencyCode] || 'Inconnu';
}

function getProductName(productId) {
    const products = {
        1: 'Standard',
        2: 'Moyen',
        3: 'Premium'
    };
    return products[productId] || 'Inconnu';
}

function resetForm() {
    predictionForm.reset();
    setDefaultValues();
    resultsSection.style.display = 'none';
    showNotification('Formulaire réinitialisé', 'info');
}

function loadFraudExample() {
    // Load the detected fraud example
    document.getElementById('gender').value = '0';  // Femme
    document.getElementById('age').value = '37';
    document.getElementById('houseType').value = '0';  // Autre
    document.getElementById('contactAvailable').value = '1';  // Oui
    document.getElementById('homeCountry').value = '1';  // France
    document.getElementById('accountNo').value = '12345';
    document.getElementById('cardExpiry').value = '202512';  // Carte valide
    document.getElementById('cif').value = '67890';
    document.getElementById('amount').value = '0.00';  // Montant suspect
    document.getElementById('transactionCountry').value = '1';  // France
    document.getElementById('currencyCode').value = '1';  // EUR
    document.getElementById('largePurchase').value = '0';  // Achat normal
    document.getElementById('productId').value = '3';  // Premium
    
    // Hide results section
    resultsSection.style.display = 'none';
    
    // Show info message
    showNotification('Exemple de transaction frauduleuse chargé', 'info');
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 90;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

async function checkAPIStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            const data = await response.json();
            updateModelStatusIndicator(data);
            
            if (data.status === 'healthy') {
                console.log('✅ API is healthy and ready');
            } else if (data.status === 'loading') {
                console.log('⏳ Model is loading...');
                // Vérifier à nouveau dans 3 secondes
                setTimeout(checkAPIStatus, 3000);
            } else {
                console.warn('⚠️ API is not healthy:', data.status);
            }
        } else {
            console.error('❌ API is not responding');
        }
    } catch (error) {
        console.error('❌ Cannot connect to API:', error);
    }
}

function updateModelStatusIndicator(statusData) {
    // Créer ou mettre à jour l'indicateur de statut
    let statusIndicator = document.getElementById('modelStatusIndicator');
    
    if (!statusIndicator) {
        // Créer l'indicateur s'il n'existe pas
        statusIndicator = document.createElement('div');
        statusIndicator.id = 'modelStatusIndicator';
        statusIndicator.className = 'position-fixed bottom-0 end-0 m-3 p-2 rounded shadow';
        statusIndicator.style.cssText = 'z-index: 1050; background: white; min-width: 250px;';
        document.body.appendChild(statusIndicator);
    }
    
    let statusHTML = '';
    if (statusData.model_loaded) {
        statusHTML = `
            <div class="d-flex align-items-center">
                <span class="badge bg-success me-2"><i class="bi bi-check-circle"></i></span>
                <small><strong>Modèle prêt</strong></small>
            </div>
        `;
        statusIndicator.className = 'position-fixed bottom-0 end-0 m-3 p-2 rounded shadow bg-light';
    } else if (statusData.status === 'loading' || statusData.model_loading) {
        statusHTML = `
            <div class="d-flex align-items-center">
                <span class="spinner-border spinner-border-sm text-primary me-2" role="status"></span>
                <small><strong>Chargement du modèle...</strong></small>
            </div>
        `;
        statusIndicator.className = 'position-fixed bottom-0 end-0 m-3 p-2 rounded shadow bg-warning';
    } else {
        statusHTML = `
            <div class="d-flex align-items-center">
                <span class="badge bg-danger me-2"><i class="bi bi-exclamation-triangle"></i></span>
                <small><strong>Modèle non disponible</strong></small>
            </div>
        `;
        statusIndicator.className = 'position-fixed bottom-0 end-0 m-3 p-2 rounded shadow bg-light';
    }
    
    statusIndicator.innerHTML = statusHTML;
    
    // Masquer l'indicateur après 10 secondes si le modèle est chargé
    if (statusData.model_loaded) {
        setTimeout(() => {
            if (statusIndicator && statusData.model_loaded) {
                statusIndicator.style.transition = 'opacity 0.5s';
                statusIndicator.style.opacity = '0';
                setTimeout(() => {
                    if (statusIndicator.parentNode) {
                        statusIndicator.remove();
                    }
                }, 500);
            }
        }, 10000);
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Fonction pour fermer manuellement le modal de chargement
function closeLoadingModal() {
    if (loadingModal) {
        loadingModal.hide();
    }
}

// Batch upload functionality
let batchResults = null;

function initializeUploadForm() {
    console.log('🔧 Initialisation du formulaire d\'upload...');
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        console.log('✅ Formulaire uploadForm trouvé');
        uploadForm.addEventListener('submit', handleFileUpload);
        console.log('✅ Event listener attaché au formulaire');
    } else {
        console.error('❌ Formulaire uploadForm non trouvé !');
    }
    
    // Vérifier aussi le fileInput
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        console.log('✅ Input file trouvé');
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                console.log(`📄 Fichier sélectionné: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
                displayFileInfo(file);
            }
        });
    } else {
        console.error('❌ Input file non trouvé !');
    }
}

function displayFileInfo(file) {
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileLabelText = document.getElementById('fileLabelText');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const fileInput = document.getElementById('fileInput');
    
    if (fileInfo && fileName && fileSize && fileLabelText && analyzeBtn) {
        // Afficher les informations du fichier
        fileName.textContent = file.name;
        const sizeKB = (file.size / 1024).toFixed(2);
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        fileSize.textContent = file.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
        
        // Masquer le label et afficher les infos
        fileLabelText.style.display = 'none';
        fileInfo.style.display = 'flex';
        
        // Activer le bouton d'analyse
        analyzeBtn.disabled = false;
        
        // Ajouter une classe pour le style
        if (fileInput) {
            fileInput.closest('.file-input-wrapper')?.classList.add('file-selected');
        }
    }
}

function clearFileSelection() {
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileLabelText = document.getElementById('fileLabelText');
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    if (fileInput) {
        fileInput.value = '';
        fileInput.closest('.file-input-wrapper')?.classList.remove('file-selected');
    }
    
    if (fileInfo) {
        fileInfo.style.display = 'none';
    }
    
    if (fileLabelText) {
        fileLabelText.style.display = 'inline';
    }
    
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
    }
}

async function handleFileUpload(event) {
    event.preventDefault();
    console.log('📤 Début de l\'upload de fichier...');
    
    const fileInput = document.getElementById('fileInput');
    if (!fileInput) {
        console.error('❌ fileInput non trouvé');
        showNotification('Erreur: champ de fichier non trouvé', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    
    if (!file) {
        console.warn('⚠️ Aucun fichier sélectionné');
        showNotification('Veuillez sélectionner un fichier', 'error');
        return;
    }
    
    console.log(`📄 Fichier sélectionné: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    
    // Vérifier le format du fichier
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'json', 'xlsx', 'xls'].includes(fileExt)) {
        console.error(`❌ Format non supporté: ${fileExt}`);
        showNotification('Format de fichier non supporté. Utilisez CSV, JSON ou Excel.', 'error');
        return;
    }
    
    // Afficher le modal de chargement
    if (loadingModalElement) {
        loadingModalElement.style.display = 'flex';
    }
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        console.log('📦 FormData créé, envoi de la requête...');
        
        const response = await fetch(`${API_BASE_URL}/predict-batch`, {
            method: 'POST',
            body: formData,
            credentials: 'include'  // Inclure les cookies de session
        });
        
        console.log(`📥 Réponse reçue: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { error: `Erreur HTTP ${response.status}: ${response.statusText}` };
            }
            console.error('❌ Erreur serveur:', errorData);
            throw new Error(errorData.error || errorData.message || 'Erreur lors de l\'analyse');
        }
        
        const result = await response.json();
        console.log('✅ Résultat reçu:', result);
        batchResults = result;
        displayBatchResults(result);
        
        // Afficher un message de succès avec plus de détails
        const fraudCount = result.statistics.fraud || 0;
        const noFraudCount = result.statistics.no_fraud || 0;
        showNotification(
            `✅ Analyse terminée: ${result.statistics.total} transaction(s) - ${fraudCount} fraude(s) détectée(s)`, 
            'success'
        );
        
        // Scroll vers les résultats
        const batchResultsSection = document.getElementById('batchResultsSection');
        if (batchResultsSection) {
            batchResultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'upload:', error);
        showNotification('Erreur lors de l\'analyse: ' + error.message, 'error');
    } finally {
        setTimeout(() => {
            if (loadingModalElement) {
                loadingModalElement.style.display = 'none';
            }
        }, 500);
    }
}

function displayBatchResults(result) {
    const batchResultsSection = document.getElementById('batchResultsSection');
    const batchStatistics = document.getElementById('batchStatistics');
    const batchResultsTable = document.getElementById('batchResultsTable');
    
    if (!batchResultsSection || !batchStatistics || !batchResultsTable) {
        return;
    }
    
    // Afficher les statistiques
    const stats = result.statistics;
    batchStatistics.innerHTML = `
        <div class="row">
            <div class="col-md-3">
                <div class="card bg-primary text-white">
                    <div class="card-body text-center">
                        <h3>${stats.total}</h3>
                        <p class="mb-0">Total</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-danger text-white">
                    <div class="card-body text-center">
                        <h3>${stats.fraud}</h3>
                        <p class="mb-0">Fraudes</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body text-center">
                        <h3>${stats.legitimate}</h3>
                        <p class="mb-0">Légitimes</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-dark">
                    <div class="card-body text-center">
                        <h3>${stats.fraud_rate}%</h3>
                        <p class="mb-0">Taux de fraude</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Afficher le tableau des résultats
    let tableHTML = `
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Montant</th>
                        <th>Pays</th>
                        <th>Prédiction</th>
                        <th>Probabilité Fraude</th>
                        <th>Confiance</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    result.predictions.forEach((pred, index) => {
        const transaction = pred.transaction_data;
        const fraudProb = pred.confidence ? (pred.confidence.fraud * 100).toFixed(1) : 'N/A';
        const confidence = pred.confidence ? (Math.max(pred.confidence.fraud, pred.confidence.no_fraud) * 100).toFixed(1) : 'N/A';
        
        tableHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${transaction.TransactionAmount?.toFixed(2) || 'N/A'}€</td>
                <td>${getCountryName(transaction.TransactionCountry) || 'N/A'}</td>
                <td>
                    <span style="padding: 0.5rem 1rem; border-radius: 0; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; border: 2px solid ${pred.prediction_label === 'fraud' ? 'var(--color-danger)' : 'var(--color-success)'}; color: ${pred.prediction_label === 'fraud' ? 'var(--color-danger)' : 'var(--color-success)'}; background: ${pred.prediction_label === 'fraud' ? 'rgba(251, 86, 7, 0.1)' : 'rgba(6, 255, 165, 0.1)'};">
                        ${pred.prediction_label === 'fraud' ? '🚨 Fraude' : '✅ Légitime'}
                    </span>
                </td>
                <td>
                    <span style="padding: 0.5rem 1rem; border-radius: 0; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; border: 2px solid ${getRiskBadgeClass(pred.confidence?.fraud || 0) === 'danger' ? 'var(--color-danger)' : getRiskBadgeClass(pred.confidence?.fraud || 0) === 'warning' ? 'var(--color-warning)' : 'var(--color-success)'}; color: ${getRiskBadgeClass(pred.confidence?.fraud || 0) === 'danger' ? 'var(--color-danger)' : getRiskBadgeClass(pred.confidence?.fraud || 0) === 'warning' ? 'var(--color-warning)' : 'var(--color-success)'};">
                        ${fraudProb}%
                    </span>
                </td>
                <td>${confidence}%</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewBatchTransactionDetails(${index})">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    batchResultsTable.innerHTML = tableHTML;
    batchResultsSection.style.display = 'block';
    batchResultsSection.scrollIntoView({ behavior: 'smooth' });
}

function viewBatchTransactionDetails(index) {
    if (!batchResults || !batchResults.predictions[index]) {
        return;
    }
    
    const prediction = batchResults.predictions[index];
    const transaction = prediction.transaction_data;
    
    const modalHtml = `
        <div class="modal fade" id="batchTransactionModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Détails de la Transaction #${index + 1}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6>Informations Client</h6>
                                <p><strong>Genre:</strong> ${transaction.Gender === 1 ? 'Homme' : 'Femme'}</p>
                                <p><strong>Âge:</strong> ${transaction.Age} ans</p>
                                <p><strong>Type de logement:</strong> ${transaction.HouseTypeID}</p>
                                <p><strong>Contact disponible:</strong> ${transaction.ContactAvaliabilityID}</p>
                            </div>
                            <div class="col-md-6">
                                <h6>Détails Transaction</h6>
                                <p><strong>Montant:</strong> ${transaction.TransactionAmount}€</p>
                                <p><strong>Pays:</strong> ${getCountryName(transaction.TransactionCountry)}</p>
                                <p><strong>Gros achat:</strong> ${transaction.LargePurchase === 1 ? 'Oui' : 'Non'}</p>
                                <p><strong>Produit:</strong> ${transaction.ProductID}</p>
                            </div>
                        </div>
                        <div class="mt-3">
                            <h6>Résultat de l'Analyse</h6>
                            <p><strong>Prédiction:</strong> 
                                <span style="padding: 0.5rem 1rem; border-radius: 0; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; border: 2px solid ${prediction.prediction_label === 'fraud' ? 'var(--color-danger)' : 'var(--color-success)'}; color: ${prediction.prediction_label === 'fraud' ? 'var(--color-danger)' : 'var(--color-success)'}; background: ${prediction.prediction_label === 'fraud' ? 'rgba(251, 86, 7, 0.1)' : 'rgba(6, 255, 165, 0.1)'};">
                                    ${prediction.prediction_label === 'fraud' ? '🚨 Fraude' : '✅ Légitime'}
                                </span>
                            </p>
                            ${prediction.confidence ? `
                                <p><strong>Probabilité de fraude:</strong> ${(prediction.confidence.fraud * 100).toFixed(1)}%</p>
                                <p><strong>Probabilité légitime:</strong> ${(prediction.confidence.no_fraud * 100).toFixed(1)}%</p>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('batchTransactionModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('batchTransactionModal'));
    modal.show();
}

function downloadTemplate() {
    // Créer un template CSV avec les colonnes requises
    const headers = [
        'Gender', 'Age', 'HouseTypeID', 'ContactAvaliabilityID', 'HomeCountry',
        'AccountNo', 'CardExpiryDate', 'TransactionAmount', 'TransactionCountry',
        'LargePurchase', 'ProductID', 'CIF', 'TransactionCurrencyCode'
    ];
    
    const exampleRow = [
        1, 35, 1, 1, 1,
        12345, 202512, 150.50, 1,
        0, 2, 67890, 1
    ];
    
    const csvContent = [headers.join(','), exampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_transactions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Modèle téléchargé', 'success');
}

function downloadResults() {
    if (!batchResults) {
        showNotification('Aucun résultat à télécharger', 'error');
        return;
    }
    
    // Convertir les résultats en CSV
    const headers = [
        'ID', 'Gender', 'Age', 'HouseTypeID', 'ContactAvaliabilityID', 'HomeCountry',
        'AccountNo', 'CardExpiryDate', 'TransactionAmount', 'TransactionCountry',
        'LargePurchase', 'ProductID', 'CIF', 'TransactionCurrencyCode',
        'Prediction', 'Prediction_Label', 'Fraud_Probability', 'No_Fraud_Probability', 'Confidence'
    ];
    
    const rows = batchResults.predictions.map((pred, index) => {
        const t = pred.transaction_data;
        return [
            index + 1,
            t.Gender, t.Age, t.HouseTypeID, t.ContactAvaliabilityID, t.HomeCountry,
            t.AccountNo, t.CardExpiryDate, t.TransactionAmount, t.TransactionCountry,
            t.LargePurchase, t.ProductID, t.CIF, t.TransactionCurrencyCode,
            pred.prediction,
            pred.prediction_label,
            pred.confidence ? pred.confidence.fraud.toFixed(4) : '',
            pred.confidence ? pred.confidence.no_fraud.toFixed(4) : '',
            pred.confidence ? Math.max(pred.confidence.fraud, pred.confidence.no_fraud).toFixed(4) : ''
        ];
    });
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `fraud_analysis_results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Résultats téléchargés', 'success');
}

// Export functions for global access
window.resetForm = resetForm;
window.scrollToSection = scrollToSection;
window.viewTransactionDetails = viewTransactionDetails;
window.closeLoadingModal = closeLoadingModal;
window.closeTransactionModal = closeTransactionModal;
window.scrollToTop = scrollToTop;
window.viewBatchTransactionDetails = viewBatchTransactionDetails;
window.downloadTemplate = downloadTemplate;
window.downloadResults = downloadResults;
