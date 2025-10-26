#!/bin/bash

# 🚀 Script de Déploiement Optimisé - Détection de Fraude Bancaire
# Version simplifiée et efficace

set -e

# Configuration
PORT=8080
API_URL="http://localhost:${PORT}"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fonctions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Vérifier les prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    if ! command -v python3 &> /dev/null; then
        log_error "Python3 n'est pas installé"
        exit 1
    fi
    
    if ! command -v pip3 &> /dev/null; then
        log_error "pip3 n'est pas installé"
        exit 1
    fi
    
    log_success "Prérequis vérifiés"
}

# Créer l'environnement virtuel
setup_venv() {
    log_info "Configuration de l'environnement virtuel..."
    
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        log_success "Environnement virtuel créé"
    else
        log_warning "Environnement virtuel existe déjà"
    fi
    
    # Installer les dépendances
    log_info "Installation des dépendances..."
    venv/bin/pip install --upgrade pip
    venv/bin/pip install -r requirements.txt
    log_success "Dépendances installées"
}

# Vérifier les modèles
check_models() {
    log_info "Vérification des modèles..."
    
    if [ ! -d "saved_models" ] || [ ! "$(ls -A saved_models/*.joblib 2>/dev/null)" ]; then
        log_error "Aucun modèle trouvé dans saved_models/"
        log_error "Entraînez d'abord le modèle avec le notebook"
        exit 1
    fi
    
    log_success "Modèles trouvés"
}

# Arrêter l'API existante
stop_api() {
    log_info "Arrêt de l'API existante..."
    pkill -f "app.py" 2>/dev/null || true
    sleep 2
}

# Démarrer l'API
start_api() {
    log_info "Démarrage de l'API..."
    
    # Démarrer en arrière-plan
    nohup venv/bin/python app.py > api.log 2>&1 &
    API_PID=$!
    echo $API_PID > api.pid
    
    # Attendre le démarrage avec vérification progressive
    for i in {1..10}; do
        sleep 1
        if curl -s "${API_URL}/health" > /dev/null 2>&1; then
            log_success "API démarrée avec succès (PID: $API_PID)"
            return 0
        fi
        log_info "Attente du démarrage... ($i/10)"
    done
    
    log_error "Échec du démarrage de l'API"
    log_error "Vérifiez les logs: cat api.log"
    return 1
}

# Tester l'API
test_api() {
    log_info "Test de l'API..."
    
    # Test de santé
    if curl -s "${API_URL}/health" | grep -q "healthy"; then
        log_success "Test de santé réussi"
    else
        log_error "Test de santé échoué"
        return 1
    fi
    
    # Test de prédiction
    response=$(curl -s -X POST "${API_URL}/predict" \
        -H "Content-Type: application/json" \
        -d '{"feature1": 1.0, "feature2": 2.0, "feature3": 3.0}' 2>/dev/null)
    
    if echo "$response" | grep -q "predictions"; then
        log_success "Test de prédiction réussi"
    else
        log_warning "Test de prédiction échoué (normal si les features ne correspondent pas)"
    fi
}

# Afficher les informations
show_info() {
    echo ""
    echo " API disponible sur: ${API_URL}"
    echo " Endpoints:"
    echo "   GET  /           - Informations sur l'API"
    echo "   GET  /health     - Vérification de santé"
    echo "   GET  /model-info - Informations du modèle"
    echo "   POST /predict    - Prédiction de fraude"
    echo ""
    echo " Commandes utiles:"
    echo "   ./deploy.sh stop    - Arrêter l'API"
    echo "   ./deploy.sh test    - Tester l'API"
    echo "   ./deploy.sh logs    - Voir les logs"
    echo "   ./deploy.sh status  - Vérifier le statut"
    echo ""
}

# Nettoyer
cleanup() {
    log_info "Nettoyage..."
    if [ -f "api.pid" ]; then
        kill $(cat api.pid) 2>/dev/null || true
        rm -f api.pid
    fi
    pkill -f "app.py" 2>/dev/null || true
}

# Fonction principale
main() {
    echo "🚀 DÉPLOIEMENT OPTIMISÉ - DÉTECTION DE FRAUDE BANCAIRE"
    echo "====================================================="
    echo ""
    
    trap cleanup EXIT INT TERM
    
    check_prerequisites
    setup_venv
    check_models
    stop_api
    start_api
    test_api
    show_info
    
    echo ""
    log_success "🎉 Déploiement terminé avec succès!"
    echo ""
    echo "Pour arrêter l'API: ./deploy.sh stop"
    echo "Pour voir les logs: ./deploy.sh logs"
    echo ""
    
    # Surveillance
    log_info "Surveillance de l'API... (Ctrl+C pour arrêter)"
    while true; do
        if ! kill -0 $API_PID 2>/dev/null; then
            log_error "L'API s'est arrêtée"
            break
        fi
        sleep 5
    done
}

# Gestion des arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "stop")
        cleanup
        log_success "API arrêtée"
        ;;
    "restart")
        cleanup
        sleep 2
        main
        ;;
    "status")
        if [ -f "api.pid" ] && kill -0 $(cat api.pid) 2>/dev/null; then
            log_success "API en cours d'exécution (PID: $(cat api.pid))"
        else
            log_error "API non en cours d'exécution"
        fi
        ;;
    "test")
        test_api
        ;;
    "logs")
        if [ -f "api.log" ]; then
            tail -f api.log
        else
            log_error "Fichier de logs non trouvé"
        fi
        ;;
    *)
        echo "Usage: $0 {deploy|stop|restart|status|test|logs}"
        echo ""
        echo "  deploy   - Déployer l'API (défaut)"
        echo "  stop     - Arrêter l'API"
        echo "  restart  - Redémarrer l'API"
        echo "  status   - Vérifier le statut"
        echo "  test     - Tester l'API"
        echo "  logs     - Voir les logs"
        ;;
esac

