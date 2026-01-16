import { ShippingCalculator } from "../../src/services/shippingCalculator";


export const assert = (actual: number, expected: number, testName: string) => {

    if(Math.abs(actual - expected) < 0.01) {
        console.log(`✅ Test passé: ${testName}`);
    } else {
        console.log(`❌ Test échoué: ${testName}. Valeur attendue: ${expected}, valeur obtenue: ${actual}`);
        process.exit(1);
    }

}

// calcul frais de port pour zone 1, sous-total < 50, poids < 5kg
const shipping1 = ShippingCalculator.calculateShipping(30, 4, 'ZONE1', {});
assert(shipping1, 5.0, 'Calcul des frais de port pour zone 1, sous-total < 50, poids < 5kg');

// calcul frais de port pour zone 1, sous-total < 50, poids entre 5kg et 10kg
const shipping2 = ShippingCalculator.calculateShipping(40, 7, 'ZONE1', {});
assert(shipping2, 5.6, 'Calcul des frais de port pour zone 1, sous-total < 50, poids entre 5kg et 10kg');

// calcul frais de port offerts pour sous-total >= 50
const shipping3 = ShippingCalculator.calculateShipping(60, 15, 'ZONE1', {});
assert(shipping3, 0.0, 'Calcul des frais de port offerts pour sous-total >= 50');

// calcul avec majoration zone 3
const shipping4 = ShippingCalculator.calculateShipping(30, 8, 'ZONE3', {});
assert(shipping4, 7.08, 'Calcul des frais de port avec majoration zone 3');

// calcul frais de manutention pour 15 articles
const handling1 = ShippingCalculator.calculateHandlingFee(15);
assert(handling1, 2.5, 'Calcul des frais de manutention pour 15 articles');

// calcul frais de manutention pour 25 articles
const handling2 = ShippingCalculator.calculateHandlingFee(25);
assert(handling2, 5, 'Calcul des frais de manutention pour 25 articles');

// calcul frais de gestion
// < 10 articles : 0€
assert(ShippingCalculator.calculateHandlingFee(5), 0, "Pas de frais de gestion petit panier");
// > 10 articles : 2.5€
assert(ShippingCalculator.calculateHandlingFee(15), 2.5, "Frais de gestion standard");
// > 20 articles : 5.0€
assert(ShippingCalculator.calculateHandlingFee(25), 5, "Frais de gestion double (>20 items)");

console.log("🎉 Tous les tests de shipping sont passés avec succès !");