/**
 * Définit une zone d'expédition et ses tarifs associés.
 * Permet de calculer les frais de port de base selon le poids.
 */

export class ShippingZone {
    constructor(
        public zone: string, // Identifiant unique de la zone de livraison (ex: "ZONE1")
        public base: number, // Coût de base pour cette zone (ex: 5.00)
        public per_kg: number // Coût par kilogramme pour cette zone (ex: 2.00)
    ) {}
}