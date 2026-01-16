import * as fs from 'fs';
import * as path from 'path';
import { loadCustomers, loadOrders, loadProducts, loadPromotions, loadShippingZones } from './data/csvLoader';
import { DiscountCalculator } from './services/discountCalculator';

// Constantes globales mal organisées
const TAX = 0.2;
const SHIPPING_LIMIT = 50;
const SHIP = 5.0;
const PREMIUM_THRESHOLD = 1000;
const LOYALTY_RATIO = 0.01;
const HANDLING_FEE = 2.5;
const MAX_DISCOUNT = 200;



// Fonction principale qui fait TOUT
function run(): string {
    const base = __dirname;
    const custPath = path.join(base, 'data', 'customers.csv');
    const ordPath = path.join(base, 'data', 'orders.csv');
    const prodPath = path.join(base, 'data', 'products.csv');
    const shipPath = path.join(base, 'data', 'shipping_zones.csv');
    const promoPath = path.join(base, 'data', 'promotions.csv');

    const customers = loadCustomers(custPath);
    const products = loadProducts(prodPath);
    const shippingZones = loadShippingZones(shipPath);
    const promotions = loadPromotions(promoPath);
    const orders = loadOrders(ordPath);
   

    // Calcul des points de fidélité (première duplication)
    const loyaltyPoints: Record<string, number> = {};
    for (const o of orders) {
        const cid = o.customer_id;
        if (!loyaltyPoints[cid]) {
            loyaltyPoints[cid] = 0;
        }
        // Calcul basé sur le prix de commande
        loyaltyPoints[cid] += o.qty * o.unit_price * LOYALTY_RATIO;
        
    }

    // Groupement par client (logique métier mélangée avec aggregation)
    const totalsByCustomer: Record<string, any> = {};
    for (const o of orders) {
        const cid = o.customer_id;

        // Récupération du produit avec fallback
        const prod = products[o.product_id] || {};
        let basePrice = prod.price !== undefined ? prod.price : o.unit_price;

        // Calcul du total de base pour la ligne
        const baseLineTotal = o.qty * basePrice;

        // Récupération de la promo (si elle existe)
        const promo = o.promo_code ? promotions[o.promo_code] : undefined;

        // Calcul de la réduction code promo
        const promoDiscount = DiscountCalculator.calculatePromoCodeAmount(baseLineTotal, o.qty, promo);

        // Application de la réduction
        let lineTotal = baseLineTotal - promoDiscount;

        // Bonus matin (règle cachée basée sur l'heure)
        const hour = o.getHour();
        const morningBonus = DiscountCalculator.calculateMorningBonus(lineTotal, hour);

        lineTotal = lineTotal - morningBonus;

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

    // Génération du rapport (mélange calculs + formatage + I/O)
    const outputLines: string[] = [];
    const jsonData: any[] = [];
    let grandTotal = 0.0;
    let totalTaxCollected = 0.0;

    // Tri par ID client (comportement à préserver)
    const sortedCustomerIds = Object.keys(totalsByCustomer).sort();

    for (const cid of sortedCustomerIds) {
        const cust = customers[cid] || {};
        const name = cust.name || 'Unknown';
        const level = cust.level || 'BASIC';
        const zone = cust.shipping_zone || 'ZONE1';
        const currency = cust.currency || 'EUR';

        const sub = totalsByCustomer[cid].subtotal;
    
    // calcul de remise volume
    let disc = DiscountCalculator.calculateVolumeDiscount(sub, level);

    // Bonus weekend
    const firstOrderDate = totalsByCustomer[cid].items[0]?.date || '';
    disc = DiscountCalculator.applyWeekendBonus(disc, firstOrderDate);

    //calcul remise fidélité
    const pts = loyaltyPoints[cid] || 0;
    let loyaltyDiscount = DiscountCalculator.calculateLoyaltyDiscount(pts);

    // Application du plafond
    const cappedValues = DiscountCalculator.applyCap(disc, loyaltyDiscount, MAX_DISCOUNT);

    disc = cappedValues.volume;
    loyaltyDiscount = cappedValues.loyalty;
    let totalDiscount = disc + loyaltyDiscount;


        // Calcul taxe (avec gestion spéciale par produit)
        const taxable = sub - totalDiscount;
        let tax = 0.0;

        // Vérifier si tous les produits sont taxables
        let allTaxable = true;
        for (const item of totalsByCustomer[cid].items) {
            const prod = products[item.product_id];
            if (prod && prod.taxable === false) {
                allTaxable = false;
                break;
            }
        }

        if (allTaxable) {
            tax = Math.round(taxable * TAX * 100) / 100; // Arrondi à 2 décimales
        } else {
            // Calcul taxe par ligne (plus complexe)
            for (const item of totalsByCustomer[cid].items) {
                const prod = products[item.product_id];
                if (prod && prod.taxable !== false) {
                    const itemTotal = item.qty * (prod.price || item.unit_price);
                    tax += itemTotal * TAX;
                }
            }
            tax = Math.round(tax * 100) / 100;
        }

        // Frais de port complexes (duplication #3)
        let ship = 0.0;
        const weight = totalsByCustomer[cid].weight;

        if (sub < SHIPPING_LIMIT) {
            const shipZone = shippingZones[zone] || { base: 5.0, per_kg: 0.5 };
            const baseShip = shipZone.base;

            if (weight > 10) {
                ship = baseShip + (weight - 10) * shipZone.per_kg;
            } else if (weight > 5) {
                // Palier intermédiaire (règle cachée)
                ship = baseShip + (weight - 5) * 0.3;
            } else {
                ship = baseShip;
            }

            // Majoration pour livraison en zone éloignée
            if (zone === 'ZONE3' || zone === 'ZONE4') {
                ship = ship * 1.2;
            }
        } else {
            // Livraison gratuite mais frais de manutention pour poids élevé
            if (weight > 20) {
                ship = (weight - 20) * 0.25;
            }
        }

        // Frais de gestion (magic number + condition cachée)
        let handling = 0.0;
        const itemCount = totalsByCustomer[cid].items.length;
        if (itemCount > 10) {
            handling = HANDLING_FEE;
        }
        if (itemCount > 20) {
            handling = HANDLING_FEE * 2; // double pour très grosses commandes
        }

        // Conversion devise (règle cachée pour non-EUR)
        let currencyRate = 1.0;
        if (currency === 'USD') {
            currencyRate = 1.1;
        } else if (currency === 'GBP') {
            currencyRate = 0.85;
        }

        const total = Math.round((taxable + tax + ship + handling) * currencyRate * 100) / 100;
        grandTotal += total;
        totalTaxCollected += tax * currencyRate;

      
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

        // Export JSON en parallèle (side effect)
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

    const result = outputLines.join('\n');

    // Side effects: print + file write
    console.log(result);

    // Export JSON surprise
    const outputPath = path.join(base, 'output.json');
    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));

    return result;
}

// Point d'entrée
if (require.main === module) {
    run();
}

export { run };
