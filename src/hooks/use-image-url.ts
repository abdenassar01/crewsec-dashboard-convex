import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

export function useImageUrl() {
  const getUploadUrl = useMutation(api.parkings.getUploadUrl);

  const getUploadUrlForFile = async () => {
    return await getUploadUrl();
  };

  const getUrl = (storageId: string | undefined) => {
    if (!storageId) return null;
    return `/api/storage/${storageId}`;
  };

  return { getUploadUrl: getUploadUrlForFile, getUrl };
}