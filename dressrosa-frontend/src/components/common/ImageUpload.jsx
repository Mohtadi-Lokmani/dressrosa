import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';

const ImageUpload = ({ images, onChange, maxImages = 5 }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (images.length + files.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images`);
      return;
    }

    setUploading(true);
    const newImages = [...images];

    try {
      for (const file of files) {
        // Basic validation
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        const data = await productService.uploadImage(file);
        newImages.push(data.url);
      }
      onChange(newImages);
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload some images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Image Previews */}
        {images.map((url, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200">
            <img
              src={url.startsWith('http') ? url : `http://localhost:8585${url}`}
              alt={`Product ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-red-500 hover:text-white rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
            {index === 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] py-1 text-center font-medium">
                Main Image
              </div>
            )}
          </div>
        ))}

        {/* Upload Button */}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-burgundy hover:bg-burgundy/5 transition-all text-gray-500 hover:text-burgundy"
          >
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <span className="text-xs font-medium">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-xs font-medium">Upload Image</span>
                <span className="text-[10px] mt-1 text-gray-400">
                  {images.length}/{maxImages}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept="image/*"
        className="hidden"
      />

      <div className="flex items-center space-x-2 text-xs text-gray-500 italic">
        <ImageIcon className="w-4 h-4" />
        <span>First image will be used as the main cover image. JPG, PNG supported.</span>
      </div>
    </div>
  );
};

export default ImageUpload;
