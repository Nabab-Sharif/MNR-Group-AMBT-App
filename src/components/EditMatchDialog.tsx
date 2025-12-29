import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { validatePhotoFile } from "@/lib/validation";
import { CameraCapture } from "./CameraCapture";

interface EditMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  match: any;
}

export const EditMatchDialog = ({ open, onOpenChange, onSuccess, match }: EditMatchDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [currentField, setCurrentField] = useState<string>("");
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    date: "",
    day: "",
    venue: "",
    matchTime: "",
    groupName: "",
    team1Name: "",
    team1Leader: "",
    team1Player1Name: "",
    team1Player2Name: "",
    team1Player1Photo: null as File | null,
    team1Player2Photo: null as File | null,
    team2Name: "",
    team2Leader: "",
    team2Player1Name: "",
    team2Player2Name: "",
    team2Player1Photo: null as File | null,
    team2Player2Photo: null as File | null,
  });

  useEffect(() => {
    if (match) {
      setFormData({
        date: match.date || "",
        day: match.day || "",
        venue: match.venue || "",
        matchTime: match.match_time || "",
        groupName: match.group_name || "",
        team1Name: match.team1_name || "",
        team1Leader: match.team1_leader || "",
        team1Player1Name: match.team1_player1_name || "",
        team1Player2Name: match.team1_player2_name || "",
        team1Player1Photo: null,
        team1Player2Photo: null,
        team2Name: match.team2_name || "",
        team2Leader: match.team2_leader || "",
        team2Player1Name: match.team2_player1_name || "",
        team2Player2Name: match.team2_player2_name || "",
        team2Player1Photo: null,
        team2Player2Photo: null,
      });
      
      // Set initial previews from existing photos
      const initialPreviews: Record<string, string> = {};
      if (match.team1_player1_photo) initialPreviews.team1Player1Photo = match.team1_player1_photo;
      if (match.team1_player2_photo) initialPreviews.team1Player2Photo = match.team1_player2_photo;
      if (match.team2_player1_photo) initialPreviews.team2Player1Photo = match.team2_player1_photo;
      if (match.team2_player2_photo) initialPreviews.team2Player2Photo = match.team2_player2_photo;
      setPreviews(initialPreviews);
    }
  }, [match]);

  const handleFileChange = (field: string, file: File | null) => {
    if (file) {
      const validation = validatePhotoFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const openCamera = (field: string) => {
    setCurrentField(field);
    setCameraOpen(true);
  };

  const handleCameraCapture = (file: File) => {
    handleFileChange(currentField, file);
  };

  const uploadPhoto = async (file: File, path: string) => {
    const { error } = await supabase.storage
      .from('player-photos')
      .upload(path, file, { upsert: true });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('player-photos')
      .getPublicUrl(path);
    
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ RULE: Team names must be different
      if (formData.team1Name.trim().toLowerCase() === formData.team2Name.trim().toLowerCase()) {
        toast.error("❌ Team names must be different!");
        setLoading(false);
        return;
      }

      // ✅ RULE: Check if team names conflict with existing teams (excluding current match)
      const { data: existingTeams } = await supabase
        .from('matches')
        .select('team1_name, team2_name')
        .eq('group_name', formData.groupName)
        .neq('id', match.id);

      if (existingTeams && existingTeams.length > 0) {
        const existingTeamNames = new Set<string>();
        existingTeams.forEach(m => {
          if (m.team1_name) existingTeamNames.add(m.team1_name.toLowerCase().trim());
          if (m.team2_name) existingTeamNames.add(m.team2_name.toLowerCase().trim());
        });

        // Check if new names conflict (allow keeping original names)
        if (formData.team1Name.trim().toLowerCase() !== match.team1_name?.toLowerCase()) {
          if (existingTeamNames.has(formData.team1Name.trim().toLowerCase())) {
            toast.error(`❌ Team "${formData.team1Name}" already exists!`);
            setLoading(false);
            return;
          }
        }

        if (formData.team2Name.trim().toLowerCase() !== match.team2_name?.toLowerCase()) {
          if (existingTeamNames.has(formData.team2Name.trim().toLowerCase())) {
            toast.error(`❌ Team "${formData.team2Name}" already exists!`);
            setLoading(false);
            return;
          }
        }
      }

      let team1Player1PhotoUrl = match.team1_player1_photo;
      let team1Player2PhotoUrl = match.team1_player2_photo;
      let team2Player1PhotoUrl = match.team2_player1_photo;
      let team2Player2PhotoUrl = match.team2_player2_photo;

      if (formData.team1Player1Photo) {
        team1Player1PhotoUrl = await uploadPhoto(formData.team1Player1Photo, `team1-player1-${Date.now()}.jpg`);
      }
      if (formData.team1Player2Photo) {
        team1Player2PhotoUrl = await uploadPhoto(formData.team1Player2Photo, `team1-player2-${Date.now()}.jpg`);
      }
      if (formData.team2Player1Photo) {
        team2Player1PhotoUrl = await uploadPhoto(formData.team2Player1Photo, `team2-player1-${Date.now()}.jpg`);
      }
      if (formData.team2Player2Photo) {
        team2Player2PhotoUrl = await uploadPhoto(formData.team2Player2Photo, `team2-player2-${Date.now()}.jpg`);
      }

      const { error } = await supabase
        .from("matches")
        .update({
          date: formData.date,
          day: formData.day,
          venue: formData.venue,
          match_time: formData.matchTime,
          group_name: formData.groupName,
          team1_name: formData.team1Name,
          team1_leader: formData.team1Leader,
          team1_player1_name: formData.team1Player1Name,
          team1_player2_name: formData.team1Player2Name,
          team1_player1_photo: team1Player1PhotoUrl,
          team1_player2_photo: team1Player2PhotoUrl,
          team2_name: formData.team2Name,
          team2_leader: formData.team2Leader,
          team2_player1_name: formData.team2Player1Name,
          team2_player2_name: formData.team2Player2Name,
          team2_player1_photo: team2Player1PhotoUrl,
          team2_player2_photo: team2Player2PhotoUrl,
        })
        .eq("id", match.id);

      if (error) throw error;

      toast.success("Match updated successfully!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update match");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Match #{match?.match_number}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto flex-1 pr-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Match Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Day *</Label>
                <Input
                  value={formData.day}
                  onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value }))}
                  placeholder="Wednesday"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={formData.matchTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, matchTime: e.target.value }))}
                  placeholder="10:00 AM"
                />
              </div>
              <div className="space-y-2">
                <Label>Venue *</Label>
                <Input
                  value={formData.venue}
                  onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                  placeholder="Sports Complex"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Group *</Label>
                <Input
                  value={formData.groupName}
                  onChange={(e) => setFormData(prev => ({ ...prev, groupName: e.target.value }))}
                  placeholder="Group A"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 bg-gradient-green rounded-lg">
            <h3 className="font-semibold text-lg text-primary-foreground">Team 1</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-primary-foreground">Team Name *</Label>
                <Input
                  value={formData.team1Name}
                  onChange={(e) => setFormData(prev => ({ ...prev, team1Name: e.target.value }))}
                  required
                  className="bg-background/90"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-primary-foreground">Team Leader *</Label>
                <Input
                  value={formData.team1Leader}
                  onChange={(e) => setFormData(prev => ({ ...prev, team1Leader: e.target.value }))}
                  required
                  className="bg-background/90"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-primary-foreground">Player 1 Name *</Label>
                <Input
                  value={formData.team1Player1Name}
                  onChange={(e) => setFormData(prev => ({ ...prev, team1Player1Name: e.target.value }))}
                  required
                  className="bg-background/90"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-primary-foreground">Player 1 Photo</Label>
                <div className="flex gap-2">
                  <Input type="file" accept="image/*" onChange={(e) => handleFileChange('team1Player1Photo', e.target.files?.[0] || null)} className="bg-background/90" />
                  <Button type="button" size="icon" variant="outline" onClick={() => openCamera('team1Player1Photo')}><Camera className="h-4 w-4" /></Button>
                </div>
                {previews.team1Player1Photo && <div className="w-32 h-32 rounded border border-primary/30"><img src={previews.team1Player1Photo} alt="Preview" className="w-full h-full object-cover rounded" /></div>}
              </div>
              <div className="space-y-2">
                <Label className="text-primary-foreground">Player 2 Name *</Label>
                <Input
                  value={formData.team1Player2Name}
                  onChange={(e) => setFormData(prev => ({ ...prev, team1Player2Name: e.target.value }))}
                  required
                  className="bg-background/90"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-primary-foreground">Player 2 Photo</Label>
                <div className="flex gap-2">
                  <Input type="file" accept="image/*" onChange={(e) => handleFileChange('team1Player2Photo', e.target.files?.[0] || null)} className="bg-background/90" />
                  <Button type="button" size="icon" variant="outline" onClick={() => openCamera('team1Player2Photo')}><Camera className="h-4 w-4" /></Button>
                </div>
                {previews.team1Player2Photo && <div className="w-32 h-32 rounded border border-primary/30"><img src={previews.team1Player2Photo} alt="Preview" className="w-full h-full object-cover rounded" /></div>}
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 bg-gradient-orange rounded-lg">
            <h3 className="font-semibold text-lg text-primary-foreground">Team 2</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-primary-foreground">Team Name *</Label>
                <Input
                  value={formData.team2Name}
                  onChange={(e) => setFormData(prev => ({ ...prev, team2Name: e.target.value }))}
                  required
                  className="bg-background/90"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-primary-foreground">Team Leader *</Label>
                <Input
                  value={formData.team2Leader}
                  onChange={(e) => setFormData(prev => ({ ...prev, team2Leader: e.target.value }))}
                  required
                  className="bg-background/90"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-primary-foreground">Player 1 Name *</Label>
                <Input
                  value={formData.team2Player1Name}
                  onChange={(e) => setFormData(prev => ({ ...prev, team2Player1Name: e.target.value }))}
                  required
                  className="bg-background/90"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-primary-foreground">Player 1 Photo</Label>
                <div className="flex gap-2">
                  <Input type="file" accept="image/*" onChange={(e) => handleFileChange('team2Player1Photo', e.target.files?.[0] || null)} className="bg-background/90" />
                  <Button type="button" size="icon" variant="outline" onClick={() => openCamera('team2Player1Photo')}><Camera className="h-4 w-4" /></Button>
                </div>
                {previews.team2Player1Photo && <div className="w-32 h-32 rounded border border-primary/30"><img src={previews.team2Player1Photo} alt="Preview" className="w-full h-full object-cover rounded" /></div>}
              </div>
              <div className="space-y-2">
                <Label className="text-primary-foreground">Player 2 Name *</Label>
                <Input
                  value={formData.team2Player2Name}
                  onChange={(e) => setFormData(prev => ({ ...prev, team2Player2Name: e.target.value }))}
                  required
                  className="bg-background/90"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-primary-foreground">Player 2 Photo</Label>
                <div className="flex gap-2">
                  <Input type="file" accept="image/*" onChange={(e) => handleFileChange('team2Player2Photo', e.target.files?.[0] || null)} className="bg-background/90" />
                  <Button type="button" size="icon" variant="outline" onClick={() => openCamera('team2Player2Photo')}><Camera className="h-4 w-4" /></Button>
                </div>
                {previews.team2Player2Photo && <div className="w-32 h-32 rounded border border-primary/30"><img src={previews.team2Player2Photo} alt="Preview" className="w-full h-full object-cover rounded" /></div>}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Updating..." : "Update Match"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
        </DialogContent>
      </Dialog>
      <CameraCapture open={cameraOpen} onOpenChange={setCameraOpen} onCapture={handleCameraCapture} fieldName={currentField} />
    </>
  );
};
