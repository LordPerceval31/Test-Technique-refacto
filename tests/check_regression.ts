import path from "path";
import * as fs from 'fs';
import { run } from "../src/index";

/// Tests de régression en comparant les sorties actuelles avec les fichiers master

console.log("=== Résultat de l'exécution du rapport de commandes ===");

// Chargement des fichiers master
const masterConsolePath = path.join(__dirname, 'master_console.txt');
const masterJsonPath = path.join(__dirname, 'master_output.json');

// Vérification de l'existence des fichiers master
if (!fs.existsSync(masterConsolePath) || !fs.existsSync(masterJsonPath)) {
    console.error("❌ ERREUR : Pas de Golden Master. Lance 'npx ts-node tests/generate_master.ts' d'abord.");
    process.exit(1);
}

// Lecture des fichiers master
const masterConsoleContent = fs.readFileSync(masterConsolePath, 'utf-8');
const masterJsonContent = fs.readFileSync(masterJsonPath, 'utf-8');

// Exécution du rapport de commandes pour obtenir les nouvelles sorties
const newConsoleOutput = run();

// Lecture du nouveau fichier JSON généré
const originalJsonPath = path.join(__dirname, '../legacy/output.json');
const newJsonData = fs.readFileSync(originalJsonPath, 'utf-8');

// Comparaison des sorties avec les fichiers master
let allTestsPassed = true;

// Comparaison de la sortie console
if (newConsoleOutput !== masterConsoleContent) {
    console.error("❌ ERREUR : La sortie console ne correspond pas au Golden Master.");
    allTestsPassed = false;
} else {
    console.log("✅ La sortie console correspond au Golden Master.");
}

// Comparaison du fichier JSON
if (newJsonData !== masterJsonContent) {
    console.error("❌ ERREUR : Le fichier JSON ne correspond pas au Golden Master.");
    allTestsPassed = false;
} else {
    console.log("✅ Le fichier JSON correspond au Golden Master.");
}

// Résultat final des tests de régression
if (allTestsPassed) {
    console.log("🎉 Tous les tests de régression sont passés avec succès !");
    process.exit(0);
} else {
    process.exit(1);
}

