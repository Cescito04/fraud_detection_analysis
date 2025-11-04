#!/bin/bash

# Script pour préparer le déploiement sur Render
# Ce script force l'ajout des modèles au repository Git

echo "🚀 Préparation du déploiement sur Render..."
echo ""

# Vérifier si les modèles existent
if [ ! -d "saved_models" ]; then
    echo " Erreur: Le dossier 'saved_models' n'existe pas"
    exit 1
fi

# Compter les modèles
MODEL_COUNT=$(find saved_models -name "*.joblib" 2>/dev/null | wc -l | tr -d ' ')
METADATA_COUNT=$(find saved_models -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
HELPER_COUNT=$(find saved_models -name "*.py" 2>/dev/null | wc -l | tr -d ' ')

echo " Fichiers trouvés:"
echo "   - Modèles (.joblib): $MODEL_COUNT"
echo "   - Métadonnées (.json): $METADATA_COUNT"
echo "   - Helpers (.py): $HELPER_COUNT"
echo ""

if [ "$MODEL_COUNT" -eq 0 ]; then
    echo "  Aucun modèle trouvé. Assurez-vous d'avoir entraîné le modèle."
    exit 1
fi

# Vérifier la taille des fichiers
TOTAL_SIZE=$(du -sh saved_models 2>/dev/null | cut -f1)
echo " Taille totale: $TOTAL_SIZE"
echo ""

# Demander confirmation
read -p "Voulez-vous ajouter les modèles au repository Git? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo " Opération annulée"
    exit 0
fi

# Forcer l'ajout des fichiers (ignore .gitignore)
echo ""
echo " Ajout des fichiers au repository..."
git add -f saved_models/*.joblib saved_models/*.json saved_models/*.py 2>/dev/null

# Vérifier ce qui a été ajouté
ADDED_FILES=$(git status --short saved_models/ | wc -l | tr -d ' ')

if [ "$ADDED_FILES" -eq 0 ]; then
    echo " Les fichiers sont déjà dans le repository"
else
    echo " $ADDED_FILES fichiers ajoutés"
    echo ""
    echo " Fichiers prêts à être commités:"
    git status --short saved_models/
    echo ""
    echo " Prochaine étape:"
    echo "   git commit -m 'Add model files for Render deployment'"
    echo "   git push origin main"
fi

echo ""
echo " Préparation terminée!"
echo ""
echo " Prochaines étapes:"
echo "   1. Commit les changements: git commit -m 'Add models for Render'"
echo "   2. Push vers GitHub: git push origin main"
echo "   3. Aller sur render.com et créer un nouveau Web Service"
echo "   4. Connecter votre repository GitHub"
echo "   5. Render déploiera automatiquement!"
echo ""
echo " Guide complet: voir RENDER_DEPLOY.md"

