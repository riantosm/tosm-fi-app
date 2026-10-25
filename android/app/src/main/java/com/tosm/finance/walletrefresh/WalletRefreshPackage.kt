package com.tosm.finance.walletrefresh

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

/** Didaftarkan manual di MainApplication (modul milik app, bukan library yang di-autolink). */
class WalletRefreshPackage : BaseReactPackage() {

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
      if (name == WalletRefreshModule.NAME) WalletRefreshModule(reactContext) else null

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    mapOf(
        WalletRefreshModule.NAME to
            ReactModuleInfo(
                name = WalletRefreshModule.NAME,
                className = WalletRefreshModule.NAME,
                canOverrideExistingModule = false,
                needsEagerInit = false,
                isCxxModule = false,
                isTurboModule = true,
            )
    )
  }
}
