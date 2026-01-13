import { useState } from "react";
import { useLocation } from "wouter";
import {
  useCourse,
  useUpdateCourse,
  useDeleteCourse,
  useKnowledgePoints,
  useCreateKnowledgePoint,
  useDeleteKnowledgePoint,
  useActionItemsByCourse,
  useCreateActionItem,
  useReviewLogsByCourse,
} from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ArrowLeft,
  BookOpen,
  Lightbulb,
  CheckSquare,
  FileText,
  Plus,
  Edit,
  Trash2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatDate, getStatusLabel, getPriorityLabel, getEmotionalIndicator } from "@/lib/utils";
import { Link } from "wouter";

interface CourseDetailPageProps {
  id: number;
}

export default function CourseDetailPage({ id }: CourseDetailPageProps) {
  const [, setLocation] = useLocation();
  const { data: course, isLoading } = useCourse(id);
  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();
  const { data: knowledgePoints } = useKnowledgePoints(id);
  const { data: actionItems } = useActionItemsByCourse(id);
  const { data: reviewLogs } = useReviewLogsByCourse(id);
  const createKnowledgePointMutation = useCreateKnowledgePoint();
  const deleteKnowledgePointMutation = useDeleteKnowledgePoint();
  const createActionItemMutation = useCreateActionItem();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: "",
    priority: "",
    completed_chapters: 0,
    total_chapters: 0,
  });

  const [newKnowledgePoint, setNewKnowledgePoint] = useState({
    title: "",
    content: "",
    summary: "",
    personal_notes: "",
  });
  const [isKnowledgePointDialogOpen, setIsKnowledgePointDialogOpen] = useState(false);

  const [newActionItem, setNewActionItem] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    due_date: "",
  });
  const [isActionItemDialogOpen, setIsActionItemDialogOpen] = useState(false);

  const handleStartEdit = () => {
    if (course) {
      setEditData({
        status: course.status,
        priority: course.priority,
        completed_chapters: course.completed_chapters,
        total_chapters: course.total_chapters,
      });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!course) return;

    const progressPercentage =
      editData.total_chapters > 0
        ? Math.round((editData.completed_chapters / editData.total_chapters) * 100)
        : 0;

    try {
      await updateMutation.mutateAsync({
        id: course.id,
        data: {
          status: editData.status as "not-started" | "in-progress" | "completed",
          priority: editData.priority as "low" | "medium" | "high",
          completed_chapters: editData.completed_chapters,
          total_chapters: editData.total_chapters,
          progress_percentage: progressPercentage,
        },
      });
      toast({
        title: "已更新",
        description: "課程進度已儲存",
        variant: "success",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "更新失敗",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = async () => {
    if (!course) return;
    try {
      await deleteMutation.mutateAsync(course.id);
      toast({
        title: "課程已刪除",
      });
      setLocation("/courses");
    } catch (error) {
      toast({
        title: "刪除失敗",
        variant: "destructive",
      });
    }
  };

  const handleCreateKnowledgePoint = async () => {
    if (!newKnowledgePoint.title.trim()) {
      toast({ title: "請輸入標題", variant: "destructive" });
      return;
    }

    try {
      await createKnowledgePointMutation.mutateAsync({
        course_id: id,
        ...newKnowledgePoint,
      });
      toast({ title: "知識點已新增", variant: "success" });
      setIsKnowledgePointDialogOpen(false);
      setNewKnowledgePoint({ title: "", content: "", summary: "", personal_notes: "" });
    } catch (error) {
      toast({ title: "新增失敗", variant: "destructive" });
    }
  };

  const handleCreateActionItem = async () => {
    if (!newActionItem.title.trim()) {
      toast({ title: "請輸入標題", variant: "destructive" });
      return;
    }

    try {
      await createActionItemMutation.mutateAsync({
        course_id: id,
        title: newActionItem.title,
        description: newActionItem.description,
        priority: newActionItem.priority,
        due_date: newActionItem.due_date || undefined,
      });
      toast({ title: "行動項目已新增", variant: "success" });
      setIsActionItemDialogOpen(false);
      setNewActionItem({ title: "", description: "", priority: "medium", due_date: "" });
    } catch (error) {
      toast({ title: "新增失敗", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <Card className="card-elegant p-12 text-center">
        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">找不到課程</h3>
        <Link href="/courses">
          <Button>返回課程列表</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/courses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold tracking-display">
            {course.title}
          </h1>
          <p className="text-muted-foreground">
            {course.instructor || "未知講師"} · {course.platform || "未分類"}
          </p>
        </div>
        <div className="flex gap-2">
          {course.course_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={course.course_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                開啟課程
              </a>
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                刪除
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>確認刪除課程？</AlertDialogTitle>
                <AlertDialogDescription>
                  此操作無法復原，所有相關資料都會被刪除。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteCourse}>
                  確認刪除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Progress Card */}
      <Card className="card-elegant">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>課程進度</CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={handleStartEdit}>
              <Edit className="w-4 h-4 mr-2" />
              編輯
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                取消
              </Button>
              <Button size="sm" onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "儲存"}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>狀態</Label>
                <Select
                  value={editData.status}
                  onValueChange={(value) => setEditData({ ...editData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">未開始</SelectItem>
                    <SelectItem value="in-progress">進行中</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>優先級</Label>
                <Select
                  value={editData.priority}
                  onValueChange={(value) => setEditData({ ...editData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>已完成章節</Label>
                <Input
                  type="number"
                  min={0}
                  value={editData.completed_chapters}
                  onChange={(e) =>
                    setEditData({ ...editData, completed_chapters: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>總章節數</Label>
                <Input
                  type="number"
                  min={0}
                  value={editData.total_chapters}
                  onChange={(e) =>
                    setEditData({ ...editData, total_chapters: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge variant={course.status as "completed" | "in-progress" | "not-started"}>
                  {getStatusLabel(course.status)}
                </Badge>
                <Badge variant={course.priority as "high" | "medium" | "low"}>
                  {getPriorityLabel(course.priority)}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>進度</span>
                  <span className="font-medium">{Number(course.progress_percentage)}%</span>
                </div>
                <Progress value={Number(course.progress_percentage)} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  {course.completed_chapters} / {course.total_chapters} 章節已完成
                </p>
              </div>
              {course.description && (
                <div>
                  <h4 className="text-sm font-medium mb-1">課程描述</h4>
                  <p className="text-sm text-muted-foreground">{course.description}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Knowledge Points, Action Items, Review Logs */}
      <Tabs defaultValue="knowledge" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="knowledge" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            知識點 ({knowledgePoints?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="actions" className="gap-2">
            <CheckSquare className="w-4 h-4" />
            行動項目 ({actionItems?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2">
            <FileText className="w-4 h-4" />
            復盤日誌 ({reviewLogs?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge">
          <Card className="card-elegant">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>知識點</CardTitle>
              <Dialog open={isKnowledgePointDialogOpen} onOpenChange={setIsKnowledgePointDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    新增
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新增知識點</DialogTitle>
                    <DialogDescription>記錄課程中的重要知識點</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>標題 *</Label>
                      <Input
                        value={newKnowledgePoint.title}
                        onChange={(e) => setNewKnowledgePoint({ ...newKnowledgePoint, title: e.target.value })}
                        placeholder="知識點標題"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>內容 (支援 Markdown)</Label>
                      <Textarea
                        value={newKnowledgePoint.content}
                        onChange={(e) => setNewKnowledgePoint({ ...newKnowledgePoint, content: e.target.value })}
                        placeholder="詳細內容..."
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>摘要</Label>
                      <Textarea
                        value={newKnowledgePoint.summary}
                        onChange={(e) => setNewKnowledgePoint({ ...newKnowledgePoint, summary: e.target.value })}
                        placeholder="簡短摘要..."
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>個人筆記</Label>
                      <Textarea
                        value={newKnowledgePoint.personal_notes}
                        onChange={(e) => setNewKnowledgePoint({ ...newKnowledgePoint, personal_notes: e.target.value })}
                        placeholder="你的想法和筆記..."
                        rows={2}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsKnowledgePointDialogOpen(false)}>取消</Button>
                    <Button onClick={handleCreateKnowledgePoint} disabled={createKnowledgePointMutation.isPending}>
                      {createKnowledgePointMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "新增"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {knowledgePoints?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">還沒有知識點，點擊「新增」開始記錄</p>
              ) : (
                <div className="space-y-4">
                  {knowledgePoints?.map((point) => (
                    <Card key={point.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{point.title}</h4>
                          {point.summary && <p className="text-sm text-muted-foreground mt-1">{point.summary}</p>}
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>確認刪除？</AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteKnowledgePointMutation.mutate({ id: point.id, courseId: id })}
                              >
                                刪除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card className="card-elegant">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>行動項目</CardTitle>
              <Dialog open={isActionItemDialogOpen} onOpenChange={setIsActionItemDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    新增
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新增行動項目</DialogTitle>
                    <DialogDescription>建立可執行的行動項目</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>標題 *</Label>
                      <Input
                        value={newActionItem.title}
                        onChange={(e) => setNewActionItem({ ...newActionItem, title: e.target.value })}
                        placeholder="行動項目標題"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>描述</Label>
                      <Textarea
                        value={newActionItem.description}
                        onChange={(e) => setNewActionItem({ ...newActionItem, description: e.target.value })}
                        placeholder="詳細描述..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>優先級</Label>
                        <Select
                          value={newActionItem.priority}
                          onValueChange={(value) => setNewActionItem({ ...newActionItem, priority: value as "low" | "medium" | "high" })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">低</SelectItem>
                            <SelectItem value="medium">中</SelectItem>
                            <SelectItem value="high">高</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>截止日期</Label>
                        <Input
                          type="date"
                          value={newActionItem.due_date}
                          onChange={(e) => setNewActionItem({ ...newActionItem, due_date: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsActionItemDialogOpen(false)}>取消</Button>
                    <Button onClick={handleCreateActionItem} disabled={createActionItemMutation.isPending}>
                      {createActionItemMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "新增"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {actionItems?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">還沒有行動項目</p>
              ) : (
                <div className="space-y-3">
                  {actionItems?.map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <h4 className={`font-medium ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                            {item.title}
                          </h4>
                          {item.due_date && (
                            <p className="text-sm text-muted-foreground">截止: {formatDate(item.due_date)}</p>
                          )}
                        </div>
                        <Badge variant={item.priority as "high" | "medium" | "low"}>
                          {getPriorityLabel(item.priority)}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card className="card-elegant">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>復盤日誌</CardTitle>
              <Link href="/reviews">
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  新增
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {reviewLogs?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">還沒有復盤日誌</p>
              ) : (
                <div className="space-y-3">
                  {reviewLogs?.map((log) => {
                    const emotion = getEmotionalIndicator(log.emotional_indicator);
                    return (
                      <Card key={log.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{log.title}</h4>
                            <p className="text-sm text-muted-foreground">{formatDate(log.review_date)}</p>
                          </div>
                          <span className="text-2xl" title={emotion.label}>{emotion.emoji}</span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
