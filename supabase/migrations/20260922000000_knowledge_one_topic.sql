-- An entry carries exactly one topic (many concepts). Enforced here rather
-- than in the form / MCP tool so the invariant holds for every writer; the UI
-- picker and kb_create_entry only mirror it (issue #49).
--
-- Row-level BEFORE trigger: rows already inserted by the same multi-row
-- INSERT are visible, so a batch carrying two topics fails on the second row.

CREATE OR REPLACE FUNCTION public.knowledge_tags_one_topic()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (SELECT t.type FROM public.tags t WHERE t.id = NEW.tag_id) <> 'topic' THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
      FROM public.knowledge_tags kt
      JOIN public.tags t ON t.id = kt.tag_id
     WHERE kt.knowledge_id = NEW.knowledge_id
       AND kt.tag_id <> NEW.tag_id
       AND t.type = 'topic'
  ) THEN
    RAISE EXCEPTION 'knowledge entry % already has a topic tag', NEW.knowledge_id
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_knowledge_tags_one_topic
BEFORE INSERT OR UPDATE OF tag_id ON public.knowledge_tags
FOR EACH ROW
EXECUTE FUNCTION public.knowledge_tags_one_topic();

-- Flipping a concept into a topic must not sneak a second topic onto entries.
CREATE OR REPLACE FUNCTION public.tags_type_keeps_one_topic()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.type = 'topic' AND OLD.type <> 'topic' AND EXISTS (
    SELECT 1
      FROM public.knowledge_tags a
      JOIN public.knowledge_tags b ON b.knowledge_id = a.knowledge_id
      JOIN public.tags t ON t.id = b.tag_id
     WHERE a.tag_id = NEW.id
       AND b.tag_id <> NEW.id
       AND t.type = 'topic'
  ) THEN
    RAISE EXCEPTION 'tag % is a concept on entries that already have a topic', NEW.id
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tags_type_keeps_one_topic
BEFORE UPDATE OF type ON public.tags
FOR EACH ROW
EXECUTE FUNCTION public.tags_type_keeps_one_topic();
