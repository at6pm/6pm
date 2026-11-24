package ai.sixpm.surfaces

import java.util.Calendar
import org.junit.Assert.assertEquals
import org.junit.Test

class QuietAgainTest {
  private fun at(day: Int, hour: Int, minute: Int = 0): Long =
    Calendar.getInstance().apply {
      clear()
      set(2026, Calendar.NOVEMBER, day, hour, minute, 0)
    }.timeInMillis

  @Test
  fun `a catch moves the question to the third quiet day from now, at the same hour`() {
    // Placed for 09:00 on the 26th from a catch on the 23rd; a catch on the 25th moves it to the 28th.
    assertEquals(at(28, 9), CaptureNotices.quietAgainAt(at(26, 9), at(25, 14, 30)))
  }

  @Test
  fun `it never comes sooner than the app placed it`() {
    // Asked about a week ago, the app placed it on the 30th: a catch on the 24th leaves it there.
    assertEquals(at(30, 9), CaptureNotices.quietAgainAt(at(30, 9), at(24, 8)))
  }

  @Test
  fun `a catch late at night counts three days from that day`() {
    assertEquals(at(27, 9), CaptureNotices.quietAgainAt(at(25, 9), at(24, 23, 50)))
  }
}
