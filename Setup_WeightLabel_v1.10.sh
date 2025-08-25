#!/bin/bash
# Line above is the shebang : it tells the OS to use /bin/bash to interpret the script. Must be the first line. 

# Author : Marc Jolivet for Coqueli'Coop - 2025/08/20

# This Bash script runs all the installation steps to create and run the weightlabel application AppImage ("coquelicoop"). 
# Tested on Linux Mint 22.1 Cinnamon. 

# Define here the link to SATO printer drivers ZIP archive : 
satodriversource="https://www.sato-global.com/files/Printer_Drivers/SATO_CUPS_Driver/Linux/SATOLinuxDriver_x64.zip"

# Define here the link to the weightlabel repo ZIP archive : 
appgitsource="https://github.com/vphone/coquelicoop/archive/master.zip"

# Define here the link to the nvm install bash script : 
nvmgitsource="https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh"

set -e #Stop script in case of fatal error

# If the script was not launched with --launched, or if the flag is empty
if [[ "$1" != "--launched" ]]; then
  # Launch a new terminal with the script and a flag to indicate it's already launched
  gnome-terminal -- bash -c "$0 --launched; exec bash"
  exit 0
fi

# Reset
RESET="\e[0m"

# Bold
BOLD="\e[1m"

# Regular colors
BLACK="\e[0;30m"
RED="\e[0;31m"
GREEN="\e[0;32m"
YELLOW="\e[0;33m"
BLUE="\e[0;34m"
MAGENTA="\e[0;35m"
CYAN="\e[0;36m"
WHITE="\e[0;37m"

# Bold / Bright colors
BOLD_BLACK="\e[1;30m"
BOLD_RED="\e[1;31m"
BOLD_GREEN="\e[1;32m"
BOLD_YELLOW="\e[1;33m"
BOLD_BLUE="\e[1;34m"
BOLD_MAGENTA="\e[1;35m"
BOLD_CYAN="\e[1;36m"
BOLD_WHITE="\e[1;37m"

# Extended 256-colors
ORANGE="\e[38;5;214m"
LIGHT_ORANGE="\e[38;5;208m"
PINK="\e[38;5;205m"
LIGHT_PINK="\e[38;5;218m"
LIGHT_BLUE="\e[38;5;81m"
LIGHT_GREEN="\e[38;5;120m"
AQUA="\e[38;5;87m"
PURPLE="\e[38;5;93m"
GREY="\e[38;5;240m"

# Background regular colors
BG_BLACK="\e[40m"
BG_RED="\e[41m"
BG_GREEN="\e[42m"
BG_YELLOW="\e[43m"
BG_BLUE="\e[44m"
BG_MAGENTA="\e[45m"
BG_CYAN="\e[46m"
BG_WHITE="\e[47m"

# Background 256 colors
BG_ORANGE="\e[48;5;214m"
BG_LIGHT_ORANGE="\e[48;5;208m"
BG_PINK="\e[48;5;205m"
BG_LIGHT_PINK="\e[48;5;218m"
BG_LIGHT_BLUE="\e[48;5;81m"
BG_LIGHT_GREEN="\e[48;5;120m"
BG_AQUA="\e[48;5;87m"
BG_PURPLE="\e[48;5;93m"
BG_GREY="\e[48;5;240m"

read -p "
$(echo -e "${BOLD_CYAN}Choisissez votre langue / Choose your language (fr/en) [fr]${RESET}")" langue
langue=${langue:-fr}

# Function to automatically do translations and an echo or read, with colors. 
msg() {
    local text
    if [[ "$langue" == "fr" ]]; then
        text="$1"
    else
        text="$2"
    fi

    if [[ "$3" == "info" ]]; then # Info message
        echo -e "
${BOLD_GREEN}$text${RESET}" 
    elif [[ "$3" == "warning" ]]; then # Warning message
        echo -e "
${BOLD_YELLOW}$text${RESET}"
    elif [[ "$3" == "important" ]]; then # Important message
        echo -e "
${BOLD_WHITE}${BG_RED}$text${RESET}"
    elif [[ "$3" == "read" ]]; then # Input needed
        local var_name="$4"
        read -p "$(echo -e "
${BOLD_CYAN}$text${RESET}")" "$var_name"
    fi
}

# msg "Ceci est un script tout-en-un." "This is an all-in-one script."

# msg "Entrez votre nom : " "Enter your name: " read nom

