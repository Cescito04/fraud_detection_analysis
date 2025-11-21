// Authentication Form Validation and Interactions

document.addEventListener('DOMContentLoaded', function() {
    initializeAuthForms();
    initializePasswordToggles();
});

function initializeAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
        setupFormValidation(loginForm);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
        setupFormValidation(registerForm);
    }
    
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPasswordSubmit);
        setupFormValidation(forgotPasswordForm);
    }
    
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', handleResetPasswordSubmit);
        setupFormValidation(resetPasswordForm);
    }
}

function setupFormValidation(form) {
    const inputs = form.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
    
    // Special validation for password confirmation
    const passwordInput = form.querySelector('#password');
    const confirmPasswordInput = form.querySelector('#confirm_password');
    
    if (passwordInput && confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', () => {
            validatePasswordMatch(passwordInput, confirmPasswordInput);
        });
    }
    
    // Password strength validation
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            validatePasswordStrength(passwordInput);
        });
    }
}

function validateField(field) {
    const fieldName = field.name || field.id;
    const errorElement = document.getElementById(fieldName + 'Error');
    
    // Clear previous error
    clearFieldError(field);
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !field.value.trim()) {
        showFieldError(field, 'Ce champ est requis');
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && field.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            showFieldError(field, 'Format d\'email invalide');
            return false;
        }
    }
    
    // Password validation
    if (field.type === 'password' && field.id === 'password' && field.value) {
        if (!validatePasswordStrength(field)) {
            return false;
        }
    }
    
    // Password match validation
    if (field.id === 'confirm_password') {
        const passwordInput = document.getElementById('password');
        if (passwordInput && !validatePasswordMatch(passwordInput, field)) {
            return false;
        }
    }
    
    // Terms validation
    if (field.id === 'terms' && field.type === 'checkbox') {
        if (!field.checked) {
            showFieldError(field, 'Vous devez accepter les conditions');
            return false;
        }
    }
    
    // Mark as valid
    field.classList.add('is-valid');
    return true;
}

function validatePasswordStrength(passwordField) {
    const password = passwordField.value;
    const errorElement = document.getElementById('passwordError');
    
    if (password.length < 8) {
        showFieldError(passwordField, 'Le mot de passe doit contenir au moins 8 caractères');
        return false;
    }
    
    if (!/[A-Z]/.test(password)) {
        showFieldError(passwordField, 'Le mot de passe doit contenir au moins une majuscule');
        return false;
    }
    
    if (!/[0-9]/.test(password)) {
        showFieldError(passwordField, 'Le mot de passe doit contenir au moins un chiffre');
        return false;
    }
    
    clearFieldError(passwordField);
    passwordField.classList.add('is-valid');
    return true;
}

function validatePasswordMatch(passwordField, confirmPasswordField) {
    const password = passwordField.value;
    const confirmPassword = confirmPasswordField.value;
    const errorElement = document.getElementById('confirm_passwordError');
    
    if (confirmPassword && password !== confirmPassword) {
        showFieldError(confirmPasswordField, 'Les mots de passe ne correspondent pas');
        return false;
    }
    
    if (confirmPassword && password === confirmPassword) {
        clearFieldError(confirmPasswordField);
        confirmPasswordField.classList.add('is-valid');
    }
    
    return true;
}

function showFieldError(field, message) {
    field.classList.remove('is-valid');
    field.classList.add('is-invalid');
    field.style.borderColor = 'var(--color-danger)';
    
    const fieldName = field.name || field.id;
    const errorElement = document.getElementById(fieldName + 'Error');
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearFieldError(field) {
    field.classList.remove('is-invalid');
    const fieldName = field.name || field.id;
    const errorElement = document.getElementById(fieldName + 'Error');
    
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
    
    // Reset border color if not focused
    if (document.activeElement !== field) {
        field.style.borderColor = '';
    }
}

function handleLoginSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('#submitBtn');
    
    // Validate all fields
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
        return;
    }
    
    // Show loading state
    setButtonLoading(submitBtn, true);
    
    // Submit form
    form.submit();
}

function handleRegisterSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('#submitBtn');
    
    // Validate all fields
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            if (!input.checked) {
                showFieldError(input, 'Vous devez accepter les conditions');
                isValid = false;
            }
        } else {
            if (!validateField(input)) {
                isValid = false;
            }
        }
    });
    
    // Validate password match
    const passwordInput = form.querySelector('#password');
    const confirmPasswordInput = form.querySelector('#confirm_password');
    
    if (passwordInput && confirmPasswordInput) {
        if (!validatePasswordMatch(passwordInput, confirmPasswordInput)) {
            isValid = false;
        }
    }
    
    if (!isValid) {
        showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
        setButtonLoading(submitBtn, false);
        return;
    }
    
    // Show loading state
    setButtonLoading(submitBtn, true);
    
    // Submit form
    form.submit();
}

function handleForgotPasswordSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('#submitBtn');
    
    // Validate email
    const emailInput = form.querySelector('#email');
    if (!validateField(emailInput)) {
        showNotification('Veuillez entrer un email valide', 'error');
        setButtonLoading(submitBtn, false);
        return;
    }
    
    // Show loading state
    setButtonLoading(submitBtn, true);
    
    // Submit form
    form.submit();
}

function handleResetPasswordSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('#submitBtn');
    
    // Validate all fields
    const passwordInput = form.querySelector('#password');
    const confirmPasswordInput = form.querySelector('#confirm_password');
    
    let isValid = true;
    
    if (!validateField(passwordInput)) {
        isValid = false;
    }
    
    if (!validateField(confirmPasswordInput)) {
        isValid = false;
    }
    
    // Validate password match
    if (passwordInput && confirmPasswordInput) {
        if (!validatePasswordMatch(passwordInput, confirmPasswordInput)) {
            isValid = false;
        }
    }
    
    if (!isValid) {
        showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
        setButtonLoading(submitBtn, false);
        return;
    }
    
    // Show loading state
    setButtonLoading(submitBtn, true);
    
    // Submit form
    form.submit();
}

function setButtonLoading(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

function initializePasswordToggles() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input[type="password"], input[type="text"]');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('bi-eye');
                icon.classList.add('bi-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('bi-eye-slash');
                icon.classList.add('bi-eye');
            }
        });
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; max-width: 500px;';
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

// Add visual feedback on input focus
document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'translateY(-1px)';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'translateY(0)';
    });
});
