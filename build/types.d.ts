export interface BalanceItem {
    id: string;
    amount: number;
    currency: string;
}
export interface BalanceResponse {
    entity: "balance";
    item: BalanceItem;
}
export interface ApiResponse<T> {
    data: T;
    error?: string;
    status: number;
}
export interface ApiConfig {
    baseUrl: string;
    headers?: Record<string, string>;
}
export interface RewardsRequestParams {
    count?: string;
    page_id?: string;
    brand_name?: string;
    category?: string;
    denomination?: string;
    expiry_by?: number;
    min_price?: string;
    max_price?: string;
    type?: "gift_card" | "membership" | "offer";
    sort_by?: "gmv" | "units_sold";
    featured?: boolean;
}
export interface Brand {
    name: string;
    website: string;
    description?: string;
    background_color?: string;
    logo_url: string;
}
export interface DisplayParameters {
    name: string;
    description: string;
    terms: string;
    redemption_channels: string[];
    redemption_url: string;
    redemption_instructions?: string;
    image_url?: string;
}
export interface Discount {
    type?: "percentage" | "fixed";
    value?: number;
    discount_value?: number;
}
export interface BaseReward {
    id: string;
    entity: "rewards";
    type: "gift_card" | "membership" | "offer";
    currency: string;
    status: "active" | "inactive" | string;
    start_date: string;
    end_date: string;
    featured?: boolean;
    categories?: string[];
    category?: string[];
    display_parameters: DisplayParameters;
    brand: Brand;
    discount: Discount;
}
export interface GiftCardReward extends BaseReward {
    type: "gift_card";
    denomination_type: "fixed" | "range";
    eligible_fixed_denomination?: number[];
    eligible_range_denomination?: number[];
    interval?: string;
    offer_has_code?: string;
}
export interface MembershipReward extends BaseReward {
    type: "membership";
    interval: string;
    amount: number;
    denomination_type?: string;
    eligible_fixed_denomination?: string;
    eligible_range_denomination?: string;
    offer_has_code?: string;
}
export interface OfferReward extends BaseReward {
    type: "offer";
    offer_has_code: string;
    denomination_type?: string;
    eligible_fixed_denomination?: string;
    eligible_range_denomination?: string;
    interval?: string;
    amount?: string;
}
export type Reward = GiftCardReward | MembershipReward | OfferReward;
export interface RewardsListResponse {
    entity: "collection";
    count: number;
    next_page_id?: string;
    items: Reward[];
}
export interface CustomerDetails {
    name?: string;
    email?: string;
    contact?: number;
}
export interface OrderReward {
    id: string;
    denomination?: number;
    interval?: string;
    quantity: number;
}
export interface CreateOrderRequest {
    reference_no: string;
    rewards: OrderReward[];
    customer?: CustomerDetails;
}
export interface Voucher {
    pin: string;
    validity: number;
    code: string;
}
export interface OrderItem {
    reward_id: string;
    reward_type: "gift_card" | "membership" | "offer";
    denomination?: number;
    currency?: string;
    quantity: number;
    status: "success" | "failed";
    failed_reason?: string;
    interval?: string;
    created_at: number;
    updated_at: number;
    vouchers?: Voucher[];
}
export interface OrderResponse {
    order_id: string;
    entity: "orders";
    reference_no: string;
    status: "success" | "partial_success" | "failure";
    created_at: number;
    order_amount?: number;
    order_success_amount: number;
    order: {
        entity: "collection";
        count: number;
        order_items?: OrderItem[];
    };
}
