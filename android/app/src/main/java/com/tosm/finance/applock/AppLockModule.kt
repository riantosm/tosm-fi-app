package com.tosm.finance.applock

import android.os.Build
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_WEAK
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.UiThreadUtil
import com.tosm.finance.specs.NativeAppLockSpec
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.concurrent.atomic.AtomicBoolean
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec

/**
 * Kunci aplikasi (Android): BiometricPrompt sistem + hash PIN PBKDF2.
 * PIN tidak pernah disimpan; JS hanya menyimpan salt + hash hasil modul ini.
 */
class AppLockModule(reactContext: ReactApplicationContext) : NativeAppLockSpec(reactContext) {

  override fun getName() = NAME

  override fun getBiometricStatus(promise: Promise) {
    val status =
        when (BiometricManager.from(reactApplicationContext).canAuthenticate(BIOMETRIC_WEAK)) {
          BiometricManager.BIOMETRIC_SUCCESS -> "available"
          BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> "none_enrolled"
          else -> "unavailable"
        }
    promise.resolve(status)
  }

  override fun authenticate(
      title: String,
      subtitle: String,
      negativeText: String,
      promise: Promise,
  ) {
    val activity = reactApplicationContext.currentActivity as? FragmentActivity
    if (activity == null) {
      promise.resolve(RESULT_ERROR)
      return
    }
    // Callback BiometricPrompt bisa datang lebih dari sekali (error setelah sukses, dsb.).
    val settled = AtomicBoolean(false)
    val settle = { result: String ->
      if (settled.compareAndSet(false, true)) {
        promise.resolve(result)
      }
    }

    UiThreadUtil.runOnUiThread {
      try {
        val prompt =
            BiometricPrompt(
                activity,
                ContextCompat.getMainExecutor(activity),
                object : BiometricPrompt.AuthenticationCallback() {
                  override fun onAuthenticationSucceeded(
                      result: BiometricPrompt.AuthenticationResult
                  ) = settle(RESULT_SUCCESS)

                  override fun onAuthenticationError(errorCode: Int, errString: CharSequence) =
                      settle(
                          when (errorCode) {
                            BiometricPrompt.ERROR_NEGATIVE_BUTTON -> RESULT_FALLBACK
                            BiometricPrompt.ERROR_USER_CANCELED,
                            BiometricPrompt.ERROR_CANCELED -> RESULT_CANCEL
                            BiometricPrompt.ERROR_LOCKOUT,
                            BiometricPrompt.ERROR_LOCKOUT_PERMANENT -> RESULT_LOCKOUT
                            else -> RESULT_ERROR
                          }
                      )

                  // Sidik jari tidak dikenali: prompt tetap terbuka dan menampilkan pesannya sendiri.
                  override fun onAuthenticationFailed() = Unit
                },
            )
        val info =
            BiometricPrompt.PromptInfo.Builder()
                .setTitle(title)
                .setSubtitle(subtitle)
                .setNegativeButtonText(negativeText)
                .setAllowedAuthenticators(BIOMETRIC_WEAK)
                .setConfirmationRequired(false)
                .build()
        prompt.authenticate(info)
      } catch (error: Exception) {
        settle(RESULT_ERROR)
      }
    }
  }

  override fun generateSalt(promise: Promise) {
    val bytes = ByteArray(SALT_BYTES)
    SecureRandom().nextBytes(bytes)
    promise.resolve(bytes.toHex())
  }

  override fun hashPin(pin: String, salt: String, promise: Promise) {
    try {
      val algorithm = defaultAlgorithm()
      promise.resolve("${algorithm.tag}\$${pbkdf2(pin, salt, algorithm)}")
    } catch (error: Exception) {
      promise.reject("E_HASH", error)
    }
  }

  override fun verifyPin(pin: String, salt: String, hash: String, promise: Promise) {
    try {
      val tag = hash.substringBefore('$', "")
      val algorithm = Algorithm.entries.firstOrNull { it.tag == tag }
      if (algorithm == null) {
        promise.resolve(false)
        return
      }
      val expected = hash.substringAfter('$').toByteArray()
      val actual = pbkdf2(pin, salt, algorithm).toByteArray()
      promise.resolve(MessageDigest.isEqual(expected, actual))
    } catch (error: Exception) {
      promise.reject("E_VERIFY", error)
    }
  }

  private enum class Algorithm(val tag: String, val javaName: String) {
    SHA256("s256", "PBKDF2WithHmacSHA256"),
    SHA1("s1", "PBKDF2WithHmacSHA1"),
  }

  /** PBKDF2WithHmacSHA256 baru ada di API 26; minSdk app 24. */
  private fun defaultAlgorithm() =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) Algorithm.SHA256 else Algorithm.SHA1

  private fun pbkdf2(pin: String, salt: String, algorithm: Algorithm): String {
    val spec = PBEKeySpec(pin.toCharArray(), salt.toByteArray(), ITERATIONS, KEY_BITS)
    try {
      return SecretKeyFactory.getInstance(algorithm.javaName).generateSecret(spec).encoded.toHex()
    } finally {
      spec.clearPassword()
    }
  }

  private fun ByteArray.toHex() = joinToString("") { "%02x".format(it) }

  companion object {
    const val NAME = "NativeAppLock"
    private const val RESULT_SUCCESS = "success"
    private const val RESULT_FALLBACK = "fallback"
    private const val RESULT_CANCEL = "cancel"
    private const val RESULT_LOCKOUT = "lockout"
    private const val RESULT_ERROR = "error"
    private const val SALT_BYTES = 16
    private const val ITERATIONS = 120_000
    private const val KEY_BITS = 256
  }
}