msg "Ceci est un script tout-en-un qui installe l'application EtiquettePoids (WeightLabel) qui imprime les prix des produits selon leur poids. Elle nécessite Dolibarr, une balance USB et une imprimante à étiquettes." \
\
"This is an all-in-one script to install WeightLabel, an application printing products price labels given their weight. It needs Dolibarr, a scale and a label printer." info

msg "Le script et l'application ont été testés sur Linux Mint 22.1 Cinnamon et Ubuntu 24.04 LTS avec l'imprimante à étiquettes SATO WS408DT-STD (vue comme 'WS408-SZPL'). Des changements peuvent être nécessaires pour leur utilisation sur d'autres OS ou modèles d'imprimantes. " \
"The script and application have been tested on Linux Mint 22.1 Cinnamon and Ubuntu 24.04 LTS with SATO WS408DT-STD (aka 'WS408-SZPL') label printer. They may need changes to work with other OS or models." warning

msg "Entrez le modèle de l'imprimante à étiquettes vu par le système [défaut : WS408-SZPL] :" \
"Enter your label printer model [default: WS408-SZPL]: " read printermodel
printermodel=${printermodel:-WS408-SZPL}

while true; do
    msg "Choisissez une installation build ou test [défaut : build] : " \
"Choose a build or test install (build/test) [default: build]: " read scriptmode
    scriptmode=${scriptmode:-build}
    if [[ "$scriptmode" == "build" || "$scriptmode" == "test" ]]; then
        break
    else
        msg "Entrée incorrecte : seules les valeurs 'build' ou 'test' sont possibles. " \
            "Invalid input : please enter 'build' or 'test'." warning
    fi
done

msg "1/11 - Installation de cURL et libfuse2t64, synchronisation et mise à jour des paquets. Merci d'entrer votre mot de passe (cela peut prendre un moment) : " \
"1/11 - Installing cURL, libfuse2t64, latest updates and upgrades. Please enter your password (this may take a while):" info

sudo apt install curl # Needed to download files from Internet
sudo apt install libfuse2t64 # Needed to launch AppImages
sudo apt-get update && sudo apt-get upgrade

msg "2/11 - Téléchargement, décompression et installation des pilotes d'imprimante SATO" \
"2/11 - Downloading, unzipping and installing SATO printer drivers${RESET}" info

