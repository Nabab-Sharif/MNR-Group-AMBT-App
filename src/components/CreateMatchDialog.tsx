import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, X } from "lucide-react";
import { matchSchema, validatePhotoFile } from "@/lib/validation";
import { CameraCapture } from "./CameraCapture";

interface CreateMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface LeaderSuggestion {
  name: string;
  department?: string;
  unit?: string;
}

export const CreateMatchDialog = ({ open, onOpenChange, onSuccess }: CreateMatchDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [currentField, setCurrentField] = useState<string>("");
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [allMatches, setAllMatches] = useState<any[]>([]);
  const [team1LeaderSuggestions, setTeam1LeaderSuggestions] = useState<LeaderSuggestion[]>([]);
  const [team2LeaderSuggestions, setTeam2LeaderSuggestions] = useState<LeaderSuggestion[]>([]);
  const [showTeam1Suggestions, setShowTeam1Suggestions] = useState(false);
  const [showTeam2Suggestions, setShowTeam2Suggestions] = useState(false);
  
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

  // Load all matches on component mount to get suggestions
  const loadLeaderSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('team1_name, team1_leader, team1_player1_name, team1_player1_department, team1_player1_unit, team1_player2_name, team1_player2_department, team1_player2_unit, team2_name, team2_leader, team2_player1_name, team2_player1_department, team2_player1_unit, team2_player2_name, team2_player2_department, team2_player2_unit')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error('Error loading suggestions:', error);
        return;
      }
      
      if (data) {
        setAllMatches(data);
      }
    } catch (err) {
      console.error('Failed to load leader suggestions:', err);
    }
  };

  // Get team data by team name
  const getTeamDataByName = (teamName: string, isTeam2: boolean = false) => {
    if (!teamName.trim() || !allMatches.length) {
      console.log(`[getTeamDataByName] No team name or matches. teamName: ${teamName}, allMatches.length: ${allMatches.length}`);
      if (allMatches.length > 0) {
        console.log(`[getTeamDataByName] Available Team 2 names:`, allMatches.map(m => m.team2_name).filter(Boolean));
      }
      return null;
    }

    console.log(`[getTeamDataByName] Searching for ${isTeam2 ? 'Team 2' : 'Team 1'}: "${teamName}" in ${allMatches.length} matches`);
    
    for (const match of allMatches) {
      if (isTeam2) {
        // For Team 2 form, search in BOTH team1 and team2 names
        if (match.team2_name?.toLowerCase() === teamName.toLowerCase()) {
          console.log(`[getTeamDataByName] Found Team 2 match for "${teamName}"`);
          return {
            leader: match.team2_leader || "",
            player1Name: match.team2_player1_name || "",
            player1Department: match.team2_player1_department || "",
            player1Unit: match.team2_player1_unit || "",
            player2Name: match.team2_player2_name || "",
            player2Department: match.team2_player2_department || "",
            player2Unit: match.team2_player2_unit || "",
          };
        }
        // Also check Team 1 if Team 2 not found
        if (match.team1_name?.toLowerCase() === teamName.toLowerCase()) {
          console.log(`[getTeamDataByName] Found Team 1 match for "${teamName}" (using for Team 2 form)`);
          return {
            leader: match.team1_leader || "",
            player1Name: match.team1_player1_name || "",
            player1Department: match.team1_player1_department || "",
            player1Unit: match.team1_player1_unit || "",
            player2Name: match.team1_player2_name || "",
            player2Department: match.team1_player2_department || "",
            player2Unit: match.team1_player2_unit || "",
          };
        }
      } else {
        // For Team 1 form, search in BOTH team1 and team2 names
        if (match.team1_name?.toLowerCase() === teamName.toLowerCase()) {
          console.log(`[getTeamDataByName] Found Team 1 match for "${teamName}"`);
          return {
            leader: match.team1_leader || "",
            player1Name: match.team1_player1_name || "",
            player1Department: match.team1_player1_department || "",
            player1Unit: match.team1_player1_unit || "",
            player2Name: match.team1_player2_name || "",
            player2Department: match.team1_player2_department || "",
            player2Unit: match.team1_player2_unit || "",
          };
        }
        // Also check Team 2 if Team 1 not found
        if (match.team2_name?.toLowerCase() === teamName.toLowerCase()) {
          console.log(`[getTeamDataByName] Found Team 2 match for "${teamName}" (using for Team 1 form)`);
          return {
            leader: match.team2_leader || "",
            player1Name: match.team2_player1_name || "",
            player1Department: match.team2_player1_department || "",
            player1Unit: match.team2_player1_unit || "",
            player2Name: match.team2_player2_name || "",
            player2Department: match.team2_player2_department || "",
            player2Unit: match.team2_player2_unit || "",
          };
        }
      }
    }
    console.log(`[getTeamDataByName] No match found for "${teamName}"`);
    return null;
  };

  // Handle Team 1 Name change - auto-fill data
  const handleTeam1NameChange = (name: string) => {
    setFormData(prev => ({ ...prev, team1Name: name }));
    
    const teamData = getTeamDataByName(name, false);
    if (teamData) {
      setFormData(prev => ({
        ...prev,
        team1Leader: teamData.leader,
        team1Player1Name: teamData.player1Name,
        team1Player1Department: teamData.player1Department,
        team1Player1Unit: teamData.player1Unit,
        team1Player2Name: teamData.player2Name,
        team1Player2Department: teamData.player2Department,
        team1Player2Unit: teamData.player2Unit,
      }));
    }
  };

  // Handle Team 2 Name change - auto-fill data
  const handleTeam2NameChange = (name: string) => {
    console.log(`[handleTeam2NameChange] Setting team2Name to: ${name}`);
    setFormData(prev => ({ ...prev, team2Name: name }));
    
    const teamData = getTeamDataByName(name, true);
    console.log(`[handleTeam2NameChange] teamData result:`, teamData);
    if (teamData) {
      setFormData(prev => ({
        ...prev,
        team2Leader: teamData.leader,
        team2Player1Name: teamData.player1Name,
        team2Player1Department: teamData.player1Department,
        team2Player1Unit: teamData.player1Unit,
        team2Player2Name: teamData.player2Name,
        team2Player2Department: teamData.player2Department,
        team2Player2Unit: teamData.player2Unit,
      }));
    }
  };

  // Get unique leader suggestions
  const getLeaderSuggestions = (searchTerm: string, isTeam2: boolean = false): LeaderSuggestion[] => {
    if (!searchTerm.trim() || !allMatches.length) return [];

    const leaders = new Set<string>();
    const suggestions: LeaderSuggestion[] = [];

    allMatches.forEach((match) => {
      const team1Match = !isTeam2 && (match.team1_leader?.toLowerCase().includes(searchTerm.toLowerCase()));
      const team2Match = isTeam2 && (match.team2_leader?.toLowerCase().includes(searchTerm.toLowerCase()));

      if (team1Match && match.team1_leader && !leaders.has(match.team1_leader)) {
        leaders.add(match.team1_leader);
        suggestions.push({
          name: match.team1_leader,
          department: match.team1_player1_department,
          unit: match.team1_player1_unit,
        });
      }

      if (team2Match && match.team2_leader && !leaders.has(match.team2_leader)) {
        leaders.add(match.team2_leader);
        suggestions.push({
          name: match.team2_leader,
          department: match.team2_player1_department,
          unit: match.team2_player1_unit,
        });
      }
    });

    return suggestions.slice(0, 5);
  };

  const handleTeam1LeaderChange = (value: string) => {
    setFormData(prev => ({ ...prev, team1Leader: value }));
    const suggestions = getLeaderSuggestions(value, false);
    setTeam1LeaderSuggestions(suggestions);
    setShowTeam1Suggestions(value.length > 0 && suggestions.length > 0);
  };

  const handleTeam2LeaderChange = (value: string) => {
    setFormData(prev => ({ ...prev, team2Leader: value }));
    const suggestions = getLeaderSuggestions(value, true);
    setTeam2LeaderSuggestions(suggestions);
    setShowTeam2Suggestions(value.length > 0 && suggestions.length > 0);
  };

  const selectLeaderSuggestion = (suggestion: LeaderSuggestion, isTeam2: boolean) => {
    if (isTeam2) {
      setFormData(prev => ({
        ...prev,
        team2Leader: suggestion.name,
      }));
      setShowTeam2Suggestions(false);
    } else {
      setFormData(prev => ({
        ...prev,
        team1Leader: suggestion.name,
      }));
      setShowTeam1Suggestions(false);
    }
  };

  // Load leader suggestions when dialog opens
  useEffect(() => {
    if (open) {
      loadLeaderSuggestions();
    }
  }, [open]);

  // Debug: Log available team names
  useEffect(() => {
    if (allMatches.length > 0) {
      const team1Names = allMatches.map(m => m.team1_name).filter(Boolean);
      const team2Names = allMatches.map(m => m.team2_name).filter(Boolean);
      console.log(`[DEBUG] Available Team 1 names:`, team1Names);
      console.log(`[DEBUG] Available Team 2 names:`, team2Names);
    }
  }, [allMatches]);

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
    setStopped(false);

    try {
      const validatedData = matchSchema.parse(formData);
      
      // ✅ RULE: Team names must be different
      if (validatedData.team1Name.trim().toLowerCase() === validatedData.team2Name.trim().toLowerCase()) {
        toast.error("❌ Team names must be different!");
        setLoading(false);
        return;
      }

      // Check if team names are different from each other
      if (validatedData.team1Name.toLowerCase().trim() === validatedData.team2Name.toLowerCase().trim()) {
        toast.error("❌ Team 1 and Team 2 must have different names!");
        setLoading(false);
        return;
      }
      
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

      // Create 3 matches with unique IDs
      const matchesToCreate = [];
      for (let i = 0; i < 3; i++) {
        if (stopped) {
          toast.info("Match creation stopped!");
          break;
        }

        matchesToCreate.push({
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
      }

      // Insert all matches
      const { data: insertedMatches, error } = await supabase.from("matches").insert(matchesToCreate).select();

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
            matches_played: 3
          });
        } else {
          // Update matches_played count
          await supabase
            .from('players')
            .update({ 
              matches_played: (existingPlayer as any).matches_played ? (existingPlayer as any).matches_played + 3 : 3,
              photo: player.photo || undefined,
              department: player.department || undefined,
              unit: player.unit || undefined
            })
            .eq('id', existingPlayer.id);
        }
      }

      // Auto-create slides for all 3 matches with player photos
      const { data: existingSlides } = await supabase
        .from('home_slides')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1);
      
      let nextOrderIndex = existingSlides && existingSlides.length > 0 ? existingSlides[0].order_index + 1 : 0;

      if (insertedMatches) {
        for (let i = 0; i < insertedMatches.length; i++) {
          if (stopped) break;

          const match = insertedMatches[i];
          const slideTitle = `${validatedData.team1Name} vs ${validatedData.team2Name}`;
          const slideDescription = `Match #${match.match_number} • ${validatedData.groupName} • ${validatedData.date}`;
          
          // Win slides get lower order index (negative) so they appear first
          // Upcoming match slides get normal positive order index
          const slideOrderIndex = -1000 - i; // Negative index = high priority (appears first)
          
          await supabase.from('home_slides').insert({
            title: slideTitle,
            description: slideDescription,
            image_url: team1Player1PhotoUrl || team2Player1PhotoUrl || null,
            order_index: slideOrderIndex
          });
        }
      }

      toast.success(`${insertedMatches?.length || matchesToCreate.length} matches created with slides!`);
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
      toast.error(error.message || "Failed to create matches");
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
                <div className="space-y-2"><Label>Team Name *</Label><Input value={formData.team1Name} onChange={(e) => handleTeam1NameChange(e.target.value)} required className="bg-background" /></div>
                <div className="space-y-2 relative">
                  <Label>Team Leader *</Label>
                  <Input 
                    value={formData.team1Leader} 
                    onChange={(e) => handleTeam1LeaderChange(e.target.value)}
                    onFocus={() => formData.team1Leader && setShowTeam1Suggestions(team1LeaderSuggestions.length > 0)}
                    required 
                    className="bg-background" 
                    placeholder="Start typing leader name..."
                  />
                  {showTeam1Suggestions && team1LeaderSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-lg">
                      {team1LeaderSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectLeaderSuggestion(suggestion, false)}
                          className="w-full text-left px-3 py-2 hover:bg-blue-100 dark:hover:bg-slate-700 border-b last:border-b-0 dark:text-white"
                        >
                          <div className="font-medium">{suggestion.name}</div>
                          {suggestion.department && <div className="text-xs text-gray-600 dark:text-gray-400">{suggestion.department} {suggestion.unit ? `• ${suggestion.unit}` : ''}</div>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
                      {!previews.team1Player1Photo ? (
                        <>
                          <Input type="file" accept="image/*" onChange={(e) => handleFileChange('team1Player1Photo', e.target.files?.[0] || null)} />
                          <Button type="button" size="icon" variant="outline" onClick={() => openCamera('team1Player1Photo')}><Camera className="h-4 w-4" /></Button>
                        </>
                      ) : (
                        <div className="relative w-24 h-24">
                          <img src={previews.team1Player1Photo} alt="Preview" className="w-full h-full object-cover rounded border" />
                          <button
                            type="button"
                            onClick={() => handleFileChange('team1Player1Photo', null)}
                            className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
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
                      {!previews.team1Player2Photo ? (
                        <>
                          <Input type="file" accept="image/*" onChange={(e) => handleFileChange('team1Player2Photo', e.target.files?.[0] || null)} />
                          <Button type="button" size="icon" variant="outline" onClick={() => openCamera('team1Player2Photo')}><Camera className="h-4 w-4" /></Button>
                        </>
                      ) : (
                        <div className="relative w-24 h-24">
                          <img src={previews.team1Player2Photo} alt="Preview" className="w-full h-full object-cover rounded border" />
                          <button
                            type="button"
                            onClick={() => handleFileChange('team1Player2Photo', null)}
                            className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team 2 */}
            <div className="space-y-4 p-4 bg-gradient-to-br from-orange-600/20 to-orange-700/10 rounded-lg border-2 border-orange-500/30">
              <h3 className="font-semibold text-lg text-orange-700 dark:text-orange-400">Team 2</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Team Name *</Label><Input value={formData.team2Name} onChange={(e) => handleTeam2NameChange(e.target.value)} required className="bg-background" /></div>
                <div className="space-y-2 relative">
                  <Label>Team Leader *</Label>
                  <Input 
                    value={formData.team2Leader} 
                    onChange={(e) => handleTeam2LeaderChange(e.target.value)}
                    onFocus={() => formData.team2Leader && setShowTeam2Suggestions(team2LeaderSuggestions.length > 0)}
                    required 
                    className="bg-background" 
                    placeholder="Start typing leader name..."
                  />
                  {showTeam2Suggestions && team2LeaderSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-lg">
                      {team2LeaderSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectLeaderSuggestion(suggestion, true)}
                          className="w-full text-left px-3 py-2 hover:bg-blue-100 dark:hover:bg-slate-700 border-b last:border-b-0 dark:text-white"
                        >
                          <div className="font-medium">{suggestion.name}</div>
                          {suggestion.department && <div className="text-xs text-gray-600 dark:text-gray-400">{suggestion.department} {suggestion.unit ? `• ${suggestion.unit}` : ''}</div>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
                      {!previews.team2Player1Photo ? (
                        <>
                          <Input type="file" accept="image/*" onChange={(e) => handleFileChange('team2Player1Photo', e.target.files?.[0] || null)} />
                          <Button type="button" size="icon" variant="outline" onClick={() => openCamera('team2Player1Photo')}><Camera className="h-4 w-4" /></Button>
                        </>
                      ) : (
                        <div className="relative w-24 h-24">
                          <img src={previews.team2Player1Photo} alt="Preview" className="w-full h-full object-cover rounded border" />
                          <button
                            type="button"
                            onClick={() => handleFileChange('team2Player1Photo', null)}
                            className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
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
                      {!previews.team2Player2Photo ? (
                        <>
                          <Input type="file" accept="image/*" onChange={(e) => handleFileChange('team2Player2Photo', e.target.files?.[0] || null)} />
                          <Button type="button" size="icon" variant="outline" onClick={() => openCamera('team2Player2Photo')}><Camera className="h-4 w-4" /></Button>
                        </>
                      ) : (
                        <div className="relative w-24 h-24">
                          <img src={previews.team2Player2Photo} alt="Preview" className="w-full h-full object-cover rounded border" />
                          <button
                            type="button"
                            onClick={() => handleFileChange('team2Player2Photo', null)}
                            className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 sticky bottom-0 bg-background pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Creating 3 Matches..." : "Create 3 Matches"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <CameraCapture open={cameraOpen} onOpenChange={setCameraOpen} onCapture={handleCameraCapture} fieldName={currentField} />
    </>
  );
};
