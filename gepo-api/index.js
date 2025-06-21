import express from "express";
import { exec } from "child_process";
import { promisify } from "util";

const app = express();
app.use(express.json());

const execAsync = promisify(exec);

app.post("/execute-ps-command", async (req, res) => {
  // Récupération de la commande et d'une éventuelle description depuis le corps de la requête
  const { command, description } = req.body;

  if (!command) {
    return res.status(400).json({ error: "Command is required" });
  }

  try {
    // Exécution de la commande PowerShell de manière asynchrone
    const { stdout, stderr } = await execAsync(
      `powershell.exe -Command "${command}"`
    );

    // Envoie de la réponse avec le résultat (stdout) et les erreurs éventuelles (stderr)
    res.json({
      success: true,
      output: stdout,
      error: stderr || null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || err,
    });
  }
});

const PORT = 3000;
// Démarrage du serveur sur l'IP 0.0.0.0 pour qu’il soit accessible de l’extérieur
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Remote Express server listening on port ${PORT}`);
});
