#!/usr/bin/env python3
"""
Script de test pour l'API de Détection de Fraude
"""

import requests
import json

API_URL = "http://localhost:8080"

def test_health():
    """Test de santé de l'API"""
    print("🔍 Test de santé...")
    try:
        response = requests.get(f"{API_URL}/health")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"    Erreur: {e}")
        return False

def test_info():
    """Test des informations de l'API"""
    print("\n Test des informations...")
    try:
        response = requests.get(f"{API_URL}/")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"    Erreur: {e}")
        return False

def test_predict():
    """Test de prédiction"""
    print("\n🔍 Test de prédiction...")
    
    # Données de test avec les vraies features
    test_data = {
        "Gender": 1,
        "Age": 35,
        "HouseTypeID": 2,
        "ContactAvaliabilityID": 1,
        "HomeCountry": 1,
        "AccountNo": 12345,
        "CardExpiryDate": 202512,
        "TransactionAmount": 150.50,
        "TransactionCountry": 1,
        "LargePurchase": 0,
        "ProductID": 1,
        "CIF": 67890,
        "TransactionCurrencyCode": 1
    }
    
    try:
        response = requests.post(
            f"{API_URL}/predict",
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"    Erreur: {e}")
        return False

def test_model_info():
    """Test des informations du modèle"""
    print("\n🔍 Test des informations du modèle...")
    try:
        response = requests.get(f"{API_URL}/model-info")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"    Erreur: {e}")
        return False

def main():
    """Fonction principale de test"""
    print("🧪 TEST DE L'API DE DÉTECTION DE FRAUDE")
    print("=" * 50)
    
    tests = [
        ("Santé", test_health),
        ("Informations", test_info),
        ("Prédiction", test_predict),
        ("Informations du modèle", test_model_info)
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"    Erreur inattendue: {e}")
            results.append((name, False))
    
    # Résumé
    print("\n RÉSUMÉ DES TESTS:")
    print("=" * 30)
    passed = 0
    for name, result in results:
        status = " PASSÉ" if result else " ÉCHOUÉ"
        print(f"   {name}: {status}")
        if result:
            passed += 1
    
    print(f"\n Résultat: {passed}/{len(results)} tests réussis")
    
    if passed == len(results):
        print(" Tous les tests sont passés avec succès!")
    else:
        print("  Certains tests ont échoué")

if __name__ == "__main__":
    main()

