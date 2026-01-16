import { Order } from "../models/order";
import { Product } from "../models/product";


export class TaxCalculator {

    private static readonly TAX_RATE = 0.2;

    static calculateTax(
        taxablesubtotal: number,
        items: Order[],
        products: Record<string, Product>
    ): number {
        let tax = 0.0;

        // Si tout est taxable, on applique la taxe globale
        let allTaxable = true;
        for (const item of items) {
            const prod = products[item.product_id];
            if (prod && prod.taxable === false) {
                allTaxable = false;
                break;
            }
        }

        if (allTaxable) {
            tax = Math.round(taxablesubtotal * TaxCalculator.TAX_RATE * 100) / 100; // Arrondi à 2 décimales
        } else {
            // Calcul taxe par ligne (plus complexe)
            for (const item of items) {
                const prod = products[item.product_id];
                if (prod && prod.taxable !== false) {
                    const itemTotal = item.qty * (prod.price || item.unit_price);
                    tax += itemTotal * TaxCalculator.TAX_RATE;
                }
            }
            tax = Math.round(tax * 100) / 100;  
        }

        return tax;
    }   
}