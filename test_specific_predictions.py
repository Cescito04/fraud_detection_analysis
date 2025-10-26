#!/usr/bin/env python3
"""
Tests de Prédictions Spécifiques - API de Détection de Fraude
Scénarios réalistes pour tester différents cas de fraude
"""

import requests
import json
from datetime import datetime

API_URL = "http://localhost:8080"

def test_transaction_scenario(scenario_name, transaction_data):
    """Tester un scénario de transaction spécifique"""
    print(f"🔍 {scenario_name}")
    print("-" * 50)
    
    try:
        response = requests.post(f"{API_URL}/predict", json=transaction_data)
        result = response.json()
        
        if response.status_code == 200:
            prediction = result["predictions"][0]
            
            # Affichage des détails
            print(f"   💰 Montant: {transaction_data['TransactionAmount']}€")
            print(f"   🌍 Pays: {transaction_data['TransactionCountry']}")
            print(f"   👤 Âge: {transaction_data['Age']} ans")
            print(f"   🏠 Type de logement: {transaction_data['HouseTypeID']}")
            print(f"   📞 Contact disponible: {'Oui' if transaction_data['ContactAvaliabilityID'] else 'Non'}")
            
            # Résultat de la prédiction
            fraud_prob = prediction['confidence']['fraud']
            no_fraud_prob = prediction['confidence']['no_fraud']
            
            print(f"\n   🎯 PRÉDICTION:")
            print(f"      Résultat: {prediction['prediction_label'].upper()}")
            print(f"      Probabilité de fraude: {fraud_prob:.1%}")
            print(f"      Probabilité légitime: {no_fraud_prob:.1%}")
            
            # Interprétation du risque
            if prediction['prediction'] == 1:
                risk_level = "🔴 ÉLEVÉ"
                risk_color = "ROUGE"
            elif fraud_prob > 0.3:
                risk_level = "🟡 MODÉRÉ"
                risk_color = "ORANGE"
            else:
                risk_level = "🟢 FAIBLE"
                risk_color = "VERT"
            
            print(f"      Niveau de risque: {risk_level}")
            
            # Recommandations
            print(f"\n   💡 RECOMMANDATIONS:")
            if prediction['prediction'] == 1:
                print("      ⚠️  TRANSACTION SUSPECTE - Investigation requise")
                print("      🔒 Bloquer temporairement la transaction")
                print("      📞 Contacter le client immédiatement")
            elif fraud_prob > 0.3:
                print("      ⚠️  Risque modéré - Surveillance renforcée")
                print("      📊 Analyser les patterns de transaction")
                print("      🔍 Vérifier l'historique du client")
            else:
                print("      ✅ Transaction légitime - Approuver")
                print("      📈 Continuer la surveillance normale")
            
            return {
                'scenario': scenario_name,
                'prediction': prediction['prediction'],
                'fraud_probability': fraud_prob,
                'risk_level': risk_color
            }
            
        else:
            print(f"   ❌ Erreur API: {result.get('error', 'Erreur inconnue')}")
            return None
            
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return None
    
    print()

