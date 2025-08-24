'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, ZoomIn, ZoomOut, Crop, Check, X } from 'lucide-react';

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedImage: File) => void;
  originalFile: File | null;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function ImageEditor({ isOpen, onClose, onSave, originalFile }: ImageEditorProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [isCropping, setIsCropping] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (originalFile && isOpen) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
      };
      reader.readAsDataURL(originalFile);
    }
  }, [originalFile, isOpen]);

  useEffect(() => {
    if (imageSrc && imageRef.current) {
      const img = imageRef.current;
      img.onload = () => {
        if (containerRef.current && canvasRef.current) {
          const container = containerRef.current;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Set canvas size to container size
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            
            // Calculate initial crop area (centered, 80% of image size)
            const containerAspect = container.clientWidth / container.clientHeight;
            const imageAspect = img.width / img.height;
            
            let cropWidth, cropHeight;
            if (containerAspect > imageAspect) {
              cropHeight = container.clientHeight * 0.8;
              cropWidth = cropHeight * imageAspect;
            } else {
              cropWidth = container.clientWidth * 0.8;
              cropHeight = cropWidth / imageAspect;
            }
            
            setCropArea({
              x: (container.clientWidth - cropWidth) / 2,
              y: (container.clientHeight - cropHeight) / 2,
              width: cropWidth,
              height: cropHeight
            });
            
            drawImage();
          }
        }
      };
    }
  }, [imageSrc]);

  const drawImage = () => {
    if (!canvasRef.current || !imageRef.current || !imageSrc) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate image position and size
    const containerWidth = canvas.width;
    const containerHeight = canvas.height;
    const imageAspect = img.width / img.height;
    const containerAspect = containerWidth / containerHeight;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (containerAspect > imageAspect) {
      drawHeight = containerHeight * scale;
      drawWidth = drawHeight * imageAspect;
      drawX = (containerWidth - drawWidth) / 2;
      drawY = (containerHeight - drawHeight) / 2;
    } else {
      drawWidth = containerWidth * scale;
      drawHeight = drawWidth / imageAspect;
      drawX = (containerWidth - drawWidth) / 2;
      drawY = (containerHeight - drawHeight) / 2;
    }
    
    // Save context, rotate, draw image, restore context
    ctx.save();
    ctx.translate(containerWidth / 2, containerHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, drawX - containerWidth / 2, drawY - containerHeight / 2, drawWidth, drawHeight);
    ctx.restore();
    
    // Draw crop overlay
    if (isCropping) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
      
      // Draw corner handles
      const handleSize = 8;
      ctx.fillStyle = '#00ff00';
      ctx.setLineDash([]);
      
      // Top-left
      ctx.fillRect(cropArea.x - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize);
      // Top-right
      ctx.fillRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize);
      // Bottom-left
      ctx.fillRect(cropArea.x - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize);
      // Bottom-right
      ctx.fillRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize);
    }
  };

  useEffect(() => {
    drawImage();
  }, [scale, rotation, cropArea, isCropping]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isCropping) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on crop area
    if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
        y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isCropping || !dragStart) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCropArea(prev => ({
      ...prev,
      x: x - dragStart.x,
      y: y - dragStart.y
    }));
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  const handleSave = () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    if (!ctx) return;
    
    // Create a new canvas for the cropped image
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    
    if (!cropCtx) return;
    
    // Set crop canvas size
    cropCanvas.width = cropArea.width;
    cropCanvas.height = cropArea.height;
    
    // Calculate source coordinates on the original image
    const containerWidth = canvas.width;
    const containerHeight = canvas.height;
    const imageAspect = img.width / img.height;
    const containerAspect = containerWidth / containerHeight;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (containerAspect > imageAspect) {
      drawHeight = containerHeight * scale;
      drawWidth = drawHeight * imageAspect;
      drawX = (containerWidth - drawWidth) / 2;
      drawY = (containerHeight - drawHeight) / 2;
    } else {
      drawWidth = containerWidth * scale;
      drawHeight = drawWidth / imageAspect;
      drawX = (containerWidth - drawWidth) / 2;
      drawY = (containerHeight - drawHeight) / 2;
    }
    
    // Calculate the actual crop area on the image
    const cropX = ((cropArea.x - drawX) / drawWidth) * img.width;
    const cropY = ((cropArea.y - drawY) / drawHeight) * img.height;
    const cropWidth = (cropArea.width / drawWidth) * img.width;
    const cropHeight = (cropArea.height / drawHeight) * img.height;
    
    // Draw the cropped portion
    cropCtx.drawImage(
      img,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, cropArea.width, cropArea.height
    );
    
    // Convert to blob and create file
    cropCanvas.toBlob((blob) => {
      if (blob) {
        const editedFile = new File([blob], originalFile?.name || 'edited-image.jpg', {
          type: 'image/jpeg'
        });
        onSave(editedFile);
        onClose();
      }
    }, 'image/jpeg', 0.9);
  };

  const resetImage = () => {
    setScale(1);
    setRotation(0);
    if (containerRef.current && imageRef.current) {
      const container = containerRef.current;
      const img = imageRef.current;
      const containerAspect = container.clientWidth / container.clientHeight;
      const imageAspect = img.width / img.height;
      
      let cropWidth, cropHeight;
      if (containerAspect > imageAspect) {
        cropHeight = container.clientHeight * 0.8;
        cropWidth = cropHeight * imageAspect;
      } else {
        cropWidth = container.clientWidth * 0.8;
        cropHeight = cropWidth / imageAspect;
      }
      
      setCropArea({
        x: (container.clientWidth - cropWidth) / 2,
        y: (container.clientHeight - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Your Photo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Image Editor Canvas */}
          <div 
            ref={containerRef}
            className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden"
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            {imageSrc && (
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Uploaded image"
                className="hidden"
              />
            )}
          </div>
          
          {/* Controls */}
          <div className="space-y-4">
            {/* Crop Toggle */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={isCropping ? "default" : "outline"}
                size="sm"
                onClick={() => setIsCropping(!isCropping)}
                className="flex items-center gap-2"
              >
                <Crop className="h-4 w-4" />
                {isCropping ? 'Crop Mode' : 'Enable Crop'}
              </Button>
              {isCropping && (
                <p className="text-sm text-muted-foreground">
                  Drag the green box to position your crop area
                </p>
              )}
            </div>
            
            {/* Image Adjustments */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Zoom</label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Slider
                    value={[scale]}
                    onValueChange={(value) => setScale(value[0])}
                    min={0.5}
                    max={3}
                    step={0.1}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setScale(Math.min(3, scale + 0.1))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground">{Math.round(scale * 100)}%</span>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Rotation</label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRotation(rotation - 90)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Slider
                    value={[rotation]}
                    onValueChange={(value) => setRotation(value[0])}
                    min={-180}
                    max={180}
                    step={90}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground">{rotation}°</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={resetImage}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
