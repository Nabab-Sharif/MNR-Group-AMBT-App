import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Slide {
  id: string;
  title: string;
  description: string;
  image_url: string;
  order_index: number;
  created_at: string;
}

export const MatchSlideshow = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenSlide, setFullscreenSlide] = useState<Slide | null>(null);
  const [allWinnersMode, setAllWinnersMode] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        if (allWinnersMode) {
          // Fetch recent completed matches (all winners mode)
          const { data: winners } = await supabase
            .from('matches')
            .select('*')
            .eq('status', 'completed')
            .not('winner', 'is', null)
            .order('updated_at', { ascending: false })
            .limit(200);

          if (winners && winners.length > 0) {
              const filtered = (winners as any[]).filter((m: any) => {
                const d = m.date || (m.updated_at ? m.updated_at.split('T')[0] : '');
                if (!d) return false;
                const day = parseInt(d.split('-')[2] || '', 10);
                return day === 6 || day === 7;
              });

              const winnerSlides: Slide[] = (filtered as any[]).map((m) => ({
              id: `match-${m.id}`,
              title: `${m.winner} — Winner`,
              description: `${m.team1_name} ${m.team1_score ?? 0} - ${m.team2_score ?? 0} ${m.team2_name} (${m.group_name || ''})`,
              image_url: m.image_url || "",
              order_index: 0,
              created_at: m.updated_at || m.date || new Date().toISOString(),
            }));
            setSlides(winnerSlides);
            setCurrentIndex(0);
            return;
          } else {
            setSlides([]);
            return;
          }
        }

        const { data } = await supabase
          .from("home_slides")
          .select("*")
          .order("order_index", { ascending: true });

        if (data) {
          // Try to fetch today's completed winner match and inject it as slide #2
          try {
            const today = new Date().toISOString().split('T')[0];
            const { data: todaysCompleted } = await supabase
              .from('matches')
              .select('*')
              .eq('status', 'completed')
              .eq('date', today)
              .not('winner', 'is', null)
              .order('updated_at', { ascending: false })
              .limit(1);

            if (todaysCompleted && todaysCompleted.length > 0) {
              const m: any = todaysCompleted[0];
              const winnerSlide: Slide = {
                id: `winner-${m.id}`,
                title: `${m.winner} — Winner`,
                description: `${m.team1_name} ${m.team1_score ?? 0} - ${m.team2_score ?? 0} ${m.team2_name} (${m.group_name || ''})`,
                image_url: m.image_url || "",
                order_index: 1,
                created_at: m.updated_at || m.date || new Date().toISOString(),
              };

              const baseSlides = data as Slide[];
              const newSlides = [
                ...(baseSlides.slice(0, 1) || []),
                winnerSlide,
                ...(baseSlides.slice(1) || []),
              ];
              setSlides(newSlides);
              return;
            }
          } catch (err) {
            console.error('Failed to fetch today\'s winner slide:', err);
          }

          setSlides(data as Slide[]);
        }
      } catch (err) {
        console.error('fetchSlides error:', err);
        setSlides([]);
      }
    };

    fetchSlides();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('slideshow-slides')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'home_slides'
        },
        () => fetchSlides()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (slides.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-bold mb-4">Welcome to Anish Memorial Tournament</h2>
        <p className="text-muted-foreground">Organized by MNR Group</p>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <>
      <div className="space-y-6 perspective-1000">
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 p-8 transform-gpu transition-all duration-700 hover:scale-[1.02] animate-slide-in-3d shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          
          <div className="relative z-10">
            {currentSlide.image_url && (
              <div className="mb-6 overflow-hidden rounded-lg shadow-xl transform transition-transform duration-500 hover:scale-105">
                <img 
                  src={currentSlide.image_url} 
                  alt={currentSlide.title}
                  className="w-full h-64 object-cover animate-fade-in"
                />
              </div>
            )}
            
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-gradient">
                {currentSlide.title}
              </h2>
              <p className="text-lg text-muted-foreground">
                {currentSlide.description}
              </p>

              <Button
                onClick={() => setFullscreenSlide(currentSlide)}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Full View
              </Button>
              <Button
                onClick={() => {
                  setAllWinnersMode((v) => !v);
                }}
                variant={allWinnersMode ? 'default' : 'outline'}
                size="sm"
                className="mt-4 ml-2"
              >
                🏆 All Winners
              </Button>
              
            </div>

            {/* 3D Slide Indicators */}
            <div className="flex justify-center gap-3 mt-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`transition-all duration-300 ${
                    index === currentIndex 
                      ? "w-12 h-3 bg-gradient-to-r from-primary to-accent rounded-full shadow-lg shadow-primary/50 animate-pulse-glow" 
                      : "w-3 h-3 bg-muted rounded-full hover:bg-muted-foreground/50 transform hover:scale-125"
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Fullscreen Slide View */}
      {fullscreenSlide && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-lg z-50 flex items-center justify-center p-8 animate-fade-in">
          <div className="relative max-w-6xl w-full">
            <Button
              onClick={() => setFullscreenSlide(null)}
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10"
            >
              ✕
            </Button>
            
            {fullscreenSlide.image_url && (
              <img 
                src={fullscreenSlide.image_url} 
                alt={fullscreenSlide.title}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
            )}
            
            <div className="text-center mt-6 space-y-4">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {fullscreenSlide.title}
              </h2>
              <p className="text-xl text-muted-foreground">
                {fullscreenSlide.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