def main():
    """Tests de scénarios spécifiques"""
    print("🏦 TESTS DE PRÉDICTIONS SPÉCIFIQUES - DÉTECTION DE FRAUDE")
    print("=" * 70)
    print()
    
    # Scénario 1: Transaction légitime normale
    print("📋 SCÉNARIO 1: Transaction légitime normale")
    legitimate_transaction = {
        "Gender": 1,  # Homme
        "Age": 35,
        "HouseTypeID": 2,  # Appartement
        "ContactAvaliabilityID": 1,  # Disponible
        "HomeCountry": 1,  # France
        "AccountNo": 12345,
        "CardExpiryDate": 202612,  # Carte valide longtemps
        "TransactionAmount": 89.99,
        "TransactionCountry": 1,  # France
        "LargePurchase": 0,  # Pas un gros achat
        "ProductID": 1,  # Produit standard
        "CIF": 67890,
        "TransactionCurrencyCode": 1  # EUR
    }
    result1 = test_transaction_scenario("Transaction légitime normale", legitimate_transaction)
    print()
    
    # Scénario 2: Gros achat suspect
    print("📋 SCÉNARIO 2: Gros achat suspect")
    large_purchase = {
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
    result2 = test_transaction_scenario("Gros achat suspect", large_purchase)
    print()
    
    # Scénario 3: Transaction étrangère
    print("📋 SCÉNARIO 3: Transaction étrangère")
    foreign_transaction = {
        "Gender": 1,  # Homme
        "Age": 45,
        "HouseTypeID": 3,  # Villa
        "ContactAvaliabilityID": 1,  # Disponible
        "HomeCountry": 1,  # France
        "AccountNo": 55555,
        "CardExpiryDate": 202512,
        "TransactionAmount": 2500.00,
        "TransactionCountry": 2,  # Pays étranger
        "LargePurchase": 1,  # Gros achat
        "ProductID": 2,  # Produit moyen
        "CIF": 55555,
        "TransactionCurrencyCode": 2  # Devise étrangère
    }
    result3 = test_transaction_scenario("Transaction étrangère", foreign_transaction)
    print()
    
    # Scénario 4: Client âgé avec transaction inhabituelle
    print("📋 SCÉNARIO 4: Client âgé avec transaction inhabituelle")
    elderly_suspicious = {
        "Gender": 0,  # Femme
        "Age": 75,  # Âge élevé
        "HouseTypeID": 1,  # Maison
        "ContactAvaliabilityID": 0,  # Non disponible
        "HomeCountry": 1,  # France
        "AccountNo": 77777,
        "CardExpiryDate": 202412,  # Carte qui expire bientôt
        "TransactionAmount": 5000.00,
        "TransactionCountry": 3,  # Pays étranger
        "LargePurchase": 1,  # Gros achat
        "ProductID": 3,  # Produit premium
        "CIF": 77777,
        "TransactionCurrencyCode": 3  # Devise étrangère
    }
    result4 = test_transaction_scenario("Client âgé - transaction inhabituelle", elderly_suspicious)
    print()
    
    # Scénario 5: Transaction nocturne
    print("📋 SCÉNARIO 5: Transaction nocturne")
    night_transaction = {
        "Gender": 1,  # Homme
        "Age": 28,
        "HouseTypeID": 2,  # Appartement
        "ContactAvaliabilityID": 0,  # Non disponible (nuit)
        "HomeCountry": 1,  # France
        "AccountNo": 33333,
        "CardExpiryDate": 202512,
        "TransactionAmount": 1200.00,
        "TransactionCountry": 2,  # Pays étranger
        "LargePurchase": 0,  # Pas un gros achat
        "ProductID": 1,  # Produit standard
        "CIF": 33333,
        "TransactionCurrencyCode": 2  # Devise étrangère
    }
    result5 = test_transaction_scenario("Transaction nocturne", night_transaction)
    print()
    
    # Résumé des résultats
    print("📊 RÉSUMÉ DES TESTS")
    print("=" * 30)
    
    results = [result1, result2, result3, result4, result5]
    valid_results = [r for r in results if r is not None]
    
    if valid_results:
        print(f"   Tests réussis: {len(valid_results)}/5")
        
        # Statistiques
        fraud_detected = sum(1 for r in valid_results if r['prediction'] == 1)
        avg_fraud_prob = sum(r['fraud_probability'] for r in valid_results) / len(valid_results)
        
        print(f"   Fraudes détectées: {fraud_detected}")
        print(f"   Probabilité moyenne de fraude: {avg_fraud_prob:.1%}")
        
        # Répartition des risques
        risk_levels = {}
        for r in valid_results:
            risk = r['risk_level']
            risk_levels[risk] = risk_levels.get(risk, 0) + 1
        
        print(f"   Répartition des risques:")
        for risk, count in risk_levels.items():
            print(f"      {risk}: {count} transaction(s)")
    
    print()
    print("✅ Tests de prédictions spécifiques terminés!")
    print()
    print("💡 Conseils d'interprétation:")
    print("   - Probabilité > 50% = Risque élevé")
    print("   - Probabilité 30-50% = Risque modéré")
    print("   - Probabilité < 30% = Risque faible")
    print("   - Adaptez les seuils selon votre politique de risque")

if __name__ == "__main__":
    main()
