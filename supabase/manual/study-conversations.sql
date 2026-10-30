-- PENDING: validate and apply ONLY on the original BridgeLIB backend.
BEGIN;
CREATE TABLE public.bridge_study_threads (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 title text NOT NULL DEFAULT 'Study conversation',
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,DELETE ON public.bridge_study_threads TO authenticated;
GRANT ALL ON public.bridge_study_threads TO service_role;
ALTER TABLE public.bridge_study_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_study_threads ON public.bridge_study_threads FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE TABLE public.bridge_study_messages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 thread_id uuid NOT NULL REFERENCES public.bridge_study_threads(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 message_id text NOT NULL,
 message jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(thread_id,message_id)
);
GRANT SELECT,INSERT ON public.bridge_study_messages TO authenticated;
GRANT ALL ON public.bridge_study_messages TO service_role;
ALTER TABLE public.bridge_study_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_study_messages_read ON public.bridge_study_messages FOR SELECT TO authenticated USING(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.bridge_study_threads t WHERE t.id=thread_id AND t.user_id=auth.uid()));
CREATE POLICY own_study_messages_insert ON public.bridge_study_messages FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.bridge_study_threads t WHERE t.id=thread_id AND t.user_id=auth.uid()));
CREATE INDEX bridge_study_messages_thread_time ON public.bridge_study_messages(thread_id,created_at);
COMMIT;