import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { Plus } from "lucide-react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

interface ImageUploadZoneProps {
  onUpload: (files: File[]) => Promise<void>;
  isUploading: boolean;
  onError: (message: string) => void;
}

export default function ImageUploadZone({
  onUpload,
  isUploading,
  onError,
}: ImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFiles = (files: File[]): File[] => {
    const valid: File[] = [];
    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        onError("Only JPG, PNG, and WebP images are supported");
        continue;
      }
      if (file.size > MAX_SIZE) {
        onError("Image must be under 5 MB");
        continue;
      }
      valid.push(file);
    }
    return valid;
  };

  const handleFiles = (files: FileList) => {
    const valid = validateFiles(Array.from(files));
    if (valid.length > 0) {
      onUpload(valid);
    }
  };

  const handleClick = () => inputRef.current?.click();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload images"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        aspect-square rounded-lg border-2 border-dashed
        flex flex-col items-center justify-center gap-2 cursor-pointer
        transition-colors duration-150
        focus-visible:ring-2 focus-visible:ring-blue-500
        ${isDragOver
          ? "border-blue-400 bg-blue-50"
          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />
      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full" />
          <span className="text-xs text-gray-400">Uploading...</span>
        </div>
      ) : (
        <>
          <Plus className="text-gray-400" size={24} />
          <span className="text-xs text-gray-400">Upload</span>
        </>
      )}
    </div>
  );
}
