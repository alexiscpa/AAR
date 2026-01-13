import { useState } from "react";
import { Link } from "wouter";
import { useActionItems, useUpdateActionItem, useDeleteActionItem } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { CheckSquare, Loader2, Trash2, Filter, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatDate, getPriorityLabel } from "@/lib/utils";

export default function ActionItemsPage() {
  const { data: actionItemsData, isLoading } = useActionItems();
  const updateMutation = useUpdateActionItem();
  const deleteMutation = useDeleteActionItem();
  const { toast } = useToast();

  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredItems = actionItemsData?.filter((item) => {
    const matchesPriority =
      priorityFilter === "all" || item.action_item.priority === priorityFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && item.action_item.completed) ||
      (statusFilter === "pending" && !item.action_item.completed);
    return matchesPriority && matchesStatus;
  });

  const handleToggleComplete = async (id: number, completed: boolean) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: { completed: !completed },
      });
      toast({
        title: completed ? "已標記為未完成" : "已標記為完成",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "更新失敗",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "行動項目已刪除",
      });
    } catch (error) {
      toast({
        title: "刪除失敗",
        variant: "destructive",
      });
    }
  };

  const groupedByPriority = {
    high: filteredItems?.filter((i) => i.action_item.priority === "high") || [],
    medium: filteredItems?.filter((i) => i.action_item.priority === "medium") || [],
    low: filteredItems?.filter((i) => i.action_item.priority === "low") || [],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold tracking-display">
          行動項目
        </h1>
        <p className="text-muted-foreground mt-1">
          管理您所有課程的行動項目
        </p>
      </div>

      {/* Filters */}
      <Card className="card-elegant p-4">
        <div className="flex flex-wrap gap-4">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="優先級" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部優先級</SelectItem>
              <SelectItem value="high">高優先級</SelectItem>
              <SelectItem value="medium">中優先級</SelectItem>
              <SelectItem value="low">低優先級</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="狀態" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部狀態</SelectItem>
              <SelectItem value="pending">待辦</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Action Items List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredItems?.length === 0 ? (
        <Card className="card-elegant p-12 text-center">
          <CheckSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">沒有行動項目</h3>
          <p className="text-muted-foreground mb-4">
            從課程詳情頁面新增行動項目
          </p>
          <Link href="/courses">
            <Button>前往課程</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* High Priority */}
          {groupedByPriority.high.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-priority-high" />
                高優先級 ({groupedByPriority.high.length})
              </h2>
              <div className="space-y-3">
                {groupedByPriority.high.map(({ action_item, course }) => (
                  <ActionItemCard
                    key={action_item.id}
                    item={action_item}
                    courseName={course?.title}
                    courseId={course?.id}
                    onToggle={handleToggleComplete}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Medium Priority */}
          {groupedByPriority.medium.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-priority-medium" />
                中優先級 ({groupedByPriority.medium.length})
              </h2>
              <div className="space-y-3">
                {groupedByPriority.medium.map(({ action_item, course }) => (
                  <ActionItemCard
                    key={action_item.id}
                    item={action_item}
                    courseName={course?.title}
                    courseId={course?.id}
                    onToggle={handleToggleComplete}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Low Priority */}
          {groupedByPriority.low.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-priority-low" />
                低優先級 ({groupedByPriority.low.length})
              </h2>
              <div className="space-y-3">
                {groupedByPriority.low.map(({ action_item, course }) => (
                  <ActionItemCard
                    key={action_item.id}
                    item={action_item}
                    courseName={course?.title}
                    courseId={course?.id}
                    onToggle={handleToggleComplete}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ActionItemCardProps {
  item: {
    id: number;
    title: string;
    description: string | null;
    priority: string;
    completed: boolean;
    due_date: string | null;
  };
  courseName?: string;
  courseId?: number;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}

function ActionItemCard({ item, courseName, courseId, onToggle, onDelete }: ActionItemCardProps) {
  const isOverdue = item.due_date && new Date(item.due_date) < new Date() && !item.completed;

  return (
    <Card className={`card-elegant p-4 ${item.completed ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-4">
        <Checkbox
          checked={item.completed}
          onCheckedChange={() => onToggle(item.id, item.completed)}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4
                className={`font-medium ${item.completed ? "line-through text-muted-foreground" : ""}`}
              >
                {item.title}
              </h4>
              {courseName && courseId && (
                <Link href={`/courses/${courseId}`}>
                  <span className="text-sm text-primary hover:underline">
                    {courseName}
                  </span>
                </Link>
              )}
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={item.priority as "high" | "medium" | "low"}>
                {getPriorityLabel(item.priority)}
              </Badge>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive h-8 w-8">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>確認刪除？</AlertDialogTitle>
                    <AlertDialogDescription>
                      確定要刪除這個行動項目嗎？
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(item.id)}>
                      刪除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          {item.due_date && (
            <div className={`flex items-center gap-1 text-sm mt-2 ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
              <Clock className="w-3 h-3" />
              <span>
                {isOverdue ? "已過期: " : "截止: "}
                {formatDate(item.due_date)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
