import { Promotion } from "../../src/models/promotion";


export class DiscountCalculator {

    // calcul des remises basées sur le volume d'achat
    static calculateVolumeDiscount(subtotal: number, customerLevel: string): number {
        let discount = 0;

        if (subtotal > 50) {
            discount = subtotal * 0.05;
        }
        if (subtotal > 100) {
            discount = subtotal * 0.1;
        }
        if (subtotal > 500) {
            discount = subtotal * 0.15;
        }
        if (subtotal > 1000 && customerLevel === 'PREMIUM') {
            discount = subtotal * 0.2;
        }
        return discount;
    }

    // application de la majoration weekend
    static applyWeekendBonus(currentDiscount: number, orderDate: string): number {
        // on sécurise si la date est vide
        if (!orderDate) return currentDiscount;

        const date = new Date(orderDate);
        const day = date.getDay(); // 0 = Dimanche, 6 = Samedi
    
        if (day === 0 || day === 6) {
        return currentDiscount * 1.05; // on retourne le nouveau montant
        }
        return currentDiscount;
    }

    // calcul des remises basées sur les points de fidélité
    static calculateLoyaltyDiscount(points: number):number {
        let discount = 0;

        if (points > 500) {
                discount = Math.min(points * 0.15, 100.0);
            } else if (points > 100) {
                discount = Math.min(points * 0.1, 50.0);
            }
            return discount;
        }

    // application du plafond de remise
    static applyCap(volumeDiscount: number, loyaltyDiscount: number, limit: number): {volume: number, loyalty: number} {
        const total = volumeDiscount + loyaltyDiscount;

        // Si on est en dessous du plafond, on ne change rien
        if (total <= limit) {
            return { volume: volumeDiscount, loyalty: loyaltyDiscount };
        }
        // Sinon, on calcule le ratio pour chaque type de remise
        const ratio = limit / total;
        return {
            volume: volumeDiscount * ratio,
            loyalty: loyaltyDiscount * ratio    
        }
    }

    // calcul de la remise matin
    static calculateMorningBonus(amount: number, hour: number): number {
        if (hour < 10) {
            return amount * 0.03;
        }
        return 0;
    }

    // Calcul de la remise promotionnelle
    static calculatePromoCodeAmount(baseTotal: number, qty: number, promo?: Promotion): number {
        if (!promo || !promo.active) {
            return 0;
        }

        let discountAmount = 0;

        if (promo.type === 'PERCENTAGE') {
            const rate = parseFloat(promo.value) / 100;
            discountAmount = baseTotal * rate;
        } else if (promo.type === 'FIXED') {
            const fixed = parseFloat(promo.value);
            discountAmount = fixed * qty;
        }

        return discountAmount;
    }
}