import { ShippingZone } from "../../src/models/shippingZone";


export class ShippingCalculator {

    private static readonly SHIPPING_LIMIT = 50;
    private static readonly HANDLING_FEE = 2.5;

    static calculateShipping(
        subtotal: number,
        weight: number,
        zone: string,
        shippingZones: Record<string, ShippingZone>
    ): number {
        let ship = 0.0;

        if (subtotal < this.SHIPPING_LIMIT) {
            const shipZone = shippingZones[zone] || { base: 5.0, per_kg: 0.5 };
            const baseShip = shipZone.base; 
            if (weight > 10) {
                ship = baseShip + (weight - 10) * shipZone.per_kg;
            }
            else if (weight > 5) {
                ship = baseShip + (weight - 5) * 0.3;
            }
            else {
                ship = baseShip;
            }   
            if (zone === 'ZONE3' || zone === 'ZONE4') {
                ship = ship * 1.2;
            }
        } else {
            if (weight > 20) {
                ship = (weight - 20) * 0.25;
            }
        }
        
        return ship;
    }
    static calculateHandlingFee(itemCount: number): number {
        if (itemCount > 20) {
            return this.HANDLING_FEE * 2;
        }
        if (itemCount > 10) {
            return this.HANDLING_FEE;
        }
        // 3. Sinon, c'est gratuit
        return 0.0;
    }
}