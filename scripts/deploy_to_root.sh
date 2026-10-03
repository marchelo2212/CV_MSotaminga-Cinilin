#!/usr/bin/env bash
# ==============================================================================
# deploy_to_root.sh
# Publica el CV Interactivo como portada principal en marchelo2212.github.io
# y convierte la portada de Quartz en la subpágina /jardin/
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CV_REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
TARGET_DIR="${CV_REPO_DIR}/../marchelo2212.github.io"

echo "======================================================================"
echo "🚀 Sincronizando CV Interactivo -> https://marchelo2212.github.io/"
echo "======================================================================"

# 1. Asegurar que marchelo2212.github.io esté disponible localmente
if [ ! -d "$TARGET_DIR" ]; then
  echo "[1/4] Clonando repositorio marchelo2212.github.io..."
  git clone https://github.com/marchelo2212/marchelo2212.github.io.git "$TARGET_DIR"
else
  echo "[1/4] Repositorio marchelo2212.github.io detectado. Actualizando..."
  cd "$TARGET_DIR"
  git pull origin master || git pull origin main || true
  cd "$CV_REPO_DIR"
fi

# 2. Generar datos limpios y sincronizar archivos del CV
echo "[2/4] Preparando archivos y datos estructurados del CV..."
python3 "${CV_REPO_DIR}/scripts/parse_cv.py"
mkdir -p "${CV_REPO_DIR}/web/assets"
cp "${CV_REPO_DIR}/data/cv_data.json" "${CV_REPO_DIR}/web/data.json"
cp "${CV_REPO_DIR}/foto_ms.png" "${CV_REPO_DIR}/web/assets/foto_ms.png" 2>/dev/null || true
cp "${CV_REPO_DIR}/cv.pdf" "${CV_REPO_DIR}/web/cv.pdf" 2>/dev/null || true
cp "${CV_REPO_DIR}/Cv2.pdf" "${CV_REPO_DIR}/web/cv_ejecutivo.pdf" 2>/dev/null || true

# 3. Preservar la portada original de Quartz en /jardin/
echo "[3/4] Moviendo la portada de Quartz a la subpágina /jardin/..."
mkdir -p "${TARGET_DIR}/jardin"
if [ -f "${TARGET_DIR}/index.html" ] && grep -q "Quartz" "${TARGET_DIR}/index.html"; then
  # Ajustar rutas relativas de CSS/JS en jardin/index.html
  sed 's|href="./|href="../|g; s|src="./|src="../|g' "${TARGET_DIR}/index.html" > "${TARGET_DIR}/jardin/index.html"
  echo "      -> Portada de Quartz respaldada en /jardin/index.html"
fi

# 4. Copiar el CV Interactivo a la raíz de marchelo2212.github.io
echo "[4/4] Inyectando CV Interactivo en la raíz de marchelo2212.github.io..."
cp "${CV_REPO_DIR}/web/index.html" "${TARGET_DIR}/index.html"
cp "${CV_REPO_DIR}/web/data.json" "${TARGET_DIR}/data.json"
cp -r "${CV_REPO_DIR}/web/assets" "${TARGET_DIR}/"
cp "${CV_REPO_DIR}/web/cv.pdf" "${TARGET_DIR}/" 2>/dev/null || true
cp "${CV_REPO_DIR}/web/cv_ejecutivo.pdf" "${TARGET_DIR}/" 2>/dev/null || true

echo ""
echo "======================================================================"
echo "✅ ¡Preparación completada exitosamente!"
echo "======================================================================"
echo "Los archivos del CV ahora están en la raíz de: $TARGET_DIR"
echo "Las notas de Quartz y el blog siguen intactos en /Blog, /Teaching, etc."
echo "La portada de Quartz ahora vive en: https://marchelo2212.github.io/jardin/"
echo ""
echo "Para publicar los cambios en vivo en GitHub, ejecuta en tu terminal:"
echo ""
echo "  cd \"${TARGET_DIR}\""
echo "  git add ."
echo "  git commit -m \"feat: CV Interactivo como portada principal y Quartz en /jardin\""
echo "  git push origin master"
echo ""
echo "======================================================================"
