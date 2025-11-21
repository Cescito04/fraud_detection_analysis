# 🔧 Configuration Brevo API pour l'envoi d'emails

## ✅ Solution au problème de timeout SMTP

L'API REST Brevo est **plus fiable** que SMTP sur Render car elle :
- ✅ Ne dépend pas des ports SMTP (pas de blocage)
- ✅ Utilise HTTPS (port 443, toujours ouvert)
- ✅ Plus rapide et plus fiable
- ✅ Meilleure gestion des erreurs

---

## 📝 Configuration sur Render

### Variables d'environnement à ajouter :

1. Allez dans **Render Dashboard** → Votre service → **Environment**
2. Ajoutez/modifiez ces variables :

```bash
BREVO_API_KEY=votre-api-key-brevo-ici
BREVO_SENDER_EMAIL=bocoumabdoulaye988@gmail.com
BREVO_SENDER_NAME=FraudGuard AI
```

**⚠️ Important** : 
- Remplacez `votre-api-key-brevo-ici` par votre vraie clé API Brevo
- Ne commitez JAMAIS la vraie clé API dans le code source
- Utilisez uniquement les variables d'environnement sur Render
- La clé API se trouve dans votre compte Brevo (Sendinblue)

### Variables optionnelles (pour SMTP en fallback) :

```bash
MAIL_SERVER=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USE_SSL=false
MAIL_USERNAME=9c2726001@smtp-brevo.com
MAIL_PASSWORD=0NGsWJcZXmrh4HfU
```

---

## 🔄 Fonctionnement

Le système utilise maintenant une **double stratégie** :

1. **Priorité 1** : API REST Brevo (recommandé)
   - Si `BREVO_API_KEY` est configuré, utilise l'API REST
   - Plus fiable sur Render

2. **Priorité 2** : SMTP (fallback)
   - Si l'API échoue ou n'est pas configurée, essaie SMTP
   - Utile en développement local

3. **Mode développement** : Affichage du lien
   - Si les deux méthodes échouent, affiche le lien dans un message flash

---

## 🚀 Étapes de déploiement

1. **Ajoutez `BREVO_API_KEY` sur Render** avec votre clé API Brevo
   - Connectez-vous à votre compte Brevo (https://app.brevo.com)
   - Allez dans Settings → SMTP & API → API Keys
   - Créez ou copiez votre clé API
   - Ajoutez-la dans les variables d'environnement Render
2. **Ajoutez aussi** :
   - `BREVO_SENDER_EMAIL=bocoumabdoulaye988@gmail.com`
   - `BREVO_SENDER_NAME=FraudGuard AI`
3. **Redéployez** l'application (Render redémarre automatiquement)
4. **Testez** la fonctionnalité "Mot de passe oublié"

---

## 📦 Installation des dépendances

La bibliothèque `requests` est déjà ajoutée à `requirements.txt`. 
Render l'installera automatiquement lors du déploiement.

---

## ✅ Vérification

Après le redéploiement, vous devriez voir dans les logs :
```
✅ Brevo API configurée (recommandé pour production)
```

Au lieu de :
```
⚠️  Brevo API non configurée (BREVO_API_KEY manquant)
```

---

## 🎯 Résultat attendu

Une fois configuré, les emails seront envoyés **sans timeout** via l'API REST Brevo, et vous ne verrez plus l'erreur "Connection timed out".

