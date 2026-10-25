package com.tosm.finance.walletrefresh

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.work.Constraints
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager

/**
 * Build debug saja: jalankan [WalletRefreshWorker] sekali sekarang (syarat sama: butuh koneksi).
 * WorkManager menolak worker periodik yang dipaksa sebelum jadwalnya, jadi uji alur latar belakang
 * (app mati, Hemat daya aktif) lewat ini:
 * `adb shell am broadcast -n com.tosm.finance.debug/com.tosm.finance.walletrefresh.DebugWalletRefreshReceiver`
 */
class DebugWalletRefreshReceiver : BroadcastReceiver() {

  override fun onReceive(context: Context, intent: Intent) {
    val request =
        OneTimeWorkRequestBuilder<WalletRefreshWorker>()
            .setConstraints(
                Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()
            )
            .build()
    WorkManager.getInstance(context).enqueue(request)
  }
}
