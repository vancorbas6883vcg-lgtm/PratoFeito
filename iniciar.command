cd "$(dirname "$0")/ecommerce-backend" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js não encontrado."
  if command -v brew >/dev/null 2>&1; then
    echo "Instalando com Homebrew..."; brew install node || exit 1
  else
    echo "Instale a versão LTS em https://nodejs.org e rode este arquivo de novo."
    (open "https://nodejs.org/pt" || xdg-open "https://nodejs.org/pt") >/dev/null 2>&1
    read -r -p "Pressione Enter para sair..." _; exit 1
  fi
fi

if [ ! -d node_modules ]; then
  echo "Preparando o PratoFeito pela primeira vez. Pode levar até um minuto..."
  npm install --no-audit --no-fund || { echo "Falha ao instalar. Verifique a internet."; read -r -p "Enter para sair..." _; exit 1; }
fi

OPEN_BROWSER=1 node server.js
