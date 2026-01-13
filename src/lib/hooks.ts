import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CourseCreate, type CourseUpdate, type ActionItemCreate, type ActionItemUpdate, type KnowledgePointCreate, type KnowledgePointUpdate, type ReviewLogCreate, type ReviewLogUpdate, type TagCreate } from "./api";

// Course hooks
export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: () => api.courses.list(),
  });
}

export function useCourse(id: number) {
  return useQuery({
    queryKey: ["courses", id],
    queryFn: () => api.courses.get(id),
    enabled: !!id,
  });
}

export function useCourseStats() {
  return useQuery({
    queryKey: ["courses", "stats"],
    queryFn: () => api.courses.stats(),
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CourseCreate) => api.courses.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CourseUpdate }) =>
      api.courses.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses", id] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.courses.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

// Knowledge Point hooks
export function useKnowledgePoints(courseId: number) {
  return useQuery({
    queryKey: ["knowledgePoints", courseId],
    queryFn: () => api.knowledgePoints.listByCourse(courseId),
    enabled: !!courseId,
  });
}

export function useCreateKnowledgePoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: KnowledgePointCreate) => api.knowledgePoints.create(data),
    onSuccess: (_, { course_id }) => {
      queryClient.invalidateQueries({ queryKey: ["knowledgePoints", course_id] });
    },
  });
}

export function useUpdateKnowledgePoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, courseId }: { id: number; data: KnowledgePointUpdate; courseId: number }) =>
      api.knowledgePoints.update(id, data),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ["knowledgePoints", courseId] });
    },
  });
}

export function useDeleteKnowledgePoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, courseId }: { id: number; courseId: number }) =>
      api.knowledgePoints.delete(id),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ["knowledgePoints", courseId] });
    },
  });
}

// Action Item hooks
export function useActionItems() {
  return useQuery({
    queryKey: ["actionItems"],
    queryFn: () => api.actionItems.listByUser(),
  });
}

export function useActionItemsByCourse(courseId: number) {
  return useQuery({
    queryKey: ["actionItems", "course", courseId],
    queryFn: () => api.actionItems.listByCourse(courseId),
    enabled: !!courseId,
  });
}

export function useActionItemStats() {
  return useQuery({
    queryKey: ["actionItems", "stats"],
    queryFn: () => api.actionItems.stats(),
  });
}

export function useCreateActionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ActionItemCreate) => api.actionItems.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actionItems"] });
    },
  });
}

export function useUpdateActionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActionItemUpdate }) =>
      api.actionItems.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actionItems"] });
    },
  });
}

export function useDeleteActionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.actionItems.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actionItems"] });
    },
  });
}

// Review Log hooks
export function useReviewLogs() {
  return useQuery({
    queryKey: ["reviewLogs"],
    queryFn: () => api.reviewLogs.listByUser(),
  });
}

export function useReviewLogsByCourse(courseId: number) {
  return useQuery({
    queryKey: ["reviewLogs", "course", courseId],
    queryFn: () => api.reviewLogs.listByCourse(courseId),
    enabled: !!courseId,
  });
}

export function useCreateReviewLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReviewLogCreate) => api.reviewLogs.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewLogs"] });
    },
  });
}

export function useUpdateReviewLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReviewLogUpdate }) =>
      api.reviewLogs.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewLogs"] });
    },
  });
}

export function useDeleteReviewLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.reviewLogs.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewLogs"] });
    },
  });
}

// Tag hooks
export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: () => api.tags.list(),
  });
}

export function useCourseTags(courseId: number) {
  return useQuery({
    queryKey: ["tags", "course", courseId],
    queryFn: () => api.tags.listByCourse(courseId),
    enabled: !!courseId,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TagCreate) => api.tags.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.tags.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useAddTagToCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { courseId: number; tagId: number }) => api.tags.addToCourse(data),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ["tags", "course", courseId] });
    },
  });
}

export function useRemoveTagFromCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, tagId }: { courseId: number; tagId: number }) =>
      api.tags.removeFromCourse(courseId, tagId),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ["tags", "course", courseId] });
    },
  });
}
