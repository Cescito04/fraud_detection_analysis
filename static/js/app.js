// JavaScript for Fraud Detection System

// Configuration
// Détecter automatiquement l'URL de base (local ou production)
const API_BASE_URL = window.location.origin;
let transactionHistory = JSON.parse(localStorage.getItem('transactionHistory')) || [];

// DOM Elements
const predictionForm = document.getElementById('predictionForm');
const resultsSection = document.getElementById('resultsSection');
const historyBody = document.getElementById('historyBody');
const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set default values
    setDefaultValues();
    
    // Load transaction history
    loadTransactionHistory();
    
    // Add form event listeners
    addFormEventListeners();
    
    // Check API status
    checkAPIStatus();
    
    // Initialize scroll effects
    initScrollEffects();
    
    // Initialize particles
    initParticles();
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
                
                if (scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
                
                // Show/hide scroll to top button
                if (scrollY > 300) {
                    scrollToTopBtn.style.display = 'flex';
                } else {
                    scrollToTopBtn.style.display = 'none';
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
                const offsetTop = target.offsetTop - 90;
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
        const scrollPos = window.scrollY + 120;
        
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

function initParticles() {
    // Simple particle animation
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '2px';
            particle.style.height = '2px';
            particle.style.background = 'rgba(255, 255, 255, 0.5)';
            particle.style.borderRadius = '50%';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animation = `float ${3 + Math.random() * 4}s ease-in-out infinite`;
            particlesContainer.appendChild(particle);
        }
    }
}

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
    
    // Validate all fields
    const isValid = validateForm();
    if (!isValid) {
        showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
        return;
    }
    
    // Show loading modal
    loadingModal.show();
    
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
        showNotification('Erreur lors de l\'analyse: ' + error.message, 'error');
    } finally {
        // Hide loading modal
        setTimeout(() => {
            loadingModal.hide();
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

async function analyzeTransaction(transactionData) {
    console.log('Données envoyées:', transactionData);
    
    const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur API:', errorData);
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
    
    // Update result header
    const resultHeader = document.getElementById('resultHeader');
    resultHeader.className = `card-header ${getRiskClass(fraudProbability)}`;
    
    // Update prediction text
    document.getElementById('predictionText').textContent = 
        prediction.prediction_label === 'fraud' ? '🚨 TRANSACTION SUSPECTE' : '✅ TRANSACTION LÉGITIME';
    
    // Update probabilities
    document.getElementById('fraudProbability').textContent = `${(fraudProbability * 100).toFixed(1)}%`;
    document.getElementById('confidence').textContent = `${(Math.max(fraudProbability, noFraudProbability) * 100).toFixed(1)}%`;
    
    // Update risk bar
    const riskBar = document.getElementById('riskBar');
    const riskPercentage = fraudProbability * 100;
    riskBar.style.width = `${riskPercentage}%`;
    riskBar.className = `progress-bar ${getRiskBarClass(fraudProbability)}`;
    
    // Update risk level
    const riskLevel = document.getElementById('riskLevel');
    riskLevel.textContent = getRiskText(fraudProbability);
    riskLevel.className = `risk-indicator ${getRiskClass(fraudProbability)}`;
    
    // Update recommendations
    updateRecommendations(fraudProbability, prediction);
    
    // Show results section
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Add animation
    resultsSection.classList.add('fade-in');
}

function getRiskClass(fraudProbability) {
    if (fraudProbability > 0.5) return 'bg-danger text-white';
    if (fraudProbability > 0.3) return 'bg-warning text-dark';
    return 'bg-success text-white';
}

function getRiskBarClass(fraudProbability) {
    if (fraudProbability > 0.5) return 'bg-danger';
    if (fraudProbability > 0.3) return 'bg-warning';
    return 'bg-success';
}

function getRiskText(fraudProbability) {
    if (fraudProbability > 0.5) return '🔴 RISQUE ÉLEVÉ';
    if (fraudProbability > 0.3) return '🟡 RISQUE MODÉRÉ';
    return '🟢 RISQUE FAIBLE';
}

function updateRecommendations(fraudProbability, prediction) {
    const recommendationsDiv = document.getElementById('recommendations');
    let recommendations = '';
    
    if (prediction.prediction === 1) {
        recommendations = `
            <div class="alert alert-danger">
                <h6><i class="bi bi-exclamation-triangle"></i> Actions Immédiates Requises</h6>
                <ul class="mb-0">
                    <li>Bloquer temporairement la transaction</li>
                    <li>Contacter le client immédiatement</li>
                    <li>Vérifier l'historique des transactions</li>
                    <li>Signaler au service de sécurité</li>
                </ul>
            </div>
        `;
    } else if (fraudProbability > 0.3) {
        recommendations = `
            <div class="alert alert-warning">
                <h6><i class="bi bi-shield-exclamation"></i> Surveillance Renforcée</h6>
                <ul class="mb-0">
                    <li>Analyser les patterns de transaction</li>
                    <li>Vérifier l'historique du client</li>
                    <li>Surveiller les transactions futures</li>
                    <li>Considérer une vérification manuelle</li>
                </ul>
            </div>
        `;
    } else {
        recommendations = `
            <div class="alert alert-success">
                <h6><i class="bi bi-check-circle"></i> Transaction Approuvée</h6>
                <ul class="mb-0">
                    <li>Approuver la transaction</li>
                    <li>Continuer la surveillance normale</li>
                    <li>Enregistrer dans l'historique</li>
                    <li>Maintenir le niveau de confiance</li>
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
                    <span class="badge ${item.prediction === 'fraud' ? 'bg-danger' : 'bg-success'}">
                        ${item.prediction === 'fraud' ? '🚨 Fraude' : '✅ Légitime'}
                    </span>
                </td>
                <td>
                    <span class="badge ${getRiskBadgeClass(item.risk)}">
                        ${(item.risk * 100).toFixed(1)}%
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewTransactionDetails(${item.id})">
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

function getRiskBadgeClass(risk) {
    if (risk > 0.5) return 'bg-danger';
    if (risk > 0.3) return 'bg-warning';
    return 'bg-success';
}

function viewTransactionDetails(transactionId) {
    const transaction = transactionHistory.find(item => item.id === transactionId);
    if (transaction) {
        // Create modal for transaction details
        const modalHtml = `
            <div class="modal fade" id="transactionModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Détails de la Transaction</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Informations Client</h6>
                                    <p><strong>Genre:</strong> ${transaction.data.Gender === 1 ? 'Homme' : 'Femme'}</p>
                                    <p><strong>Âge:</strong> ${transaction.data.Age} ans</p>
                                    <p><strong>Type de logement:</strong> ${getHouseTypeName(transaction.data.HouseTypeID)}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6>Détails Transaction</h6>
                                    <p><strong>Montant:</strong> ${transaction.data.TransactionAmount}€</p>
                                    <p><strong>Pays:</strong> ${getCountryName(transaction.data.TransactionCountry)}</p>
                                    <p><strong>Gros achat:</strong> ${transaction.data.LargePurchase === 1 ? 'Oui' : 'Non'}</p>
                                </div>
                            </div>
                            <div class="mt-3">
                                <h6>Résultat de l'Analyse</h6>
                                <p><strong>Prédiction:</strong> 
                                    <span class="badge ${transaction.prediction === 'fraud' ? 'bg-danger' : 'bg-success'}">
                                        ${transaction.prediction === 'fraud' ? '🚨 Fraude' : '✅ Légitime'}
                                    </span>
                                </p>
                                <p><strong>Probabilité de fraude:</strong> ${(transaction.risk * 100).toFixed(1)}%</p>
                            </div>
                        </div>
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
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('transactionModal'));
        modal.show();
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
            if (data.status === 'healthy') {
                console.log(' API is healthy and ready');
            } else {
                console.warn(' API is not healthy');
            }
        } else {
            console.error(' API is not responding');
        }
    } catch (error) {
        console.error(' Cannot connect to API:', error);
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

// Export functions for global access
window.resetForm = resetForm;
window.scrollToSection = scrollToSection;
window.viewTransactionDetails = viewTransactionDetails;
window.closeLoadingModal = closeLoadingModal;
window.scrollToTop = scrollToTop;
