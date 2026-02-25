#!/bin/bash
set -e

# Configuration
OWNER="naveenpoddar"
REPO="cursorscript"
APP_NAME="cursorscript"
INSTALL_DIR="$HOME/.$APP_NAME"
BIN_DIR="$INSTALL_DIR/bin"

# 1. Detect Architecture
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"
if [ "$ARCH" = "x86_64" ]; then ARCH="x64"; fi
if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then ARCH="arm64"; fi

TARGET="bundle-$OS-$ARCH.zip" # Matches your build script naming
RELEASE_URL="https://github.com/$OWNER/$REPO/releases/latest/download/$TARGET"

echo "🚀 Installing $APP_NAME for $OS-$ARCH..."

# 2. Create directories
mkdir -p "$BIN_DIR"

# 3. Download and Extract
curl -L "$RELEASE_URL" -o "$INSTALL_DIR/tmp.zip"
unzip -o "$INSTALL_DIR/tmp.zip" -d "$INSTALL_DIR/tmp_extract"
# Move the binary from inside the extracted folder
mv "$INSTALL_DIR/tmp_extract/cursorscript-$OS-$ARCH/cursorx" "$BIN_DIR/$APP_NAME"
rm -rf "$INSTALL_DIR/tmp.zip" "$INSTALL_DIR/tmp_extract"

chmod +x "$BIN_DIR/$APP_NAME"

# 4. Add to Path
SHELL_CONFIG=""
case $SHELL in
  */zsh) SHELL_CONFIG="$HOME/.zshrc" ;;
  */bash) SHELL_CONFIG="$HOME/.bashrc" ;;
  *) SHELL_CONFIG="$HOME/.profile" ;;
esac

if ! grep -q "$BIN_DIR" "$SHELL_CONFIG"; then
  echo "export PATH=\"\$PATH:$BIN_DIR\"" >> "$SHELL_CONFIG"
  echo "✅ Added to $SHELL_CONFIG. Please restart your terminal or run 'source $SHELL_CONFIG'"
fi

echo "✨ $APP_NAME installed successfully! Try running '$APP_NAME --version'"