import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X, RotateCw } from "lucide-react";
import { toast } from "sonner";

interface CameraCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (file: File) => void;
  fieldName: string;
}

export const CameraCapture = ({ open, onOpenChange, onCapture, fieldName }: CameraCaptureProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => stopCamera();
  }, [open, facingMode]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode },
        audio: false
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast.error("Failed to access camera");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const file = new File([blob], `${fieldName}-${Date.now()}.jpg`, { type: 'image/jpeg' });
      onCapture(file);
      onOpenChange(false);
      toast.success("Photo captured!");
    }, 'image/jpeg', 0.9);
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Capture Photo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                onClick={switchCamera}
                className="bg-black/50 hover:bg-black/70"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                className="bg-black/50 hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <Button
                size="lg"
                onClick={capturePhoto}
                className="rounded-full h-16 w-16 bg-primary hover:bg-primary/90"
              >
                <Camera className="h-8 w-8 text-primary-foreground" />
              </Button>
            </div>

            <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded text-white text-sm">
              {facingMode === 'user' ? 'Front Camera' : 'Back Camera'}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
