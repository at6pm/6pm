-- People who asked to join the Android closed test on Google Play, from the website. The email is
-- the Google account they use on the Play Store, trimmed and lowercased, and each is here once. The
-- founder adds them to the test's tester list by hand and sets `added_at` when done. Times are
-- ISO 8601 in UTC.
CREATE TABLE android_testers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  language TEXT NOT NULL CHECK (language IN ('en', 'vi')),
  created_at TEXT NOT NULL,
  added_at TEXT
);
