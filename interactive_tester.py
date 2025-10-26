#!/usr/bin/env python3
"""
Testeur Interactif de Prédictions - API de Détection de Fraude
Permet de tester des scénarios personnalisés
"""

import requests
import json

API_URL = "http://localhost:8080"

def get_user_input(prompt, default=None, input_type=int):
    """Obtenir une entrée utilisateur avec valeur par défaut"""
    try:
        if default is not None:
            user_input = input(f"{prompt} (défaut: {default}): ").strip()
            if not user_input:
                return default
        else:
            user_input = input(f"{prompt}: ").strip()
        
        return input_type(user_input)
    except ValueError:
        print(f" Valeur invalide. Utilisation de la valeur par défaut: {default}")
        return default

def create_transaction():
    """Créer une transaction personnalisée"""
    print("\n  CRÉATION D'UNE TRANSACTION PERSONNALISÉE")
    print("=" * 50)
    
    transaction = {}
    
    # Informations de base
    print("\n Informations de base:")
    transaction['Gender'] = get_user_input("Genre (0=Femme, 1=Homme)", 1)
    transaction['Age'] = get_user_input("Âge", 35)
    transaction['HouseTypeID'] = get_user_input("Type de logement (1=Maison, 2=Appartement, 3=Villa)", 2)
    transaction['ContactAvaliabilityID'] = get_user_input("Contact disponible (0=Non, 1=Oui)", 1)
    transaction['HomeCountry'] = get_user_input("Pays d'origine (1=France, 2=Autre)", 1)
    
    # Informations bancaires
    print("\n Informations bancaires:")
    transaction['AccountNo'] = get_user_input("Numéro de compte", 12345)
    transaction['CardExpiryDate'] = get_user_input("Date d'expiration carte (YYYYMM)", 202512)
    transaction['CIF'] = get_user_input("CIF", 67890)
    
    # Transaction
    print("\n Détails de la transaction:")
    transaction['TransactionAmount'] = get_user_input("Montant de la transaction", 100.0, float)
    transaction['TransactionCountry'] = get_user_input("Pays de transaction (1=France, 2=Autre)", 1)
    transaction['TransactionCurrencyCode'] = get_user_input("Code devise (1=EUR, 2=USD, 3=Autre)", 1)
    transaction['LargePurchase'] = get_user_input("Gros achat (0=Non, 1=Oui)", 0)
    transaction['ProductID'] = get_user_input("ID Produit (1=Standard, 2=Moyen, 3=Premium)", 1)
    
    return transaction

def test_transaction(transaction):
    """Tester une transaction"""
    print("\n ANALYSE DE LA TRANSACTION")
    print("=" * 40)
    
    try:
        response = requests.post(f"{API_URL}/predict", json=transaction)
        result = response.json()
        
        if response.status_code == 200:
            prediction = result["predictions"][0]
            
            # Affichage des détails
            print(f" Montant: {transaction['TransactionAmount']}€")
            print(f" Pays: {transaction['TransactionCountry']}")
            print(f" Âge: {transaction['Age']} ans")
            print(f" Type de logement: {transaction['HouseTypeID']}")
            print(f" Contact disponible: {'Oui' if transaction['ContactAvaliabilityID'] else 'Non'}")
            
            # Résultat de la prédiction
            fraud_prob = prediction['confidence']['fraud']
            no_fraud_prob = prediction['confidence']['no_fraud']
            
            print(f"\n🎯 RÉSULTAT DE L'ANALYSE:")
            print(f"   Prédiction: {prediction['prediction_label'].upper()}")
            print(f"   Probabilité de fraude: {fraud_prob:.1%}")
            print(f"   Probabilité légitime: {no_fraud_prob:.1%}")
            
            # Interprétation du risque
            if prediction['prediction'] == 1:
                risk_level = " ÉLEVÉ"
                recommendation = "  TRANSACTION SUSPECTE - Investigation requise"
            elif fraud_prob > 0.3:
                risk_level = " MODÉRÉ"
                recommendation = "  Risque modéré - Surveillance renforcée"
            else:
                risk_level = " FAIBLE"
                recommendation = " Transaction légitime - Approuver"
            
            print(f"   Niveau de risque: {risk_level}")
            print(f"   Recommandation: {recommendation}")
            
            return prediction
            
        else:
            print(f" Erreur API: {result.get('error', 'Erreur inconnue')}")
            return None
            
    except Exception as e:
        print(f" Erreur: {e}")
        return None

