#!/usr/bin/env python3
"""
Exemples d'utilisation de l'API de Détection de Fraude Bancaire
"""

import requests
import json
from datetime import datetime

API_URL = "http://localhost:8080"

def example_legitimate_transaction():
    """Exemple de transaction légitime"""
    print(" Exemple de transaction légitime:")
    print("-" * 40)
    
    transaction = {
        "Gender": 1,  # Homme
        "Age": 35,
        "HouseTypeID": 2,  # Appartement
        "ContactAvaliabilityID": 1,  # Disponible
        "HomeCountry": 1,  # France
        "AccountNo": 12345,
        "CardExpiryDate": 202512,
        "TransactionAmount": 89.99,
        "TransactionCountry": 1,  # France
        "LargePurchase": 0,  # Pas un gros achat
        "ProductID": 1,  # Produit standard
        "CIF": 67890,
        "TransactionCurrencyCode": 1  # EUR
    }
    
    response = requests.post(f"{API_URL}/predict", json=transaction)
    result = response.json()
    
    prediction = result["predictions"][0]
    print(f"   Montant: {transaction['TransactionAmount']}€")
    print(f"   Pays: {transaction['TransactionCountry']}")
    print(f"   Prédiction: {prediction['prediction_label']}")
    print(f"   Confiance: {prediction['confidence']['fraud']:.1%} fraude")
    print(f"   Risque: {'🟢 FAIBLE' if prediction['prediction'] == 0 else '🔴 ÉLEVÉ'}")
    print()

def example_suspicious_transaction():
    """Exemple de transaction suspecte"""
    print(" Exemple de transaction suspecte:")
    print("-" * 40)
    
    transaction = {
        "Gender": 0,  # Femme
        "Age": 22,
        "HouseTypeID": 1,  # Maison
        "ContactAvaliabilityID": 0,  # Non disponible
        "HomeCountry": 1,  # France
        "AccountNo": 99999,
        "CardExpiryDate": 202412,  # Carte qui expire bientôt
        "TransactionAmount": 15000.00,  # Gros montant
        "TransactionCountry": 3,  # Pays étranger
        "LargePurchase": 1,  # Gros achat
        "ProductID": 3,  # Produit premium
        "CIF": 99999,
        "TransactionCurrencyCode": 3  # Devise étrangère
    }
    
    response = requests.post(f"{API_URL}/predict", json=transaction)
    result = response.json()
    
    prediction = result["predictions"][0]
    print(f"   Montant: {transaction['TransactionAmount']}€")
    print(f"   Pays: {transaction['TransactionCountry']}")
    print(f"   Prédiction: {prediction['prediction_label']}")
    print(f"   Confiance: {prediction['confidence']['fraud']:.1%} fraude")
    print(f"   Risque: {'🟢 FAIBLE' if prediction['prediction'] == 0 else '🔴 ÉLEVÉ'}")
    print()

def batch_prediction_example():
    """Exemple de prédiction en lot"""
    print("📊 Exemple de prédiction en lot:")
    print("-" * 40)
    
    transactions = [
        {
            "Gender": 1, "Age": 45, "HouseTypeID": 2, "ContactAvaliabilityID": 1,
            "HomeCountry": 1, "AccountNo": 11111, "CardExpiryDate": 202612,
            "TransactionAmount": 250.00, "TransactionCountry": 1, "LargePurchase": 0,
            "ProductID": 1, "CIF": 11111, "TransactionCurrencyCode": 1
        },
        {
            "Gender": 0, "Age": 28, "HouseTypeID": 1, "ContactAvaliabilityID": 0,
            "HomeCountry": 1, "AccountNo": 22222, "CardExpiryDate": 202412,
            "TransactionAmount": 5000.00, "TransactionCountry": 2, "LargePurchase": 1,
            "ProductID": 2, "CIF": 22222, "TransactionCurrencyCode": 2
        },
        {
            "Gender": 1, "Age": 60, "HouseTypeID": 3, "ContactAvaliabilityID": 1,
            "HomeCountry": 1, "AccountNo": 33333, "CardExpiryDate": 202512,
            "TransactionAmount": 75.50, "TransactionCountry": 1, "LargePurchase": 0,
            "ProductID": 1, "CIF": 33333, "TransactionCurrencyCode": 1
        }
    ]
    
    response = requests.post(f"{API_URL}/predict", json=transactions)
    result = response.json()
    
    print(f"   Nombre de transactions: {len(transactions)}")
    print(f"   Modèle utilisé: {result['model_info']['name']}")
    print(f"   F1-Score du modèle: {result['model_info']['f1_score']:.3f}")
    print()
    
    for i, prediction in enumerate(result["predictions"]):
        transaction = transactions[i]
        risk_emoji = "🔴" if prediction['prediction'] == 1 else "🟢"
        print(f"   Transaction {i+1}: {transaction['TransactionAmount']}€ "
              f"→ {prediction['prediction_label']} {risk_emoji} "
              f"({prediction['confidence']['fraud']:.1%})")

def api_status_check():
    """Vérification du statut de l'API"""
    print(" Vérification du statut de l'API:")
    print("-" * 40)
    
    try:
        # Test de santé
        health_response = requests.get(f"{API_URL}/health")
        health_data = health_response.json()
        
        print(f"   Statut: {health_data['status']}")
        print(f"   Modèle chargé: {health_data['model_loaded']}")
        print(f"   Timestamp: {health_data['timestamp']}")
        
        # Informations du modèle
        model_response = requests.get(f"{API_URL}/model-info")
        model_data = model_response.json()
        
        print(f"   Modèle: {model_data['model_name']}")
        print(f"   Accuracy: {model_data['accuracy']:.3f}")
        print(f"   F1-Score: {model_data['f1_score']:.3f}")
        print(f"   Features: {len(model_data['features'])}")
        
    except Exception as e:
        print(f"    Erreur: {e}")

def main():
    """Fonction principale"""
    print(" EXEMPLES D'UTILISATION - API DE DÉTECTION DE FRAUDE")
    print("=" * 60)
    print()
    
    # Vérification du statut
    api_status_check()
    print()
    
    # Exemples de prédictions
    example_legitimate_transaction()
    example_suspicious_transaction()
    batch_prediction_example()
    
    print(" Tous les exemples ont été exécutés avec succès!")
    print()
    print(" Conseils d'utilisation:")
    print("   - Utilisez des données réalistes pour de meilleures prédictions")
    print("   - Surveillez les transactions avec une confiance élevée en fraude")
    print("   - Adaptez les seuils selon votre politique de risque")
    print("   - Testez régulièrement avec de nouvelles données")

if __name__ == "__main__":
    main()

