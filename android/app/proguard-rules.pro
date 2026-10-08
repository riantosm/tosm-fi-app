# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# react-native-config: Class.forName("<namespace>.BuildConfig"). Pakai NAMESPACE di build.gradle,
# bukan applicationId. Tanpa ini Config di JS = {} (API_BASE_URL kosong).
-keep class com.tosm.finance.BuildConfig { *; }

# Nitro (react-native-vision-camera v5, nitro-image, nitro-modules): objek Hybrid dipanggil dari
# C++ lewat JNI. Hanya class Spec/factory yang ber-@Keep; implementasi (sesi kamera, output foto,
# view pratinjau) tidak. Keep seluruh paket supaya kamera aman tanpa bergantung pada heuristik R8.
-keep class com.margelo.nitro.** { *; }

# Fresco (pemuat gambar bawaan RN) membuat memory pool & codec lewat Class.forName + getConstructor.
# Tanpa ini semua <Image> kosong di release tanpa error apa pun (pool gagal dibuat, gambar tak
# pernah di-decode). Target refleksi diambil dari PoolFactory, Fresco, NativeImageTranscoderFactory,
# ImagePipelineFactory, AnimatedFactoryProvider, WebpSupportStatus (Fresco 3.7).
-keep class com.facebook.imagepipeline.memory.*MemoryChunkPool { public <init>(...); }
-keep class com.facebook.imagepipeline.nativecode.** { *; }
-keep class com.facebook.animated.** { *; }
-keep class com.facebook.fresco.animation.factory.** { *; }
-keep class com.facebook.webpsupport.** { *; }
