# 🚀 Guide de Déploiement sur Render

Guide étape par étape pour déployer votre application de détection de fraude sur Render.

## 📋 Prérequis

1. Un compte GitHub avec votre repository `fraud_detection_analysis`
2. Un compte Render (gratuit, sans carte bancaire requise)
3. Les modèles doivent être dans le repository (voir étape importante ci-dessous)

## ⚠️ IMPORTANT : Inclure les modèles dans Git

Les modèles sont actuellement exclus par `.gitignore`. Pour déployer sur Render, vous devez les inclure :

```bash
# Forcer l'ajout des modèles malgré .gitignore
git add -f saved_models/*.joblib saved_models/*.json saved_models/*.py
git commit -m "Add model files for Render deployment"
git push origin main
```

**Note:** Si les fichiers sont trop volumineux (>100MB), utilisez Git LFS :
```bash
git lfs install
git lfs track "*.joblib"
git add .gitattributes
git add saved_models/*.joblib
git commit -m "Add models with Git LFS"
git push origin main
```

## 🎯 Étapes de Déploiement

### Étape 1 : Créer un compte Render

1. Aller sur [render.com](https://render.com)
2. Cliquer sur **"Get Started for Free"**
3. Créer un compte avec GitHub (recommandé) ou email

### Étape 2 : Créer un nouveau Web Service

1. Dans le dashboard Render, cliquer sur **"New +"**
2. Sélectionner **"Web Service"**
3. Connecter votre repository GitHub :
   - Cliquer sur **"Connect GitHub"** si ce n'est pas déjà fait
   - Autoriser l'accès à votre repository
   - Sélectionner le repository `fraud_detection_analysis`
   - Cliquer sur **"Connect"**

### Étape 3 : Configurer le Service

Render détecte automatiquement la configuration depuis `render.yaml`, mais vous pouvez vérifier :

**Paramètres de base :**
- **Name:** `fraud-detection-api` (ou le nom de votre choix)
- **Environment:** `Python 3`
- **Region:** Choisir la région la plus proche (ex: `Frankfurt` pour l'Europe)
- **Branch:** `main`
- **Root Directory:** (laisser vide)
- **Runtime:** `Python 3`

**Build & Deploy :**
- **Build Command:** `pip install --upgrade pip && pip install -r requirements.txt`
- **Start Command:** `python app.py`

**Variables d'environnement (optionnel):**
- Render définit automatiquement `PORT`, mais vous pouvez ajouter :
  - `HOST=0.0.0.0` (déjà géré par l'app)
  - `PYTHON_VERSION=3.12.0`

### Étape 4 : Déployer

1. Cliquer sur **"Create Web Service"**
2. Render va :
   - Installer les dépendances
   - Lancer l'application
   - Vous donner une URL publique

### Étape 5 : Vérifier le Déploiement

1. Attendre que le build soit terminé (environ 2-5 minutes)
2. Cliquer sur l'URL fournie (ex: `https://fraud-detection-api.onrender.com`)
3. Tester l'endpoint de santé : `https://votre-url.onrender.com/health`
4. Tester l'interface web : `https://votre-url.onrender.com`

## 🔍 Vérification Post-Déploiement

### Tester les endpoints

```bash
# Santé de l'API
curl https://votre-url.onrender.com/health

# Informations du modèle
curl https://votre-url.onrender.com/model-info

# Test de prédiction
curl -X POST https://votre-url.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{"V1": -1.359807, "V2": -0.072781, "V3": 2.536347, ...}'
```

### Interface Web

Ouvrir dans votre navigateur :
```
https://votre-url.onrender.com
```

## ⚙️ Configuration Avancée

### Variables d'Environnement

Dans le dashboard Render, section **"Environment"**, vous pouvez ajouter :

- `DEBUG=False` (déjà en production)
- `LOG_LEVEL=INFO`
- `PYTHON_VERSION=3.12.0`

### Plan de Service

Render offre un plan gratuit qui inclut :
- ✅ Service web gratuit
- ✅ SSL automatique
- ⚠️ Service qui "s'endort" après 15 minutes d'inactivité
- ⚠️ Premier démarrage peut prendre 30-60 secondes après inactivité

**Pour un service toujours actif**, considérez le plan payant ($7/mois).

### Logs et Monitoring

- **Logs en temps réel :** Dashboard Render → Votre service → "Logs"
- **Health checks :** Automatiques via `/health`
- **Métriques :** Disponibles dans le dashboard

## 🐛 Dépannage

### Problème : Build échoue

**Solution :**
- Vérifier les logs dans Render
- S'assurer que `requirements.txt` est à jour
- Vérifier la version Python (3.12.0 recommandée)

### Problème : Modèle non trouvé

**Solution :**
- Vérifier que les fichiers `.joblib` sont dans le repository
- Vérifier le chemin dans `app.py` : `saved_models/`
- Forcer l'ajout avec `git add -f saved_models/*.joblib`

### Problème : Service ne démarre pas

**Solution :**
- Vérifier les logs : Dashboard → Logs
- Vérifier que le port est bien configuré (Render utilise la variable `PORT`)
- Vérifier que `app.py` utilise `os.environ.get('PORT')`

### Problème : Service trop lent au démarrage

**Solution :**
- Normal pour le plan gratuit (service "dort" après inactivité)
- Considérer le plan payant pour un service toujours actif
- Utiliser un health check externe pour "réveiller" le service

## 📊 Monitoring

### Health Check Automatique

Render vérifie automatiquement `/health` toutes les minutes.

### Logs

Accéder aux logs :
1. Dashboard Render
2. Sélectionner votre service
3. Onglet "Logs"
4. Logs en temps réel ou historiques

## 🔄 Mise à Jour

Pour mettre à jour l'application :

```bash
# Faire vos modifications
git add .
git commit -m "Update application"
git push origin main
```

Render déploie automatiquement les nouvelles versions !

## ✅ Checklist de Déploiement

- [ ] Modèles ajoutés au repository Git
- [ ] `render.yaml` configuré
- [ ] `requirements.txt` à jour
- [ ] `app.py` utilise les variables d'environnement
- [ ] Compte Render créé
- [ ] Service web créé
- [ ] Build réussi
- [ ] Health check OK
- [ ] Interface web accessible
- [ ] Prédictions fonctionnelles

## 🎉 Félicitations !

Votre application est maintenant déployée publiquement sur Render !

**URL publique :** `https://votre-url.onrender.com`

---

**Besoin d'aide ?** Consultez la documentation Render : [render.com/docs](https://render.com/docs)

