import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, Edit, Trash2, Plus } from "lucide-react";
import html2canvas from "html2canvas";
import { EditSlideDialog } from "./EditSlideDialog";

export const SlideManagement = () => {
  const [slides, setSlides] = useState<any[]>([]);
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(() => {
    const saved = localStorage.getItem('slideshow-autoplay-enabled');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [autoPlayInterval, setAutoPlayInterval] = useState(() => {
    const saved = localStorage.getItem('slideshow-autoplay-interval');
    return saved !== null ? parseInt(saved, 10) : 5;
  });

  const saveAutoPlaySettings = (enabled: boolean, interval: number) => {
    localStorage.setItem('slideshow-autoplay-enabled', JSON.stringify(enabled));
    localStorage.setItem('slideshow-autoplay-interval', JSON.stringify(interval));
    setAutoPlayEnabled(enabled);
    setAutoPlayInterval(interval);
    toast.success("Auto-play settings saved!");
  };

  const fetchSlides = async () => {
    const { data } = await supabase
      .from("matches")
      .select("*")
      .eq("status", "upcoming")
      .order("date", { ascending: true });
    
    if (data) setSlides(data);
  };

  useEffect(() => {
    fetchSlides();

    const channel = supabase
      .channel('slides-management')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        () => fetchSlides()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDownloadSlide = async (matchId: string) => {
    const element = document.getElementById(`slide-${matchId}`);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#1a1a2e',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `match-slide-${matchId}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success("Slide downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download slide");
    }
  };

  const handleDeleteSlide = async (matchId: string) => {
    const { error } = await supabase
      .from("matches")
      .delete()
      .eq("id", matchId);

    if (error) {
      toast.error("Failed to delete slide");
    } else {
      toast.success("Slide deleted successfully!");
      fetchSlides();
    }
  };

  const handleEditSlide = (slide: any) => {
    setEditingSlide(slide);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Slide Management</h2>
      </div>

      {/* Auto-play Settings */}
      <Card className="p-6 border-2 border-primary/30 bg-card">
        <div className="space-y-4">
          <h3 className="text-lg font-bold">🎬 Auto-Play Settings</h3>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoPlayEnabled}
                onChange={(e) => saveAutoPlaySettings(e.target.checked, autoPlayInterval)}
                className="w-5 h-5 rounded"
              />
              <span className="font-semibold">Enable Auto-Play</span>
            </label>
          </div>

          {autoPlayEnabled && (
            <div className="space-y-3 pl-8 border-l-2 border-primary/30">
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold min-w-fit">Interval (seconds):</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={autoPlayInterval}
                  onChange={(e) => {
                    const value = Math.max(1, parseInt(e.target.value, 10) || 5);
                    setAutoPlayInterval(value);
                  }}
                  className="w-20 px-3 py-2 border border-border rounded bg-background text-foreground"
                />
                <Button
                  onClick={() => saveAutoPlaySettings(autoPlayEnabled, autoPlayInterval)}
                  className="ml-2"
                  size="sm"
                >
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">⏱️ Slide will auto-advance every {autoPlayInterval} second(s). Auto-play pauses on hover.</p>
            </div>
          )}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slides.map((slide) => (
          <div key={slide.id} className="relative group">
            <Card
              id={`slide-${slide.id}`}
              className="p-6 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 backdrop-blur-sm border-2 border-primary/30 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/50"
              style={{
                perspective: '1000px',
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-primary mb-2">Match #{slide.match_number}</h3>
                  <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    {slide.group_name}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-semibold">{slide.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Day:</span>
                    <span className="font-semibold">{slide.day}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Venue:</span>
                    <span className="font-semibold">{slide.venue}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Team 1</p>
                    <p className="font-semibold text-sm">{slide.team1_name}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Team 2</p>
                    <p className="font-semibold text-sm">{slide.team2_name}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={() => handleDownloadSlide(slide.id)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="default"
                className="h-8 w-8"
                onClick={() => handleEditSlide(slide)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                className="h-8 w-8"
                onClick={() => handleDeleteSlide(slide.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editingSlide && (
        <EditSlideDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          slide={editingSlide}
          onSuccess={fetchSlides}
        />
      )}
    </div>
  );
};
