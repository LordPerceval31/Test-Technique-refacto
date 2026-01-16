import { Customers, Order, Product, Promotion, ShippingZone } from "./interfaces";
import * as fs from 'fs';

    

    // Lecture fichier customers (parsing basique avec duplication)
    export const loadCustomers = (filePath: string) : Record<string, Customers> => {
        const customers: Record<string, Customers> = {};
    
    if (!fs.existsSync(filePath)) {
        return customers;
    }
        const custData = fs.readFileSync(filePath, 'utf-8');
        const custLines = custData.split('\n').filter(l => l.trim());

        for (let i = 1; i < custLines.length; i++) {
            const parts = custLines[i].split(',');
            const id = parts[0];
            
            customers[id] = {
                id: parts[0],
                name: parts[1],
                level: parts[2] || 'BASIC',
                shipping_zone: parts[3] || 'ZONE1',
                currency: parts[4] || 'EUR'
            };
        }
        return customers;
    };


    // Lecture fichier products (encore une variation du parsing avec try/catch)
    export const loadProducts = (filePath: string) : Record<string, Product> => {
        const products: Record<string, Product> = {};
        if (!fs.existsSync(filePath)) {
            return products;
        }
        const prodData = fs.readFileSync(filePath, 'utf-8');
        const prodLines = prodData.split('\n').filter(l => l.trim());
        for (let i = 1; i < prodLines.length; i++) {
            const parts = prodLines[i].split(',');
            try {
                products[parts[0]] = {
                    id: parts[0],
                    name: parts[1],
                    category: parts[2],
                    price: parseFloat(parts[3]),
                    weight: parseFloat(parts[4] || '1.0'),
                    taxable: parts[5] === 'true'
                };
            }
            catch (e) {
                // Skip silencieux des erreurs
                continue;
            }
        }
          return products;
    };
    

    // Lecture fichier shipping zones (parsing simple mais différent)
    export const loadShippingZones = (filePath: string) : Record<string, ShippingZone> => {
        const shippingZones: Record<string, ShippingZone> = {};
        if (!fs.existsSync(filePath)) {
            return shippingZones;
        }
        const shipData = fs.readFileSync(filePath, 'utf-8');
        const shipLines = shipData.split('\n').filter(l => l.trim());
        for (let i = 1; i < shipLines.length; i++) {
            const p = shipLines[i].split(',');
            shippingZones[p[0]] = {
                zone: p[0],
                base: parseFloat(p[1]),
                per_kg: parseFloat(p[2] || '0.5')
            };
        }
        return shippingZones;
    };


    // Lecture fichier promotions (encore une autre variation de parsing)
    export const loadPromotions = (filePath: string): Record<string, Promotion> => {
    const promotions: Record<string, Promotion> = {};
    
    if (!fs.existsSync(filePath)) {
        return promotions;
    }

    // Correction : On utilise filePath, pas promoPath !
    const promoData = fs.readFileSync(filePath, 'utf-8');
    const promoLines = promoData.split('\n').filter(l => l.trim());

    for (let i = 1; i < promoLines.length; i++) {
        const p = promoLines[i].split(',');
        promotions[p[0]] = {
            code: p[0],
            type: p[1],
            value: p[2],
            active: p[3] !== 'false'
        };
    }
    return promotions;
};

    // Lecture fichier orders (parsing avec gestion des erreurs)
    export const loadOrders = (filePath: string): Order[] => {
        const orders: Order[] = [];
        if (!fs.existsSync(filePath)) {
            return orders;
        }
        const ordData = fs.readFileSync(filePath, 'utf-8');
        const ordLines = ordData.split('\n').filter(l => l.trim());
        for (let i = 1; i < ordLines.length; i++) {
            const parts = ordLines[i].split(',');
            try {
                const qty = parseInt(parts[3]);
                const price = parseFloat(parts[4]);

                orders.push({
                    id: parts[0],
                    customer_id: parts[1],
                    product_id: parts[2],
                    qty: qty,
                    unit_price: price,
                    date: parts[5],
                    promo_code: parts[6] || '',
                    time: parts[7] || '12:00'
                });
            } catch (e) {
                // Skip silencieux
                continue;
            }
        }
        return orders;
    };