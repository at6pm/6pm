package ai.sixpm.surfaces

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class TestAlertTest {
  private val own = "app.at6pm"
  private val token = "7d9c2a44-6f1b-4a3e-8f55-0c1d2e3f4a5b"

  @Test
  fun `6pm's own notification on the test channel with a token is the test alert`() {
    assertTrue(TestAlert.recognises(own, own, TestAlert.CHANNEL, TestAlert.TAG, token))
  }

  @Test
  fun `another app is never taken for it, whatever channel, tag and token it uses`() {
    for (bank in listOf("com.mbmobile", "com.mservice.momotransfer", "app.at6pm.dev", "")) {
      assertFalse(TestAlert.recognises(own, bank, TestAlert.CHANNEL, TestAlert.TAG, token))
    }
    assertFalse(TestAlert.recognises(own, null, TestAlert.CHANNEL, TestAlert.TAG, token))
  }

  @Test
  fun `6pm's other notifications are still let go`() {
    // The close reminder, a caught payment, the first catch: other channels and tags.
    assertFalse(TestAlert.recognises(own, own, "close", null, null))
    assertFalse(TestAlert.recognises(own, own, "caught", "caught", null))
    assertFalse(TestAlert.recognises(own, own, "capture", "first-catch", token))
    assertFalse(TestAlert.recognises(own, own, TestAlert.CHANNEL, "caught", token))
    assertFalse(TestAlert.recognises(own, own, null, TestAlert.TAG, token))
  }

  @Test
  fun `one with no token is not read, since no screen could know it as its own`() {
    assertFalse(TestAlert.recognises(own, own, TestAlert.CHANNEL, TestAlert.TAG, null))
    assertFalse(TestAlert.recognises(own, own, TestAlert.CHANNEL, TestAlert.TAG, ""))
    assertFalse(TestAlert.recognises(own, own, TestAlert.CHANNEL, TestAlert.TAG, "  "))
  }
}
