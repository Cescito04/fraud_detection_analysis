#!/usr/bin/env python3
"""
Script de test automatique pour les exemples de transactions frauduleuses
"""

import requests
import json
import time
from datetime import datetime

# Configuration
API_BASE_URL = 'http://localhost:8080'

# Exemples de transactions frauduleuses
FRAUD_EXAMPLES = [
    {
        'name': 'Fraude Classique (Montant 0€)',
        'description': 'Pattern le plus fréquent - 62% des fraudes',
        'data': {
            'Gender': 0.0,           # Femme
            'Age': 37.0,            # 37 ans
            'HouseTypeID': 0.0,     # Autre
            'ContactAvaliabilityID': 1.0,  # Oui
            'HomeCountry': 1.0,     # France
            'AccountNo': 12345,
            'CardExpiryDate': 202512,  # Carte valide
            'TransactionAmount': 0.0,  # Montant suspect
            'TransactionCountry': 1.0,  # France
            'LargePurchase': 0.0,   # Achat normal
            'ProductID': 3.0,       # Premium
            'CIF': 67890,
            'TransactionCurrencyCode': 1.0  # EUR
        }
    },
    {
        'name': 'Fraude Senior (Contact Non Disponible)',
        'description': 'Personne âgée avec contact non disponible',
        'data': {
            'Gender': 0.0,           # Femme
            'Age': 62.0,            # 62 ans
            'HouseTypeID': 1.0,     # Maison
            'ContactAvaliabilityID': 0.0,  # Non disponible
            'HomeCountry': 1.0,     # France
            'AccountNo': 12345,
            'CardExpiryDate': 202512,  # Carte valide
            'TransactionAmount': 0.0,  # Montant suspect
            'TransactionCountry': 1.0,  # France
            'LargePurchase': 0.0,   # Achat normal
            'ProductID': 3.0,       # Premium
            'CIF': 67890,
            'TransactionCurrencyCode': 1.0  # EUR
        }
    },
    {
        'name': 'Fraude Jeune Femme',
        'description': 'Jeune femme avec profil suspect',
        'data': {
            'Gender': 0.0,           # Femme
            'Age': 28.0,            # 28 ans
            'HouseTypeID': 0.0,     # Autre
            'ContactAvaliabilityID': 0.0,  # Non disponible
            'HomeCountry': 1.0,     # France
            'AccountNo': 11111,
            'CardExpiryDate': 202512,  # Carte valide
            'TransactionAmount': 0.0,  # Montant suspect
            'TransactionCountry': 1.0,  # France
            'LargePurchase': 0.0,   # Achat normal
            'ProductID': 3.0,       # Premium
            'CIF': 11111,
            'TransactionCurrencyCode': 1.0  # EUR
        }
    },
    {
        'name': 'Fraude Montant Très Faible',
        'description': 'Transaction avec montant très faible',
        'data': {
            'Gender': 0.0,           # Femme
            'Age': 35.0,            # 35 ans
            'HouseTypeID': 1.0,     # Maison
            'ContactAvaliabilityID': 2.0,  # Partiellement disponible
            'HomeCountry': 1.0,     # France
            'AccountNo': 22222,
            'CardExpiryDate': 202512,  # Carte valide
            'TransactionAmount': 0.01,  # Montant très faible
            'TransactionCountry': 1.0,  # France
            'LargePurchase': 0.0,   # Achat normal
            'ProductID': 1.0,       # Standard
            'CIF': 22222,
            'TransactionCurrencyCode': 1.0  # EUR
        }
    },
    {
        'name': 'Fraude Homme Jeune',
        'description': 'Homme jeune avec profil suspect',
        'data': {
            'Gender': 1.0,           # Homme
            'Age': 25.0,            # 25 ans
            'HouseTypeID': 0.0,     # Autre
            'ContactAvaliabilityID': 0.0,  # Non disponible
            'HomeCountry': 1.0,     # France
            'AccountNo': 33333,
            'CardExpiryDate': 202512,  # Carte valide
            'TransactionAmount': 0.0,  # Montant suspect
            'TransactionCountry': 1.0,  # France
            'LargePurchase': 0.0,   # Achat normal
            'ProductID': 2.0,       # Moyen
            'CIF': 33333,
            'TransactionCurrencyCode': 1.0  # EUR
        }
    }
]

def test_api_health():
    """Test de santé de l'API"""
    try:
        response = requests.get(f'{API_BASE_URL}/health', timeout=5)
        if response.status_code == 200:
            data = response.json()
            return data.get('status') == 'healthy'
        return False
    except:
        return False

