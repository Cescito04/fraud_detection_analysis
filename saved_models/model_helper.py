
import joblib
import pickle

def load_best_model(model_path):
    """
    Fonction pour charger le meilleur modèle sauvegardé
    """
    try:
        model = joblib.load(model_path)
        print(f" Modèle chargé depuis: {model_path}")
        return model
    except:
        try:
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
            print(f" Modèle chargé depuis: {model_path}")
            return model
        except Exception as e:
            print(f" Erreur chargement modèle: {e}")
            return None

def predict_fraud(model, data):
    """
    Fonction pour prédire la fraude avec le modèle chargé
    """
    try:
        predictions = model.predict(data)
        probabilities = model.predict_proba(data) if hasattr(model, 'predict_proba') else None
        return predictions, probabilities
    except Exception as e:
        print(f" Erreur prédiction: {e}")
        return None, None
