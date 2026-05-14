import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api, apiErrorMessage } from "@/lib/axios";
import type { FeedResponse, Post, PostComment } from "@/types/post";
import { useAuthUser } from "./useAuthUser";

export const FEED_KEY = ["feed"] as const;

/**
 * Reads as `Post[]` for consumers — the API's `{ posts: [...] }`
 * envelope is unwrapped here so components don't have to care.
 */
export const useFeed = () =>
  useQuery<Post[]>({
    queryKey: FEED_KEY,
    queryFn: async () => {
      const { data } = await api.get<FeedResponse>("/feed");
      return data.posts ?? [];
    },
  });

/**
 * Convert a File to a base64 data URI. The backend's createPost
 * accepts the image as a base64 string in the JSON body (passed
 * straight to cloudinary.uploader.upload, which handles data URIs).
 * We do the conversion client-side rather than switching to
 * multipart to match the existing API contract.
 */
const fileToDataUri = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Unexpected reader.result type"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("File read failed"));
    reader.readAsDataURL(file);
  });

interface CreatePostInput {
  content: string;
  imageFile?: File | null;
}

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ content, imageFile }: CreatePostInput) => {
      const image = imageFile ? await fileToDataUri(imageFile) : undefined;
      await api.post("/feed/create", { content, image });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEED_KEY });
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error));
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      await api.delete(`/feed/delete/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEED_KEY });
      toast.success("Post deleted");
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error));
    },
  });
};

/**
 * Optimistic like toggle. The backend likePost endpoint flips state
 * server-side, so we mirror that locally and reconcile on success.
 */
export const useLikePost = () => {
  const queryClient = useQueryClient();
  const { data: user } = useAuthUser();

  return useMutation({
    mutationFn: async (postId: string) => {
      await api.post(`/feed/${postId}/like`);
    },
    onMutate: async (postId) => {
      if (!user) return;
      await queryClient.cancelQueries({ queryKey: FEED_KEY });
      const previous = queryClient.getQueryData<Post[]>(FEED_KEY);
      queryClient.setQueryData<Post[]>(FEED_KEY, (old) =>
        old?.map((p) => {
          if (p._id !== postId) return p;
          const liked = p.likes.includes(user._id);
          return {
            ...p,
            likes: liked
              ? p.likes.filter((id) => id !== user._id)
              : [...p.likes, user._id],
          };
        })
      );
      return { previous };
    },
    onError: (error, _postId, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(FEED_KEY, ctx.previous);
      toast.error(apiErrorMessage(error));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FEED_KEY });
    },
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      content,
    }: {
      postId: string;
      content: string;
    }) => {
      const { data } = await api.post<{ post: Post }>(
        `/feed/${postId}/comment`,
        { content }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEED_KEY });
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error));
    },
  });
};

export type { PostComment };
