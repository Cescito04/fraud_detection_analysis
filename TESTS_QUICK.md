# 🚀 Tests Rapides - API de Détection de Fraude

## ⚡ Commandes Essentielles

### Vérification Rapide
```bash
# Statut de l'API
./deploy.sh status

# Test de santé
curl http://localhost:8080/health
```

### Tests Complets
```bash
# Tests de base
python test_api.py

# Tests de scénarios
python test_specific_predictions.py

# Testeur interactif
python interactive_tester.py

# Exemples pratiques
python examples.py
```

## 🎯 Tests en 30 Secondes

1. **Vérifier l'API** : `./deploy.sh status`
2. **Test rapide** : `python test_api.py`
3. **Test interactif** : `python interactive_tester.py`

## 📊 Résultats Attendus

- ✅ API en cours d'exécution
- ✅ 4/4 tests réussis
- ✅ Modèle chargé (F1-Score: 0.927)
- ✅ Prédictions fonctionnelles

## 🚨 Dépannage Rapide

| Problème | Solution |
|----------|----------|
| API non disponible | `./deploy.sh restart` |
| Erreur de features | `python interactive_tester.py` |
| Port occupé | Modifier port dans `app.py` |
| Modèle non trouvé | Vérifier `saved_models/` |

---

**📚 Documentation complète : `TESTING_GUIDE.md`**
