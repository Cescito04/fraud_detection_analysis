# Guide de Déploiement Public

Ce document explique comment déployer votre application de détection de fraude sur une plateforme publique.

## 🚀 Options de Déploiement

### Option 1: Railway (Recommandé - Gratuit et Facile)

**Avantages:**
- ✅ Gratuit avec cartes de crédit requises
- ✅ Déploiement automatique depuis GitHub
- ✅ SSL automatique
- ✅ Gestion simple des variables d'environnement

**Étapes:**

1. **Visitez Railway**
   - Aller sur [railway.app](https://railway.app)
   - Créer un compte avec GitHub

2. **Connecter le Repository**
   - Cliquer sur "New Project"
   - Sélectionner "Deploy from GitHub repo"
   - Choisir votre repo `fraud_detection_analysis`

3. **Configuration**
   - Railway détecte automatiquement que c'est une app Python
   - Le fichier `railway.json` configure le build et le déploiement
   - Les fichiers seront automatiquement déployés

4. **Variables d'Environnement (optionnel)**
   ```bash
   PORT=8080
   ```

5. **Déployer**
   - Railway déploie automatiquement
   - Vous recevez une URL publique comme: `https://votre-app.up.railway.app`

### Option 2: Render (Gratuit sans carte bancaire)

**Avantages:**
- ✅ Totalement gratuit
- ✅ Aucune carte bancaire requise
- ✅ SSL automatique

**Étapes:**

1. **Visitez Render**
   - Aller sur [render.com](https://render.com)
   - Créer un compte avec GitHub

2. **Créer un nouveau Web Service**
   - Cliquer sur "New +" → "Web Service"
   - Connecter votre repository GitHub

3. **Configuration**
   ```yaml
   Name: fraud-detection-api
   Region: Singapore (ou plus proche de vous)
   Branch: main
   Root Directory: ./
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: python app.py
   ```

4. **Variables d'Environnement**
   ```bash
   PORT=10000
   ```

5. **Déployer**
   - Render déploie automatiquement
   - Vous recevez une URL publique

### Option 3: Heroku (Traditionnel)

**Avantages:**
- ✅ Plateforme éprouvée
- ✅ Documentations riches

**Étapes:**

```bash
# Installation de Heroku CLI
brew install heroku/brew/heroku  # macOS
# ou télécharger depuis heroku.com

# Login
heroku login

# Créer l'app
heroku create fraud-detection-api

# Configurer le port dynamique
heroku config:set PORT=$PORT

# Déployer
git push heroku main
```

### Option 4: VPS (Contrôle Total)

**Avantages:**
- ✅ Contrôle total
- ✅ Pas de limites de ressources
- ✅ Idéal pour production professionnelle

**Étapes:**

1. **Acheter un VPS** (Hetzner, DigitalOcean, OVH)
   - Prix: ~5-10€/mois

2. **Se connecter au serveur**
   ```bash
   ssh root@votre-ip
   ```

3. **Installer les dépendances**
   ```bash
   apt update && apt upgrade -y
   apt install python3 python3-pip git nginx -y
   ```

4. **Cloner le projet**
   ```bash
   git clone https://github.com/Cescito04/fraud_detection_analysis.git
   cd ML_Project
   ```

5. **Installer Python**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

6. **Configurer Nginx**
   ```bash
   nano /etc/nginx/sites-available/fraud-detection
   ```

   ```nginx
   server {
       listen 80;
       server_name votre-domaine.com;

       location / {
           proxy_pass http://127.0.0.1:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

   ```bash
   ln -s /etc/nginx/sites-available/fraud-detection /etc/nginx/sites-enabled/
   nginx -t && systemctl restart nginx
   ```

7. **Installer SSL avec Let's Encrypt**
   ```bash
   apt install certbot python3-certbot-nginx -y
   certbot --nginx -d votre-domaine.com
   ```

8. **Lancer l'app en background**
   ```bash
   nohup python app.py > app.log 2>&1 &
   ```

## 📋 Configuration du Port Dynamique

Mettez à jour `app.py` pour supporter le port dynamique:

```python
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
```

## 🔒 Sécurité

Avant de déployer en production:

1. **Désactiver le mode debug**
   ```python
   app.run(debug=False)
   ```

2. **Ajouter CORS si nécessaire**
   ```bash
   pip install flask-cors
   ```
   ```python
   from flask_cors import CORS
   CORS(app)
   ```

3. **Limiter les requêtes**
   ```bash
   pip install flask-limiter
   ```
   ```python
   from flask_limiter import Limiter
   limiter = Limiter(app)
   
   @app.route('/predict')
   @limiter.limit("10 per minute")
   def predict():
       # ...
   ```

## 📝 Checklist de Déploiement

- [ ] Port dynamique configuré
- [ ] Variables d'environnement définies
- [ ] Mode debug désactivé
- [ ] SSL/HTTPS activé
- [ ] Tests effectués
- [ ] Monitoring configuré (optionnel)
- [ ] Backups des modèles (optionnel)

## 🌐 Comparaison des Options

| Plateforme | Prix | Complexité | Recommandation |
|------------|------|------------|----------------|
| Railway    | Gratuit* | ⭐ Facile | Développement |
| Render     | Gratuit  | ⭐⭐ Moyen | Production légère |
| Heroku     | Payant   | ⭐ Facile | Traditionnel |
| VPS        | Payant   | ⭐⭐⭐ Difficile | Production sérieuse |

## 🆘 Support

Pour plus d'aide:
- Railway: https://railway.app/docs
- Render: https://render.com/docs
- Heroku: https://devcenter.heroku.com