def test_fraud_example(example):
    """Test d'un exemple de fraude"""
    try:
        response = requests.post(
            f'{API_BASE_URL}/predict',
            json=example['data'],
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            prediction = result['predictions'][0]
            
            return {
                'success': True,
                'prediction': prediction['prediction'],
                'prediction_label': prediction['prediction_label'],
                'confidence_fraud': prediction['confidence']['fraud'],
                'confidence_no_fraud': prediction['confidence']['no_fraud']
            }
        else:
            return {
                'success': False,
                'error': f'HTTP {response.status_code}: {response.text}'
            }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def main():
    """Fonction principale"""
    print(' TEST AUTOMATIQUE DES EXEMPLES DE FRAUDE')
    print('=' * 60)
    print(f' Heure de test: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    print(f' API URL: {API_BASE_URL}')
    print()
    
    # Test de santé de l'API
    print('🔍 Vérification de l\'API...')
    if not test_api_health():
        print(' L\'API n\'est pas accessible ou n\'est pas en bonne santé')
        print('   Assurez-vous que le serveur Flask est démarré sur le port 8080')
        return
    print(' API accessible et en bonne santé')
    print()
    
    # Test des exemples
    results = []
    detected_count = 0
    
    for i, example in enumerate(FRAUD_EXAMPLES, 1):
        print(f' TEST {i}: {example["name"]}')
        print(f'   Description: {example["description"]}')
        
        # Afficher les données clés
        data = example['data']
        print(f'   Genre: {data["Gender"]} ({'Femme' if data["Gender"] == 0 else 'Homme'})')
        print(f'   Âge: {data["Age"]} ans')
        print(f'   Montant: {data["TransactionAmount"]}€')
        print(f'   Contact: {data["ContactAvaliabilityID"]} ({'Non' if data["ContactAvaliabilityID"] == 0 else 'Oui' if data["ContactAvaliabilityID"] == 1 else 'Partiellement'})')
        
        # Test de prédiction
        result = test_fraud_example(example)
        
        if result['success']:
            prediction = result['prediction']
            confidence_fraud = result['confidence_fraud']
            confidence_no_fraud = result['confidence_no_fraud']
            
            print(f'    Prédiction: {result["prediction_label"].upper()}')
            print(f'    Probabilité fraude: {confidence_fraud:.1%}')
            print(f'    Probabilité légitime: {confidence_no_fraud:.1%}')
            
            if prediction == 1:
                print('    FRAUDE DÉTECTÉE !')
                detected_count += 1
            else:
                print('     Non détectée comme fraude')
            
            results.append({
                'name': example['name'],
                'detected': prediction == 1,
                'confidence_fraud': confidence_fraud,
                'confidence_no_fraud': confidence_no_fraud
            })
        else:
            print(f'    Erreur: {result["error"]}')
            results.append({
                'name': example['name'],
                'detected': False,
                'error': result['error']
            })
        
        print()
        time.sleep(0.5)  # Pause entre les tests
    
    # Résumé
    print(' RÉSUMÉ DES TESTS')
    print('=' * 30)
    print(f'Total d\'exemples testés: {len(FRAUD_EXAMPLES)}')
    print(f'Fraudes détectées: {detected_count}')
    print(f'Taux de détection: {detected_count/len(FRAUD_EXAMPLES)*100:.1f}%')
    print()
    
    # Détail des résultats
    print(' DÉTAIL DES RÉSULTATS:')
    for result in results:
        if 'error' in result:
            print(f'    {result["name"]}: Erreur - {result["error"]}')
        else:
            status = ' DÉTECTÉE' if result['detected'] else '⚠️  Non détectée'
            print(f'   {status} {result["name"]}: {result["confidence_fraud"]:.1%} probabilité fraude')
    
    print()
    print(' RECOMMANDATIONS:')
    if detected_count == len(FRAUD_EXAMPLES):
        print('    Excellent ! Tous les exemples sont détectés')
    elif detected_count >= len(FRAUD_EXAMPLES) * 0.8:
        print('    Bon taux de détection (>80%)')
    elif detected_count >= len(FRAUD_EXAMPLES) * 0.5:
        print('    Taux de détection modéré (50-80%)')
    else:
        print('    Taux de détection faible (<50%)')
    
    print('    Utilisez ces exemples pour tester l\'interface web')
    print('    Ouvrez http://localhost:8080 et cliquez sur "Exemple Fraude"')

if __name__ == '__main__':
    main()
