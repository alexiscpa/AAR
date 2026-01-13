import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useReviewLogs, useCourses, useCreateReviewLog, useUpdateReviewLog, useDeleteReviewLog } from "@/lib/hooks";
import type { ReviewLog } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  parseISO,
} from "date-fns";
import { zhTW } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Plus, Loader2, Trash2, Filter, Pencil, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatDate, getEmotionalIndicator } from "@/lib/utils";

export default function ReviewsPage() {
  const { data: reviewLogsData, isLoading } = useReviewLogs();
  const { data: courses } = useCourses();
  const createMutation = useCreateReviewLog();
  const updateMutation = useUpdateReviewLog();
  const deleteMutation = useDeleteReviewLog();
  const { toast } = useToast();

  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<ReviewLog | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 取得當月有復盤的日期
  const reviewDates = useMemo(() => {
    if (!reviewLogsData) return new Set<string>();
    return new Set(
      reviewLogsData.map(({ review_log }) =>
        format(parseISO(review_log.review_date), "yyyy-MM-dd")
      )
    );
  }, [reviewLogsData]);

  // 計算當月復盤天數
  const currentMonthReviewCount = useMemo(() => {
    if (!reviewLogsData) return 0;
    return reviewLogsData.filter(({ review_log }) =>
      isSameMonth(parseISO(review_log.review_date), currentMonth)
    ).length;
  }, [reviewLogsData, currentMonth]);
  const [newLog, setNewLog] = useState({
    course_id: 0,
    title: "",
    reflection: "",
    application_insights: "",
    key_takeaways: "",
    emotional_indicator: 3,
    review_date: new Date().toISOString().split("T")[0],
  });

  const filteredLogs = reviewLogsData?.filter(
    (item) => courseFilter === "all" || item.course?.id?.toString() === courseFilter
  );

  const handleCreate = async () => {
    if (!newLog.title.trim()) {
      toast({ title: "請輸入標題", variant: "destructive" });
      return;
    }
    if (!newLog.course_id) {
      toast({ title: "請選擇課程", variant: "destructive" });
      return;
    }

    try {
      await createMutation.mutateAsync(newLog);
      toast({ title: "復盤日誌已新增", variant: "success" });
      setIsDialogOpen(false);
      setNewLog({
        course_id: 0,
        title: "",
        reflection: "",
        application_insights: "",
        key_takeaways: "",
        emotional_indicator: 3,
        review_date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      toast({ title: "新增失敗", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "復盤日誌已刪除" });
    } catch (error) {
      toast({ title: "刪除失敗", variant: "destructive" });
    }
  };

  const handleEdit = (log: ReviewLog) => {
    setEditingLog(log);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingLog) return;
    if (!editingLog.title.trim()) {
      toast({ title: "請輸入標題", variant: "destructive" });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: editingLog.id,
        data: {
          title: editingLog.title,
          reflection: editingLog.reflection,
          application_insights: editingLog.application_insights,
          key_takeaways: editingLog.key_takeaways,
          emotional_indicator: editingLog.emotional_indicator,
        },
      });
      toast({ title: "復盤日誌已更新", variant: "success" });
      setIsEditDialogOpen(false);
      setEditingLog(null);
    } catch (error) {
      toast({ title: "更新失敗", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-display">
            復盤日誌
          </h1>
          <p className="text-muted-foreground mt-1">
            記錄您的學習反思和心得
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              新增日誌
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>新增復盤日誌</DialogTitle>
              <DialogDescription>記錄您的學習反思和應用心得</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>課程 *</Label>
                  <Select
                    value={newLog.course_id.toString()}
                    onValueChange={(value) =>
                      setNewLog({ ...newLog, course_id: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇課程" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses?.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>日期</Label>
                  <Input
                    type="date"
                    value={newLog.review_date}
                    onChange={(e) =>
                      setNewLog({ ...newLog, review_date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>標題 *</Label>
                <Input
                  value={newLog.title}
                  onChange={(e) => setNewLog({ ...newLog, title: e.target.value })}
                  placeholder="復盤日誌標題"
                />
              </div>
              <div className="space-y-2">
                <Label>學習反思</Label>
                <Textarea
                  value={newLog.reflection}
                  onChange={(e) =>
                    setNewLog({ ...newLog, reflection: e.target.value })
                  }
                  placeholder="這次學習有什麼收穫？有哪些需要改進的地方？"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>應用心得</Label>
                <Textarea
                  value={newLog.application_insights}
                  onChange={(e) =>
                    setNewLog({ ...newLog, application_insights: e.target.value })
                  }
                  placeholder="學到的知識可以如何應用？有什麼實際案例？"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>關鍵收穫</Label>
                <Textarea
                  value={newLog.key_takeaways}
                  onChange={(e) =>
                    setNewLog({ ...newLog, key_takeaways: e.target.value })
                  }
                  placeholder="最重要的幾點收穫是什麼？"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>情感指標</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => {
                    const { emoji } = getEmotionalIndicator(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setNewLog({ ...newLog, emotional_indicator: value })
                        }
                        className={`text-3xl p-2 rounded-lg transition-all ${
                          newLog.emotional_indicator === value
                            ? "bg-primary/20 scale-110"
                            : "hover:bg-muted"
                        }`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "新增"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>編輯復盤日誌</DialogTitle>
              <DialogDescription>修改您的學習反思和應用心得</DialogDescription>
            </DialogHeader>
            {editingLog && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>標題 *</Label>
                  <Input
                    value={editingLog.title}
                    onChange={(e) => setEditingLog({ ...editingLog, title: e.target.value })}
                    placeholder="復盤日誌標題"
                  />
                </div>
                <div className="space-y-2">
                  <Label>學習反思</Label>
                  <Textarea
                    value={editingLog.reflection || ""}
                    onChange={(e) =>
                      setEditingLog({ ...editingLog, reflection: e.target.value })
                    }
                    placeholder="這次學習有什麼收穫？有哪些需要改進的地方？"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>應用心得</Label>
                  <Textarea
                    value={editingLog.application_insights || ""}
                    onChange={(e) =>
                      setEditingLog({ ...editingLog, application_insights: e.target.value })
                    }
                    placeholder="學到的知識可以如何應用？有什麼實際案例？"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>關鍵收穫</Label>
                  <Textarea
                    value={editingLog.key_takeaways || ""}
                    onChange={(e) =>
                      setEditingLog({ ...editingLog, key_takeaways: e.target.value })
                    }
                    placeholder="最重要的幾點收穫是什麼？"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>情感指標</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => {
                      const { emoji } = getEmotionalIndicator(value);
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setEditingLog({ ...editingLog, emotional_indicator: value })
                          }
                          className={`text-3xl p-2 rounded-lg transition-all ${
                            editingLog.emotional_indicator === value
                              ? "bg-primary/20 scale-110"
                              : "hover:bg-muted"
                          }`}
                        >
                          {emoji}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "儲存"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="card-elegant p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="篩選課程" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部課程</SelectItem>
              {courses?.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
            共 <span className="font-semibold text-foreground">{filteredLogs?.length || 0}</span> 筆復盤紀錄
          </div>
        </div>
      </Card>

      {/* Main Content: Review Logs + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Review Logs List - Takes 3/4 */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredLogs?.length === 0 ? (
            <Card className="card-elegant p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">沒有復盤日誌</h3>
              <p className="text-muted-foreground mb-4">
                開始記錄您的學習反思
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredLogs?.map(({ review_log, course }) => {
                const emotion = getEmotionalIndicator(review_log.emotional_indicator);
                return (
                  <Card key={review_log.id} className="card-elegant overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{review_log.title}</CardTitle>
                          {course && (
                            <Link href={`/courses/${course.id}`}>
                              <span className="text-sm text-primary hover:underline">
                                {course.title}
                              </span>
                            </Link>
                          )}
                        </div>
                        <span className="text-3xl" title={emotion.label}>
                          {emotion.emoji}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {review_log.reflection && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              反思
                            </h4>
                            <p className="text-sm line-clamp-3">{review_log.reflection}</p>
                          </div>
                        )}
                        {review_log.key_takeaways && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              關鍵收穫
                            </h4>
                            <p className="text-sm line-clamp-2">{review_log.key_takeaways}</p>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(review_log.review_date)}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(review_log)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>確認刪除？</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    確定要刪除這個復盤日誌嗎？
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(review_log.id)}
                                  >
                                    刪除
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Mini Calendar - Takes 1/4 */}
        <Card className="card-elegant p-4 h-fit">
          <div className="space-y-3">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium">
                  {format(currentMonth, "yyyy年 M月", { locale: zhTW })}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
              {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
                <div key={day} className="py-1">{day}</div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {(() => {
                const monthStart = startOfMonth(currentMonth);
                const monthEnd = endOfMonth(currentMonth);
                const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
                const startPadding = getDay(monthStart);

                return (
                  <>
                    {/* Empty cells for padding */}
                    {Array.from({ length: startPadding }).map((_, i) => (
                      <div key={`pad-${i}`} className="aspect-square" />
                    ))}
                    {/* Actual days */}
                    {days.map((day) => {
                      const dateStr = format(day, "yyyy-MM-dd");
                      const hasReview = reviewDates.has(dateStr);
                      const isToday = isSameDay(day, new Date());

                      return (
                        <div
                          key={dateStr}
                          className={`aspect-square flex items-center justify-center text-xs rounded-md transition-colors
                            ${hasReview
                              ? "bg-primary text-primary-foreground font-medium"
                              : "hover:bg-muted"
                            }
                            ${isToday && !hasReview ? "ring-1 ring-primary" : ""}
                          `}
                          title={hasReview ? `${format(day, "M/d")} 有復盤紀錄` : ""}
                        >
                          {format(day, "d")}
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>

            {/* Summary */}
            <div className="pt-2 border-t text-center">
              <span className="text-sm text-muted-foreground">
                本月復盤 <span className="font-semibold text-primary">{currentMonthReviewCount}</span> 次
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
