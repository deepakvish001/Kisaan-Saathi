import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, Upload, Loader, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { translate, type Language } from '../lib/translations';

interface UploadedImage {
  id: string;
  url: string;
  fileName: string;
  uploading?: boolean;
  analyzing?: boolean;
  analyzed?: boolean;
  analysisError?: boolean;
  symptoms?: string[];
  condition?: string;
}

interface ImageUploadProps {
  conversationId: string;
  language: Language;
  cropType?: string;
  onImagesUploaded: (imageUrls: string[]) => void;
  onAnalysisComplete?: (symptoms: string[], imageId: string) => void;
}

export function ImageUpload({ conversationId, language, cropType, onImagesUploaded, onAnalysisComplete }: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const uploadToStorage = async (file: File, source: 'camera' | 'gallery'): Promise<{ url: string; id: string } | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${conversationId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('crop-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('crop-images')
        .getPublicUrl(fileName);

      const { data: imageRecord, error: insertError } = await supabase
        .from('crop_images')
        .insert({
          conversation_id: conversationId,
          file_path: fileName,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          upload_source: source,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      return { url: urlData.publicUrl, id: imageRecord.id };
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const analyzeImage = async (imageId: string, imageUrl: string, tempId: string) => {
    try {
      setImages(prev =>
        prev.map(img =>
          img.id === tempId ? { ...img, analyzing: true } : img
        )
      );

      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-crop-image`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId,
          imageUrl,
          cropType,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      const symptoms = result.analysis?.detectedSymptoms?.map((s: any) => s.symptom) || [];

      setImages(prev =>
        prev.map(img =>
          img.id === tempId
            ? {
                ...img,
                analyzing: false,
                analyzed: true,
                symptoms,
                condition: result.analysis?.overallCondition,
              }
            : img
        )
      );

      if (onAnalysisComplete && symptoms.length > 0) {
        onAnalysisComplete(symptoms, imageId);
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      setImages(prev =>
        prev.map(img =>
          img.id === tempId
            ? { ...img, analyzing: false, analyzed: false, analysisError: true }
            : img
        )
      );
    }
  };

  const handleFileSelect = async (files: FileList | null, source: 'camera' | 'gallery') => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages: UploadedImage[] = [];
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) continue;

      if (file.size > 5 * 1024 * 1024) {
        alert(language === 'hi' ? 'फाइल 5MB से छोटी होनी चाहिए' : 'File must be smaller than 5MB');
        continue;
      }

      const tempId = `temp-${Date.now()}-${i}`;
      const tempUrl = URL.createObjectURL(file);

      const newImage: UploadedImage = {
        id: tempId,
        url: tempUrl,
        fileName: file.name,
        uploading: true,
      };

      newImages.push(newImage);
      setImages(prev => [...prev, newImage]);

      const uploadResult = await uploadToStorage(file, source);

      if (uploadResult) {
        setImages(prev =>
          prev.map(img =>
            img.id === tempId
              ? { ...img, url: uploadResult.url, uploading: false }
              : img
          )
        );

        uploadedUrls.push(uploadResult.url);

        analyzeImage(uploadResult.id, uploadResult.url, tempId);
      } else {
        setImages(prev => prev.filter(img => img.id !== tempId));
      }
    }

    setUploading(false);

    if (uploadedUrls.length > 0) {
      onImagesUploaded(uploadedUrls);
    }
  };

  const removeImage = async (imageId: string, imageUrl: string) => {
    try {
      const fileName = imageUrl.split('/').pop();
      if (fileName && imageUrl.includes('crop-images')) {
        const filePath = `${conversationId}/${fileName}`;

        await supabase.storage.from('crop-images').remove([filePath]);

        await supabase
          .from('crop_images')
          .delete()
          .eq('file_path', filePath);
      }

      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="w-5 h-5" />
          {language === 'hi' ? 'कैमरा' : 'Camera'}
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ImageIcon className="w-5 h-5" />
          {language === 'hi' ? 'गैलरी' : 'Gallery'}
        </button>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={(e) => handleFileSelect(e.target.files, 'camera')}
        className="hidden"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files, 'gallery')}
        className="hidden"
      />

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                <img
                  src={image.url}
                  alt={image.fileName}
                  className="w-full h-full object-cover"
                />
                {image.uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center flex-col gap-2">
                    <Loader className="w-8 h-8 text-white animate-spin" />
                    <span className="text-white text-xs font-bold">
                      {language === 'hi' ? 'अपलोड हो रहा है...' : 'Uploading...'}
                    </span>
                  </div>
                )}
                {image.analyzing && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 bg-opacity-90 flex items-center justify-center flex-col gap-2">
                    <Sparkles className="w-8 h-8 text-white animate-pulse" />
                    <span className="text-white text-xs font-bold">
                      {language === 'hi' ? 'विश्लेषण हो रहा है...' : 'Analyzing...'}
                    </span>
                  </div>
                )}
                {image.analyzed && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                    <div className="flex items-center gap-1 text-white">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-xs font-bold">
                        {language === 'hi' ? 'विश्लेषण पूर्ण' : 'Analyzed'}
                      </span>
                    </div>
                    {image.symptoms && image.symptoms.length > 0 && (
                      <p className="text-xs text-white mt-1 line-clamp-2">
                        {image.symptoms.join(', ')}
                      </p>
                    )}
                  </div>
                )}
                {image.analysisError && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-900 to-transparent p-2">
                    <div className="flex items-center gap-1 text-white">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-bold">
                        {language === 'hi' ? 'विश्लेषण विफल' : 'Analysis failed'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {!image.uploading && !image.analyzing && (
                <button
                  onClick={() => removeImage(image.id, image.url)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="flex items-center justify-center gap-2 text-gray-600 py-2">
          <Loader className="w-5 h-5 animate-spin" />
          <span className="font-semibold">
            {language === 'hi' ? 'अपलोड हो रहा है...' : 'Uploading...'}
          </span>
        </div>
      )}
    </div>
  );
}
