import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getRelativeTime(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "今天";
  if (diffDays === 1) return "昨天";
  if (diffDays < 7) return `${diffDays} 天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 週前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 個月前`;
  return `${Math.floor(diffDays / 365)} 年前`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    high: "高優先級",
    medium: "中優先級",
    low: "低優先級",
  };
  return labels[priority] || priority;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    completed: "已完成",
    "in-progress": "進行中",
    "not-started": "未開始",
  };
  return labels[status] || status;
}

export function getEmotionalIndicator(indicator: number): { emoji: string; label: string } {
  if (indicator >= 4) return { emoji: "😊", label: "很滿意" };
  if (indicator >= 3) return { emoji: "🙂", label: "滿意" };
  if (indicator >= 2) return { emoji: "😐", label: "普通" };
  if (indicator >= 1) return { emoji: "😕", label: "不太滿意" };
  return { emoji: "😞", label: "不滿意" };
}
