# Projet GEPO – Serveur Express + IA

Ce projet permet à une intelligence artificielle de communiquer avec une machine distante pour exécuter des commandes, récupérer des informations ou gérer des ressources.  
L’objectif est de simplifier l’administration d’un système via une interface conversationnelle.

## Fonctionnement

- Une IA (comme Claude) comprend les demandes de l’utilisateur (ex : "Donne-moi la liste des utilisateurs du domaine").
- Un serveur local (appelé MCP) transforme ces demandes en commandes adaptées.
- Ces commandes sont envoyées à un serveur distant (basé sur Express) qui les exécute sur la machine cible.
- Le résultat est renvoyé à l’utilisateur via l’interface IA.

## Technologies utilisées

- **Node.js / Express** pour le serveur distant.
- **Bash** pour les scripts automatisés.
- **PowerShell** pour l’exécution des commandes Windows.
- **LaTeX** pour générer la documentation du projet.

## Organisation du projet

### Serveur MCP

- `gepo-mcp/` : code source du serveur MCP.

### Serveur API

- `gepo-api/` : code source du serveur Express.

### Documentation

- `docs/` : rapport de projet en LaTeX.
- `scripts/` : scripts utiles, dont la génération du rapport Git.
- `parts/` : parties du document principal.
- `rapport-gepo.tex` : document principal.

## Générer la documentation

Depuis le dossier `docs/`, exécute la commande suivante :

```bash
pdflatex rapport-gepo.tex
```
