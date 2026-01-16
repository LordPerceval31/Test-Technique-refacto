import path from "path";
import * as fs from 'fs';
import { run } from "../legacy/orderReportLegacy";


/// Génération des fichiers master pour les tests


// 1ère étape : exécution du rapport de commandes
const consoleOutput = run();

console.log("=== Résultat de l'exécution du rapport de commandes ===");

// 2ème étape : sauvegarde des sorties console et JSON dans des fichiers master
const masterConsolePath = path.join(__dirname, 'master_console.txt');
const masterJsonPath = path.join(__dirname, 'master_output.json');

// Sauvegarde de la sortie console
fs.writeFileSync(masterConsolePath, consoleOutput);


// Sauvegarde du fichier JSON généré
const originalJsonPath = path.join(__dirname, '../legacy/output.json');
const jsonData = fs.readFileSync(originalJsonPath);
fs.writeFileSync(masterJsonPath, jsonData);

// Affichage des chemins des fichiers générés
console.log(`Fichier console master généré : ${masterConsolePath}`);
console.log(`Fichier JSON master généré : ${masterJsonPath}`);