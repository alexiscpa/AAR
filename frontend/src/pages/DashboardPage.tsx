import { Link } from "wouter";
import { useCourseStats, useActionItemStats, useCourses } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  CheckSquare,
  Clock,
  TrendingUp,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { formatDate, getStatusLabel } from "@/lib/utils";

export default function DashboardPage() {
  const { data: courseStats, isLoading: courseStatsLoading } = useCourseStats();
  const { data: actionStats, isLoading: actionStatsLoading } = useActionItemStats();
  const { data: courses, isLoading: coursesLoading } = useCourses();

  const recentCourses = courses?.slice(0, 3) || [];
  const inProgressCourses = courses?.filter((c) => c.status === "in-progress") || [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-display font-bold tracking-display">
          學習儀表板
        </h1>
        <p className="text-muted-foreground mt-1">
          追蹤您的學習進度，管理課程和行動項目
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              總課程數
            </CardTitle>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {courseStatsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-3xl font-bold">{courseStats?.total || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {courseStats?.completed || 0} 已完成
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              進行中課程
            </CardTitle>
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            {courseStatsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-3xl font-bold">
                  {courseStats?.inProgress || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  持續學習中
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              待辦行動項目
            </CardTitle>
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            {actionStatsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-3xl font-bold">
                  {actionStats?.pending || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {actionStats?.completed || 0} 已完成
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              完成率
            </CardTitle>
            <div className="w-10 h-10 bg-status-completed/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-status-completed" />
            </div>
          </CardHeader>
          <CardContent>
            {courseStatsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-3xl font-bold">
                  {courseStats?.total
                    ? Math.round((courseStats.completed / courseStats.total) * 100)
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground mt-1">課程完成比例</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* In Progress Courses */}
      {inProgressCourses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold tracking-display">
              進行中的課程
            </h2>
            <Link href="/courses">
              <Button variant="ghost" size="sm" className="gap-1">
                查看全部 <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgressCourses.slice(0, 3).map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="card-elegant p-6 cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {course.platform || "未分類"}
                      </p>
                    </div>
                    <Badge variant="in-progress">{getStatusLabel("in-progress")}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">進度</span>
                      <span className="font-medium">
                        {Number(course.progress_percentage)}%
                      </span>
                    </div>
                    <Progress value={Number(course.progress_percentage)} />
                    <p className="text-xs text-muted-foreground">
                      {course.completed_chapters} / {course.total_chapters} 章節
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-semibold tracking-display">
            最近課程
          </h2>
          <Link href="/courses">
            <Button variant="ghost" size="sm" className="gap-1">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        {coursesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : recentCourses.length === 0 ? (
          <Card className="card-elegant p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">還沒有課程</h3>
            <p className="text-muted-foreground mb-4">
              開始添加您的第一個課程，追蹤學習進度
            </p>
            <Link href="/courses">
              <Button>新增課程</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCourses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="card-elegant p-6 cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {course.instructor || "未知講師"}
                      </p>
                    </div>
                    <Badge variant={course.status as "completed" | "in-progress" | "not-started"}>
                      {getStatusLabel(course.status)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Progress value={Number(course.progress_percentage)} />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{course.platform || "未分類"}</span>
                      <span>{formatDate(course.updated_at)}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
