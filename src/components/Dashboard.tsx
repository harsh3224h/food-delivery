"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Info,
  RotateCcw,
  BarChart4,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { Order, KpiMetrics, PeakHoursData, RestaurantData, TimeTrendData, ScatterPlotData } from "../types/dashboard";
import StatsCard from "./StatsCard";
import CsvUploader from "./CsvUploader";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurantMetric, setRestaurantMetric] = useState<"revenue" | "volume">("revenue");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#ecf0f5]">
        <div className="text-slate-400 font-bold uppercase tracking-wider text-xs">Loading Dashboard Components...</div>
      </div>
    );
  }

  // Handle uploaded data
  const handleDataParsed = (newOrders: Order[]) => {
    setOrders(newOrders);
  };

  const handleReset = () => {
    setOrders([]);
  };

  // --- Aggregations ---
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.order_value, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const totalDeliveryTime = orders.reduce((sum, o) => sum + o.delivery_time_mins, 0);
  const avgDeliveryTime = totalOrders > 0 ? totalDeliveryTime / totalOrders : 0;

  const onTimeOrders = orders.filter((o) => o.is_on_time === 1).length;
  const onTimeRate = totalOrders > 0 ? (onTimeOrders / totalOrders) * 100 : 0;

  const metrics: KpiMetrics = {
    avgDeliveryTime,
    onTimeRate,
    avgOrderValue,
    totalRevenue,
    totalOrders,
  };

  // 2. Peak Order Hours (0 - 23)
  const peakHoursData: PeakHoursData[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    orderCount: 0,
  }));

  orders.forEach((o) => {
    try {
      const timePart = o.order_timestamp.includes(" ") 
        ? o.order_timestamp.split(" ")[1] 
        : o.order_timestamp.split("T")[1] || "";
      const hour = parseInt(timePart.split(":")[0], 10);
      if (!isNaN(hour) && hour >= 0 && hour < 24) {
        peakHoursData[hour].orderCount += 1;
      }
    } catch (e) {
      const date = new Date(o.order_timestamp);
      const hour = date.getHours();
      if (!isNaN(hour) && hour >= 0 && hour < 24) {
        peakHoursData[hour].orderCount += 1;
      }
    }
  });

  // 3. Top 5 Restaurants
  const restaurantMap: Record<string, { revenue: number; orderCount: number }> = {};
  orders.forEach((o) => {
    if (!restaurantMap[o.restaurant_name]) {
      restaurantMap[o.restaurant_name] = { revenue: 0, orderCount: 0 };
    }
    restaurantMap[o.restaurant_name].revenue += o.order_value;
    restaurantMap[o.restaurant_name].orderCount += 1;
  });

  const restaurantData: RestaurantData[] = Object.entries(restaurantMap).map(([name, stats]) => ({
    name,
    revenue: Math.round(stats.revenue * 100) / 100,
    orderCount: stats.orderCount,
  }));

  const topRestaurants = [...restaurantData]
    .sort((a, b) =>
      restaurantMetric === "revenue" ? b.revenue - a.revenue : b.orderCount - a.orderCount
    )
    .slice(0, 5);

  // 4. Delivery Time Trend (Daily)
  const trendMap: Record<string, { totalTime: number; count: number }> = {};
  orders.forEach((o) => {
    const date = o.order_timestamp.split(" ")[0] || o.order_timestamp.split("T")[0];
    if (date) {
      if (!trendMap[date]) {
        trendMap[date] = { totalTime: 0, count: 0 };
      }
      trendMap[date].totalTime += o.delivery_time_mins;
      trendMap[date].count += 1;
    }
  });

  const timeTrendData: TimeTrendData[] = Object.entries(trendMap)
    .map(([date, stats]) => ({
      date,
      avgDeliveryTime: Math.round((stats.totalTime / stats.count) * 10) / 10,
      orderCount: stats.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 5. Delivery Time vs. Distance (Scatter)
  const scatterPlotData: ScatterPlotData[] = orders.map((o) => ({
    distance: o.distance_km,
    deliveryTime: o.delivery_time_mins,
    restaurant: o.restaurant_name,
    orderValue: o.order_value,
  }));

  const COLORS = ["#3c8dbc", "#00a65a", "#f39c12", "#dd4b39", "#605ca8"];

  return (
    <div className="min-h-screen bg-[#ecf0f5] text-[#333]">
      
      {/* 2015 Styled Classic Admin Header / Navbar */}
      <header className="bg-white border-b border-[#d2d6de] h-[50px] flex items-center justify-between px-4 select-none">
        <div className="flex items-center gap-2">
          <span className="bg-[#3c8dbc] text-white px-3 py-1 font-bold text-sm tracking-tight rounded-none">
            DELIVERY ANALYTICS
          </span>
          <span className="text-xs text-[#777] font-bold uppercase tracking-wider hidden sm:inline-block">
            Dashboard Control Panel v1.0
          </span>
        </div>
        {orders.length > 0 && (
          <button
            onClick={handleReset}
            className="btn-2015 btn-danger-2015 text-xs flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Clear Data / Upload New
          </button>
        )}
      </header>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* If no data loaded, display only the uploader */}
        {orders.length === 0 ? (
          <div className="max-w-3xl mx-auto mt-10">
            <div className="panel-2015 panel-primary-2015">
              <div className="border-b border-[#f4f4f4] bg-[#fdfdfd] px-4 py-3 font-bold text-xs uppercase text-[#444] flex items-center gap-1.5">
                <BarChart4 className="h-4 w-4 text-[#3c8dbc]" />
                Food Delivery Analytics CSV Aggregator
              </div>
              <div className="p-6 bg-white space-y-4">
                <p className="text-xs text-[#666] leading-relaxed">
                  Welcome to the Delivery Performance Dashboard. This system aggregates metrics instantly on the client side. No server configuration or database schema is required.
                </p>
                <div className="border border-[#f4f4f4] p-3 bg-[#fcfcfc] text-[11px] text-[#777] space-y-1">
                  <div className="font-bold text-[#555] uppercase mb-1">CSV Format Requirements:</div>
                  <div>Ensure your file contains the following columns:</div>
                  <div className="font-mono text-[#3c8dbc] overflow-x-auto whitespace-nowrap bg-white border border-[#eee] p-1.5 mt-1">
                    order_id, order_timestamp, restaurant_name, order_value, delivery_time_mins, distance_km, is_on_time
                  </div>
                </div>
                <CsvUploader
                  onDataParsed={handleDataParsed}
                  onReset={handleReset}
                  hasData={false}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Dashboard Dashboard Panels */
          <>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#d2d6de] pb-3 gap-2">
              <div>
                <h1 className="text-xl font-bold uppercase tracking-tight text-[#333] flex items-center gap-1">
                  Performance Metrics Overview
                </h1>
                <p className="text-xs text-[#777] mt-0.5">
                  Real-time statistics compiled from uploaded file ({orders.length} unique orders)
                </p>
              </div>
            </div>

            {/* Stats Row */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <StatsCard
                title="Avg Delivery Time"
                value={`${metrics.avgDeliveryTime.toFixed(1)} MINS`}
                icon={<Clock className="h-5 w-5" />}
                subtext="Target standard: ≤ 30.0 mins"
                colorTheme="orange"
                trend={{
                  value: metrics.avgDeliveryTime <= 30 ? "OPTIMAL" : "CRITICAL",
                  isPositive: metrics.avgDeliveryTime <= 30,
                }}
              />
              <StatsCard
                title="On-Time Rate"
                value={`${metrics.onTimeRate.toFixed(1)}%`}
                icon={<CheckCircle2 className="h-5 w-5" />}
                subtext="Target standard: ≥ 85.0%"
                colorTheme="green"
                trend={{
                  value: metrics.onTimeRate >= 85 ? "STABLE" : "WARNING",
                  isPositive: metrics.onTimeRate >= 85,
                }}
              />
              <StatsCard
                title="Average Order Value"
                value={`$${metrics.avgOrderValue.toFixed(2)}`}
                icon={<DollarSign className="h-5 w-5" />}
                subtext={`Total Gross: $${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                colorTheme="blue"
                trend={{
                  value: "REVENUE OK",
                  isPositive: true,
                }}
              />
            </section>

            {/* Charts Row */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Peak Order Hours */}
              <div className="panel-2015 panel-primary-2015">
                <div className="border-b border-[#f4f4f4] bg-[#fdfdfd] px-4 py-3 font-bold text-xs uppercase text-[#444]">
                  Peak Order Hours
                </div>
                <div className="p-4 bg-white">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={peakHoursData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="0" stroke="#f4f4f4" vertical={false} />
                        <XAxis dataKey="hour" stroke="#999" tickLine={false} tickFormatter={(h) => `${h}:00`} fontSize={10} />
                        <YAxis stroke="#999" tickLine={false} axisLine={false} fontSize={10} allowDecimals={false} />
                        <Tooltip
                          cursor={{ fill: "#f5f5f5" }}
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #d2d6de",
                            borderRadius: "0px",
                            fontSize: "12px",
                          }}
                        />
                        <Bar dataKey="orderCount" fill="#3c8dbc" radius={0} name="Order Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Top 5 Restaurants */}
              <div className="panel-2015 panel-success-2015">
                <div className="border-b border-[#f4f4f4] bg-[#fdfdfd] px-4 py-3 font-bold text-xs uppercase text-[#444] flex items-center justify-between flex-wrap gap-2">
                  <span>Top 5 Restaurants</span>
                  
                  {/* Classical Button Group */}
                  <div className="inline-flex border border-[#d2d6de]">
                    <button
                      onClick={() => setRestaurantMetric("revenue")}
                      className={`text-[10px] font-bold px-2 py-1 rounded-none outline-none ${
                        restaurantMetric === "revenue"
                          ? "bg-[#3c8dbc] text-white"
                          : "bg-white text-[#555] hover:bg-[#f4f4f4]"
                      }`}
                    >
                      BY REVENUE
                    </button>
                    <button
                      onClick={() => setRestaurantMetric("volume")}
                      className={`text-[10px] font-bold px-2 py-1 rounded-none outline-none border-l border-[#d2d6de] ${
                        restaurantMetric === "volume"
                          ? "bg-[#3c8dbc] text-white"
                          : "bg-white text-[#555] hover:bg-[#f4f4f4]"
                      }`}
                    >
                      BY VOLUME
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topRestaurants}
                        layout="vertical"
                        margin={{ top: 10, right: 10, left: 15, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="0" stroke="#f4f4f4" horizontal={false} />
                        <XAxis type="number" stroke="#999" tickLine={false} fontSize={10} />
                        <YAxis dataKey="name" type="category" stroke="#999" tickLine={false} fontSize={10} width={80} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #d2d6de",
                            borderRadius: "0px",
                            fontSize: "12px",
                          }}
                        />
                        <Bar
                          dataKey={restaurantMetric === "revenue" ? "revenue" : "orderCount"}
                          radius={0}
                          name={restaurantMetric === "revenue" ? "Revenue ($)" : "Orders"}
                        >
                          {topRestaurants.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Delivery Time Trend */}
              <div className="panel-2015 panel-warning-2015">
                <div className="border-b border-[#f4f4f4] bg-[#fdfdfd] px-4 py-3 font-bold text-xs uppercase text-[#444]">
                  Delivery Time Trend
                </div>
                <div className="p-4 bg-white">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="0" stroke="#f4f4f4" />
                        <XAxis dataKey="date" stroke="#999" tickLine={false} fontSize={10} />
                        <YAxis stroke="#999" tickLine={false} axisLine={false} fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #d2d6de",
                            borderRadius: "0px",
                            fontSize: "12px",
                          }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="square" />
                        <Line
                          type="monotone"
                          dataKey="avgDeliveryTime"
                          stroke="#605ca8"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                          name="Avg Delivery Speed (mins)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Delivery Time vs Distance Scatter Plot */}
              <div className="panel-2015 panel-danger-2015">
                <div className="border-b border-[#f4f4f4] bg-[#fdfdfd] px-4 py-3 font-bold text-xs uppercase text-[#444]">
                  Delivery Time vs. Distance Scatter Plot
                </div>
                <div className="p-4 bg-white">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="0" stroke="#f4f4f4" />
                        <XAxis
                          type="number"
                          dataKey="distance"
                          name="Distance"
                          unit=" km"
                          stroke="#999"
                          tickLine={false}
                          fontSize={10}
                        />
                        <YAxis
                          type="number"
                          dataKey="deliveryTime"
                          name="Fulfillment"
                          unit=" mins"
                          stroke="#999"
                          tickLine={false}
                          fontSize={10}
                        />
                        <Tooltip
                          cursor={{ strokeDasharray: "3 3" }}
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #d2d6de",
                            borderRadius: "0px",
                            fontSize: "12px",
                          }}
                          formatter={(value: any, name?: any) => {
                            if (name === "Fulfillment") return [`${value} mins`, "Delivery Time"];
                            if (name === "Distance") return [`${value} km`, "Distance"];
                            return [value, name];
                          }}
                        />
                        <Scatter
                          name="Orders"
                          data={scatterPlotData}
                          fill="#00a65a"
                          shape="circle"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

            </section>
          </>
        )}

      </div>
    </div>
  );
}