def quick_test_scenarios():
    """Tests rapides avec scénarios prédéfinis"""
    print("\n⚡ TESTS RAPIDES - SCÉNARIOS PRÉDÉFINIS")
    print("=" * 50)
    
    scenarios = [
        {
            "name": "Transaction normale",
            "data": {
                "Gender": 1, "Age": 35, "HouseTypeID": 2, "ContactAvaliabilityID": 1,
                "HomeCountry": 1, "AccountNo": 12345, "CardExpiryDate": 202612,
                "TransactionAmount": 89.99, "TransactionCountry": 1, "LargePurchase": 0,
                "ProductID": 1, "CIF": 67890, "TransactionCurrencyCode": 1
            }
        },
        {
            "name": "Gros achat suspect",
            "data": {
                "Gender": 0, "Age": 22, "HouseTypeID": 1, "ContactAvaliabilityID": 0,
                "HomeCountry": 1, "AccountNo": 99999, "CardExpiryDate": 202412,
                "TransactionAmount": 15000.00, "TransactionCountry": 3, "LargePurchase": 1,
                "ProductID": 3, "CIF": 99999, "TransactionCurrencyCode": 3
            }
        },
        {
            "name": "Transaction étrangère",
            "data": {
                "Gender": 1, "Age": 45, "HouseTypeID": 3, "ContactAvaliabilityID": 1,
                "HomeCountry": 1, "AccountNo": 55555, "CardExpiryDate": 202512,
                "TransactionAmount": 2500.00, "TransactionCountry": 2, "LargePurchase": 1,
                "ProductID": 2, "CIF": 55555, "TransactionCurrencyCode": 2
            }
        }
    ]
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"\n📋 Scénario {i}: {scenario['name']}")
        print("-" * 30)
        test_transaction(scenario['data'])

def main():
    """Fonction principale"""
    print(" TESTEUR INTERACTIF - DÉTECTION DE FRAUDE BANCAIRE")
    print("=" * 60)
    
    # Vérifier que l'API est disponible
    try:
        response = requests.get(f"{API_URL}/health")
        if response.status_code != 200:
            print(" L'API n'est pas disponible. Démarrez-la avec: ./deploy.sh deploy")
            return
    except:
        print(" L'API n'est pas disponible. Démarrez-la avec: ./deploy.sh deploy")
        return
    
    print(" API disponible et fonctionnelle")
    
    while True:
        print("\n MENU PRINCIPAL")
        print("=" * 20)
        print("1. Créer une transaction personnalisée")
        print("2. Tests rapides avec scénarios prédéfinis")
        print("3. Quitter")
        
        choice = input("\nVotre choix (1-3): ").strip()
        
        if choice == "1":
            transaction = create_transaction()
            test_transaction(transaction)
            
        elif choice == "2":
            quick_test_scenarios()
            
        elif choice == "3":
            print("\n👋 Merci d'avoir utilisé le testeur interactif!")
            break
            
        else:
            print(" Choix invalide. Veuillez choisir 1, 2 ou 3.")
        
        # Demander si l'utilisateur veut continuer
        if choice in ["1", "2"]:
            continue_choice = input("\nVoulez-vous faire un autre test? (o/n): ").strip().lower()
            if continue_choice not in ["o", "oui", "y", "yes"]:
                print("\n👋 Merci d'avoir utilisé le testeur interactif!")
                break

if __name__ == "__main__":
    main()
