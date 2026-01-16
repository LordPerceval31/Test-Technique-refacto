import { DiscountCalculator } from "../../src/services/discountCalculator";


export const assert = (actual: number, expected: number, testName: string) => {

    if(Math.abs(actual - expected) < 0.01) {
        console.log(`✅ Test passé: ${testName}`);
    } else {
        console.log(`❌ Test échoué: ${testName}. Valeur attendue: ${expected}, valeur obtenue: ${actual}`);
        process.exit(1);
    }

}
// Test weekend
const weekendBonus = DiscountCalculator.applyWeekendBonus(100, '2023-10-21');
assert(weekendBonus, 105, 'Application de la majoration weekend');

// Test semaine
const noWeekendBonus = DiscountCalculator.applyWeekendBonus(100, '2023-10-18');
assert(noWeekendBonus, 100, 'Pas de majoration en semaine');

// Test fidélité
const loyaltyDiscount = DiscountCalculator.calculateLoyaltyDiscount(600);
assert(loyaltyDiscount, 90, 'Calcul de la remise fidélité pour 600 points');

// Test plafond de remise
const cappedDiscount = DiscountCalculator.applyCap(150, 100, 200);
assert(cappedDiscount.volume, 120, 'Application du plafond de remise - partie volume');
assert(cappedDiscount.loyalty, 80, 'Application du plafond de remise - partie fidélité');

console.log("🎉 Tous les tests de discount sont passés avec succès !");