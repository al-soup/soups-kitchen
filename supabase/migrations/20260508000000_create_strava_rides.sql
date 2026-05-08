CREATE TABLE public.strava_rides (
  id                  bigserial PRIMARY KEY,
  strava_activity_id  bigint UNIQUE NOT NULL,
  ride_date           timestamptz NOT NULL,
  distance_km         numeric(7, 2) NOT NULL,
  elevation_gain_m    numeric(7, 1) NOT NULL,
  average_speed_kmh   numeric(5, 2) NOT NULL,
  raw_response        jsonb NOT NULL,
  created_at          timestamptz DEFAULT now()
);

CREATE INDEX idx_strava_rides_activity_id ON public.strava_rides (strava_activity_id);
CREATE INDEX idx_strava_rides_ride_date   ON public.strava_rides (ride_date);

ALTER TABLE public.strava_rides ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.strava_rides FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.strava_rides_id_seq FROM anon, authenticated;
