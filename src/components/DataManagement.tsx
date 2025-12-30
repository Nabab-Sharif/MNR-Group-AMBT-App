import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Upload, Trash2, Database, FileJson } from "lucide-react";

export const DataManagement = () => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportAll = async () => {
    setLoading(true);
    try {
      const { data: matches, error: matchesError } = await supabase.from("matches").select("*");
      const { data: slides, error: slidesError } = await supabase.from("home_slides").select("*");

      if (matchesError || slidesError) {
        throw new Error("Failed to fetch data");
      }

      const exportData = {
        exportDate: new Date().toISOString(),
        matches: matches || [],
        slides: slides || [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tournament-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("All data exported successfully!");
    } catch (err) {
      console.error('Export error:', err);
      toast.error("Failed to export data");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.matches && Array.isArray(data.matches)) {
        for (const match of data.matches) {
          const { id, match_number, created_at, updated_at, ...matchData } = match;
          await supabase.from("matches").insert(matchData);
        }
        toast.success(`Imported ${data.matches.length} matches`);
      }

      if (data.slides && Array.isArray(data.slides)) {
        for (const slide of data.slides) {
          const { id, created_at, ...slideData } = slide;
          await supabase.from("home_slides").insert(slideData);
        }
        toast.success(`Imported ${data.slides.length} slides`);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Import error:', err);
      toast.error("Failed to import data. Please check the file format.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllMatches = async () => {
    if (!confirm("Are you sure you want to delete ALL matches? This cannot be undone!")) return;
    if (!confirm("This will permanently delete all match data. Type 'DELETE' to confirm.")) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("matches").delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (error) throw error;
      
      toast.success("All matches deleted");
      window.location.reload();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error("Failed to delete matches");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllSlides = async () => {
    if (!confirm("Are you sure you want to delete ALL slides? This cannot be undone!")) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("home_slides").delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (error) throw error;
      
      toast.success("All slides deleted");
      window.location.reload();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error("Failed to delete slides");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-bold">Data Management</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Export All */}
        <div className="bg-card border border-primary/30 rounded-xl p-4 text-foreground">
          <div className="flex items-center gap-2 mb-2">
            <Download className="h-5 w-5 text-primary" />
            <span className="font-bold">Export All</span>
          </div>
          <p className="text-sm opacity-90 mb-3 text-muted-foreground">Download all matches and slides as JSON</p>
          <Button 
            onClick={handleExportAll} 
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <FileJson className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Import */}
        <div className="bg-card border border-primary/30 rounded-xl p-4 text-foreground">
          <div className="flex items-center gap-2 mb-2">
            <Upload className="h-5 w-5 text-primary" />
            <span className="font-bold">Import Data</span>
          </div>
          <p className="text-sm opacity-90 mb-3 text-muted-foreground">Import matches and slides from JSON</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import JSON
          </Button>
        </div>

        {/* Delete Matches */}
        <div className="bg-card border border-destructive/30 rounded-xl p-4 text-foreground">
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            <span className="font-bold">Delete Matches</span>
          </div>
          <p className="text-sm opacity-90 mb-3 text-muted-foreground">Remove all matches permanently</p>
          <Button 
            onClick={handleDeleteAllMatches} 
            disabled={loading}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All
          </Button>
        </div>

        {/* Delete Slides */}
        <div className="bg-card border border-destructive/30 rounded-xl p-4 text-foreground">
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            <span className="font-bold">Delete Slides</span>
          </div>
          <p className="text-sm opacity-90 mb-3 text-muted-foreground">Remove all slides permanently</p>
          <Button 
            onClick={handleDeleteAllSlides} 
            disabled={loading}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All
          </Button>
        </div>
      </div>
    </Card>
  );
};