#!/usr/bin/env python3
"""
API Flask pour la Détection de Fraude Bancaire
Version optimisée et simplifiée
"""

from flask import Flask, request, jsonify, render_template
import joblib
import pandas as pd
import numpy as np
import json
import os
from datetime import datetime

# Initialisation de l'application Flask
app = Flask(__name__)

# Variables globales
model = None
model_info = None

def load_model():
    """Charger le meilleur modèle sauvegardé"""
    global model, model_info
    
    try:
        # Trouver le modèle le plus récent
        model_dir = "saved_models"
        model_files = [f for f in os.listdir(model_dir) 
                      if f.startswith("best_model_") and f.endswith(".joblib")]
        
        if not model_files:
            raise FileNotFoundError("Aucun modèle trouvé")
        
        # Prendre le plus récent
        latest_model = sorted(model_files)[-1]
        model_path = os.path.join(model_dir, latest_model)
        
        # Charger le modèle
        model = joblib.load(model_path)
        print(f" Modèle chargé: {latest_model}")
        
        # Charger les métadonnées si disponibles
        metadata_files = [f for f in os.listdir(model_dir) 
                         if f.startswith("model_metadata_") and f.endswith(".json")]
        if metadata_files:
            latest_metadata = sorted(metadata_files)[-1]
            metadata_path = os.path.join(model_dir, latest_metadata)
            
            with open(metadata_path, 'r') as f:
                model_info = json.load(f)
            print(f" Métadonnées chargées: {latest_metadata}")
        
        return True
        
    except Exception as e:
        print(f" Erreur chargement modèle: {e}")
        return False

@app.route('/', methods=['GET'])
def home():
    """Page d'accueil avec interface web"""
    return render_template('index.html')

@app.route('/api', methods=['GET'])
def api_info():
    """Informations sur l'API"""
    return jsonify({
        "message": "API de Détection de Fraude Bancaire",
        "version": "1.0.0",
        "status": "active",
        "model_loaded": model is not None,
        "endpoints": {
            "/": "Interface web",
            "/api": "Informations sur l'API",
            "/health": "Vérification de santé",
            "/predict": "Prédiction de fraude (POST)"
        },
        "timestamp": datetime.now().isoformat()
    })

@app.route('/health', methods=['GET'])
def health():
    """Vérification de santé du service"""
    return jsonify({
        "status": "healthy" if model is not None else "unhealthy",
        "model_loaded": model is not None,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Prédiction de fraude"""
    try:
        if model is None:
            return jsonify({"error": "Modèle non chargé"}), 500
        
        # Récupérer les données
        data = request.get_json()
        if not data:
            return jsonify({"error": "Aucune donnée fournie"}), 400
        
        # Convertir en DataFrame
        if isinstance(data, dict):
            df = pd.DataFrame([data])
        elif isinstance(data, list):
            df = pd.DataFrame(data)
        else:
            return jsonify({"error": "Format de données invalide"}), 400
        
        # Faire la prédiction
        predictions = model.predict(df)
        
        # Obtenir les probabilités si disponibles
        probabilities = None
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(df).tolist()
        
        # Préparer la réponse
        results = []
        for i, pred in enumerate(predictions):
            result = {
                "transaction_id": i,
                "prediction": int(pred),
                "prediction_label": "fraud" if pred == 1 else "no_fraud",
                "timestamp": datetime.now().isoformat()
            }
            
            if probabilities:
                result["confidence"] = {
                    "no_fraud": float(probabilities[i][0]),
                    "fraud": float(probabilities[i][1])
                }
            
            results.append(result)
        
        return jsonify({
            "predictions": results,
            "model_info": {
                "name": model_info.get('model_name', 'Unknown') if model_info else 'Unknown',
                "f1_score": model_info.get('f1_score', 0) if model_info else 0
            },
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({"error": f"Erreur lors de la prédiction: {str(e)}"}), 500

@app.route('/model-info', methods=['GET'])
def model_info_endpoint():
    """Informations sur le modèle"""
    if model_info:
        return jsonify(model_info)
    else:
        return jsonify({"error": "Informations du modèle non disponibles"}), 404

if __name__ == '__main__':
    print("🚀 Démarrage de l'API de Détection de Fraude...")
    
    # Charger le modèle au démarrage
    if load_model():
        print(" ✅ Modèle chargé avec succès")
        
        # Récupérer le port depuis l'environnement (pour déploiement public)
        port = int(os.environ.get('PORT', 8080))
        host = os.environ.get('HOST', '0.0.0.0')
        
        print(f" 🌐 API disponible sur: http://{host}:{port}")
        print(" 📋 Endpoints:")
        print("   GET  /           - Interface web")
        print("   GET  /api        - Informations sur l'API")
        print("   GET  /health     - Vérification de santé")
        print("   GET  /model-info - Informations du modèle")
        print("   POST /predict    - Prédiction de fraude")
        
        # Démarrer l'API
        app.run(host=host, port=port, debug=False)
    else:
        print(" ❌ Impossible de charger le modèle")
        print("Vérifiez que le dossier 'saved_models' contient des modèles valides")

