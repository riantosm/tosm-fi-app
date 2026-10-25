package com.tosm.finance

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.tosm.finance.applock.AppLockPackage
import com.tosm.finance.walletrefresh.WalletRefreshPackage

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Modul native milik app (tidak di-autolink): kunci aplikasi (biometrik + PIN) dan
          // jadwal pembaruan notifikasi saldo (WorkManager).
          add(AppLockPackage())
          add(WalletRefreshPackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
