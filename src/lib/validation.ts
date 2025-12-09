import { z } from 'zod';

// Match creation form validation schema
export const matchSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in format YYYY-MM-DD"),
  day: z.string().trim().min(1, "Day is required").max(20, "Day must be less than 20 characters"),
  venue: z.string().trim().min(1, "Venue is required").max(100, "Venue must be less than 100 characters"),
  groupName: z.string().trim().min(1, "Group name is required").max(50, "Group name must be less than 50 characters"),
  team1Name: z.string().trim().min(1, "Team 1 name is required").max(50, "Team name must be less than 50 characters"),
  team1Leader: z.string().trim().min(1, "Team 1 leader is required").max(50, "Leader name must be less than 50 characters"),
  team1Player1Name: z.string().trim().min(1, "Player 1 name is required").max(50, "Player name must be less than 50 characters"),
  team1Player1Department: z.string().trim().optional(),
  team1Player1Unit: z.string().trim().optional(),
  team1Player2Name: z.string().trim().min(1, "Player 2 name is required").max(50, "Player name must be less than 50 characters"),
  team1Player2Department: z.string().trim().optional(),
  team1Player2Unit: z.string().trim().optional(),
  team2Name: z.string().trim().min(1, "Team 2 name is required").max(50, "Team name must be less than 50 characters"),
  team2Leader: z.string().trim().min(1, "Team 2 leader is required").max(50, "Leader name must be less than 50 characters"),
  team2Player1Name: z.string().trim().min(1, "Player 1 name is required").max(50, "Player name must be less than 50 characters"),
  team2Player1Department: z.string().trim().optional(),
  team2Player1Unit: z.string().trim().optional(),
  team2Player2Name: z.string().trim().min(1, "Player 2 name is required").max(50, "Player name must be less than 50 characters"),
  team2Player2Department: z.string().trim().optional(),
  team2Player2Unit: z.string().trim().optional(),
  firstMatch: z.boolean().optional(),
  matchTime: z.string().optional(),
});

export type MatchFormData = z.infer<typeof matchSchema>;

// Photo upload validation constants
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const validatePhotoFile = (file: File): { valid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "File too large (max 5MB)" };
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: "Only JPEG, PNG, and WebP images allowed" };
  }
  return { valid: true };
};

// Score validation
export const scoreSchema = z.number().int().min(0).max(21);

export const validateScore = (score: number): boolean => {
  return scoreSchema.safeParse(score).success;
};
