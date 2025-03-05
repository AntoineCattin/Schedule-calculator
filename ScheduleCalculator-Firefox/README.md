# Schedule Calculator pour Firefox

Cette extension vous permet de calculer facilement vos horaires de travail en fonction de vos contraintes et préférences.

## Installation sur Firefox

### Installation temporaire (pour le développement)

1. Ouvrez Firefox et tapez `about:debugging` dans la barre d'adresse
2. Cliquez sur "Ce Firefox" dans le menu de gauche
3. Cliquez sur "Charger un module temporaire..."
4. Naviguez jusqu'au dossier de l'extension et sélectionnez le fichier `manifest.json`
5. L'extension sera chargée temporairement et apparaîtra dans la barre d'outils

### Installation permanente

Pour une installation permanente, l'extension doit être signée par Mozilla. Voici les étapes à suivre :

1. Créez un compte sur [Mozilla Add-ons Developer Hub](https://addons.mozilla.org/developers/)
2. Compressez le contenu du dossier de l'extension en un fichier ZIP
3. Connectez-vous à votre compte développeur et soumettez le fichier ZIP pour vérification
4. Une fois approuvée, l'extension pourra être installée de façon permanente

## Fonctionnalités

- Calcul automatique des horaires de travail en fonction des heures hebdomadaires cibles
- Prise en compte des pauses déjeuner
- Option pour des heures de fin uniformes ou des heures de travail égales
- Ajustement des horaires en cours de semaine
- Sauvegarde automatique des paramètres

## Différences avec la version Chrome

Cette version a été adaptée pour fonctionner sur Firefox. Les principales différences sont :

- Utilisation de `manifest_version: 2` au lieu de `manifest_version: 3`
- Utilisation de `browser_action` au lieu de `action`
- Ajout de `browser_specific_settings` pour l'identifiant de l'extension
- Format différent pour la politique de sécurité du contenu

## Support

Pour toute question ou problème, veuillez créer une issue sur le dépôt GitHub du projet. 