CREATE OR REPLACE FUNCTION public.habit_from_knowledge()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_action_id bigint;
BEGIN
  SELECT id INTO v_action_id
    FROM public.action
   WHERE name = 'Learning Session'
   LIMIT 1;

  IF v_action_id IS NULL THEN
    RAISE WARNING 'habit_from_knowledge: no action named "Learning Session", skipping';
    RETURN NEW;
  END IF;

  INSERT INTO public.habit (action_id, completed_at, note)
  VALUES (
    v_action_id,
    NEW.created_at,
    format(
      E'%s\n\nhttps://www.soup.one/apps/knowledge-base/%s',
      NEW.question,
      NEW.id
    )
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_knowledge_to_habit
AFTER INSERT ON public.knowledge
FOR EACH ROW
EXECUTE FUNCTION public.habit_from_knowledge();
