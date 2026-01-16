/**
 * Représente un code promotionnel.
 * Peut être de type pourcentage ou montant fixe.
 */

export class Promotion {
    constructor(
        public code: string, // Code unique de la promotion (ex: "PROMO10")
        public type: string, // Type de promotion (ex: "PERCENTAGE", "FIXED")
        public value: string, // Valeur de la promotion (ex: "10" pour 10% ou "5" pour 5 unités monétaires)
        public active: boolean // Indique si la promotion est active
    ) {}
}
