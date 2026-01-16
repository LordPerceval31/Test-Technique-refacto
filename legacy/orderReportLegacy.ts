import * as fs from 'fs';
import * as path from 'path';
import { loadCustomers, loadOrders, loadProducts, loadPromotions, loadShippingZones } from './data/csvLoader';
import { OrderService } from './services/orderService';

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

    const { report, jsonData } = OrderService.generateReport(
        orders,
        customers,
        products,
        promotions,
        shippingZones
    );
 
    // Side effects: print + file write
    console.log(report);

    // Export JSON surprise
    const outputPath = path.join(base, 'output.json');
    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));

    return report;
}

// Point d'entrée
if (require.main === module) {
    run();
}

export { run };
