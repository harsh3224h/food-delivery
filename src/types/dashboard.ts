export interface Order {
  order_id: string | number;
  order_timestamp: string;
  restaurant_name: string;
  order_value: number;
  delivery_time_mins: number;
  distance_km: number;
  is_on_time: number; // 0 or 1
}

export interface KpiMetrics {
  avgDeliveryTime: number;
  onTimeRate: number;
  avgOrderValue: number;
  totalRevenue: number;
  totalOrders: number;
}

export interface PeakHoursData {
  hour: number;
  orderCount: number;
}

export interface RestaurantData {
  name: string;
  revenue: number;
  orderCount: number;
}

export interface TimeTrendData {
  date: string; // YYYY-MM-DD
  avgDeliveryTime: number;
  orderCount: number;
}

export interface ScatterPlotData {
  distance: number;
  deliveryTime: number;
  restaurant: string;
  orderValue: number;
}
