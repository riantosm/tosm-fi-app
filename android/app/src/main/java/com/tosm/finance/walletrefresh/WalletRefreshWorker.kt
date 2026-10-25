package com.tosm.finance.walletrefresh

import android.content.Context
import androidx.work.Worker
import androidx.work.WorkerParameters
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import com.facebook.react.jstasks.HeadlessJsTaskContext
import com.facebook.react.jstasks.HeadlessJsTaskEventListener
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Dijalankan WorkManager (periodik, butuh koneksi): menjalankan task headless JS
 * `WalletNotificationRefresh` yang memuat ulang saldo dompet lalu memperbarui notifikasi saldo.
 *
 * Task dimulai langsung lewat [HeadlessJsTaskContext] (bukan HeadlessJsTaskService), karena
 * Android 8+ melarang memulai service dari latar belakang. Kalau React belum berjalan (app
 * sudah ditutup), ReactHost dinyalakan tanpa activity, sama seperti HeadlessJsTaskService.
 */
class WalletRefreshWorker(context: Context, params: WorkerParameters) : Worker(context, params) {

  override fun doWork(): Result {
    val reactHost = (applicationContext as? ReactApplication)?.reactHost ?: return Result.failure()
    val done = CountDownLatch(1)

    UiThreadUtil.runOnUiThread {
      val current = reactHost.currentReactContext
      if (current != null) {
        startTask(current, done)
        return@runOnUiThread
      }
      val started = AtomicBoolean(false)
      reactHost.addReactInstanceEventListener(
          object : ReactInstanceEventListener {
            override fun onReactContextInitialized(context: ReactContext) {
              if (!started.compareAndSet(false, true)) {
                return
              }
              // Dilepas setelah iterasi listener selesai (hindari ubah daftar saat diiterasi).
              UiThreadUtil.runOnUiThread { reactHost.removeReactInstanceEventListener(this) }
              startTask(context, done)
            }
          }
      )
      reactHost.start()
    }

    val finished = done.await(TASK_TIMEOUT_MS + WAIT_MARGIN_MS, TimeUnit.MILLISECONDS)
    return if (finished) Result.success() else Result.retry()
  }

  private fun startTask(context: ReactContext, done: CountDownLatch) {
    UiThreadUtil.runOnUiThread {
      val tasks = HeadlessJsTaskContext.getInstance(context)
      var taskId = -1
      val listener =
          object : HeadlessJsTaskEventListener {
            override fun onHeadlessJsTaskStart(taskId: Int) = Unit

            override fun onHeadlessJsTaskFinish(finishedId: Int) {
              if (finishedId == taskId) {
                UiThreadUtil.runOnUiThread { tasks.removeTaskEventListener(this) }
                done.countDown()
              }
            }
          }
      tasks.addTaskEventListener(listener)
      try {
        // Listener selesai selalu dipanggil lewat post ke UI thread, jadi taskId sudah terisi.
        taskId =
            tasks.startTask(
                HeadlessJsTaskConfig(TASK_KEY, Arguments.createMap(), TASK_TIMEOUT_MS, true)
            )
      } catch (error: Exception) {
        tasks.removeTaskEventListener(listener)
        done.countDown()
      }
    }
  }

  companion object {
    /** Nama task di `AppRegistry.registerHeadlessTask` (index.js). */
    const val TASK_KEY = "WalletNotificationRefresh"
    private const val TASK_TIMEOUT_MS = 60_000L
    private const val WAIT_MARGIN_MS = 30_000L
  }
}
