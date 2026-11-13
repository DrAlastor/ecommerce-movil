package com.fashionstoremobile

import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class ImageGalleryPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
        listOf(ImageGalleryModule(reactContext))

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<View, *>> =
        emptyList()
}
