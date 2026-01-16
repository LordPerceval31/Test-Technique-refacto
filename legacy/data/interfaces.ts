

// Types minimaux (manque de typage propre)

export interface Customers {
    id: string;
    name: string;
    level: string;
    shipping_zone: string;
    currency: string;
}

export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    weight: number;
    taxable: boolean;
}
export interface ShippingZone {
    zone: string;
    base: number;
    per_kg: number;
}

export interface Promotion {
    code: string;
    type: string;
    value: string;
    active: boolean;
}

export interface Order {
    id: string;
    customer_id: string;
    product_id: string;
    qty: number;
    unit_price: number;
    date: string;
    promo_code?: string;
    time: string;
}
