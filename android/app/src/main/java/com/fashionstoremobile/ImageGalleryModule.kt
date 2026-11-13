package com.fashionstoremobile

import android.app.Activity
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.util.Base64
import com.facebook.react.bridge.*
import java.io.ByteArrayOutputStream
import java.io.InputStream

class ImageGalleryModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var pickerPromise: Promise? = null

    companion object {
        private const val REQUEST_PICK_IMAGE = 4129
    }

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = "ImageGalleryPicker"

    @ReactMethod
    fun pickImageFromGallery(promise: Promise) {
        val currentActivity = reactContext.currentActivity
        if (currentActivity == null) {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity does not exist")
            return
        }

        if (pickerPromise != null) {
            pickerPromise?.reject("E_PREVIOUS_PICKER_PENDING", "Una selección previa sigue pendiente")
            pickerPromise = null
        }

        pickerPromise = promise

        try {
            val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                type = "image/*"
                addCategory(Intent.CATEGORY_OPENABLE)
            }
            currentActivity.startActivityForResult(
                Intent.createChooser(intent, "Selecciona el código QR de la galería"),
                REQUEST_PICK_IMAGE
            )
        } catch (e: Exception) {
            pickerPromise?.reject("E_FAILED_TO_OPEN_GALLERY", e.message, e)
            pickerPromise = null
        }
    }

    override fun onActivityResult(
        activity: Activity,
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        if (requestCode != REQUEST_PICK_IMAGE) return

        val promise = pickerPromise ?: return
        pickerPromise = null

        if (resultCode != Activity.RESULT_OK || data == null || data.data == null) {
            val result = Arguments.createMap().apply {
                putBoolean("cancelled", true)
            }
            promise.resolve(result)
            return
        }

        val imageUri: Uri = data.data!!

        try {
            val inputStream: InputStream? = reactContext.contentResolver.openInputStream(imageUri)
            val bitmap = BitmapFactory.decodeStream(inputStream)
            inputStream?.close()

            if (bitmap == null) {
                promise.reject("E_DECODE_FAILED", "No se pudo decodificar la imagen seleccionada")
                return
            }

            // Escalar razonablemente si la imagen de cámara es masiva (> 1024px) para optimizar memoria y base64
            val maxDimension = 1024
            val scale = if (bitmap.width > maxDimension || bitmap.height > maxDimension) {
                val ratio = maxDimension.toFloat() / Math.max(bitmap.width, bitmap.height)
                ratio
            } else 1.0f

            val targetBitmap = if (scale < 1.0f) {
                Bitmap.createScaledBitmap(
                    bitmap,
                    (bitmap.width * scale).toInt(),
                    (bitmap.height * scale).toInt(),
                    true
                )
            } else {
                bitmap
            }

            val outputStream = ByteArrayOutputStream()
            targetBitmap.compress(Bitmap.CompressFormat.PNG, 90, outputStream)
            val byteArray = outputStream.toByteArray()
            val base64String = Base64.encodeToString(byteArray, Base64.NO_WRAP)
            val dataUrl = "data:image/png;base64,$base64String"

            val result = Arguments.createMap().apply {
                putBoolean("cancelled", false)
                putString("dataUrl", dataUrl)
                putString("uri", imageUri.toString())
                putInt("width", targetBitmap.width)
                putInt("height", targetBitmap.height)
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("E_READ_FAILED", "Error leyendo la imagen: ${e.message}", e)
        }
    }

    override fun onNewIntent(intent: Intent) {}
}
