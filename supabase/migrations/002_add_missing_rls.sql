-- =====================================================
-- Add missing RLS policies for update/delete operations
-- =====================================================

-- Checkins: update and delete
CREATE POLICY "Users can update own checkins" ON public.checkins FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own checkins" ON public.checkins FOR DELETE USING (auth.uid() = user_id);

-- Photos: update and delete
CREATE POLICY "Users can update own photos" ON public.photos FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own photos" ON public.photos FOR DELETE USING (auth.uid() = user_id);
