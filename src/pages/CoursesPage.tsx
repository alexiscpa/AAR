import { useState } from "react";
import { Link } from "wouter";
import { useCourses, useCreateCourse, useDeleteCourse } from "@/lib/hooks";
import type { CourseCreate } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
import {
  BookOpen,
  Plus,
  Search,
  Loader2,
  Trash2,
  Filter,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatDate, getStatusLabel, getPriorityLabel } from "@/lib/utils";

export default function CoursesPage() {
  const { data: courses, isLoading } = useCourses();
  const createMutation = useCreateCourse();
  const deleteMutation = useDeleteCourse();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState<CourseCreate>({
    title: "",
    platform: "",
    instructor: "",
    description: "",
    course_url: "",
    total_chapters: 0,
  });

  const filteredCourses = courses?.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.platform?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || course.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || course.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateCourse = async () => {
    if (!newCourse.title.trim()) {
      toast({
        title: "請輸入課程名稱",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMutation.mutateAsync(newCourse);
      toast({
        title: "課程已新增",
        description: `「${newCourse.title}」已成功加入您的課程清單`,
        variant: "success",
      });
      setIsCreateDialogOpen(false);
      setNewCourse({
        title: "",
        platform: "",
        instructor: "",
        description: "",
        course_url: "",
        total_chapters: 0,
      });
    } catch (error) {
      toast({
        title: "新增失敗",
        description: error instanceof Error ? error.message : "請稍後再試",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = async (id: number, title: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "課程已刪除",
        description: `「${title}」已從您的課程清單中移除`,
      });
    } catch (error) {
      toast({
        title: "刪除失敗",
        description: error instanceof Error ? error.message : "請稍後再試",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-display">
            課程管理
          </h1>
          <p className="text-muted-foreground mt-1">
            管理您的所有線上課程
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              新增課程
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>新增課程</DialogTitle>
              <DialogDescription>
                添加新的課程到您的學習清單
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">課程名稱 *</Label>
                <Input
                  id="title"
                  value={newCourse.title}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, title: e.target.value })
                  }
                  placeholder="例如：React 完整教程"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">學習平台</Label>
                  <Input
                    id="platform"
                    value={newCourse.platform || ""}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, platform: e.target.value })
                    }
                    placeholder="例如：Udemy"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructor">講師</Label>
                  <Input
                    id="instructor"
                    value={newCourse.instructor || ""}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, instructor: e.target.value })
                    }
                    placeholder="講師姓名"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="course_url">課程連結</Label>
                <Input
                  id="course_url"
                  value={newCourse.course_url || ""}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, course_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_chapters">總章節數</Label>
                <Input
                  id="total_chapters"
                  type="number"
                  min={0}
                  value={newCourse.total_chapters || ""}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      total_chapters: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">課程描述</Label>
                <Textarea
                  id="description"
                  value={newCourse.description || ""}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, description: e.target.value })
                  }
                  placeholder="課程簡介..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                取消
              </Button>
              <Button
                onClick={handleCreateCourse}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    新增中...
                  </>
                ) : (
                  "新增課程"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="card-elegant p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜尋課程..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="狀態" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部狀態</SelectItem>
                <SelectItem value="not-started">未開始</SelectItem>
                <SelectItem value="in-progress">進行中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="優先級" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部優先級</SelectItem>
                <SelectItem value="high">高優先級</SelectItem>
                <SelectItem value="medium">中優先級</SelectItem>
                <SelectItem value="low">低優先級</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Course List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredCourses?.length === 0 ? (
        <Card className="card-elegant p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
              ? "沒有找到符合條件的課程"
              : "還沒有課程"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
              ? "嘗試調整搜尋條件"
              : "點擊「新增課程」開始您的學習之旅"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses?.map((course) => (
            <Card key={course.id} className="card-elegant overflow-hidden group">
              <Link href={`/courses/${course.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-1">
                        {course.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {course.instructor || "未知講師"} · {course.platform || "未分類"}
                      </p>
                    </div>
                    <Badge
                      variant={course.status as "completed" | "in-progress" | "not-started"}
                      className="ml-2 shrink-0"
                    >
                      {getStatusLabel(course.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">進度</span>
                        <span className="font-medium">
                          {Number(course.progress_percentage)}%
                        </span>
                      </div>
                      <Progress value={Number(course.progress_percentage)} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {course.completed_chapters} / {course.total_chapters} 章節
                      </span>
                      <Badge variant={course.priority as "high" | "medium" | "low"}>
                        {getPriorityLabel(course.priority)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      更新於 {formatDate(course.updated_at)}
                    </p>
                  </div>
                </CardContent>
              </Link>
              <div className="px-6 pb-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      刪除課程
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>確認刪除課程？</AlertDialogTitle>
                      <AlertDialogDescription>
                        確定要刪除「{course.title}」嗎？此操作無法復原，所有相關的知識點、行動項目和復盤日誌也會一併刪除。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteCourse(course.id, course.title)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        確認刪除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
