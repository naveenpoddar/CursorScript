#!/bin/bash
set -e

APP_NAME="cursorx"
PACKAGE_NAME="cursorscript"
INSTALL_ROOT="$HOME/.$PACKAGE_NAME"
BIN_LINK="/usr/local/bin/$APP_NAME"

# 1. Detect Arch/OS
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"
[[ "$ARCH" == "x86_64" ]] && ARCH="x64"
[[ "$ARCH" == "aarch64" || "$ARCH" == "arm64" ]] && ARCH="arm64"

TARGET="${PACKAGE_NAME}-${OS}-${ARCH}.zip"
URL="https://github.com/naveenpoddar/cursorscript/releases/latest/download/$TARGET"

echo "📦 Downloading $TARGET..."
mkdir -p "$INSTALL_ROOT"
curl -L "$URL" -o "$INSTALL_ROOT/package.zip"

# 2. Extract & Clean up
echo "📂 Extracting full bundle..."
unzip -o "$INSTALL_ROOT/package.zip" -d "$INSTALL_ROOT"
# This moves contents out of the subfolder 'cursorscript-linux-x64' into the root install dir
mv "$INSTALL_ROOT/${PACKAGE_NAME}-${OS}-${ARCH}/"* "$INSTALL_ROOT/"
rm -rf "$INSTALL_ROOT/${PACKAGE_NAME}-${OS}-${ARCH}" "$INSTALL_ROOT/package.zip"

# 3. Create Symlink (Requires sudo for /usr/local/bin, or use ~/.local/bin)
echo "🔗 Setting up PATH..."
chmod +x "$INSTALL_ROOT/cursorx"

# If you don't want to use sudo, change this to append to .zshrc/.bashrc instead
sudo ln -sf "$INSTALL_ROOT/cursorx" "$BIN_LINK"

echo "✅ Installed! The app and its /lib are at $INSTALL_ROOT"
echo "🚀 Try running: $APP_NAME"