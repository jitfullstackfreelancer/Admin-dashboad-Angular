export type KpiFormat = 'currency' | 'number';

export interface Kpi {
  id: string;
  label: string;
  value: number;
  format: KpiFormat;
  delta: number;
  hint: string;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
}

export interface CategorySales {
  category: string;
  amount: number;
}

export type OrderStatus = 'paid' | 'pending' | 'shipped' | 'refunded';

export interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  status: OrderStatus;
  amount: number;
  channel: string;
}

export type CustomerSegment = 'new' | 'returning' | 'vip';

export interface Customer {
  id: string;
  name: string;
  email: string;
  region: string;
  segment: CustomerSegment;
  orders: number;
  spend: number;
  joined: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  time: string;
}

export interface OverviewData {
  kpis: Kpi[];
  revenueTrend: RevenuePoint[];
  salesByCategory: CategorySales[];
  recentOrders: Order[];
  activity: ActivityItem[];
}
