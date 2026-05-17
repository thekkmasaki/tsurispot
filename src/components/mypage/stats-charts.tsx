"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

interface MonthlyData {
  month: string;
  count: number;
  label: string;
}

interface FishData {
  fishName: string;
  count: number;
}

interface SpotData {
  spotSlug: string;
  spotName: string;
  count: number;
}

interface MethodData {
  method: string;
  count: number;
}

interface SizeTrendData {
  date: string;
  sizeCm: number;
  fishName: string;
}

interface ChartsData {
  monthly: MonthlyData[];
  byFish: FishData[];
  bySpot: SpotData[];
  byMethod: MethodData[];
  sizeTrend: SizeTrendData[];
  totalReports: number;
}

const PIE_COLORS = [
  "#0EA5E9",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#A855F7",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#6366F1",
  "#84CC16",
];

export function StatsCharts({ data }: { data: ChartsData }) {
  if (data.totalReports === 0) {
    return (
      <div className="rounded-lg border bg-muted/30 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          まだ釣果がありません。釣果を投稿すると統計グラフが表示されます。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 text-sm font-bold sm:text-base">
          月別釣果数 (過去12ヶ月)
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data.monthly} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" fontSize={11} stroke="#6b7280" />
            <YAxis allowDecimals={false} fontSize={11} stroke="#6b7280" />
            <Tooltip
              cursor={{ fill: "rgba(14, 165, 233, 0.08)" }}
              contentStyle={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                fontSize: 12,
              }}
              labelFormatter={(label) => String(label)}
              formatter={(value) => [`${value}件`, "釣果数"]}
            />
            <Bar dataKey="count" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {data.byFish.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-sm font-bold sm:text-base">
            魚種別 TOP {data.byFish.length}
          </h2>
          <ResponsiveContainer width="100%" height={Math.max(220, data.byFish.length * 32)}>
            <BarChart
              data={data.byFish}
              layout="vertical"
              margin={{ top: 5, right: 20, bottom: 5, left: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis type="number" allowDecimals={false} fontSize={11} stroke="#6b7280" />
              <YAxis
                type="category"
                dataKey="fishName"
                fontSize={11}
                stroke="#6b7280"
                width={60}
              />
              <Tooltip
                cursor={{ fill: "rgba(34, 197, 94, 0.08)" }}
                contentStyle={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  fontSize: 12,
                }}
                formatter={(value) => [`${value}件`, "釣果数"]}
              />
              <Bar dataKey="count" fill="#22C55E" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.bySpot.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-sm font-bold sm:text-base">
            スポット別 TOP {data.bySpot.length}
          </h2>
          <ResponsiveContainer width="100%" height={Math.max(220, data.bySpot.length * 32)}>
            <BarChart
              data={data.bySpot}
              layout="vertical"
              margin={{ top: 5, right: 20, bottom: 5, left: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis type="number" allowDecimals={false} fontSize={11} stroke="#6b7280" />
              <YAxis
                type="category"
                dataKey="spotName"
                fontSize={10}
                stroke="#6b7280"
                width={80}
                tickFormatter={(v: string) => (v.length > 8 ? v.slice(0, 8) + "…" : v)}
              />
              <Tooltip
                cursor={{ fill: "rgba(245, 158, 11, 0.08)" }}
                contentStyle={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  fontSize: 12,
                }}
                formatter={(value) => [`${value}件`, "釣果数"]}
              />
              <Bar dataKey="count" fill="#F59E0B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.byMethod.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-sm font-bold sm:text-base">釣法別</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.byMethod}
                dataKey="count"
                nameKey="method"
                outerRadius={80}
                label={(props) => {
                  const m = props as unknown as { method?: string; percent?: number };
                  return `${m.method ?? ""} ${m.percent ? (m.percent * 100).toFixed(0) : 0}%`;
                }}
                labelLine={false}
              >
                {data.byMethod.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  fontSize: 12,
                }}
                formatter={(value) => [`${value}件`, "釣果数"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.sizeTrend.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-sm font-bold sm:text-base">サイズ推移 (直近{data.sizeTrend.length}件)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={data.sizeTrend}
              margin={{ top: 10, right: 10, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                fontSize={10}
                stroke="#6b7280"
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis
                fontSize={11}
                stroke="#6b7280"
                unit="cm"
                domain={[0, "dataMax"]}
              />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  fontSize: 12,
                }}
                labelFormatter={(label) => String(label)}
                formatter={(value, _name, props) => {
                  const item = (props as { payload?: SizeTrendData }).payload;
                  return [`${value}cm`, item?.fishName ?? "サイズ"];
                }}
              />
              <Line
                type="monotone"
                dataKey="sizeCm"
                stroke="#0EA5E9"
                strokeWidth={2}
                dot={{ r: 3, fill: "#0EA5E9" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
