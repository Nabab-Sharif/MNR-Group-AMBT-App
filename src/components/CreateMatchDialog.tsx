import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { matchSchema, validatePhotoFile } from "@/lib/validation";
import { CameraCapture } from "./CameraCapture";

interface CreateMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateMatchDialog = ({ open, onOpenChange, onSuccess }: CreateMatchDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [currentField, setCurrentField] = useState<string>("");
  const [previews, setPreviews] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    date: "",
    day: "",
    venue: "",
    matchTime: "",
    firstMatch: false,
    groupName: "",
    team1Name: "",
    team1Leader: "",
    team1Player1Name: "",
    team1Player1Department: "",
    team1Player1Unit: "",
    team1Player2Name: "",
    team1Player2Department: "",
    team1Player2Unit: "",
    team1Player1Photo: null as File | null,
    team1Player2Photo: null as File | null,
    team2Name: "",
    team2Leader: "",
    team2Player1Name: "",
    team2Player1Department: "",
    team2Player1Unit: "",
    team2Player2Name: "",
    team2Player2Department: "",
    team2Player2Unit: "",
    team2Player1Photo: null as File | null,
    team2Player2Photo: null as File | null,
  });

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
    } else {
      setPreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[field];
        return newPreviews;
      });
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
    const { data, error } = await supabase.storage
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
      const validatedData = matchSchema.parse(formData);
      
      let team1Player1PhotoUrl = null;
      let team1Player2PhotoUrl = null;
      let team2Player1PhotoUrl = null;
      let team2Player2PhotoUrl = null;

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

      const { error } = await supabase.from("matches").insert({
        date: validatedData.date,
        day: validatedData.day,
        venue: validatedData.venue,
        match_time: validatedData.matchTime || null,
        first_match: validatedData.firstMatch,
        group_name: validatedData.groupName,
        team1_name: validatedData.team1Name,
        team1_leader: validatedData.team1Leader,
        team1_player1_name: validatedData.team1Player1Name,
        team1_player1_department: validatedData.team1Player1Department || null,
        team1_player1_unit: validatedData.team1Player1Unit || null,
        team1_player2_name: validatedData.team1Player2Name,
        team1_player2_department: validatedData.team1Player2Department || null,
        team1_player2_unit: validatedData.team1Player2Unit || null,
        team1_player1_photo: team1Player1PhotoUrl,
        team1_player2_photo: team1Player2PhotoUrl,
        team2_name: validatedData.team2Name,
        team2_leader: validatedData.team2Leader,
        team2_player1_name: validatedData.team2Player1Name,
        team2_player1_department: validatedData.team2Player1Department || null,
        team2_player1_unit: validatedData.team2Player1Unit || null,
        team2_player2_name: validatedData.team2Player2Name,
        team2_player2_department: validatedData.team2Player2Department || null,
        team2_player2_unit: validatedData.team2Player2Unit || null,
        team2_player1_photo: team2Player1PhotoUrl,
        team2_player2_photo: team2Player2PhotoUrl,
        status: "upcoming"
      });

      if (error) throw error;

      // Auto-create player profiles
      const playersToCreate = [
        { name: validatedData.team1Player1Name, photo: team1Player1PhotoUrl, department: validatedData.team1Player1Department, unit: validatedData.team1Player1Unit },
        { name: validatedData.team1Player2Name, photo: team1Player2PhotoUrl, department: validatedData.team1Player2Department, unit: validatedData.team1Player2Unit },
        { name: validatedData.team2Player1Name, photo: team2Player1PhotoUrl, department: validatedData.team2Player1Department, unit: validatedData.team2Player1Unit },
        { name: validatedData.team2Player2Name, photo: team2Player2PhotoUrl, department: validatedData.team2Player2Department, unit: validatedData.team2Player2Unit },
      ];

      for (const player of playersToCreate) {
        // Check if player already exists
        const { data: existingPlayer } = await supabase
          .from('players')
          .select('id')
          .eq('name', player.name)
          .maybeSingle();

        if (!existingPlayer) {
          // Create new player profile
          await supabase.from('players').insert({
            name: player.name,
            photo: player.photo,
            department: player.department || null,
            unit: player.unit || null,
            matches_played: 1
          });
        } else {
          // Update matches_played count
          await supabase
            .from('players')
            .update({ 
              matches_played: (existingPlayer as any).matches_played ? (existingPlayer as any).matches_played + 1 : 1,
              photo: player.photo || undefined,
              department: player.department || undefined,
              unit: player.unit || undefined
            })
            .eq('id', existingPlayer.id);
        }
      }

      // Auto-create slide for the match with player photos
      const slideTitle = `${validatedData.team1Name} vs ${validatedData.team2Name}`;
      const slideDescription = `Match #${Date.now()} • ${validatedData.groupName} • ${validatedData.date}`;
      
      // Get the highest order_index
      const { data: existingSlides } = await supabase
        .from('home_slides')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1);
      
      const nextOrderIndex = existingSlides && existingSlides.length > 0 ? existingSlides[0].order_index + 1 : 0;
      
      await supabase.from('home_slides').insert({
        title: slideTitle,
        description: slideDescription,
        image_url: team1Player1PhotoUrl || team2Player1PhotoUrl || null,
        order_index: nextOrderIndex
      });

      toast.success("Match created with slide!");
      onSuccess();
      onOpenChange(false);
      
      setFormData({
        date: "", day: "", venue: "", matchTime: "", firstMatch: false, groupName: "",
        team1Name: "", team1Leader: "", 
        team1Player1Name: "", team1Player1Department: "", team1Player1Unit: "",
        team1Player2Name: "", team1Player2Department: "", team1Player2Unit: "",
        team1Player1Photo: null, team1Player2Photo: null,
        team2Name: "", team2Leader: "", 
        team2Player1Name: "", team2Player1Department: "", team2Player1Unit: "",
        team2Player2Name: "", team2Player2Department: "", team2Player2Unit: "",
        team2Player1Photo: null, team2Player2Photo: null,
      });
      setPreviews({});
    } catch (error: any) {
      toast.error(error.message || "Failed to create match");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Create New Match</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto flex-1 pr-4">
            {/* Match Details */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold text-lg">Match Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Date *</Label><Input type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} required /></div>
                <div className="space-y-2"><Label>Day *</Label><Input value={formData.day} onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value }))} required /></div>
                <div className="space-y-2"><Label>Venue *</Label><Input value={formData.venue} onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))} required /></div>
                <div className="space-y-2"><Label>Time</Label><Input type="time" value={formData.matchTime} onChange={(e) => setFormData(prev => ({ ...prev, matchTime: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Group *</Label><Input value={formData.groupName} onChange={(e) => setFormData(prev => ({ ...prev, groupName: e.target.value }))} required /></div>
              </div>
            </div>

            {/* Team 1 */}
            <div className="space-y-4 p-4 bg-gradient-to-br from-green-600/20 to-green-700/10 rounded-lg border-2 border-green-500/30">
              <h3 className="font-semibold text-lg text-green-700 dark:text-green-400">Team 1</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Team Name *</Label><Input value={formData.team1Name} onChange={(e) => setFormData(prev => ({ ...prev, team1Name: e.target.value }))} required className="bg-background" /></div>
                <div className="space-y-2"><Label>Team Leader *</Label><Input value={formData.team1Leader} onChange={(e) => setFormData(prev => ({ ...prev, team1Leader: e.target.value }))} required className="bg-background" /></div>
              </div>
              
              {/* Player 1 */}
              <div className="space-y-4 p-3 bg-background/80 rounded border border-green-500/20">
                <h4 className="font-medium text-sm text-green-600 dark:text-green-400">Player 1</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Name *</Label><Input value={formData.team1Player1Name} onChange={(e) => setFormData(prev => ({ ...prev, team1Player1Name: e.target.value }))} required /></div>
                  <div className="space-y-2"><Label>Department</Label><Input value={formData.team1Player1Department} onChange={(e) => setFormData(prev => ({ ...prev, team1Player1Department: e.target.value }))} placeholder="e.g., IT Department" /></div>
                  <div className="space-y-2"><Label>Unit/Office</Label><Input value={formData.team1Player1Unit} onChange={(e) => setFormData(prev => ({ ...prev, team1Player1Unit: e.target.value }))} placeholder="e.g., Head Office" /></div>
                  <div className="space-y-2">
                    <Label>Photo</Label>
                    <div className="flex gap-2">
                      <Input type="file" accept="image/*" onChange={(e) => handleFileChange('team1Player1Photo', e.target.files?.[0] || null)} />
                      <Button type="button" size="icon" variant="outline" onClick={() => openCamera('team1Player1Photo')}><Camera className="h-4 w-4" /></Button>
                    </div>
                    {previews.team1Player1Photo && <div className="w-24 h-24 rounded border"><img src={previews.team1Player1Photo} alt="Preview" className="w-full h-full object-cover rounded" /></div>}
                  </div>
                </div>
              </div>

              {/* Player 2 */}
              <div className="space-y-4 p-3 bg-background/80 rounded border border-green-500/20">
                <h4 className="font-medium text-sm text-green-600 dark:text-green-400">Player 2</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Name *</Label><Input value={formData.team1Player2Name} onChange={(e) => setFormData(prev => ({ ...prev, team1Player2Name: e.target.value }))} required /></div>
                  <div className="space-y-2"><Label>Department</Label><Input value={formData.team1Player2Department} onChange={(e) => setFormData(prev => ({ ...prev, team1Player2Department: e.target.value }))} placeholder="e.g., HR Department" /></div>
                  <div className="space-y-2"><Label>Unit/Office</Label><Input value={formData.team1Player2Unit} onChange={(e) => setFormData(prev => ({ ...prev, team1Player2Unit: e.target.value }))} placeholder="e.g., Branch Office" /></div>
                  <div className="space-y-2">
                    <Label>Photo</Label>
                    <div className="flex gap-2">
                      <Input type="file" accept="image/*" onChange={(e) => handleFileChange('team1Player2Photo', e.target.files?.[0] || null)} />
                      <Button type="button" size="icon" variant="outline" onClick={() => openCamera('team1Player2Photo')}><Camera className="h-4 w-4" /></Button>
                    </div>
                    {previews.team1Player2Photo && <div className="w-24 h-24 rounded border"><img src={previews.team1Player2Photo} alt="Preview" className="w-full h-full object-cover rounded" /></div>}
                  </div>
                </div>
              </div>
            </div>

            {/* Team 2 */}
            <div className="space-y-4 p-4 bg-gradient-to-br from-orange-600/20 to-orange-700/10 rounded-lg border-2 border-orange-500/30">
              <h3 className="font-semibold text-lg text-orange-700 dark:text-orange-400">Team 2</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Team Name *</Label><Input value={formData.team2Name} onChange={(e) => setFormData(prev => ({ ...prev, team2Name: e.target.value }))} required className="bg-background" /></div>
                <div className="space-y-2"><Label>Team Leader *</Label><Input value={formData.team2Leader} onChange={(e) => setFormData(prev => ({ ...prev, team2Leader: e.target.value }))} required className="bg-background" /></div>
              </div>
              
              {/* Player 1 */}
              <div className="space-y-4 p-3 bg-background/80 rounded border border-orange-500/20">
                <h4 className="font-medium text-sm text-orange-600 dark:text-orange-400">Player 1</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Name *</Label><Input value={formData.team2Player1Name} onChange={(e) => setFormData(prev => ({ ...prev, team2Player1Name: e.target.value }))} required /></div>
                  <div className="space-y-2"><Label>Department</Label><Input value={formData.team2Player1Department} onChange={(e) => setFormData(prev => ({ ...prev, team2Player1Department: e.target.value }))} placeholder="e.g., Finance Department" /></div>
                  <div className="space-y-2"><Label>Unit/Office</Label><Input value={formData.team2Player1Unit} onChange={(e) => setFormData(prev => ({ ...prev, team2Player1Unit: e.target.value }))} placeholder="e.g., Regional Office" /></div>
                  <div className="space-y-2">
                    <Label>Photo</Label>
                    <div className="flex gap-2">
                      <Input type="file" accept="image/*" onChange={(e) => handleFileChange('team2Player1Photo', e.target.files?.[0] || null)} />
                      <Button type="button" size="icon" variant="outline" onClick={() => openCamera('team2Player1Photo')}><Camera className="h-4 w-4" /></Button>
                    </div>
                    {previews.team2Player1Photo && <div className="w-24 h-24 rounded border"><img src={previews.team2Player1Photo} alt="Preview" className="w-full h-full object-cover rounded" /></div>}
                  </div>
                </div>
              </div>

              {/* Player 2 */}
              <div className="space-y-4 p-3 bg-background/80 rounded border border-orange-500/20">
                <h4 className="font-medium text-sm text-orange-600 dark:text-orange-400">Player 2</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Name *</Label><Input value={formData.team2Player2Name} onChange={(e) => setFormData(prev => ({ ...prev, team2Player2Name: e.target.value }))} required /></div>
                  <div className="space-y-2"><Label>Department</Label><Input value={formData.team2Player2Department} onChange={(e) => setFormData(prev => ({ ...prev, team2Player2Department: e.target.value }))} placeholder="e.g., Operations Department" /></div>
                  <div className="space-y-2"><Label>Unit/Office</Label><Input value={formData.team2Player2Unit} onChange={(e) => setFormData(prev => ({ ...prev, team2Player2Unit: e.target.value }))} placeholder="e.g., Support Office" /></div>
                  <div className="space-y-2">
                    <Label>Photo</Label>
                    <div className="flex gap-2">
                      <Input type="file" accept="image/*" onChange={(e) => handleFileChange('team2Player2Photo', e.target.files?.[0] || null)} />
                      <Button type="button" size="icon" variant="outline" onClick={() => openCamera('team2Player2Photo')}><Camera className="h-4 w-4" /></Button>
                    </div>
                    {previews.team2Player2Photo && <div className="w-24 h-24 rounded border"><img src={previews.team2Player2Photo} alt="Preview" className="w-full h-full object-cover rounded" /></div>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 sticky bottom-0 bg-background pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Match"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <CameraCapture open={cameraOpen} onOpenChange={setCameraOpen} onCapture={handleCameraCapture} fieldName={currentField} />
    </>
  );
};
