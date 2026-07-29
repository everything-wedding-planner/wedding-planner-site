import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, GripVertical } from "lucide-react";
import Card from "./Card";
import ImageUploadZone from "./ImageUploadZone";
import type { ImageResponseDTO } from "../../../src/DTO/imageDTO";

interface ImageGalleryProps {
  images: ImageResponseDTO[];
  setImages: (images: ImageResponseDTO[]) => void;
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  onUpload: (files: File[]) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onReorder: (
    refType: string,
    refId: number | string,
    items: { id: number; display_order: number }[],
  ) => Promise<void>;
}

export default function ImageGallery({
  images,
  setImages,
  isLoading,
  isUploading,
  error,
  onUpload,
  onDelete,
  onReorder,
}: ImageGalleryProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleError = (msg: string) => {
    setUploadError(msg);
    setTimeout(() => setUploadError(null), 3000);
  };

  const handleDelete = async (id: number) => {
    setDeleteConfirmId(null);
    setDeleteError(null);
    try {
      await onDelete(id);
    } catch {
      setDeleteError("Failed to remove image. Please try again.");
      setTimeout(() => setDeleteError(null), 3000);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((i) => i.id === active.id);
    const newIndex = images.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(images, oldIndex, newIndex).map((img, idx) => ({
      ...img,
      position: idx,
    }));

    setImages(reordered);

    try {
      const refType = reordered[0].reference_type;
      const refId = reordered[0].reference_id;
      await onReorder(
        refType,
        refId,
        reordered.map((img) => ({
          id: img.id,
          display_order: img.position,
        })),
      );
    } catch {
      setImages(images);
    }
  };

  if (isLoading) {
    return (
      <Card title="Images">
        <div className="flex justify-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-rose-600 border-t-transparent rounded-full" />
        </div>
      </Card>
    );
  }

  const displayError = error ?? uploadError ?? deleteError;

  return (
    <Card title="Images">
      {displayError && (
        <p className="text-red-600 text-sm mb-3">{displayError}</p>
      )}

      {images.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-6">
          <p className="text-sm text-stone-500">
            Add images to showcase this venue/vendor
          </p>
          <div className="w-48">
            <ImageUploadZone
              onUpload={onUpload}
              isUploading={isUploading}
              onError={handleError}
            />
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((img) => img.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((image) => (
                <SortableImageCard
                  key={image.id}
                  image={image}
                  isDeleting={deleteConfirmId === image.id}
                  onDeleteClick={() => setDeleteConfirmId(image.id)}
                  onDeleteConfirm={() => handleDelete(image.id)}
                  onDeleteCancel={() => setDeleteConfirmId(null)}
                />
              ))}
              <ImageUploadZone
                onUpload={onUpload}
                isUploading={isUploading}
                onError={handleError}
              />
            </div>
          </SortableContext>
        </DndContext>
      )}
    </Card>
  );
}

/* ---------- Sortable Image Card ---------- */

function SortableImageCard({
  image,
  isDeleting,
  onDeleteClick,
  onDeleteConfirm,
  onDeleteCancel,
}: {
  image: ImageResponseDTO;
  isDeleting: boolean;
  onDeleteClick: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative aspect-square rounded-lg overflow-hidden bg-stone-100
        shadow-sm border border-stone-200 group
        ${isDragging ? "opacity-40 z-50" : ""}
      `}
    >
      <img src={image.url} alt="" className="w-full h-full object-cover" />

      <button
        aria-label="Remove image"
        onClick={onDeleteClick}
        className="
          absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white
          opacity-0 group-hover:opacity-100 transition-opacity
          hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-blue-500
        "
      >
        <X size={14} />
      </button>

      <button
        aria-label="Reorder image"
        {...attributes}
        {...listeners}
        className="
          absolute bottom-2 left-1/2 -translate-x-1/2 p-1 rounded
          bg-black/40 text-white cursor-grab active:cursor-grabbing
          opacity-0 group-hover:opacity-100 transition-opacity
          focus-visible:ring-2 focus-visible:ring-blue-500
        "
      >
        <GripVertical size={14} />
      </button>

      {isDeleting && (
        <div
          className="absolute inset-0 bg-black/60 flex items-center justify-center p-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-lg p-3 shadow-lg text-center">
            <p className="text-sm text-stone-900 mb-3">Remove this image?</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={onDeleteConfirm}
                className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Remove
              </button>
              <button
                onClick={onDeleteCancel}
                className="px-3 py-1.5 text-xs font-medium text-stone-600 border border-stone-200 rounded-md hover:bg-stone-50 focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
