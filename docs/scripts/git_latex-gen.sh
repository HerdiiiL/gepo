#!/bin/bash

# Set the output file name
DATE=$(date '+%Y-%m-%d')
FILE_PATH=""
OUTPUT_FILE="${FILE_PATH}git_report.tex"

# Get general repository information
CURRENT_BRANCH=$(git branch --show-current)
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "No tags")
REMOTE_INFO=$(git remote -v)
STATUS_INFO=$(git status)

# Get branch information
BRANCH=$(git branch --list -v)

# Get worktree information
WORKTREE=$(git worktree list)

# Get commit graph visualization
COMMIT_GRAPH=$(git log --all --decorate --oneline --graph --format=format:'%C(auto)%h - %C(bold green)(%as) %C(white)%s %C(dim white)- %an%n%C(auto)%d')

# Get detailed commit history
COMMIT_HISTORY=$(git log --all --pretty=format:'%h|%an|%ad|%s' --date=iso)

# Escape special LaTeX characters in user-generated content
escape_latex_braces() {
	echo "$1" | sed -e 's/[{}]/\\&/g'
}

escape_latex_backslash() {
	echo "$1" | sed -e 's/\\/\\textbackslash{}/g'
}

escape_latex_circum() {
	echo "$1" | sed -e 's/\^/\\textasciicircum{}/g'
}

escape_latex_tilde() {
	echo "$1" | sed -e 's/~/\\textasciitilde{}/g'
}

escape_latex_special_char() {
	echo "$1" | sed -e 's/[&%$#_]/\\&/g'
}

escape_latex() {
	input="$1"
	input=$(escape_latex_braces "$input")
    input=$(escape_latex_backslash "$input")
    input=$(escape_latex_circum "$input")
    input=$(escape_latex_tilde "$input")
    input=$(escape_latex_special_char "$input")
    echo "$input"
}

# Generate LaTeX document
cat > "$OUTPUT_FILE" << EOF
\subsection*{Repository Overview}
\begin{itemize}
    \item Current Branch: \textbf{$(escape_latex "$CURRENT_BRANCH")}
    \item Latest Tag: \textbf{$(escape_latex "$LATEST_TAG")}
\end{itemize}

\subsection*{Remote Information}
\begin{verbatim}
$(escape_latex "$REMOTE_INFO")
\end{verbatim}

\subsection*{Status Information}
\begin{verbatim}
$(escape_latex "$STATUS_INFO")
\end{verbatim}

\subsection*{Branch Information}
\begin{verbatim}
$(escape_latex "$BRANCH")
\end{verbatim}

\subsection*{Worktree Information}
\scriptsize
\begin{verbatim}
$(escape_latex "$WORKTREE")
\end{verbatim}
\footnotesize

\pagebreak

\subsection*{Commit Graph}
\begin{alltt}
$(escape_latex "$COMMIT_GRAPH")
\end{alltt}

\pagebreak

\subsection*{Detailed Commit History}
\begin{longtable}{llll}
\toprule
Commit Hash & Author & Date & Message \\\\
\midrule
$(echo "$(escape_latex "$COMMIT_HISTORY")" | while read -r line; do
    IFS='|' read -ra cols <<< "$line"
    echo "\texttt{${cols[0]}} & ${cols[1]} & ${cols[2]} & ${cols[3]} \\\\"
done)
\bottomrule
\end{longtable}
EOF

echo "LaTeX report generated: $OUTPUT_FILE"
echo "Compile with: pdflatex $OUTPUT_FILE"