# Order Report Refactoring

<a name="-english"></a>


This project involves the refactoring of a legacy order reporting system. The goal was to transition from a monolithic script to a clean, modular, and testable architecture while strictly preserving the original business logic.

### Architecture & Design Decisions

The code has been restructured using **SOLID principles** and separated into distinct layers in the `src/` directory. The `legacy/` directory remains untouched to serve as a reference.

1.  **Services (Logic Layer)**: Business logic was extracted into dedicated stateless services.
    * **`DiscountCalculator`**: Handles volume discounts, weekend bonuses, and loyalty points.
    * **`TaxCalculator`**: Manages VAT rules, including complex mixed-cart scenarios.
    * **`ShippingCalculator`**: Computes shipping fees based on weight, zones, and handling fees.
2.  **Models (Data Layer)**: Typing (`Order`, `Product`) introduced to ensure safety.
3.  **Utils**: Separated data ingestion responsibility (`CsvLoader`) from processing logic.

### Testing Strategy

A robust testing strategy was implemented to guarantee **Zero Regression**.

* **Golden Master (Regression Testing)**: Compares the output (Console & JSON) of the Legacy code against the New Refactored code to ensure 100% behavior fidelity.
* **Unit Tests**: Validates specific business rules in isolation (e.g., shipping tiers, tax exemptions).

### How to Run

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run Tests (Recommended)**:
    Runs Unit Tests AND the Golden Master check.
    ```bash
    npm test
    ```

3.  **Run Scripts**:
    * Refactored code: `npm start`
    * Legacy code: `npm run legacy`

### design decisions

- **Stateless Services**: I chose to implement calculators (Tax, Discount, Shipping) as stateless services with static methods. This simplifies testing and avoids unnecessary object instantiation since these services don't need to maintain internal state.
- **Data Integrity**: I introduced strict TypeScript Interfaces to replace the legacy "any" objects. This prevents runtime errors that were common in the original script due to missing properties in CSV rows.
- **Handling Fee Logic**: During refactoring, a bug was identified in the legacy logic where overlapping conditions caused incorrect fees. I decided to implement a "top-down" return strategy (checking highest tiers first) to ensure clarity and correctness.

---
<a name="-français"></a>

Ce projet consiste en la refonte d'un système legacy de génération de rapports de commandes. L'objectif était de nettoyer le code, d'améliorer sa maintenabilité et d'ajouter des tests sans altérer le comportement d'origine.

### Architecture et Choix Techniques

Le code monolithique original a été découpé pour respecter les principes **SOLID** :

1.  **Services** : La logique métier a été isolée dans des services dédiés.
    * **`DiscountCalculator`** : Gestion des remises (volume, fidélité, bonus week-end).
    * **`TaxCalculator`** : Calcul de la TVA et gestion des paniers mixtes (produits taxables/non-taxables).
    * **`ShippingCalculator`** : Logique des frais de port et frais de gestion (manutention).
2.  **Models** : Typage via TypeScript pour sécuriser les données.
3.  **Utils** : Séparation de la logique de chargement des fichiers CSV.

### Stratégie de Tests

Pour garantir la sécurité du refactoring, deux niveaux de tests ont été mis en place :

* **Golden Master (Non-régression)** : Compare la sortie du code Legacy vs le nouveau code. Garantit que le comportement est strictement identique à l'original.
* **Tests Unitaires** : Couverture des règles métier critiques (paliers de livraison, calculs de taxes).

### Installation et Lancement

1.  **Installation** :
    ```bash
    npm install
    ```

2.  **Lancer les Tests (Recommandé)** :
    Lance les tests unitaires ET le Golden Master.
    ```bash
    npm test
    ```

3.  **Lancer les Scripts** :
    * Nouveau code : `npm start`
    * Ancien code (Legacy) : `npm run legacy`

---
### Project Structure / Arborescence

├── legacy/
│   ├── data/         # CSV Data files
│   └── orderReportLegacy.ts
├── src/
│   ├── models/       # Data structures / Types
│   ├── services/     # Business logic (Tax, Discount, Shipping)
│   ├── utils/        # CSV loading
│   └── index.ts      # Entry point
├── tests/
│   ├── unit/         # Unit tests
│   └── check_regression.ts
│   └── generate_master.ts
└── README.md
└── .gitignore
└── tsconfig.json
└── package.json

### choix de conception 

- **Services Stateless** : J'ai choisi d'implémenter les calculateurs (TVA, Remises, Frais de port) sous forme de services sans état avec des méthodes statiques. Cela facilite les tests et évite des instanciations inutiles puisque ces services ne conservent aucune donnée interne.
- **Intégrité des Données** : L'introduction d'interfaces TypeScript strictes remplace les objets génériques du code legacy. Cela permet d'éviter les erreurs d'exécution liées à des propriétés manquantes ou mal nommées dans les fichiers CSV.
- **Logique des frais de gestion** : Lors du refactoring, un bug a été identifié dans la logique originale (les conditions se chevauchaient). J'ai opté pour une stratégie de "retour immédiat" (test des paliers les plus hauts en premier) pour garantir une lecture claire et un résultat exact.