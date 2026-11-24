-- Anonymous funnel counts: how far new people get, as counters and nothing else. There is no row
-- per phone and no device token, install id or address in it, so two reports can never be tied
-- together. `day` is the UTC date a count arrived; `since_open` is the step's own day counted from
-- the phone's first open (-1 for a step that has none); `detail` is the step's one word from a
-- fixed list (a way of capture, an onboarding step, a Max plan), '' when it has none.
CREATE TABLE funnel_counts (
  day TEXT NOT NULL,
  step TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  since_open INTEGER NOT NULL DEFAULT -1,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  version TEXT NOT NULL,
  language TEXT NOT NULL,
  count INTEGER NOT NULL CHECK (count > 0),
  PRIMARY KEY (day, step, detail, since_open, platform, version, language)
);

CREATE INDEX funnel_counts_step ON funnel_counts (step, day);
