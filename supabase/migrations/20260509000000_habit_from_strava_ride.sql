CREATE OR REPLACE FUNCTION public.habit_from_strava_ride()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_action_id bigint;
BEGIN
  SELECT id INTO v_action_id
    FROM public.action
   WHERE name = 'Cycling'
   LIMIT 1;

  IF v_action_id IS NULL THEN
    RAISE WARNING 'habit_from_strava_ride: no action named "Cycling", skipping';
    RETURN NEW;
  END IF;

  INSERT INTO public.habit (action_id, completed_at, note)
  VALUES (
    v_action_id,
    NEW.ride_date,
    format(
      E'%skm\n%skm/h\n%sm\n\nhttps://strava.com/activities/%s',
      trim(trailing '.' from to_char(NEW.distance_km,       'FM9999990.99')),
      trim(trailing '.' from to_char(NEW.average_speed_kmh, 'FM9999990.99')),
      trim(trailing '.' from to_char(NEW.elevation_gain_m,  'FM9999990.99')),
      NEW.strava_activity_id
    )
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_strava_ride_to_habit
AFTER INSERT ON public.strava_rides
FOR EACH ROW
EXECUTE FUNCTION public.habit_from_strava_ride();
