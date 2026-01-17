import React, { useCallback, useState } from 'react';
import { Upload, X, Image } from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string | string[];
  onChange: (url: string | string[]) => void;
  multiple?: boolean;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  multiple = false,
  className,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );

      if (files.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        if (multiple) {
          const urls = await Promise.all(files.map((file) => uploadToCloudinary(file)));
          const currentUrls = Array.isArray(value) ? value : [];
          onChange([...currentUrls, ...urls]);
        } else {
          const url = await uploadToCloudinary(files[0]);
          onChange(url);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setLoading(false);
      }
    },
    [multiple, onChange, value]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).filter((file) =>
        file.type.startsWith('image/')
      );

      if (files.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        if (multiple) {
          const urls = await Promise.all(files.map((file) => uploadToCloudinary(file)));
          const currentUrls = Array.isArray(value) ? value : [];
          onChange([...currentUrls, ...urls]);
        } else {
          const url = await uploadToCloudinary(files[0]);
          onChange(url);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setLoading(false);
      }
    },
    [multiple, onChange, value]
  );

  const removeImage = (index?: number) => {
    if (multiple && Array.isArray(value) && index !== undefined) {
      const newUrls = value.filter((_, i) => i !== index);
      onChange(newUrls);
    } else {
      onChange(multiple ? [] : '');
    }
  };

  const renderPreview = () => {
    if (multiple && Array.isArray(value) && value.length > 0) {
      return (
        <div className="flex flex-wrap gap-2 mt-3">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg border border-border"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      );
    }

    if (!multiple && typeof value === 'string' && value) {
      return (
        <div className="relative inline-block mt-3 group">
          <img
            src={value}
            alt="Upload preview"
            className="w-32 h-32 object-cover rounded-lg border border-border"
          />
          <button
            onClick={() => removeImage()}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          'border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer transition-colors hover:border-primary hover:bg-primary/5',
          loading && 'opacity-50 pointer-events-none'
        )}
      >
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-2">
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            ) : (
              <>
                <div className="p-3 rounded-full bg-primary/10">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Drag & drop or click to upload
                </p>
              </>
            )}
          </div>
        </label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {renderPreview()}
    </div>
  );
};
