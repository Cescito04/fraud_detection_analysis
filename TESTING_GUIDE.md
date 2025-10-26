# 🧪 Guide de Tests - API de Détection de Fraude

## 📋 Vue d'ensemble

Ce guide détaille tous les outils de test disponibles pour l'API de détection de fraude bancaire, avec des exemples pratiques et des scénarios de test.

## 🚀 Tests Rapides

### 1. Vérification de Base
```bash
# Vérifier que l'API fonctionne
./deploy.sh status

# Test de santé
curl http://localhost:8080/health
```

### 2. Test Complet Automatisé
```bash
# Tests de tous les endpoints
python test_api.py
```

**Résultat attendu :**
```
🎯 Résultat: 4/4 tests réussis
🎉 Tous les tests sont passés avec succès!
```

## 🎯 Tests de Scénarios Spécifiques

### Testeur de Scénarios Réalistes
```bash
python test_specific_predictions.py
```

**Scénarios testés :**
1. **Transaction légitime normale** - Montant: 89.99€, Pays: France
2. **Gros achat suspect** - Montant: 15,000€, Pays étranger
3. **Transaction étrangère** - Montant: 2,500€, Pays étranger
4. **Client âgé suspect** - Âge: 75 ans, Montant: 5,000€
5. **Transaction nocturne** - Contact indisponible, Montant: 1,200€

**Exemple de sortie :**
```
🔍 Transaction légitime normale
   💰 Montant: 89.99€
   🌍 Pays: 1
   👤 Âge: 35 ans
   🎯 PRÉDICTION:
      Résultat: NO_FRAUD
      Probabilité de fraude: 8.0%
      Niveau de risque: 🟢 FAIBLE
```

## 🎮 Testeur Interactif

### Interface Utilisateur
```bash
python interactive_tester.py
```

**Menu disponible :**
```
🎯 MENU PRINCIPAL
==================
1. Créer une transaction personnalisée
2. Tests rapides avec scénarios prédéfinis
3. Quitter
```

### Création de Transaction Personnalisée

Le testeur interactif vous guide pour créer une transaction :

```
📋 Informations de base:
Genre (0=Femme, 1=Homme) (défaut: 1): 
Âge (défaut: 35): 
Type de logement (1=Maison, 2=Appartement, 3=Villa) (défaut: 2): 

🏦 Informations bancaires:
Numéro de compte (défaut: 12345): 
Date d'expiration carte (YYYYMM) (défaut: 202512): 

💳 Détails de la transaction:
Montant de la transaction (défaut: 100.0): 
Pays de transaction (1=France, 2=Autre) (défaut: 1): 
```

## 📊 Exemples d'Utilisation Pratique

### Script d'Exemples
```bash
python examples.py
```

**Fonctionnalités :**
- Vérification du statut de l'API
- Exemples de transactions légitimes et suspectes
- Prédictions en lot
- Conseils d'interprétation

## 🔍 Tests Manuels avec cURL

### Test de Santé
```bash
curl http://localhost:8080/health
```

### Test de Prédiction Simple
```bash
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

### Test avec Données Réelles
```bash
# Test avec une vraie transaction frauduleuse du dataset
python -c "
import pandas as pd
import requests
import json

df = pd.read_csv('creditcarddata.csv')
fraud_sample = df[df['PotentialFraud'] == 1].iloc[0]
fraud_data = fraud_sample.drop('PotentialFraud').to_dict()

response = requests.post('http://localhost:8080/predict', json=fraud_data)
result = response.json()
prediction = result['predictions'][0]

print(f'Montant: {fraud_data[\"TransactionAmount\"]}€')
print(f'Prédiction: {prediction[\"prediction_label\"]}')
print(f'Probabilité fraude: {prediction[\"confidence\"][\"fraud\"]:.1%}')
"
```

## 📈 Interprétation des Résultats

### Niveaux de Risque

| Probabilité | Niveau | Action | Couleur |
|-------------|--------|--------|---------|
| > 50% | ÉLEVÉ | Bloquer et investiguer | 🔴 |
| 30-50% | MODÉRÉ | Surveillance renforcée | 🟡 |
| < 30% | FAIBLE | Approuver normalement | 🟢 |

### Exemple de Réponse API
```json
{
  "predictions": [
    {
      "transaction_id": 0,
      "prediction": 0,
      "prediction_label": "no_fraud",
      "confidence": {
        "no_fraud": 0.92,
        "fraud": 0.08
      },
      "timestamp": "2025-10-25T23:58:13.679307"
    }
  ],
  "model_info": {
    "name": "Forêt Aléatoire",
    "f1_score": 0.9267643142476698
  }
}
```

## 🚨 Dépannage des Tests

### Erreur "API non disponible"
```bash
# Vérifier le statut
./deploy.sh status

# Redémarrer l'API
./deploy.sh restart
```

### Erreur "Feature names should match"
```bash
# Vérifier les features du modèle
curl http://localhost:8080/model-info

# Utiliser le testeur interactif pour des exemples corrects
python interactive_tester.py
```

### Erreur de connexion
```bash
# Vérifier que le port 8080 est libre
lsof -i :8080

# Vérifier les logs
./deploy.sh logs
```

## 📋 Checklist de Tests

### Tests Obligatoires
- [ ] API démarre correctement (`./deploy.sh status`)
- [ ] Endpoint `/health` répond (`curl http://localhost:8080/health`)
- [ ] Endpoint `/predict` fonctionne (`python test_api.py`)
- [ ] Modèle chargé correctement (`curl http://localhost:8080/model-info`)

### Tests Recommandés
- [ ] Tests de scénarios spécifiques (`python test_specific_predictions.py`)
- [ ] Testeur interactif (`python interactive_tester.py`)
- [ ] Exemples pratiques (`python examples.py`)
- [ ] Test avec données réelles du dataset

### Tests Avancés
- [ ] Tests de charge (transactions multiples)
- [ ] Tests de limites (montants extrêmes)
- [ ] Tests de robustesse (données manquantes)
- [ ] Tests de performance (temps de réponse)

## 🎯 Conseils d'Utilisation

### Pour les Développeurs
1. Utilisez `python test_api.py` pour les tests de base
2. Utilisez `python interactive_tester.py` pour tester vos propres scénarios
3. Consultez `examples.py` pour des exemples d'intégration

### Pour les Utilisateurs Métier
1. Utilisez `python test_specific_predictions.py` pour voir des cas d'usage
2. Utilisez `python interactive_tester.py` pour tester des cas spécifiques
3. Adaptez les seuils de risque selon votre politique

### Pour les Tests de Production
1. Testez avec des données réelles du dataset
2. Vérifiez les performances avec des charges importantes
3. Surveillez les logs pour détecter les erreurs

---

**🎉 Votre système de tests est complet et prêt à l'emploi !**