echo "Source is $satodriversource"
rm -r satodrivers* # Remove old folder if there is one
wget -O z2 $satodriversource && unzip z2 -d ~/workspace/satodrivers && rm z2 
cd ~/workspace/satodrivers
sudo dpkg -i ./*.deb

msg "3/11 - Création du modèle d'étiquette et lancement du test d'impression" \
"3/12 - Creating label model and launching Test Print${RESET}" info

cd ~/workspace
cat > etiquette.zpl << EOF
^XA
^CI28
^CF0,0,30
^FO220,15,0^FD[LD] AIL BLANC DEMETER - BIO -^FS
^FO220,45,0^FDEsp - DYN [LD]^FS
^CF0,0,20
^FO220,80,0^FD763€/Kg^FS
^FO330,80,0^FDPoids SAISI^FS
^FO550,80,0^FDPesé le^FS
^CF0,0,28
^FO220,100,0^FD19,08€^FS
^FO330,100,0^FD25g^FS
^CF0,0,20
^FO550,100,0^FD20/10/20^FS
^FO280,140^BY3,2,20^BEN,60,Y,N^FD2000801000252^FS
^XZ
EOF

msg "A la prochaine étape, le menu des imprimantes va s'afficher. Merci de : 
- Supprimer toutes les imprimantes
- Débrancher/rebrancher l'imprimante SATO SW408DT-STD
- Attendre jusqu'à ce que le système la détecte sous le nom $printermodel. " \
\
"On the next step, the printer panel will open. Please: 
- Suppress all printers
- Unplug/replug the SATO WS408DT-STD printer
- Wait until the system detects it as $printermodel. " warning

msg "Attention : si le nom détecté n'est pas $printermodel, cette installation ne fonctionnera pas. 
Rejouez ces étapes jusqu'à ce que le bon nom apparaisse, ou bien relancez ce script d'installation en indiquant le nom que vous voyez pour le modèle d'imprimante. " \
\
"Warning : if the name is not $printermodel, this install won't work. 
Replay those steps until it shows the good name, or relaunch this script with the name you see for the printer model. " important

msg "Appuyez sur Entrée lorsque vous êtes prêt : " \
"Press Enter when you are ready " read enter
enter=${enter:-}

gnome-terminal -- bash -c "system-config-printer; exec bash"

msg "Lancement du test d'impression - A l'appui sur Entrée, vous devez voir une étiquette vierge sortir de l'imprimante. Appuyez sur Entrée lorsque vous êtes prêt : " \
"Launching Test Print - When hitting Enter, you must see a blank label coming out of the printer. Press Enter when you are ready:" read enter
enter=${enter:-}

if ! lpr -l -P $printermodel etiquette.zpl; then
    msg "L'imprimante n'a pas été détectée. Souhaitez-vous poursuivre l'installation ? (y/n)" \
    "The printer wasn't detected. Do you wish to go on with setup ? (y/n)" read response
    if [[ "$response" != "y" ]] then
        msg "Arrêt du script. " \
        "Stopping script execution. " important
        exit 1
    fi
fi

msg "4/11 - Téléchargement et décompression de l'application" \
"4/11 - Downloading and unzipping the app" info

echo "Source is $appgitsource"
echo "Install directory is $HOME/workspace/coquelicoop-master"

rm -rf ~/workspace/coquelicoop-master # Suppression of existing folder
wget -O z $appgitsource && unzip z -d ~/workspace && rm z

msg "5/11 - Téléchargement et installation de NVM" \
"5/11 - Downloading and installing NVM" info

echo "Source is $nvmgitsource"
curl -o- $nvmgitsource | bash

# Restart bash from terminal without restarting terminal : 
source "$HOME/.nvm/nvm.sh"

msg "6/11 - Téléchargement et installation de Node.js (environnement de déploiement JavaScript)" \
"6/11 - Downloading and installing Node.js (JavaScript deployment environment)" info
nvm install 22

msg "7/11 - Création du fichier d'environnement .env avec le modèle d'imprimante $printermodel" \
"7/11 - Creating of .env environment file with $printermodel printer model" info

cd ~/workspace/coquelicoop-master
cat > .env << EOF
VUE_APP_DOLAPIKEY="8hFpmNydStnIYB5Eas4K2nD3q15S530I"
VUE_APP_API_URL="https://coqueli-coop.doli.bar/api/index.php/"
VUE_APP_USE_MOCKS="false"
VUE_APP_SCALE="/dev/ttyUSB0"
VUE_APP_PRINTER="$printermodel"
VUE_APP_ADMIN_PASSWORD="4202"
VUE_APP_PATH="/workspace/coquelicoop-master/src/app/"
EOF

msg "8/11 - Installation des dépendances NPM (cela peut prendre un moment)" \
"8/11 - Installing NPM dependencies (this may take a while)" info

npm install

if [[ "$scriptmode" == "build" ]]; then
    msg "9/11 - Construction d'une version définitive de l'application (build) (cela peut prendre un moment)" \
    "9/11 - Building the app (this may take a while)" info

    # Handling an OpenSSL issue : 
    export NODE_OPTIONS=--openssl-legacy-provider
    # Compiling the app with electron:build module in a dist_electron file : 
    npm run electron:build

    msg "10/11 - Création d'un fichier .desktop pour le lancement automatique de l'application au démarrage" \
    "10/11 - Creating .desktop file for automatic launch at startup" info

    echo "File created is $HOME/.config/autostart/weightlabel.desktop"    
    mkdir -p ~/.config/autostart
    cat > ~/.config/autostart/weightlabel.desktop << EOF
[Desktop Entry]
Type=Application
Exec=$HOME/workspace/coquelicoop-master/dist_electron/coquelicoop-0.1.0.AppImage
X-GNOME-Autostart-enabled=true
NoDisplay=false
Hidden=false
Name[fr_FR]=weightlabel
Comment[fr_FR]=Automatic startup for WeightLabel. This application prints products price labels given their weight. It needs Dolibarr, a scale and a label printer. 
X-GNOME-Autostart-Delay=0
EOF
else
    msg "9/11 - Construction d'une version de test de l'application (test) (cela peut prendre un moment)" \
    "9/11 - Building a test version of the app (this may take a while)" info

    npm run electron:serve
    
    msg "10/11 - Il n'y a pas de lancement automatique au démarrage pour la version de test. " \
    "10/11 - There is no automatic launch at startup for the test version. " info
fi

msg "11/11 - Ajout des permissions USB pour l'utilisateur. Votre mot de passe peut vous être demandé : " \
"11/11 - Adding USB access permissions to user - You may have to enter your password: " info
sudo adduser "$USER" dialout

msg "L'installation est terminée. Merci de redémarrer pour appliquer les permissions USB et pour vérifier si l'application se lance bien au démarrage. " \
"Installation is done. Please reboot to apply USB permissions and check if app is launching on startup. " warning

# Prevents terminal closing automatically : 
echo
