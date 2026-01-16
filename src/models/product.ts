/**
 * Représente un produit vendu dans le magasin.
 * Cette classe encapsule les données brutes du catalogue (CSV)
 * et fournira les méthodes de calcul de prix.
 */
export class Product {
    constructor(
        public id: string, // Identifiant unique du produit (ex: "P-8852")
        public name: string, // Nom commercial du produit
        public category: string, // Catégorie pour le reporting (ex: "Food", "Electronics")
        public price: number, // Prix unitaire de base (Hors Taxe)
        public weight: number, // Poids unitaire en Kilogrammes (kg). Utilisé pour le calcul des frais de port.
        public taxable: boolean // Indique si la TVA standard s'applique à ce produit.
    ) {}

    // Indique si le produit est soumis à la TVA. Permet d'isoler la logique fiscale (qui pourrait changer selon le prix ou la catégorie).
    public isTaxable(): boolean {
        return this.taxable;
    }

    // Retourne le prix unitaire du produit. 
    public getPrice(): number {
        return this.price;
    }
}