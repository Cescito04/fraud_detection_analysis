#!/usr/bin/env python3
"""
API Flask pour la Détection de Fraude Bancaire
Version optimisée et simplifiée
"""

from flask import Flask, request, jsonify, render_template, session, redirect, url_for, flash
from werkzeug.exceptions import RequestEntityTooLarge
from flask_mail import Mail, Message
from dotenv import load_dotenv
import joblib
import pandas as pd
import numpy as np
import json
import os
import socket
import threading
import time
import requests
from datetime import datetime
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
import io
import secrets

# Charger les variables d'environnement depuis .env
load_dotenv()

# Initialisation de l'application Flask
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(32))
# Limite de taille pour les uploads de fichiers (16 MB)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Configuration pour l'envoi d'emails
# Option 1: API REST Brevo (recommandé pour production, plus fiable)
BREVO_API_KEY = os.environ.get('BREVO_API_KEY')
BREVO_SENDER_EMAIL = os.environ.get('BREVO_SENDER_EMAIL', 'bocoumabdoulaye988@gmail.com')
BREVO_SENDER_NAME = os.environ.get('BREVO_SENDER_NAME', 'FraudGuard AI')

# Option 2: SMTP (fallback si API non disponible)
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
app.config['MAIL_USE_SSL'] = os.environ.get('MAIL_USE_SSL', 'false').lower() in ['true', 'on', '1']
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER', 'noreply@fraudguard.ai')
app.config['MAIL_DEFAULT_SENDER_NAME'] = 'FraudGuard AI'
app.config['MAIL_TIMEOUT'] = 30
app.config['MAIL_SUPPRESS_SEND'] = False

# Initialiser Flask-Mail (sera None si non configuré)
mail = None
if app.config['MAIL_USERNAME'] and app.config['MAIL_PASSWORD']:
    try:
        mail = Mail(app)
        print("  ✅ Flask-Mail configuré (SMTP)")
        print(f"     Serveur: {app.config['MAIL_SERVER']}:{app.config['MAIL_PORT']}")
    except Exception as e:
        print(f"  ⚠️  Erreur configuration Flask-Mail: {e}")

# Vérifier la configuration Brevo API
if BREVO_API_KEY:
    print("  ✅ Brevo API configurée (recommandé pour production)")
else:
    print("  ⚠️  Brevo API non configurée (BREVO_API_KEY manquant)")
    if not mail:
        print("  💡 Mode développement: les liens seront affichés dans les messages flash")

# Variables globales
model = None
model_info = None
model_loading = False
model_load_error = None

# Chemin du fichier de base de données utilisateurs
USERS_DB_FILE = 'users.json'
RESET_TOKENS_FILE = 'reset_tokens.json'

