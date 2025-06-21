import express from "express";
import { exec } from "child_process";
import { promisify } from "util";

const app = express();
app.use(express.json());

const execAsync = promisify(exec);

app.post("/execute-ps-command", async (req, res) => {
  // Recuperation de la commande et d'une eventuelle
  // description depuis le corps de la requete
  const { command, description } = req.body;

  if (!command) {
    return res.status(400).json({ error: "Command is required" });
  }

  try {
    // Execution de la commande PowerShell de maniere
    // asynchrone
    const { stdout, stderr } = await execAsync(
      `powershell.exe -Command "${command}"`
    );

    // Envoie de la reponse avec le resultat (stdout)
    // et les erreurs eventuelles (stderr)
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
// Demarrage du serveur sur l'IP 0.0.0.0 pour qu'il
// soit accessible
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Remote Express server listening on port ${PORT}`);
});
