package ai.sixpm.surfaces

import ai.sixpm.surfaces.KeepRunning.Page
import android.content.ActivityNotFoundException
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class KeepRunningTest {
  @Test
  fun `every phone gets the battery list, then 6pm's own page`() {
    assertEquals(listOf(Page.BatteryList, Page.AppDetails), KeepRunning.pages("Google"))
  }

  @Test
  fun `the makers that stop apps get their own page first, under any of their brands`() {
    for (maker in listOf("Xiaomi", "Redmi", "POCO", "OPPO", "realme", "vivo", "iQOO", "HUAWEI", "HONOR")) {
      val pages = KeepRunning.pages(maker)
      assertTrue(maker, pages.first() is Page.Maker)
      assertEquals(maker, listOf(Page.BatteryList, Page.AppDetails), pages.takeLast(2))
    }
  }

  @Test
  fun `a maker page that is missing or closed falls back to the battery list`() {
    val tried = mutableListOf<Page>()
    val opened =
      KeepRunning.open(KeepRunning.pages("Xiaomi")) { page ->
        tried += page
        if (page is Page.Maker) throw ActivityNotFoundException()
      }
    assertEquals(1, opened)
    assertEquals(Page.BatteryList, tried.last())
  }

  @Test
  fun `6pm's own page is the last resort, and nothing opening is said`() {
    val pages = KeepRunning.pages("vivo")
    val opened = KeepRunning.open(pages) { page -> if (page != Page.AppDetails) throw SecurityException() }
    assertEquals(pages.size - 1, opened)
    assertEquals(-1, KeepRunning.open(KeepRunning.pages("Google")) { throw ActivityNotFoundException() })
  }
}
