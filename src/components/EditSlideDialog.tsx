import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditSlideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slide: any;
  onSuccess: () => void;
}

export const EditSlideDialog = ({ open, onOpenChange, slide, onSuccess }: EditSlideDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: slide?.date || "",
    day: slide?.day || "",
    venue: slide?.venue || "",
    matchTime: slide?.match_time || "",
    groupName: slide?.group_name || "",
    team1Name: slide?.team1_name || "",
    team1Leader: slide?.team1_leader || "",
    team1Player1Name: slide?.team1_player1_name || "",
    team1Player2Name: slide?.team1_player2_name || "",
    team2Name: slide?.team2_name || "",
    team2Leader: slide?.team2_leader || "",
    team2Player1Name: slide?.team2_player1_name || "",
    team2Player2Name: slide?.team2_player2_name || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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
          team2_name: formData.team2Name,
          team2_leader: formData.team2Leader,
          team2_player1_name: formData.team2Player1Name,
          team2_player2_name: formData.team2Player2Name,
        })
        .eq("id", slide.id);

      if (error) throw error;

      toast.success("Slide updated successfully!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update slide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Slide</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Day</Label>
              <Input
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Venue</Label>
              <Input
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={formData.matchTime}
                onChange={(e) => setFormData({ ...formData, matchTime: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Group Name</Label>
            <Input
              value={formData.groupName}
              onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Team 1</h3>
            <Input
              placeholder="Team Name"
              value={formData.team1Name}
              onChange={(e) => setFormData({ ...formData, team1Name: e.target.value })}
              required
            />
            <Input
              placeholder="Team Leader"
              value={formData.team1Leader}
              onChange={(e) => setFormData({ ...formData, team1Leader: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Player 1 Name"
                value={formData.team1Player1Name}
                onChange={(e) => setFormData({ ...formData, team1Player1Name: e.target.value })}
                required
              />
              <Input
                placeholder="Player 2 Name"
                value={formData.team1Player2Name}
                onChange={(e) => setFormData({ ...formData, team1Player2Name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Team 2</h3>
            <Input
              placeholder="Team Name"
              value={formData.team2Name}
              onChange={(e) => setFormData({ ...formData, team2Name: e.target.value })}
              required
            />
            <Input
              placeholder="Team Leader"
              value={formData.team2Leader}
              onChange={(e) => setFormData({ ...formData, team2Leader: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Player 1 Name"
                value={formData.team2Player1Name}
                onChange={(e) => setFormData({ ...formData, team2Player1Name: e.target.value })}
                required
              />
              <Input
                placeholder="Player 2 Name"
                value={formData.team2Player2Name}
                onChange={(e) => setFormData({ ...formData, team2Player2Name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Slide"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
