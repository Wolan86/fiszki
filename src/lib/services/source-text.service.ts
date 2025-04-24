import { z } from 'zod';
import type { SupabaseClient } from '../../db/supabase.client';
import type { CreateSourceTextCommand, SourceTextDto } from '../../types';

// Validation schema for create source text command
const createSourceTextSchema = z.object({
  content: z.string()
    .min(1000, 'Content must be between 1000 and 10000 characters')
    .max(10000, 'Content must be between 1000 and 10000 characters')
});

/**
 * Fetches a source text by its ID
 * 
 * @param supabase Supabase client instance
 * @param id Source text ID to fetch
 * @returns Source text data or null if not found
 */
export async function getSourceTextById(
  supabase: SupabaseClient,
  id: string
): Promise<SourceTextDto | null> {
  const { data, error } = await supabase
    .from('source_texts')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // Record not found
      return null;
    }
    throw new Error(`Failed to fetch source text: ${error.message}`);
  }
  
  return data;
}

export class SourceTextService {
  constructor(private supabase: SupabaseClient) {}

  async createSourceText(command: CreateSourceTextCommand, userId: string): Promise<SourceTextDto> {
    // Validate the command
    const validationResult = createSourceTextSchema.safeParse(command);
    
    if (!validationResult.success) {
      const errors = validationResult.error.format();
      throw new Error('VALIDATION_ERROR:' + JSON.stringify(errors));
    }
    
    // Insert source text into database
    const { data, error } = await this.supabase
      .from('source_texts')
      .insert({
        user_id: userId,
        content: command.content
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`DATABASE_ERROR:${error.message}`);
    }
    
    return data;
  }
} 