def load_users():
    """Charger les utilisateurs depuis le fichier JSON"""
    if os.path.exists(USERS_DB_FILE):
        try:
            with open(USERS_DB_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_users(users):
    """Sauvegarder les utilisateurs dans le fichier JSON"""
    with open(USERS_DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, indent=2, ensure_ascii=False)

def load_reset_tokens():
    """Charger les tokens de réinitialisation depuis le fichier JSON"""
    if os.path.exists(RESET_TOKENS_FILE):
        try:
            with open(RESET_TOKENS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_reset_tokens(tokens):
    """Sauvegarder les tokens de réinitialisation dans le fichier JSON"""
    with open(RESET_TOKENS_FILE, 'w', encoding='utf-8') as f:
        json.dump(tokens, f, indent=2, ensure_ascii=False)

def generate_reset_token():
    """Générer un token unique pour la réinitialisation"""
    return secrets.token_urlsafe(32)

def send_email_brevo_api(to_email, subject, html_content):
    """
    Envoyer un email via l'API REST Brevo (plus fiable que SMTP sur Render)
    
    Args:
        to_email: Adresse email du destinataire
        subject: Sujet de l'email
        html_content: Contenu HTML de l'email
    
    Returns:
        tuple: (success: bool, message: str)
    """
    if not BREVO_API_KEY:
        return False, "BREVO_API_KEY non configurée"
    
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }
    
    payload = {
        "sender": {
            "name": BREVO_SENDER_NAME,
            "email": BREVO_SENDER_EMAIL
        },
        "to": [{"email": to_email}],
        "subject": subject,
        "htmlContent": html_content
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        if response.status_code == 201:
            return True, "Email envoyé avec succès"
        else:
            error_msg = f"Erreur Brevo API: {response.status_code} - {response.text}"
            print(f"  ❌ {error_msg}")
            return False, error_msg
    except requests.exceptions.Timeout:
        return False, "Timeout lors de l'envoi de l'email"
    except requests.exceptions.RequestException as e:
        error_msg = f"Erreur de connexion: {str(e)}"
        print(f"  ❌ {error_msg}")
        return False, error_msg
    except Exception as e:
        error_msg = f"Erreur inattendue: {str(e)}"
        print(f"  ❌ {error_msg}")
        return False, error_msg

def cleanup_expired_tokens():
    """Nettoyer les tokens expirés (plus de 1 heure)"""
    tokens = load_reset_tokens()
    current_time = time.time()
    expired_tokens = []
    
    for token, data in tokens.items():
        if current_time - data['created_at'] > 3600:  # 1 heure
            expired_tokens.append(token)
    
    for token in expired_tokens:
        del tokens[token]
    
    if expired_tokens:
        save_reset_tokens(tokens)

def init_users_db():
    """Initialiser la base de données utilisateurs si elle n'existe pas"""
    if not os.path.exists(USERS_DB_FILE):
        save_users({})
        print("  ✅ Base de données utilisateurs initialisée")
    
    # Initialiser le fichier de tokens si nécessaire
    if not os.path.exists(RESET_TOKENS_FILE):
        save_reset_tokens({})
        print("  ✅ Base de données tokens initialisée")

def is_authenticated():
    """Vérifier si l'utilisateur est authentifié"""
    return 'user_id' in session

def require_auth(f):
    """Décorateur pour protéger les routes"""
    def decorated_function(*args, **kwargs):
        print(f"🔐 Vérification authentification pour {request.path}")
        print(f"   Session: {dict(session)}")
        print(f"   Authentifié: {is_authenticated()}")
        
        if not is_authenticated():
            print("❌ Non authentifié, redirection vers login")
            # Si c'est une requête AJAX/API, retourner une réponse JSON
            if request.is_json or request.path.startswith('/predict'):
                return jsonify({
                    "error": "Authentification requise",
                    "message": "Vous devez être connecté pour accéder à cette ressource"
                }), 401
            # Sinon, rediriger vers la page de login
            flash('Vous devez être connecté pour accéder à cette page', 'info')
            return redirect(url_for('login'))
        print("✅ Authentification OK")
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

def load_model():
    """Charger le meilleur modèle sauvegardé"""
    global model, model_info, model_loading, model_load_error
    
    try:
        model_loading = True
        model_load_error = None
        
        # Utiliser le chemin absolu basé sur le répertoire du script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_dir = os.path.join(script_dir, "saved_models")
        
        # Vérifier que le dossier existe
        if not os.path.exists(model_dir):
            raise FileNotFoundError(f"Dossier 'saved_models' introuvable dans: {script_dir}")
        
        print(f"  Recherche dans: {model_dir}")
        
        # Lister tous les fichiers dans le dossier
        all_files = os.listdir(model_dir)
        print(f"  Fichiers trouvés: {len(all_files)}")
        
        # Trouver le modèle le plus récent
        model_files = [f for f in all_files 
                      if f.startswith("best_model_") and f.endswith(".joblib")]
        
        if not model_files:
            print(f"   Aucun fichier .joblib trouvé dans {model_dir}")
            print(f" 📂 Fichiers présents: {', '.join(all_files[:10])}")
            raise FileNotFoundError("Aucun modèle trouvé")
        
        print(f" {len(model_files)} modèle(s) trouvé(s)")
        
        # Prendre le plus récent
        latest_model = sorted(model_files)[-1]
        model_path = os.path.join(model_dir, latest_model)
        
        print(f"  Chargement du modèle: {latest_model}")
        print(f"  ⏳ Veuillez patienter, chargement en cours...")
        print(f"  💡 Le chargement peut prendre 10-30 secondes selon votre système")
        
        # Charger le modèle avec optimisation
        start_time = time.time()
        
        # Utiliser mmap_mode='r' pour un chargement plus rapide en lecture seule
        try:
            model = joblib.load(model_path, mmap_mode='r')
        except (ValueError, TypeError):
            # Si mmap_mode n'est pas supporté, charger normalement
            model = joblib.load(model_path)
        
        load_time = time.time() - start_time
        print(f" ✅ Modèle chargé avec succès: {latest_model} (en {load_time:.2f}s)")
        
        # Charger les métadonnées si disponibles
        metadata_files = [f for f in all_files 
                         if f.startswith("model_metadata_") and f.endswith(".json")]
        if metadata_files:
            latest_metadata = sorted(metadata_files)[-1]
            metadata_path = os.path.join(model_dir, latest_metadata)
            
            with open(metadata_path, 'r') as f:
                model_info = json.load(f)
            print(f" ✅ Métadonnées chargées: {latest_metadata}")
        else:
            print(f" ⚠️  Aucune métadonnée trouvée")
        
        model_loading = False
        return True
        
    except Exception as e:
        model_loading = False
        model_load_error = str(e)
        print(f" ❌ Erreur chargement modèle: {e}")
        import traceback
        traceback.print_exc()
        return False

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Page de connexion"""
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        remember = request.form.get('remember') == 'on'
        
        if not email or not password:
            flash('Veuillez remplir tous les champs', 'danger')
            return render_template('login.html')
        
        users = load_users()
        
        if email not in users:
            flash('Email ou mot de passe incorrect', 'danger')
            return render_template('login.html')
        
        user = users[email]
        
        if not check_password_hash(user['password'], password):
            flash('Email ou mot de passe incorrect', 'danger')
            return render_template('login.html')
        
        # Connexion réussie
        session['user_id'] = email
        session['user_name'] = f"{user['first_name']} {user['last_name']}"
        session.permanent = remember
        
        flash(f'Bienvenue, {user["first_name"]} !', 'success')
        return redirect(url_for('home'))
    
    # Si déjà connecté, rediriger vers la page d'accueil
    if is_authenticated():
        return redirect(url_for('home'))
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Page d'inscription"""
    if request.method == 'POST':
        first_name = request.form.get('first_name', '').strip()
        last_name = request.form.get('last_name', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        terms = request.form.get('terms') == 'on'
        
        # Validation
        errors = []
        
        if not first_name or not last_name:
            errors.append('Le prénom et le nom sont requis')
        
        if not email or '@' not in email:
            errors.append('Email invalide')
        
        if len(password) < 8:
            errors.append('Le mot de passe doit contenir au moins 8 caractères')
        
        if not any(c.isupper() for c in password):
            errors.append('Le mot de passe doit contenir au moins une majuscule')
        
        if not any(c.isdigit() for c in password):
            errors.append('Le mot de passe doit contenir au moins un chiffre')
        
        if password != confirm_password:
            errors.append('Les mots de passe ne correspondent pas')
        
        if not terms:
            errors.append('Vous devez accepter les conditions d\'utilisation')
        
        if errors:
            for error in errors:
                flash(error, 'danger')
            return render_template('register.html')
        
        users = load_users()
        
        if email in users:
            flash('Cet email est déjà utilisé', 'danger')
            return render_template('register.html')
        
        # Créer le nouvel utilisateur
        users[email] = {
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'password': generate_password_hash(password),
            'created_at': datetime.now().isoformat()
        }
        
        save_users(users)
        
        # Connecter automatiquement l'utilisateur
        session['user_id'] = email
        session['user_name'] = f"{first_name} {last_name}"
        session.permanent = True
        
        flash(f'Compte créé avec succès ! Bienvenue, {first_name} !', 'success')
        return redirect(url_for('home'))
    
    # Si déjà connecté, rediriger vers la page d'accueil
    if is_authenticated():
        return redirect(url_for('home'))
    
    return render_template('register.html')

@app.route('/logout', methods=['GET', 'POST'])
def logout():
    """Déconnexion"""
    session.clear()
    flash('Vous avez été déconnecté avec succès', 'info')
    return redirect(url_for('login'))

@app.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    """Page de mot de passe oublié"""
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        
        if not email or '@' not in email:
            flash('Veuillez entrer un email valide', 'danger')
            return render_template('forgot_password.html')
        
        users = load_users()
        
        if email not in users:
            # Pour la sécurité, on ne révèle pas si l'email existe ou non
            flash('Si cet email existe dans notre système, un lien de réinitialisation a été envoyé.', 'info')
            return render_template('forgot_password.html')
        
        # Générer un token de réinitialisation
        token = generate_reset_token()
        tokens = load_reset_tokens()
        
        # Nettoyer les tokens expirés
        cleanup_expired_tokens()
        
        # Sauvegarder le token
        tokens[token] = {
            'email': email,
            'created_at': time.time()
        }
        save_reset_tokens(tokens)
        
        # Générer le lien de réinitialisation
        reset_url = url_for('reset_password', token=token, _external=True)
        
        # Contenu HTML de l'email
        email_html = f'''
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 20px auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #FF006E; margin: 0;">⚡ FRAUD GUARD</h1>
                </div>
                <h2 style="color: #333; margin-top: 0;">Réinitialisation de mot de passe</h2>
                <p>Bonjour,</p>
                <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte FraudGuard AI.</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="{reset_url}" style="background: #FF006E; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Réinitialiser mon mot de passe</a>
                </p>
                <p>Ou copiez ce lien dans votre navigateur:</p>
                <p style="word-break: break-all; color: #666; background: #f9f9f9; padding: 10px; border-radius: 5px; font-size: 12px;">{reset_url}</p>
                <p><strong style="color: #FF006E;">⚠️ Ce lien expire dans 1 heure.</strong></p>
                <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe ne sera pas modifié.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #999; font-size: 12px; margin: 0;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">© 2025 FraudGuard AI - Tous droits réservés</p>
            </div>
        </body>
        </html>
        '''
        
        email_subject = 'Réinitialisation de votre mot de passe - FraudGuard AI'
        email_sent = False
        
        # Essayer d'abord l'API Brevo (plus fiable sur Render)
        if BREVO_API_KEY:
            success, message = send_email_brevo_api(email, email_subject, email_html)
            if success:
                print(f"  ✅ Email de réinitialisation envoyé via Brevo API à {email}")
                flash('Un lien de réinitialisation a été envoyé à votre adresse email.', 'success')
                email_sent = True
            else:
                print(f"  ⚠️  Échec envoi via Brevo API: {message}")
                # Continuer pour essayer SMTP en fallback
        
        # Fallback: Essayer SMTP si Brevo API a échoué ou n'est pas configuré
        if not email_sent and mail:
            try:
                msg = Message(
                    subject=email_subject,
                    recipients=[email],
                    html=email_html
                )
                socket.setdefaulttimeout(30)
                mail.send(msg)
                print(f"  ✅ Email de réinitialisation envoyé via SMTP à {email}")
                flash('Un lien de réinitialisation a été envoyé à votre adresse email.', 'success')
                email_sent = True
            except socket.timeout:
                error_msg = "Timeout de connexion SMTP. Le serveur n'a pas répondu dans les 30 secondes."
                print(f"  ❌ Timeout SMTP pour {email}")
            except Exception as e:
                error_msg = str(e)
                print(f"  ❌ Erreur SMTP pour {email}: {error_msg}")
        
        # Si aucun envoi n'a réussi, afficher le lien en mode développement
        if not email_sent:
            flash('Erreur lors de l\'envoi de l\'email. Le lien de réinitialisation est affiché ci-dessous.', 'warning')
            flash(f'Lien de réinitialisation: {reset_url}', 'info')
        
        return render_template('forgot_password.html')
    
    return render_template('forgot_password.html')

@app.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    """Page de réinitialisation du mot de passe"""
    tokens = load_reset_tokens()
    
    # Vérifier si le token existe et n'est pas expiré
    if token not in tokens:
        flash('Lien de réinitialisation invalide ou expiré', 'danger')
        return redirect(url_for('forgot_password'))
    
    token_data = tokens[token]
    current_time = time.time()
    
    # Vérifier l'expiration (1 heure)
    if current_time - token_data['created_at'] > 3600:
        del tokens[token]
        save_reset_tokens(tokens)
        flash('Le lien de réinitialisation a expiré. Veuillez en demander un nouveau.', 'danger')
        return redirect(url_for('forgot_password'))
    
    if request.method == 'POST':
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        # Validation
        errors = []
        
        if len(password) < 8:
            errors.append('Le mot de passe doit contenir au moins 8 caractères')
        
        if not any(c.isupper() for c in password):
            errors.append('Le mot de passe doit contenir au moins une majuscule')
        
        if not any(c.isdigit() for c in password):
            errors.append('Le mot de passe doit contenir au moins un chiffre')
        
        if password != confirm_password:
            errors.append('Les mots de passe ne correspondent pas')
        
        if errors:
            for error in errors:
                flash(error, 'danger')
            return render_template('reset_password.html', token=token)
        
        # Mettre à jour le mot de passe
        users = load_users()
        email = token_data['email']
        
        if email in users:
            users[email]['password'] = generate_password_hash(password)
            save_users(users)
        
        # Supprimer le token utilisé
        del tokens[token]
        save_reset_tokens(tokens)
        
        flash('Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.', 'success')
        return redirect(url_for('login'))
    
    return render_template('reset_password.html', token=token)

@app.route('/', methods=['GET'])
@require_auth
def home():
    """Page d'accueil avec interface web"""
    return render_template('index.html', user_name=session.get('user_name', ''))

@app.route('/api', methods=['GET'])
def api_info():
    """Informations sur l'API"""
    if model is not None:
        model_status = "loaded"
    elif model_loading:
        model_status = "loading"
    elif model_load_error:
        model_status = "error"
    else:
        model_status = "not_loaded"
    
    return jsonify({
        "message": "API de Détection de Fraude Bancaire",
        "version": "1.0.0",
        "status": "active",
        "model_status": model_status,
        "model_loaded": model is not None,
        "model_loading": model_loading,
        "model_error": model_load_error if model_load_error else None,
        "endpoints": {
            "/": "Interface web",
            "/api": "Informations sur l'API",
            "/health": "Vérification de santé",
            "/model-info": "Informations du modèle",
            "/predict": "Prédiction de fraude (POST)",
            "/predict-batch": "Prédiction en lot depuis fichier (POST - CSV/JSON/Excel)"
        },
        "timestamp": datetime.now().isoformat()
    })

@app.route('/health', methods=['GET'])
def health():
    """Vérification de santé du service"""
    if model is not None:
        status = "healthy"
    elif model_loading:
        status = "loading"
    elif model_load_error:
        status = "error"
    else:
        status = "unhealthy"
    
    return jsonify({
        "status": status,
        "model_loaded": model is not None,
        "model_loading": model_loading,
        "error": model_load_error if model_load_error else None,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
@require_auth
def predict():
    """Prédiction de fraude"""
    try:
        if model is None:
            if model_loading:
                return jsonify({
                    "error": "Modèle en cours de chargement",
                    "message": "Veuillez patienter quelques secondes et réessayer",
                    "status": "loading"
                }), 503  # Service Unavailable
            elif model_load_error:
                return jsonify({
                    "error": "Erreur lors du chargement du modèle",
                    "details": model_load_error
                }), 500
            else:
                return jsonify({"error": "Modèle non chargé"}), 500
        
        # Récupérer les données
        data = request.get_json()
        if not data:
            return jsonify({"error": "Aucune donnée fournie"}), 400
        
        # Convertir en DataFrame
        if isinstance(data, dict):
            df = pd.DataFrame([data])
        elif isinstance(data, list):
            df = pd.DataFrame(data)
        else:
            return jsonify({"error": "Format de données invalide"}), 400
        
        # Faire la prédiction
        predictions = model.predict(df)
        
        # Obtenir les probabilités si disponibles
        probabilities = None
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(df).tolist()
        
        # Préparer la réponse
        results = []
        for i, pred in enumerate(predictions):
            result = {
                "transaction_id": i,
                "prediction": int(pred),
                "prediction_label": "fraud" if pred == 1 else "no_fraud",
                "timestamp": datetime.now().isoformat()
            }
            
            if probabilities:
                result["confidence"] = {
                    "no_fraud": float(probabilities[i][0]),
                    "fraud": float(probabilities[i][1])
                }
            
            results.append(result)
        
        return jsonify({
            "predictions": results,
            "model_info": {
                "name": model_info.get('model_name', 'Unknown') if model_info else 'Unknown',
                "f1_score": model_info.get('f1_score', 0) if model_info else 0
            },
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({"error": f"Erreur lors de la prédiction: {str(e)}"}), 500

@app.route('/model-info', methods=['GET'])
def model_info_endpoint():
    """Informations sur le modèle"""
    if model_info:
        return jsonify(model_info)
    else:
        return jsonify({"error": "Informations du modèle non disponibles"}), 404

@app.route('/predict-batch', methods=['POST'])
@require_auth
def predict_batch():
    """Prédiction de fraude en lot depuis un fichier (CSV, JSON, Excel)"""
    print(f"📥 Requête POST /predict-batch reçue")
    print(f"   Content-Type: {request.content_type}")
    print(f"   Files dans request: {list(request.files.keys())}")
    print(f"   Form data: {list(request.form.keys())}")
    
    try:
        if model is None:
            if model_loading:
                return jsonify({
                    "error": "Modèle en cours de chargement",
                    "message": "Veuillez patienter quelques secondes et réessayer",
                    "status": "loading"
                }), 503
            elif model_load_error:
                return jsonify({
                    "error": "Erreur lors du chargement du modèle",
                    "details": model_load_error
                }), 500
            else:
                return jsonify({"error": "Modèle non chargé"}), 500
        
        # Vérifier qu'un fichier a été envoyé
        if 'file' not in request.files:
            print("❌ Aucun fichier 'file' dans request.files")
            return jsonify({"error": "Aucun fichier fourni"}), 400
        
        file = request.files['file']
        print(f"📄 Fichier reçu: {file.filename}")
        
        if file.filename == '':
            print("❌ Nom de fichier vide")
            return jsonify({"error": "Aucun fichier sélectionné"}), 400
        
        # Lire le fichier selon son extension
        filename = secure_filename(file.filename)
        file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        
        try:
            if file_ext == 'csv':
                df = pd.read_csv(file)
            elif file_ext == 'json':
                df = pd.read_json(file)
            elif file_ext in ['xlsx', 'xls']:
                df = pd.read_excel(file)
            else:
                return jsonify({
                    "error": f"Format de fichier non supporté: {file_ext}",
                    "formats_supportes": ["csv", "json", "xlsx", "xls"]
                }), 400
        except Exception as e:
            return jsonify({
                "error": f"Erreur lors de la lecture du fichier: {str(e)}"
            }), 400
        
        if df.empty:
            return jsonify({"error": "Le fichier est vide"}), 400
        
        # Vérifier que les colonnes requises sont présentes
        required_columns = [
            'Gender', 'Age', 'HouseTypeID', 'ContactAvaliabilityID', 
            'HomeCountry', 'AccountNo', 'CardExpiryDate', 'TransactionAmount',
            'TransactionCountry', 'LargePurchase', 'ProductID', 'CIF', 
            'TransactionCurrencyCode'
        ]
        
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            return jsonify({
                "error": f"Colonnes manquantes: {', '.join(missing_columns)}",
                "colonnes_requises": required_columns,
                "colonnes_trouvees": list(df.columns)
            }), 400
        
        # Sélectionner uniquement les colonnes requises dans le bon ordre
        df = df[required_columns]
        
        # Faire les prédictions
        predictions = model.predict(df)
        
        # Obtenir les probabilités si disponibles
        probabilities = None
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(df).tolist()
        
        # Préparer la réponse
        results = []
        for i, pred in enumerate(predictions):
            result = {
                "transaction_id": i,
                "prediction": int(pred),
                "prediction_label": "fraud" if pred == 1 else "no_fraud",
                "timestamp": datetime.now().isoformat(),
                "transaction_data": df.iloc[i].to_dict()
            }
            
            if probabilities:
                result["confidence"] = {
                    "no_fraud": float(probabilities[i][0]),
                    "fraud": float(probabilities[i][1])
                }
            
            results.append(result)
        
        # Statistiques
        fraud_count = sum(1 for r in results if r["prediction"] == 1)
        total_count = len(results)
        
        return jsonify({
            "predictions": results,
            "statistics": {
                "total": total_count,
                "fraud": fraud_count,
                "legitimate": total_count - fraud_count,
                "fraud_rate": round(fraud_count / total_count * 100, 2) if total_count > 0 else 0
            },
            "model_info": {
                "name": model_info.get('model_name', 'Unknown') if model_info else 'Unknown',
                "f1_score": model_info.get('f1_score', 0) if model_info else 0
            },
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Erreur lors de la prédiction en lot: {str(e)}"}), 500

def load_model_async():
    """Charger le modèle de manière asynchrone dans un thread séparé"""
    def load():
        load_model()
    
    thread = threading.Thread(target=load, daemon=True)
    thread.start()
    return thread

@app.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(e):
    """Gérer les erreurs de fichier trop volumineux"""
    if request.path.startswith('/predict'):
        return jsonify({
            "error": "Fichier trop volumineux",
            "message": "La taille maximale autorisée est de 16 MB"
        }), 413
    flash('Le fichier est trop volumineux. Taille maximale: 16 MB', 'danger')
    return redirect(request.url), 413

if __name__ == '__main__':
    print("🚀 Démarrage de l'API de Détection de Fraude...")
    print("")
    print("  ⚡ Démarrage rapide activé")
    print("  📦 Le modèle se charge en arrière-plan...")
    print("  🌐 L'API est disponible immédiatement")
    print("")
    
    # Initialiser la base de données utilisateurs
    init_users_db()
    
    # Démarrer le chargement du modèle en arrière-plan
    load_thread = load_model_async()
    
    # Récupérer le port depuis l'environnement (pour déploiement public)
    port = int(os.environ.get('PORT', 8080))
    host = os.environ.get('HOST', '0.0.0.0')
    
    print(f"  ✅ API disponible sur: http://{host}:{port}")
    print("  Endpoints:")
    print("   GET  /             - Interface web (protégé)")
    print("   GET  /login        - Page de connexion")
    print("   GET  /register     - Page d'inscription")
    print("   GET  /logout       - Déconnexion")
    print("   GET  /api          - Informations sur l'API")
    print("   GET  /health       - Vérification de santé (affiche l'état du modèle)")
    print("   GET  /model-info  - Informations du modèle")
    print("   POST /predict      - Prédiction de fraude (transaction unique, protégé)")
    print("   POST /predict-batch - Prédiction en lot (CSV/JSON/Excel, protégé)")
    print("")
    print("  💡 Note: Les prédictions seront disponibles une fois le modèle chargé")
    print("  📊 Vérifiez /health pour connaître l'état du chargement")
    print("")
    
    # Démarrer l'API immédiatement
    app.run(host=host, port=port, debug=False)

