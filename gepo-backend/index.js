const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.send(`
    <h1>API de Commandes PowerShell</h1>
    <p>Utilisez l'endpoint <code>/execute-command</code> pour exécuter des commandes PowerShell.</p>
    <p>Envoyez une requête POST avec un JSON contenant la clé <code>command</code>.</p>
    <pre>
{
  "command": "Get-Process"
}
    </pre>
  `);
});

app.post("/execute-command", (req, res) => {
  const { command, summary } = req.body;

  if (!command || typeof command !== "string") {
    return res.status(400).json({
      error: "Commande PowerShell invalide ou manquante. Veuillez réessayer...",
    });
  }

  exec(`powershell -Command "${command}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(
        `Erreur lors de l'exécution de la commande : ${error.message}.`
      );
      return res.status(500).json({ error: error.message, stderr });
    }

    if (stderr) {
      console.warn(`Erreur standard : ${stderr}`);
      return res.status(500).json({ error: stderr });
    }

    console.log(`Commande exécutée avec succès : ${command}`);

    res.json({
      message: "Commande exécutée avec succès",
      output: stdout.trim(),
      stderr: stderr.trim(),
    });
  });
});
