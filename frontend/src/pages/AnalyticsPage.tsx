import { useCourses, useCourseStats, useActionItemStats, useReviewLogs } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  BookOpen,
  CheckSquare,
  TrendingUp,
  Calendar,
  Loader2,
} from "lucide-react";
import { getEmotionalIndicator } from "@/lib/utils";

const COLORS = {
  primary: "oklch(0.623 0.214 259.815)",
  secondary: "oklch(0.65 0.2 280)",
  accent: "oklch(0.8 0.15 45)",
  completed: "oklch(0.6 0.18 145)",
  inProgress: "oklch(0.623 0.214 259.815)",
  notStarted: "oklch(0.552 0.016 285.938)",
};

export default function AnalyticsPage() {
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: courseStats, isLoading: courseStatsLoading } = useCourseStats();
  const { data: actionStats, isLoading: actionStatsLoading } = useActionItemStats();
  const { data: reviewLogs, isLoading: reviewLogsLoading } = useReviewLogs();

  const isLoading =
    coursesLoading || courseStatsLoading || actionStatsLoading || reviewLogsLoading;

  // Course status data for pie chart
  const courseStatusData = [
    { name: "已完成", value: courseStats?.completed || 0, color: "#22c55e" },
    { name: "進行中", value: courseStats?.in_progress || 0, color: "#3b82f6" },
    { name: "未開始", value: courseStats?.not_started || 0, color: "#94a3b8" },
  ];

  // Course progress data for bar chart
  const courseProgressData =
    courses
      ?.slice(0, 8)
      .map((course) => ({
        name: course.title.slice(0, 15) + (course.title.length > 15 ? "..." : ""),
        progress: Number(course.progress_percentage),
      })) || [];

  // Emotional trend data
  const emotionalTrendData =
    reviewLogs
      ?.slice(0, 10)
      .reverse()
      .map((item) => ({
        date: new Date(item.review_log.review_date).toLocaleDateString("zh-TW", {
          month: "short",
          day: "numeric",
        }),
        score: item.review_log.emotional_indicator,
      })) || [];

  // Platform distribution
  const platformCounts: Record<string, number> = {};
  courses?.forEach((course) => {
    const platform = course.platform || "其他";
    platformCounts[platform] = (platformCounts[platform] || 0) + 1;
  });
  const platformData = Object.entries(platformCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Average emotional score
  const avgEmotionalScore = reviewLogs?.length
    ? (
        reviewLogs.reduce((sum, item) => sum + item.review_log.emotional_indicator, 0) /
        reviewLogs.length
      ).toFixed(1)
    : "N/A";

  // Average progress
  const avgProgress = courses?.length
    ? Math.round(
        courses.reduce((sum, course) => sum + Number(course.progress_percentage), 0) /
          courses.length
      )
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold tracking-display">
          統計分析
        </h1>
        <p className="text-muted-foreground mt-1">
          查看您的學習數據和趨勢
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              總課程數
            </CardTitle>
            <BookOpen className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{courseStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {courseStats?.completed || 0} 已完成
            </p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              行動項目完成率
            </CardTitle>
            <CheckSquare className="w-5 h-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {actionStats?.total
                ? Math.round((actionStats.completed / actionStats.total) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {actionStats?.completed || 0} / {actionStats?.total || 0} 完成
            </p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均進度
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgProgress}%</div>
            <Progress value={avgProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均學習滿意度
            </CardTitle>
            <Calendar className="w-5 h-5 text-status-completed" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <span>{avgEmotionalScore !== "N/A" ? getEmotionalIndicator(Number(avgEmotionalScore)).emoji : "📊"}</span>
              <span className="text-2xl">{avgEmotionalScore}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {reviewLogs?.length || 0} 篇復盤日誌
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Status Pie Chart */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>課程狀態分布</CardTitle>
          </CardHeader>
          <CardContent>
            {courseStats?.total ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={courseStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {courseStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                暫無數據
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Progress Bar Chart */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>課程進度一覽</CardTitle>
          </CardHeader>
          <CardContent>
            {courseProgressData.length ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={courseProgressData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="progress" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                暫無數據
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotional Trend Line Chart */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>學習滿意度趨勢</CardTitle>
          </CardHeader>
          <CardContent>
            {emotionalTrendData.length ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={emotionalTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                  <Tooltip
                    formatter={(value: number) => [
                      `${getEmotionalIndicator(value).emoji} ${getEmotionalIndicator(value).label}`,
                      "滿意度",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                暫無數據
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>學習平台分布</CardTitle>
          </CardHeader>
          <CardContent>
            {platformData.length ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {platformData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"][
                            index % 6
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                暫無數據
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
