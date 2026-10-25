package com.tosm.finance.walletrefresh

import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.PowerManager
import android.provider.Settings
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.tosm.finance.specs.NativeWalletRefreshSpec
import java.util.concurrent.TimeUnit

/**
 * Jadwal pembaruan notifikasi saldo di latar belakang (WorkManager, periodik + butuh koneksi).
 * Pekerjaannya ada di [WalletRefreshWorker].
 */
class WalletRefreshModule(reactContext: ReactApplicationContext) :
    NativeWalletRefreshSpec(reactContext) {

  override fun getName() = NAME

  override fun schedulePeriodicRefresh(intervalMinutes: Double, promise: Promise) {
    try {
      // Batas minimum WorkManager 15 menit.
      val minutes = intervalMinutes.toLong().coerceAtLeast(15L)
      val request =
          PeriodicWorkRequestBuilder<WalletRefreshWorker>(minutes, TimeUnit.MINUTES)
              .setConstraints(
                  Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()
              )
              .build()
      // KEEP: dipanggil setiap app dibuka tanpa mereset jadwal yang sudah berjalan.
      WorkManager.getInstance(reactApplicationContext)
          .enqueueUniquePeriodicWork(WORK_NAME, ExistingPeriodicWorkPolicy.KEEP, request)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("schedule_failed", error)
    }
  }

  override fun cancelPeriodicRefresh(promise: Promise) {
    try {
      WorkManager.getInstance(reactApplicationContext).cancelUniqueWork(WORK_NAME)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("cancel_failed", error)
    }
  }

  override fun isIgnoringBatteryOptimizations(promise: Promise) {
    val power = reactApplicationContext.getSystemService(Context.POWER_SERVICE) as PowerManager
    promise.resolve(power.isIgnoringBatteryOptimizations(reactApplicationContext.packageName))
  }

  /**
   * Hemat daya / Doze menahan job dan memblokir internet app di latar belakang, kecuali app yang
   * dikecualikan dari optimasi baterai. Dialog sistem ini yang meminta persetujuan user.
   */
  @SuppressLint("BatteryLife")
  override fun requestIgnoreBatteryOptimizations(promise: Promise) {
    val context = reactApplicationContext
    val activity = context.currentActivity
    val request =
        Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
            .setData(Uri.parse("package:${context.packageName}"))
    // Cadangan: daftar optimasi baterai (beberapa ROM tidak punya dialog di atas).
    val fallback = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
    // startActivity + tangkap ActivityNotFoundException (bukan resolveActivity: Android 11+
    // menyaring hasilnya tanpa <queries>).
    for (intent in listOf(request, fallback)) {
      try {
        if (activity != null) {
          activity.startActivity(intent)
        } else {
          context.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        }
        promise.resolve(null)
        return
      } catch (error: ActivityNotFoundException) {
        // Coba cadangan.
      } catch (error: Exception) {
        promise.reject("request_failed", error)
        return
      }
    }
    promise.reject("unavailable", "Battery optimization settings not available")
  }

  companion object {
    const val NAME = "NativeWalletRefresh"
    private const val WORK_NAME = "wallet-notification-refresh"
  }
}
