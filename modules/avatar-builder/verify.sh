#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║            LPC Avatar Builder Module - Structure Verification            ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check core files
echo "📦 Checking core module files..."
FILES=(
  "index.js"
  "asset-loader.js"
  "avatar-builder.js"
  "player-customization.js"
  "npc-system.js"
  "avatar-builder.css"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    SIZE=$(wc -c < "$file" | xargs)
    echo "  ✅ $file ($SIZE bytes)"
  else
    echo "  ❌ $file - MISSING"
  fi
done

echo ""
echo "📚 Checking documentation files..."
DOCS=(
  "README.md"
  "QUICK_START.md"
  "INTEGRATION_GUIDE.md"
  "package.json"
  "demo.html"
)

for doc in "${DOCS[@]}"; do
  if [ -f "$doc" ]; then
    echo "  ✅ $doc"
  else
    echo "  ❌ $doc - MISSING"
  fi
done

echo ""
echo "👥 Checking NPC presets..."
NPC_DIR="../../content/npcs"
if [ -d "$NPC_DIR" ]; then
  NPC_COUNT=$(find "$NPC_DIR" -name "*.json" | wc -l)
  echo "  ✅ NPC preset directory found"
  echo "  📊 $NPC_COUNT NPC preset(s) available:"
  for npc in "$NPC_DIR"/*.json; do
    if [ -f "$npc" ]; then
      NAME=$(basename "$npc" .json)
      echo "     - $NAME"
    fi
  done
else
  echo "  ❌ NPC preset directory not found"
fi

echo ""
echo "🎨 Checking spritesheet assets..."
SPRITE_DIR="../../spritesheets"
if [ -d "$SPRITE_DIR" ]; then
  BODY_COUNT=$(find "$SPRITE_DIR/body" -name "*.png" 2>/dev/null | wc -l)
  HAIR_COUNT=$(find "$SPRITE_DIR/hair" -name "*.png" 2>/dev/null | wc -l)
  WEAPON_COUNT=$(find "$SPRITE_DIR/weapon" -name "*.png" 2>/dev/null | wc -l)
  
  echo "  ✅ Spritesheet directory found"
  echo "  📊 Body sprites: $BODY_COUNT"
  echo "  📊 Hair sprites: $HAIR_COUNT"
  echo "  📊 Weapon sprites: $WEAPON_COUNT"
else
  echo "  ❌ Spritesheet directory not found"
fi

echo ""
echo "🔍 Analyzing JavaScript files..."
TOTAL_LINES=0
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    LINES=$(wc -l < "$file" | xargs)
    TOTAL_LINES=$((TOTAL_LINES + LINES))
  fi
done
echo "  📊 Total lines of code: $TOTAL_LINES"

echo ""
echo "✅ Module verification complete!"
echo ""
echo "🚀 To get started:"
echo "   1. Open demo.html in a web browser"
echo "   2. Read QUICK_START.md for integration examples"
echo "   3. Review INTEGRATION_GUIDE.md for detailed instructions"
echo ""
