import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Card({ className, children }) {
  return (
    <div className={cn("rounded-xl bg-white border border-[#E2E8F0] shadow-[0_2px_4px_rgba(0,0,0,0.02)]", className)}>
      {children}
    </div>
  );
}
function CardHeader({ className, children }) {
  return <div className={cn("p-5 pb-3", className)}>{children}</div>;
}
function CardTitle({ className, children }) {
  return <div className={cn("text-sm font-bold text-[#172B4D]", className)}>{children}</div>;
}
function CardDescription({ className, children }) {
  return <div className={cn("mt-1 text-xs text-[#6B778C]", className)}>{children}</div>;
}
function CardContent({ className, children }) {
  return <div className={cn("p-5 pt-2", className)}>{children}</div>;
}

function Dashboard() {
  // Mock Data for Charts
  const dailyData = [
    { day: "월", orders: 320 },
    { day: "화", orders: 350 },
    { day: "수", orders: 300 },
    { day: "목", orders: 380 },
    { day: "금", orders: 420 },
    { day: "토", orders: 450 },
    { day: "일", orders: 400 },
  ];

  const partnerData = [
    { name: "A파트너명", rate: 95 },
    { name: "B파트너명", rate: 88 },
    { name: "C파트너명", rate: 92 },
    { name: "D파트너명", rate: 85 },
  ];

  const hourlyData = [
    { time: "00", value: 10 }, { time: "04", value: 5 },
    { time: "08", value: 20 }, { time: "12", value: 50 },
    { time: "16", value: 40 }, { time: "20", value: 80 },
    { time: "24", value: 30 },
  ];

  const issueData = [
    { name: "완료", value: 85 },
    { name: "미처리", value: 15 },
  ];
  const COLORS = ["#0052CC", "#DFE1E6"];

  // KPI Data
  const performanceFlow = [
    { label: "발행", value: 248, color: "text-[#172B4D]" },
    { label: "예약 완료", value: 164, color: "text-[#0052CC]" },
    { label: "수행 완료", value: 79, color: "text-[#0052CC]" },
    { label: "취소", value: 5, color: "text-rose-600" },
  ];

  const emergencyMetrics = [
    { label: "위생 장애 인입", value: "12건" },
    { label: "긴급 오더 발행", value: "12건" },
    { label: "적시 수행", value: "10건" },
    { label: "평균 리드타임", value: "45분" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Car Wash Performance Status */}
        <Card>
          <CardHeader>
            <CardTitle>세차 수행 현황 (Today)</CardTitle>
            <CardDescription>실시간 오더 라이프사이클</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {performanceFlow.map((item, idx) => (
                <React.Fragment key={item.label}>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-[#6B778C]">{item.label}</span>
                    <span className={cn("text-2xl font-bold", item.color)}>{item.value}</span>
                  </div>
                  {idx < performanceFlow.length - 1 && (
                    <div className="h-px w-8 bg-[#DFE1E6] md:w-16" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Wash Status */}
        <Card>
          <CardHeader>
            <CardTitle>긴급 세차 처리 현황 (최근 1주일)</CardTitle>
            <CardDescription>위생 이슈 대응 지표</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              {emergencyMetrics.map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[#6B778C]">{item.label}</span>
                  <span className="text-xl font-bold text-[#172B4D]">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div>
        <h3 className="mb-4 text-lg font-bold text-[#172B4D]">요약 그래프</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          {/* Daily Orders */}
          <Card>
            <CardHeader><CardTitle>일자별 오더</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFE1E6" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B778C" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B778C" }} />
                  <Tooltip cursor={{ fill: "#F4F5F7" }} />
                  <Bar dataKey="orders" fill="#0052CC" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Partner Performance */}
          <Card>
            <CardHeader><CardTitle>파트너별 수행률</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={partnerData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#DFE1E6" />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} tick={{ fontSize: 12, fill: "#6B778C" }} />
                  <Tooltip cursor={{ fill: "#F4F5F7" }} />
                  <Bar dataKey="rate" fill="#0052CC" radius={[0, 4, 4, 0]} barSize={20} label={{ position: "right", fill: "#172B4D", fontSize: 12 }} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Hourly Concentration */}
          <Card>
            <CardHeader><CardTitle>시간대별 세차 집중도</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0052CC" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0052CC" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFE1E6" />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B778C" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B778C" }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#0052CC" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Issue Resolution Rate */}
          <Card>
            <CardHeader><CardTitle>장애 처리율</CardTitle></CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={issueData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {issueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-[#172B4D]">
                    85%
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;