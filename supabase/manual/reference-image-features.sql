-- PENDING: apply ONLY to the original BridgeLIB project after restoring its editor connection.
-- Never apply to the unrelated empty editor-managed backend.
BEGIN;
CREATE TABLE public.bridge_bookmarks (
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 subject_id bigint NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
 created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,subject_id)
);
GRANT SELECT,INSERT,DELETE ON public.bridge_bookmarks TO authenticated;
GRANT ALL ON public.bridge_bookmarks TO service_role;
ALTER TABLE public.bridge_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_bookmarks ON public.bridge_bookmarks FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE TABLE public.bridge_ratings (
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 subject_id bigint NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
 rating integer NOT NULL CHECK(rating BETWEEN 1 AND 5), PRIMARY KEY(user_id,subject_id)
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.bridge_ratings TO authenticated;
GRANT ALL ON public.bridge_ratings TO service_role;
ALTER TABLE public.bridge_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_ratings ON public.bridge_ratings FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.course_enrollments e WHERE e.user_id=auth.uid() AND e.subject_id=bridge_ratings.subject_id));
CREATE TABLE public.bridge_certificates (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 subject_id bigint NOT NULL REFERENCES public.subjects(id), learner_name text NOT NULL, subject_name text NOT NULL,
 issued_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,subject_id)
);
GRANT SELECT ON public.bridge_certificates TO authenticated;
GRANT ALL ON public.bridge_certificates TO service_role;
ALTER TABLE public.bridge_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_certificates ON public.bridge_certificates FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE FUNCTION public.bridge_course_metrics() RETURNS TABLE(subject_id bigint,lesson_count bigint,student_count bigint,rating_count bigint,rating_average numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT s.id,(SELECT count(*) FROM public.lessons l WHERE l.subject_id=s.id AND l.is_published),
 (SELECT count(*) FROM public.course_enrollments e WHERE e.subject_id=s.id),
 (SELECT count(*) FROM public.bridge_ratings r WHERE r.subject_id=s.id),
 (SELECT round(avg(r.rating),1) FROM public.bridge_ratings r WHERE r.subject_id=s.id)
 FROM public.subjects s;
$$;
REVOKE ALL ON FUNCTION public.bridge_course_metrics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bridge_course_metrics() TO anon,authenticated;
CREATE FUNCTION public.bridge_issue_certificate(p_subject bigint) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE cid uuid; learner text; subject text;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to continue.'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.course_enrollments WHERE user_id=auth.uid() AND subject_id=p_subject)
 OR NOT EXISTS(SELECT 1 FROM public.lessons WHERE subject_id=p_subject AND is_published)
 OR EXISTS(SELECT 1 FROM public.lessons l WHERE l.subject_id=p_subject AND l.is_published AND NOT EXISTS(SELECT 1 FROM public.lesson_completions c WHERE c.lesson_id=l.id AND c.user_id=auth.uid())) THEN
 RAISE EXCEPTION 'Enroll and complete every published lesson before requesting your completion certificate.'; END IF;
 SELECT coalesce(nullif(full_name,''),'BridgeLIB learner') INTO learner FROM public.profiles WHERE id=auth.uid();
 SELECT name INTO subject FROM public.subjects WHERE id=p_subject;
 INSERT INTO public.bridge_certificates(user_id,subject_id,learner_name,subject_name) VALUES(auth.uid(),p_subject,coalesce(learner,'BridgeLIB learner'),subject) ON CONFLICT(user_id,subject_id) DO NOTHING;
 SELECT id INTO cid FROM public.bridge_certificates WHERE user_id=auth.uid() AND subject_id=p_subject; RETURN cid;
END $$;
REVOKE ALL ON FUNCTION public.bridge_issue_certificate(bigint) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.bridge_issue_certificate(bigint) TO authenticated;
CREATE FUNCTION public.bridge_my_certificates() RETURNS SETOF public.bridge_certificates LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$ SELECT * FROM public.bridge_certificates WHERE user_id=auth.uid() ORDER BY issued_at DESC $$;
REVOKE ALL ON FUNCTION public.bridge_my_certificates() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.bridge_my_certificates() TO authenticated;
-- Practice is a learning mode with immediate feedback, not a high-stakes exam.
CREATE FUNCTION public.bridge_practice_feedback(p_question uuid,p_option text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE result jsonb;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to continue.'; END IF;
 SELECT jsonb_build_object('question_id',q.id,'correct_option',a.correct_option,'explanation',q.explanation,'is_correct',a.correct_option=p_option)
 INTO result FROM public.exam_questions q JOIN public.exam_question_answers a ON a.question_id=q.id
 WHERE q.id=p_question AND q.is_published AND EXISTS(SELECT 1 FROM jsonb_array_elements(q.options) o WHERE o->>'id'=p_option);
 IF result IS NULL THEN RAISE EXCEPTION 'Question unavailable.'; END IF; RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.bridge_practice_feedback(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.bridge_practice_feedback(uuid,text) TO authenticated;
COMMIT;
