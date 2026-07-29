import { useState, useEffect, useCallback } from "react";
import type { ImageResponseDTO } from "../../../src/DTO/imageDTO";

export function useImages(refType: string, refId: number | string) {
  const [images, setImages] = useState<ImageResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/images?referenceType=${refType}&referenceId=${refId}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Failed to fetch images");
      const data = await res.json();
      setImages(data ?? []);
    } catch {
      setError("Failed to load images");
    } finally {
      setIsLoading(false);
    }
  }, [refType, refId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const uploadImages = async (files: File[]) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("referenceType", refType);
      formData.append("referenceId", String(refId));

      const res = await fetch("/api/images", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 413) throw new Error("Image must be under 5 MB");
        throw new Error("Upload failed. Please try again.");
      }
    }

    await fetchImages();
  };

  const deleteImage = async (imageId: number) => {
    const res = await fetch(`/api/images/${imageId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok)
      throw new Error("Failed to remove image. Please try again.");
    setImages((prev) => prev.filter((i) => i.id !== imageId));
  };

  const reorderImages = async (
    refType: string,
    refId: number | string,
    items: { id: number; display_order: number }[],
  ) => {
    const res = await fetch("/api/images/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        referenceType: refType,
        referenceId: Number(refId),
        items,
      }),
    });
    if (!res.ok) throw new Error("Failed to reorder images");
  };

  return {
    images,
    setImages,
    isLoading,
    error,
    fetchImages,
    uploadImages,
    deleteImage,
    reorderImages,
  };
}
