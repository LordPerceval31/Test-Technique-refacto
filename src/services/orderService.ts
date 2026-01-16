import { Customer } from "../../src/models/customer";
import { Order } from "../../src/models/order";
import { Product } from "../../src/models/product";
import { Promotion } from "../../src/models/promotion";
import { ShippingZone } from "../../src/models/shippingZone";
import { DiscountCalculator } from "./discountCalculator";
import { ShippingCalculator } from "./shippingCalculator";
import { TaxCalculator } from "./taxCalculator";



const MAX_DISCOUNT = 200;
const LOYALTY_RATIO = 0.01;

export class OrderService {

    static generateReport(
        orders: Order[],
        customers: Record<string, Customer>,
        products: Record<string, Product>,
        promotions: Record<string, Promotion>,
        shippingZones: Record<string, ShippingZone>
    ): { report: string, jsonData: any[] } {
        
        // 1. Calcul des points de fidélité
        const loyaltyPoints: Record<string, number> = {};
        for (const o of orders) {
            const cid = o.customer_id;
            if (!loyaltyPoints[cid]) loyaltyPoints[cid] = 0;
            loyaltyPoints[cid] += o.qty * o.unit_price * LOYALTY_RATIO;
        }

        // 2. Préparation des données (Groupement par client)
        const totalsByCustomer: Record<string, any> = {};
        for (const o of orders) {
            const cid = o.customer_id;
            const prod = products[o.product_id] || {};
            let basePrice = prod.price !== undefined ? prod.price : o.unit_price;
            
            // Calculs préliminaires par ligne
            const baseLineTotal = o.qty * basePrice;
            const promo = o.promo_code ? promotions[o.promo_code] : undefined;
            const promoDiscount = DiscountCalculator.calculatePromoCodeAmount(baseLineTotal, o.qty, promo);
            let lineTotal = baseLineTotal - promoDiscount;
            
            const hour = o.getHour();
            const morningBonus = DiscountCalculator.calculateMorningBonus(lineTotal, hour);
            lineTotal = lineTotal - morningBonus;

            // Aggrégation
            if (!totalsByCustomer[cid]) {
                totalsByCustomer[cid] = {
                    subtotal: 0.0,
                    items: [],
                    weight: 0.0,
                    promoDiscount: 0.0,
                    morningBonus: 0.0
                };
            }
            totalsByCustomer[cid].subtotal += lineTotal;
            totalsByCustomer[cid].weight += (prod.weight || 1.0) * o.qty;
            totalsByCustomer[cid].items.push(o);
            totalsByCustomer[cid].morningBonus += morningBonus;
        }

        // 3. Génération du rapport texte et JSON
        const outputLines: string[] = [];
        const jsonData: any[] = [];
        let grandTotal = 0.0;
        let totalTaxCollected = 0.0;

        const sortedCustomerIds = Object.keys(totalsByCustomer).sort();

        for (const cid of sortedCustomerIds) {
            const cust = customers[cid] || {};
            const name = cust.name || 'Unknown';
            const level = cust.level || 'BASIC';
            const zone = cust.shipping_zone || 'ZONE1';
            const currency = cust.currency || 'EUR';

            const sub = totalsByCustomer[cid].subtotal;

            // --- Appels aux Calculateurs ---

            // calcul des remises
            let disc = DiscountCalculator.calculateVolumeDiscount(sub, level);
            const firstOrderDate = totalsByCustomer[cid].items[0]?.date || '';
            disc = DiscountCalculator.applyWeekendBonus(disc, firstOrderDate);
            
            // calcul des points de fidélité
            const pts = loyaltyPoints[cid] || 0;
            let loyaltyDiscount = DiscountCalculator.calculateLoyaltyDiscount(pts);
            
            //calcul des plafonds
            const cappedValues = DiscountCalculator.applyCap(disc, loyaltyDiscount, MAX_DISCOUNT);
            disc = cappedValues.volume;
            loyaltyDiscount = cappedValues.loyalty;
            let totalDiscount = disc + loyaltyDiscount;

            // calculs des taxes
            const taxable = sub - totalDiscount;
            const tax = TaxCalculator.calculateTax(taxable, totalsByCustomer[cid].items, products);

            // calculs des frais de port
            const weight = totalsByCustomer[cid].weight;
            const ship = ShippingCalculator.calculateShipping(sub, weight, zone, shippingZones);

            //calculs des frais de gestion
            const itemCount = totalsByCustomer[cid].items.length;
            const handling = ShippingCalculator.calculateHandlingFee(itemCount);

            // Conversion devise
            let currencyRate = 1.0;
            if (currency === 'USD') currencyRate = 1.1;
            else if (currency === 'GBP') currencyRate = 0.85;

            const total = Math.round((taxable + tax + ship + handling) * currencyRate * 100) / 100;
            grandTotal += total;
            totalTaxCollected += tax * currencyRate;

            // Construction du texte
            outputLines.push(`Customer: ${name} (${cid})`);
            outputLines.push(`Level: ${level} | Zone: ${zone} | Currency: ${currency}`);
            outputLines.push(`Subtotal: ${sub.toFixed(2)}`);
            outputLines.push(`Discount: ${totalDiscount.toFixed(2)}`);
            outputLines.push(`  - Volume discount: ${disc.toFixed(2)}`);
            outputLines.push(`  - Loyalty discount: ${loyaltyDiscount.toFixed(2)}`);
            if (totalsByCustomer[cid].morningBonus > 0) {
                outputLines.push(`  - Morning bonus: ${totalsByCustomer[cid].morningBonus.toFixed(2)}`);
            }
            outputLines.push(`Tax: ${(tax * currencyRate).toFixed(2)}`);
            outputLines.push(`Shipping (${zone}, ${weight.toFixed(1)}kg): ${ship.toFixed(2)}`);
            if (handling > 0) {
                outputLines.push(`Handling (${itemCount} items): ${handling.toFixed(2)}`);
            }
            outputLines.push(`Total: ${total.toFixed(2)} ${currency}`);
            outputLines.push(`Loyalty Points: ${Math.floor(pts)}`);
            outputLines.push('');

            jsonData.push({
                customer_id: cid,
                name: name,
                total: total,
                currency: currency,
                loyalty_points: Math.floor(pts)
            });
        }

        outputLines.push(`Grand Total: ${grandTotal.toFixed(2)} EUR`);
        outputLines.push(`Total Tax Collected: ${totalTaxCollected.toFixed(2)} EUR`);

        return {
            report: outputLines.join('\n'),
            jsonData: jsonData
        };
    }
}