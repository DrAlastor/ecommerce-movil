package com.fashionstoremobile

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          add(LocalNotificationPackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)

    // Crear canal de notificaciones de alta prioridad para Firebase Cloud Messaging (Android 8.0+)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val notificationManager = getSystemService(NotificationManager::class.java)
      val channel = NotificationChannel(
        "fashionstore_channel",
        "Fashion Store Notificaciones",
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "Notificaciones de compras, reservas y novedades de Fashion Store"
        enableVibration(true)
        enableLights(true)
      }
      notificationManager?.createNotificationChannel(channel)
    }
  }
}
