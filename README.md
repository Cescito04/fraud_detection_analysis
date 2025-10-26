# 🏦 Détection de Fraude Bancaire - API

## 📋 Vue d'ensemble
API Flask pour la détection de fraude bancaire utilisant des modèles de machine learning entraînés.

## 🚀 Démarrage Rapide

### Déploiement Automatique
```bash
# Déploiement complet en une commande
./deploy.sh deploy
```

### Commandes Disponibles
```bash
./deploy.sh deploy    # Déployer l'API
./deploy.sh stop      # Arrêter l'API
./deploy.sh restart   # Redémarrer l'API
./deploy.sh status    # Vérifier le statut
./deploy.sh test      # Tester l'API
./deploy.sh logs      # Voir les logs
```

## 🌐 API Endpoints

### GET /
Informations sur l'API
```bash
curl http://localhost:8080/
```

### GET /health
Vérification de santé
```bash
curl http://localhost:8080/health
```

### GET /model-info
Informations du modèle
```bash
curl http://localhost:8080/model-info
```

### POST /predict
Prédiction de fraude
```bash
curl -X POST http://localhost:8080/predict \
     -H "Content-Type: application/json" \
     -d '{"feature1": 1.0, "feature2": 2.0, "feature3": 3.0}'
```

## 📊 Exemple de Réponse

```json
{
  "predictions": [
    {
      "transaction_id": 0,
      "prediction": 1,
      "prediction_label": "fraud",
      "confidence": {
        "no_fraud": 0.2,
        "fraud": 0.8
      },
      "timestamp": "2024-01-01T12:00:00"
    }
  ],
  "model_info": {
    "name": "Forêt Aléatoire",
    "f1_score": 0.9268
  }
}
```

## 🧪 Tests

### Test Automatique Complet
```bash
python test_api.py
```

### Tests de Prédictions Spécifiques
```bash
# Tests avec scénarios réalistes
python test_specific_predictions.py
```

### Testeur Interactif
```bash
# Interface interactive pour tester vos propres scénarios
python interactive_tester.py
```

### Tests Manuels
```bash
# Test de santé
curl http://localhost:8080/health

# Test de prédiction avec vraies features
curl -X POST http://localhost:8080/predict \
     -H "Content-Type: application/json" \
     -d '{
       "Gender": 1,
       "Age": 35,
       "HouseTypeID": 2,
       "ContactAvaliabilityID": 1,
       "HomeCountry": 1,
       "AccountNo": 12345,
       "CardExpiryDate": 202512,
       "TransactionAmount": 100.0,
       "TransactionCountry": 1,
       "LargePurchase": 0,
       "ProductID": 1,
       "CIF": 67890,
       "TransactionCurrencyCode": 1
     }'
```

## 📁 Structure du Projet

```
ML_Project/
├── app.py                      # API Flask
├── deploy.sh                   # Script de déploiement
├── test_api.py                 # Tests de base de l'API
├── test_specific_predictions.py # Tests de scénarios spécifiques
├── interactive_tester.py       # Testeur interactif
├── examples.py                 # Exemples d'utilisation
├── requirements.txt            # Dépendances Python
├── README.md                   # Documentation
├── fraud_detection.ipynb       # Notebook d'entraînement
├── saved_models/               # Modèles sauvegardés
└── creditcarddata.csv          # Dataset
```

## 🔧 Prérequis

- Python 3.8+
- pip
- Modèles entraînés dans `saved_models/`

## 📦 Dépendances

- Flask >= 2.3.0
- pandas >= 2.0.0
- numpy >= 1.24.0
- scikit-learn >= 1.3.0
- joblib >= 1.3.0

## 📊 Exemples de Prédictions

### Scénarios de Test Disponibles

#### 1. Transaction Légitime Normale
```json
{
  "Gender": 1,
  "Age": 35,
  "HouseTypeID": 2,
  "ContactAvaliabilityID": 1,
  "HomeCountry": 1,
  "AccountNo": 12345,
  "CardExpiryDate": 202612,
  "TransactionAmount": 89.99,
  "TransactionCountry": 1,
  "LargePurchase": 0,
  "ProductID": 1,
  "CIF": 67890,
  "TransactionCurrencyCode": 1
}
```
**Résultat attendu** : `no_fraud` avec probabilité faible de fraude

