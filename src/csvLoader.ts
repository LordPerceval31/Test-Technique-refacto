import * as fs from 'fs';
import { Customer } from './models/customer';
import { Product } from './models/product';
import { ShippingZone } from './models/shippingZone';
import { Promotion } from './models/promotion';
import { Order } from './models/order';

    

    // Lecture fichier customers (parsing basique avec duplication)
    export const loadCustomers = (filePath: string) : Record<string, Customer> => {
        const customers: Record<string, Customer> = {};
    
    if (!fs.existsSync(filePath)) {
        return customers;
    }
        const custData = fs.readFileSync(filePath, 'utf-8');
        const custLines = custData.split('\n').filter(l => l.trim());

        for (let i = 1; i < custLines.length; i++) {
            const parts = custLines[i].split(',');
            const id = parts[0];
            
            customers[id] = new Customer (
                parts[0],
                parts[1],
                parts[2] || 'BASIC',
                parts[3] || 'ZONE1',
                parts[4] || 'EUR'
            );
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
                products[parts[0]] = new Product(
                    parts[0],
                    parts[1],
                    parts[2],
                    parseFloat(parts[3]),
                    parseFloat(parts[4] || '1.0'),
                    parts[5] === 'true'
                );
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
            shippingZones[p[0]] = new ShippingZone(
                p[0],
                parseFloat(p[1]),
                parseFloat(p[2] || '0.5')
            );
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
        promotions[p[0]] = new Promotion(
            p[0],
            p[1],
            p[2],
            p[3] !== 'false'
        );
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

                orders.push(new Order(
                    parts[0],
                    parts[1],
                    parts[2],
                    qty,
                    price,
                    parts[5],
                    parts[6] || '',
                    parts[7] || '12:00'
                ));
            } catch (e) {
                // Skip silencieux
                continue;
            }
        }
        return orders;
    };