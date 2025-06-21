#!/bin/bash

# 🔒 Vérifie que l'on est bien dans un dépôt Git
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ Ce répertoire n'est pas un dépôt Git."
  exit 1
fi

# 📁 Gestion du chemin de sortie (par défaut: dossier courant)
FILE_PATH="${1:-./}"
FILE_PATH="${FILE_PATH%/}/"
DATE=$(date '+%Y-%m-%d_%H-%M')
OUTPUT_FILE="${FILE_PATH}git_report.tex"

# 📋 Récupération des infos Git
CURRENT_BRANCH=$(git branch --show-current)
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "No tags")
REMOTE_INFO=$(git remote -v)
STATUS_INFO=$(git status)
BRANCH_INFO=$(git branch --list -v)
WORKTREE=$(git worktree list)
COMMIT_GRAPH=$(git log --all --decorate --oneline --graph --format=format:'%C(auto)%h - %C(bold green)(%as) %C(white)%s %C(dim white)- %an%n%C(auto)%d')
COMMIT_HISTORY=$(git log --all --pretty=format:'%h|%an|%ad|%s' --date=iso)

# 🧼 Fonction d'échappement LaTeX
escape_latex() {
  sed -e 's/\\/\\textbackslash{}/g' \
      -e 's/{/\\{/g' \
      -e 's/}/\\}/g' \
      -e 's/\^/\\textasciicircum{}/g' \
      -e 's/~/\\textasciitilde{}/g' \
      -e 's/[&%$#_]/\\&/g'
}

# 📄 Génération du document LaTeX
cat > "$OUTPUT_FILE" << EOF
\subsection*{Rapport Git du \today}
\textit{Généré automatiquement le \texttt{$(date '+%d/%m/%Y à %Hh%M')}}

\subsection*{Repository Overview}
\begin{itemize}
    \item Branche courante : \textbf{$(echo "$CURRENT_BRANCH" | escape_latex)}
    \item Dernier tag : \textbf{$(echo "$LATEST_TAG" | escape_latex)}
\end{itemize}

\subsection*{Remote Information}
\begin{verbatim}
$(echo "$REMOTE_INFO" | escape_latex)
\end{verbatim}

\subsection*{Status Information}
\begin{verbatim}
$(echo "$STATUS_INFO" | escape_latex)
\end{verbatim}

\subsection*{Branch Information}
\begin{verbatim}
$(echo "$BRANCH_INFO" | escape_latex)
\end{verbatim}

\subsection*{Worktree Information}
\scriptsize
\begin{verbatim}
$(echo "$WORKTREE" | escape_latex)
\end{verbatim}
\footnotesize

\pagebreak

\subsection*{Commit Graph}
\begin{alltt}
$(echo "$COMMIT_GRAPH" | escape_latex)
\end{alltt}

\pagebreak

\subsection*{Historique détaillé des commits}
\renewcommand{\arraystretch}{1.2}
\setlength{\LTpre}{0pt}
\setlength{\LTpost}{0pt}
\begin{longtable}{@{}p{2.5cm}p{3.5cm}p{3.5cm}p{7cm}@{}}
\toprule
\textbf{Hash} & \textbf{Auteur} & \textbf{Date} & \textbf{Message} \\\\
\midrule
\endhead
EOF

# 🔁 Ajouter les lignes du tableau commit
echo "$COMMIT_HISTORY" | while IFS='|' read -r hash author date message; do
  echo "\texttt{$(echo "$hash" | escape_latex)} & \
$(echo "$author" | escape_latex) & \
$(echo "$date" | escape_latex) & \
$(echo "$message" | escape_latex) \\\\" >> "$OUTPUT_FILE"
done

# ✅ Fin du tableau
cat >> "$OUTPUT_FILE" << EOF
\bottomrule
\end{longtable}
EOF

# 📢 Fin
echo "✅ Rapport LaTeX généré : $OUTPUT_FILE"
echo "👉 Compile avec : pdflatex $(basename "$OUTPUT_FILE")"