#### 2. Gros Achat Suspect
```json
{
  "Gender": 0,
  "Age": 22,
  "HouseTypeID": 1,
  "ContactAvaliabilityID": 0,
  "HomeCountry": 1,
  "AccountNo": 99999,
  "CardExpiryDate": 202412,
  "TransactionAmount": 15000.00,
  "TransactionCountry": 3,
  "LargePurchase": 1,
  "ProductID": 3,
  "CIF": 99999,
  "TransactionCurrencyCode": 3
}
```
**Résultat attendu** : Risque modéré à élevé

#### 3. Transaction Étrangère
```json
{
  "Gender": 1,
  "Age": 45,
  "HouseTypeID": 3,
  "ContactAvaliabilityID": 1,
  "HomeCountry": 1,
  "AccountNo": 55555,
  "CardExpiryDate": 202512,
  "TransactionAmount": 2500.00,
  "TransactionCountry": 2,
  "LargePurchase": 1,
  "ProductID": 2,
  "CIF": 55555,
  "TransactionCurrencyCode": 2
}
```
**Résultat attendu** : Surveillance renforcée recommandée

### Interprétation des Résultats

| Probabilité de Fraude | Niveau de Risque | Action Recommandée |
|----------------------|------------------|-------------------|
| > 50% | 🔴 ÉLEVÉ | Bloquer et investiguer |
| 30-50% | 🟡 MODÉRÉ | Surveillance renforcée |
| < 30% | 🟢 FAIBLE | Approuver normalement |

## 🎯 Outils de Test Avancés

### Testeur Interactif
Le testeur interactif permet de créer et tester vos propres scénarios :

```bash
python interactive_tester.py
```

**Fonctionnalités :**
- Interface utilisateur conviviale
- Création de transactions personnalisées
- Tests rapides avec scénarios prédéfinis
- Interprétation automatique des résultats

### Tests de Scénarios Spécifiques
Tests automatisés avec 5 scénarios réalistes :

```bash
python test_specific_predictions.py
```

**Scénarios inclus :**
1. Transaction légitime normale
2. Gros achat suspect
3. Transaction étrangère
4. Client âgé avec transaction inhabituelle
5. Transaction nocturne

### Exemples d'Utilisation Pratique
Script avec exemples concrets d'utilisation :

```bash
python examples.py
```

**Inclut :**
- Transactions légitimes et suspectes
- Prédictions en lot
- Vérification du statut de l'API
- Conseils d'interprétation

## 🚨 Dépannage

### API ne démarre pas
```bash
# Vérifier les logs
./deploy.sh logs

# Vérifier le statut
./deploy.sh status
```

### Modèle non trouvé
```bash
# Vérifier que les modèles existent
ls -la saved_models/

# Entraîner le modèle si nécessaire
jupyter notebook fraud_detection.ipynb
```

### Port occupé
L'API utilise le port 8080 par défaut. Si occupé, modifiez le port dans `app.py`.

### Erreurs de Prédiction
Si vous obtenez des erreurs de features :
1. Vérifiez que vous utilisez les bonnes features (voir `/model-info`)
2. Utilisez le testeur interactif pour des exemples corrects
3. Consultez les exemples dans `examples.py`

## 📚 Documentation Complète

- **README.md** - Guide principal (ce fichier)
- **TESTING_GUIDE.md** - Guide détaillé des tests et exemples
- **examples.py** - Exemples d'utilisation pratiques
- **test_specific_predictions.py** - Tests de scénarios spécifiques
- **interactive_tester.py** - Testeur interactif

## 📞 Support

Pour toute question :
1. Vérifiez les logs : `./deploy.sh logs`
2. Testez l'API : `./deploy.sh test`
3. Vérifiez le statut : `./deploy.sh status`
4. Utilisez le testeur interactif : `python interactive_tester.py`
5. Consultez le guide de tests : `TESTING_GUIDE.md`

---

**🎉 Votre API de détection de fraude est prête !**

# fraud_detection_analysis
