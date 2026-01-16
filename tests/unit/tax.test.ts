import { Order } from "../../src/models/order";
import { Product } from "../../src/models/product";
import { TaxCalculator } from "../../src/services/taxCalculator";


export const assert = (actual: number, expected: number, testName: string) => {

    if(Math.abs(actual - expected) < 0.01) {
        console.log(`✅ Test passé: ${testName}`);
    } else {
        console.log(`❌ Test échoué: ${testName}. Valeur attendue: ${expected}, valeur obtenue: ${actual}`);
        process.exit(1);
    }

}
// Faux produits pour les tests
const products: Record<string, Product> = {
    'PROD_TAX': { 
        id: 'PROD_TAX', 
        name: 'Produit Normal',
        category: 'General',
        price: 100, 
        weight: 1, 
        taxable: true 
    } as Product, 
    'PROD_FREE': { 
        id: 'PROD_FREE',
        name: 'Produit Non Taxable',
        category: 'Food',            
        price: 100, 
        weight: 1, 
        taxable: false 
    } as Product
};

// Test cas où tous les produits sont taxables
const taxAll = TaxCalculator.calculateTax(300, [
    { product_id: 'PROD_TAX', qty: 1, unit_price: 100 } as Order,
    { product_id: 'PROD_TAX', qty: 2, unit_price: 100 } as Order
], products);
assert(taxAll, 60, 'Calcul de la taxe lorsque tous les produits sont taxables');

// Test cas avec un produit non taxable
const taxSome = TaxCalculator.calculateTax(300, [
    { product_id: 'PROD_TAX', qty: 1, unit_price: 100 } as Order,
    { product_id: 'PROD_FREE', qty: 2, unit_price: 100 } as Order
], products);
assert(taxSome, 20, 'Calcul de la taxe avec un produit non taxable');

console.log("🎉 Tous les tests de tax sont passés avec succès !")   ;
    