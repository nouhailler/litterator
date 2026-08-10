#!/bin/bash
# Script pour générer des icônes placeholder (à exécuter manuellement si besoin)
# Pour une vraie PWA, il faudrait des icônes personnalisées

# Créer des icônes SVG de base
for size in 72 96 128 144 152 192 384 512; do
  cat > icon-${size}x${size}.png << 'SVGEOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" fill="#1a237e"/>
  <text x="50" y="60" text-anchor="middle" fill="white" font-size="40" font-family="Arial">L</text>
</svg>
SVGEOF
  # Convertir SVG en PNG (nécessite ImageMagick ou un outil similaire)
  # convert icon-${size}x${size}.svg icon-${size}x${size}.png
  echo "Création de l'icône ${size}x${size}..."
done
