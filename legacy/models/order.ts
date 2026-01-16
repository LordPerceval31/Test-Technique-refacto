/**
 * Modèle représentant une commande passée dans le magasin.
 * cette classe encapsule les données brutes des commandes (CSV).
 * et fournira des méthodes spécifiques aux commandes.
 */

export class Order {
    constructor(
        public id: string, // Identifiant unique de la commande (ex: "O-5001")
        public customer_id: string, // Identifiant du client ayant passé la commande
        public product_id: string, // Identifiant du produit commandé
        public qty: number, // Quantité commandée
        public unit_price: number, // Prix unitaire au moment de la commande (Hors Taxe)
        public date: string, // Date de la commande (ex: "2023-08-15")
        public promo_code: string, // Code promotionnel appliqué (s'il y en a un)
        public time: string // Heure de la commande (ex: "14:30")
    ) {}
}