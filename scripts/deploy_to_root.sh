#!/usr/bin/env bash
# ==============================================================================
# deploy_to_root.sh
# Publica el CV Interactivo en la raíz (https://marchelo2212.github.io/)
# y traslada TODO Quartz a la subcarpeta /jardin/ (https://marchelo2212.github.io/jardin/)
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CV_REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
TARGET_DIR="${CV_REPO_DIR}/../marchelo2212.github.io"

echo "======================================================================"
echo "🚀 Sincronizando CV Interactivo -> https://marchelo2212.github.io/"
echo "   y Quartz completo -> https://marchelo2212.github.io/jardin/"
echo "======================================================================"

# 1. Asegurar repositorio marchelo2212.github.io
if [ ! -d "$TARGET_DIR" ]; then
  echo "[1/4] Clonando repositorio marchelo2212.github.io..."
  git clone https://github.com/marchelo2212/marchelo2212.github.io.git "$TARGET_DIR"
else
  echo "[1/4] Repositorio marchelo2212.github.io detectado. Actualizando..."
  cd "$TARGET_DIR"
  git pull origin master || git pull origin main || true
  cd "$CV_REPO_DIR"
fi

# 2. Generar datos actualizados del CV
echo "[2/4] Generando datos estructurados y preparando assets del CV..."
python3 "${CV_REPO_DIR}/scripts/parse_cv.py"
mkdir -p "${CV_REPO_DIR}/web/assets"
cp "${CV_REPO_DIR}/data/cv_data.json" "${CV_REPO_DIR}/web/data.json"
cp "${CV_REPO_DIR}/foto_ms.png" "${CV_REPO_DIR}/web/assets/foto_ms.png" 2>/dev/null || true
cp "${CV_REPO_DIR}/cv.pdf" "${CV_REPO_DIR}/web/cv.pdf" 2>/dev/null || true
cp "${CV_REPO_DIR}/Cv2.pdf" "${CV_REPO_DIR}/web/cv_ejecutivo.pdf" 2>/dev/null || true

# 3. Mover TODO el contenido de Quartz dentro de la subcarpeta jardin/
echo "[3/4] Trasladando Quartz completo a la subcarpeta /jardin/..."
mkdir -p "${TARGET_DIR}/jardin"
cd "$TARGET_DIR"
for item in *; do
  if [ "$item" != "jardin" ] && [ "$item" != "assets" ] && [ "$item" != "data.json" ] && [ "$item" != "cv.pdf" ] && [ "$item" != "cv_ejecutivo.pdf" ] && [ "$item" != ".git" ]; then
    # Si index.html pertenece al CV, no moverlo; si es de Quartz, moverlo a jardin
    if [ "$item" == "index.html" ]; then
      if grep -q "LATENT KNOWLEDGE OBSERVATORY" "$item" 2>/dev/null; then
        continue
      fi
    fi
    git mv "$item" jardin/ 2>/dev/null || mv "$item" jardin/
  fi
done
cd "$CV_REPO_DIR"

# 4. Inyectar CV Interactivo en la raíz
echo "[4/4] Inyectando CV Interactivo en la raíz..."
cp "${CV_REPO_DIR}/web/index.html" "${TARGET_DIR}/index.html"
cp "${CV_REPO_DIR}/web/data.json" "${TARGET_DIR}/data.json"
cp -r "${CV_REPO_DIR}/web/assets" "${TARGET_DIR}/"
cp "${CV_REPO_DIR}/web/cv.pdf" "${TARGET_DIR}/" 2>/dev/null || true
cp "${CV_REPO_DIR}/web/cv_ejecutivo.pdf" "${TARGET_DIR}/" 2>/dev/null || true
touch "${TARGET_DIR}/.nojekyll"
touch "${TARGET_DIR}/jardin/.nojekyll"

echo ""
echo "======================================================================"
echo "✅ ¡Estructura sincronizada con éxito!"
echo "======================================================================"
echo "📍 Portada Principal (CV Interactivo): https://marchelo2212.github.io/"
echo "🌱 Jardín Digital (Quartz completo):   https://marchelo2212.github.io/jardin/"
echo "📝 Notas del Blog:                    https://marchelo2212.github.io/jardin/Blog/"
echo ""
echo "Para desplegar en GitHub Pages ahora mismo, ejecuta:"
echo ""
echo "  cd \"${TARGET_DIR}\""
echo "  git add ."
echo "  git commit -m \"feat: CV interactivo en portada principal y Quartz completo en /jardin\""
echo "  git push origin master"
echo ""
echo "======================================================================"
