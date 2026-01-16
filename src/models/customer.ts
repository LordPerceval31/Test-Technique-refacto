/**
 * Modèle représentant un client du magasin.
 * Cette classe encapsule les données brutes des clients (CSV).
 * et pourra être étendue avec des méthodes spécifiques aux clients.
 */
export class Customer {
    constructor(
        public id: string, // Identifiant unique du client (ex: "C-1001")
        public name: string, // Nom du client
        public level: string, // Niveau du client (ex: "BASIC", "PREMIUM")
        public shipping_zone: string, // Zone de livraison (ex: "ZONE1", "ZONE2")
        public currency: string // Devise préférée du client (ex: "EUR", "USD")
    ) {}
}   

