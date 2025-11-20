#!/bin/bash

# Script simple pour démarrer l'application en local avec affichage des logs

cd "$(dirname "$0")"

echo "🔨 Construction et démarrage du projet..."
echo ""

# Vérifier l'environnement virtuel
if [ ! -d "venv" ]; then
    echo "❌ Environnement virtuel non trouvé. Exécutez: ./build_local.sh"
    exit 1
fi

# Arrêter les instances existantes
pkill -f "python.*app.py" 2>/dev/null || true
sleep 1

# Définir les variables d'environnement
export PORT=8080
export HOST=127.0.0.1

echo "🚀 Démarrage de l'application sur http://${HOST}:${PORT}"
echo ""
echo "⚡ Mode démarrage rapide activé"
echo "   • L'API démarre immédiatement"
echo "   • Le modèle se charge en arrière-plan (10-30 secondes)"
echo "   • L'interface web est accessible tout de suite"
echo "   • Vérifiez /health pour l'état du modèle"
echo ""
echo "💡 Appuyez sur Ctrl+C pour arrêter"
echo ""

# Démarrer l'application
venv/bin/python app.py


