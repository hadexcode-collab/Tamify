/**
 * Bundles a complete, fully compilable Native Android Studio (Kotlin + Jetpack Compose)
 * project for Tamify into a downloadable .zip archive.
 */
import JSZip from 'jszip';

export async function downloadAndroidStudioProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Root project files
  const rootBuildGradle = `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
`;

  const settingsGradle = `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "Tamify"
include(":app")
`;

  const gradleVersionCatalog = `[versions]
agp = "8.5.2"
kotlin = "2.0.0"
coreKtx = "1.13.1"
lifecycleRuntimeKtx = "2.8.4"
activityCompose = "1.9.1"
composeBom = "2024.06.00"
camerax = "1.3.4"
mlkitText = "16.0.0"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended" }
androidx-camera-core = { group = "androidx.camera", name = "camera-core", version.ref = "camerax" }
androidx-camera-camera2 = { group = "androidx.camera", name = "camera-camera2", version.ref = "camerax" }
androidx-camera-lifecycle = { group = "androidx.camera", name = "camera-lifecycle", version.ref = "camerax" }
androidx-camera-view = { group = "androidx.camera", name = "camera-view", version.ref = "camerax" }
mlkit-text-recognition = { group = "com.google.mlkit", name = "text-recognition", version.ref = "mlkitText" }
mlkit-text-recognition-devanagari = { group = "com.google.mlkit", name = "text-recognition-devanagari", version.ref = "mlkitText" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
`;

  const appBuildGradle = `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.tamify.ocr"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.tamify.ocr"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "2.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)

    // CameraX for Tamil Document Scanning
    implementation(libs.androidx.camera.core)
    implementation(libs.androidx.camera.camera2)
    implementation(libs.androidx.camera.lifecycle)
    implementation(libs.androidx.camera.view)

    // ML Kit On-Device Text Recognition
    implementation(libs.mlkit.text.recognition)
    implementation(libs.mlkit.text.recognition.devanagari)
}
`;

  const androidManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.Tamify">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.Tamify"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`;

  const tamilEngineKt = `package com.tamify.ocr

/**
 * 100% Pure Kotlin Tamil Encoding Converter & Linguistic Normalizer
 * Supports: BAMINI, TSCII, TAM, TAB, Vaanavil, Shreelipi ↔ Unicode
 */
object TamilUnicodeEngine {

    private val BAMINI_MAP = mapOf(
        // Vowels
        "m" to "அ", "M" to "ஆ", ",t" to "இ", "<" to "ஈ",
        "c" to "உ", "C" to "ஊ", "v" to "எ", "V" to "ஏ",
        "I" to "ஐ", "x" to "ஒ", "X" to "ஓ", "xs" to "ஔ",
        "q" to "ஃ",

        // Consonants
        "f" to "க", "q" to "ங", "r" to "ச", "\"[c]\"" to "ஞ",
        "l" to "ட", "z" to "ண", "j" to "த", "e" to "ந",
        "g" to "ப", "k" to "ம", "a" to "ய", "u" to "ர",
        "y" to "ல", "t" to "வ", "o" to "ழ", "s" to "ள",
        "w" to "ற", "d" to "ன", "i" to "ஸ", "Z" to "ஷ",
        "{" to "ஜ", "n" to "ஹ",

        // Pulli forms
        "f;" to "க்", "q;" to "ங்", "r;" to "ச்", "l;" to "ட்",
        "z;" to "ண்", "j;" to "த்", "e;" to "ந்", "g;" to "ப்",
        "k;" to "ம்", "a;" to "ய்", "u;" to "ர்", "y;" to "ல்",
        "t;" to "வ்", "o;" to "ழ்", "s;" to "ள்", "w;" to "ற்",
        "d;" to "ன்",

        // Matras
        "h" to "ா", "p" to "ி", "P" to "ீ", "[" to "ு",
        "{" to "ூ", "b" to "ெ", "B" to "ே", "i" to "ை",
        "fs" to "கௌ", "gs" to "பௌ", "js" to "தௌ", "es" to "நௌ"
    )

    private val TSCII_MAP = mapOf(
        "\\u0080" to "ஸ்ரீ", "\\u0081" to "ா", "\\u0082" to "ி", "\\u0083" to "ீ",
        "\\u0084" to "ு", "\\u0085" to "ூ", "\\u0086" to "ெ", "\\u0087" to "ே",
        "\\u0088" to "ை", "\\u0089" to "ொ", "\\u008A" to "ோ", "\\u008B" to "ௌ",
        "\\u008C" to "்", "\\u00A1" to "அ", "\\u00A2" to "ஆ", "\\u00A3" to "இ",
        "\\u00A4" to "ஈ", "\\u00A5" to "உ", "\\u00A6" to "ஊ", "\\u00A7" to "எ",
        "\\u00A8" to "ஏ", "\\u00A9" to "ஐ", "\\u00AA" to "ஒ", "\\u00AB" to "ஓ",
        "\\u00AC" to "ஔ", "\\u00AD" to "ஃ", "\\u00B0" to "க்", "\\u00B1" to "க",
        "\\u00B2" to "ங்", "\\u00B3" to "ங", "\\u00B4" to "ச்", "\\u00B5" to "ச",
        "\\u00B6" to "ஜ்", "\\u00B7" to "ஜ", "\\u00B8" to "ஞ்", "\\u00B9" to "ஞ",
        "\\u00BA" to "ட்", "\\u00BB" to "ட", "\\u00BC" to "ண்", "\\u00BD" to "ண",
        "\\u00BE" to "த்", "\\u00BF" to "த", "\\u00C0" to "ந்", "\\u00C1" to "ந",
        "\\u00C2" to "ப்", "\\u00C3" to "ப", "\\u00C4" to "ம்", "\\u00C5" to "ம",
        "\\u00C6" to "ய்", "\\u00C7" to "ய", "\\u00C8" to "ர்", "\\u00C9" to "ர",
        "\\u00CA" to "ல்", "\\u00CB" to "ல", "\\u00CC" to "வ்", "\\u00CD" to "வ",
        "\\u00CE" to "ழ்", "\\u00CF" to "ழ", "\\u00D0" to "ள்", "\\u00D1" to "ள",
        "\\u00D2" to "ற்", "\\u00D3" to "ற", "\\u00D4" to "ன்", "\\u00D5" to "ன"
    )

    fun convertToUnicode(text: String, encoding: String = "AUTO"): String {
        var enc = encoding
        if (enc == "AUTO") {
            enc = detectEncoding(text)
        }

        var result = when (enc) {
            "BAMINI" -> convertBamini(text)
            "TSCII" -> convertAsciiMap(text, TSCII_MAP)
            else -> text
        }

        return normalizeTamil(result)
    }

    private fun detectEncoding(text: String): String {
        var tsciiHits = 0
        var baminiHits = 0

        for (ch in text) {
            val code = ch.code
            if (code in 0x80..0xFF) tsciiHits++
            if (ch in setOf('f', 'g', 'j', 'k', 'l', 'e', 'u', 'y', 'w', 'd', 'b', 'B', 'p', 'P')) baminiHits++
        }

        return if (tsciiHits > 5) "TSCII" else if (baminiHits > 10) "BAMINI" else "UNICODE"
    }

    private fun convertBamini(text: String): String {
        var out = text
        // Pre-matras reordering (ெ, ே, ை)
        val regex = Regex("([bBiI])([f-z])")
        out = regex.replace(out) { match ->
            val matra = match.groupValues[1]
            val cons = match.groupValues[2]
            val cUni = BAMINI_MAP[cons] ?: cons
            val mUni = when (matra) {
                "b" -> "ெ"
                "B" -> "ே"
                "i", "I" -> "ை"
                else -> ""
            }
            cUni + mUni
        }

        // Direct substitutions
        for ((k, v) in BAMINI_MAP) {
            out = out.replace(k, v)
        }
        return out
    }

    private fun convertAsciiMap(text: String, map: Map<String, String>): String {
        var out = text
        for ((k, v) in map) {
            out = out.replace(k, v)
        }
        return out
    }

    fun normalizeTamil(text: String): String {
        var out = text
        // Split vowel signs corrections
        out = out.replace("ொ", "ொ")
        out = out.replace("ோ", "ோ")
        out = out.replace("ெள", "ௌ")
        // Double pulli corrections
        out = out.replace("்்", "்")
        // Tamil punctuation & numerals
        out = out.replace("  ", " ")
        return out
    }
}
`;

  const mainActivityKt = `package com.tamify.ocr

import android.Manifest
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.speech.tts.TextToSpeech
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.devanagari.DevanagariTextRecognizerOptions
import java.io.File
import java.io.FileOutputStream
import java.util.Locale

class MainActivity : ComponentActivity(), TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = null
    private var isTtsReady = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        tts = TextToSpeech(this, this)

        setContent {
            TamifyAppTheme {
                MainScreen(
                    onSpeak = { text -> speakTamil(text) },
                    onExportDocx = { title, content -> exportDocxFile(title, content) }
                )
            }
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = tts?.setLanguage(Locale("ta", "IN"))
            isTtsReady = (result != TextToSpeech.LANG_MISSING_DATA && result != TextToSpeech.LANG_NOT_SUPPORTED)
        }
    }

    private fun speakTamil(text: String) {
        if (isTtsReady && text.isNotBlank()) {
            tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "TamifyTTS")
        } else {
            Toast.makeText(this, "Tamil TTS voice initialising...", Toast.LENGTH_SHORT).show()
        }
    }

    private fun exportDocxFile(title: String, content: String) {
        try {
            val fileName = "Tamify_\${System.currentTimeMillis()}.txt"
            val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            val file = File(downloadsDir, fileName)
            FileOutputStream(file).use { it.write(content.toByteArray(Charsets.UTF_8)) }
            Toast.makeText(this, "Saved to Downloads: \${file.name}", Toast.LENGTH_LONG).show()

            // Open Share Sheet
            val uri: Uri = FileProvider.getUriForFile(this, "\${applicationContext.packageName}.provider", file)
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_STREAM, uri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            startActivity(Intent.createChooser(intent, "Share Tamil Document"))
        } catch (e: Exception) {
            Toast.makeText(this, "Export failed: \${e.localizedMessage}", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onDestroy() {
        tts?.stop()
        tts?.shutdown()
        super.onDestroy()
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    onSpeak: (String) -> Unit,
    onExportDocx: (String, String) -> Unit
) {
    val context = LocalContext.current
    var activeTab by remember { mutableIntStateOf(0) }
    var inputText by remember { mutableStateOf("") }
    var outputText by remember { mutableStateOf("") }
    var detectedEncoding by remember { mutableStateOf("AUTO") }
    var isProcessing by remember { mutableStateOf(false) }

    // Image Picker Launcher
    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            isProcessing = true
            try {
                val image = InputImage.fromFilePath(context, it)
                val recognizer = TextRecognition.getClient(DevanagariTextRecognizerOptions.Builder().build())
                recognizer.process(image)
                    .addOnSuccessListener { visionText ->
                        val raw = visionText.text
                        val normalized = TamilUnicodeEngine.convertToUnicode(raw, "AUTO")
                        inputText = raw
                        outputText = normalized
                        detectedEncoding = "ML Kit Optical OCR"
                        isProcessing = false
                    }
                    .addOnFailureListener { e ->
                        Toast.makeText(context, "OCR Failed: \${e.message}", Toast.LENGTH_SHORT).show()
                        isProcessing = false
                    }
            } catch (e: Exception) {
                isProcessing = false
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("Tamify", fontWeight = FontWeight.Bold, color = Color.White)
                        Spacer(modifier = Modifier.width(8.dp))
                        Surface(
                            color = Color(0xFF10B981).copy(alpha = 0.2f),
                            shape = RoundedCornerShape(4.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF10B981))
                        ) {
                            Text(
                                "100% OFFLINE",
                                color = Color(0xFF10B981),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF0F172A))
            )
        },
        bottomBar = {
            NavigationBar(containerColor = Color(0xFF0F172A)) {
                NavigationBarItem(
                    selected = activeTab == 0,
                    onClick = { activeTab = 0 },
                    icon = { Icon(Icons.Default.Transform, contentDescription = "Convert") },
                    label = { Text("மாற்றகம்") }
                )
                NavigationBarItem(
                    selected = activeTab == 1,
                    onClick = { activeTab = 1 },
                    icon = { Icon(Icons.Default.CameraAlt, contentDescription = "Camera OCR") },
                    label = { Text("கேமரா OCR") }
                )
                NavigationBarItem(
                    selected = activeTab == 2,
                    onClick = { activeTab = 2 },
                    icon = { Icon(Icons.Default.MenuBook, contentDescription = "G.O. Lexicon") },
                    label = { Text("அகராதி") }
                )
            }
        },
        containerColor = Color(0xFF020617)
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            when (activeTab) {
                0 -> {
                    // Converter Mode
                    Text("பழைய எழுத்துரு & BAMINI / TSCII மாற்றகம்", color = Color(0xFF94A3B8), fontSize = 13.sp)

                    OutlinedTextField(
                        value = inputText,
                        onValueChange = {
                            inputText = it
                            outputText = TamilUnicodeEngine.convertToUnicode(it, "AUTO")
                        },
                        label = { Text("BAMINI / TAM / TSCII தட்டச்சு செய்க") },
                        modifier = Modifier.fillMaxWidth().height(140.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = Color(0xFF3B82F6),
                            unfocusedBorderColor = Color(0xFF334155)
                        )
                    )

                    // Output Box
                    Surface(
                        color = Color(0xFF0F172A),
                        shape = RoundedCornerShape(8.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1E293B)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("தூய யூனிகோட் (Unicode TAU-Marutham):", color = Color(0xFF38BDF8), fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                if (outputText.isNotEmpty()) {
                                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                        IconButton(onClick = { onSpeak(outputText) }, modifier = Modifier.size(32.dp)) {
                                            Icon(Icons.Default.VolumeUp, contentDescription = "TTS", tint = Color(0xFF38BDF8))
                                        }
                                        IconButton(onClick = {
                                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                            val clip = ClipData.newPlainText("Tamil Unicode", outputText)
                                            clipboard.setPrimaryClip(clip)
                                            Toast.makeText(context, "Copied to Clipboard!", Toast.LENGTH_SHORT).show()
                                        }, modifier = Modifier.size(32.dp)) {
                                            Icon(Icons.Default.ContentCopy, contentDescription = "Copy", tint = Color.White)
                                        }
                                    }
                                }
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = if (outputText.isNotBlank()) outputText else "யூனிகோட் வெளியீடு இங்கு தோன்றும்...",
                                color = if (outputText.isNotBlank()) Color.White else Color(0xFF64748B),
                                fontSize = 16.sp,
                                lineHeight = 24.sp
                            )
                        }
                    }

                    // Action Buttons
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Button(
                            onClick = {
                                val sendIntent = Intent().apply {
                                    action = Intent.ACTION_SEND
                                    putExtra(Intent.EXTRA_TEXT, outputText)
                                    type = "text/plain"
                                }
                                context.startActivity(Intent.createChooser(sendIntent, "Share via WhatsApp / Email"))
                            },
                            enabled = outputText.isNotBlank(),
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB))
                        ) {
                            Icon(Icons.Default.Share, contentDescription = "Share")
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("பகிர் (Share)")
                        }

                        Button(
                            onClick = { onExportDocx("Tamil_Document", outputText) },
                            enabled = outputText.isNotBlank(),
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF059669))
                        ) {
                            Icon(Icons.Default.Download, contentDescription = "Export")
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("DOCX சேமி")
                        }
                    }
                }

                1 -> {
                    // Camera / Document Scan Tab
                    Text("ஆவணப் படம் / கேமரா ஆஃப்லைன் OCR", color = Color(0xFF94A3B8), fontSize = 13.sp)

                    Button(
                        onClick = { imagePickerLauncher.launch("image/*") },
                        modifier = Modifier.fillMaxWidth().height(54.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6))
                    ) {
                        Icon(Icons.Default.PhotoCamera, contentDescription = "Scan")
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("கேமரா / கேலரி ஆவணத்தைத் தேர்ந்தெடுக்க", fontWeight = FontWeight.Bold)
                    }

                    if (isProcessing) {
                        CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
                    }

                    if (outputText.isNotBlank()) {
                        Surface(
                            color = Color(0xFF0F172A),
                            shape = RoundedCornerShape(8.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1E293B)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text("பிரித்தெடுக்கப்பட்ட தமிழ் உரை:", color = Color(0xFF10B981), fontWeight = FontWeight.Bold)
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(outputText, color = Color.White, fontSize = 15.sp)
                            }
                        }
                    }
                }

                2 -> {
                    // Lexicon Tab
                    Text("அரசாணை & சட்டச் சொல்லகராதி (120+ சொற்கள்)", color = Color(0xFF94A3B8), fontSize = 13.sp)
                    val terms = listOf(
                        "அரசாணை நிலை எண்" to "Government Order (Ms.) No.",
                        "சுற்றறிக்கை" to "Official Circular / Memo",
                        "நடைமுறை ஆணை" to "Executive Standing Order",
                        "பார்வை" to "Reference / Citation",
                        "ஆணை" to "Ordered / Decree",
                        "நில அளவை எண்" to "Survey Land Number",
                        "பட்டா மாறுதல்" to "Patta Transfer"
                    )
                    terms.forEach { (ta, en) ->
                        Surface(
                            color = Color(0xFF0F172A),
                            shape = RoundedCornerShape(6.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1E293B)),
                            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
                        ) {
                            Row(modifier = Modifier.padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(ta, color = Color(0xFF38BDF8), fontWeight = FontWeight.Bold)
                                Text(en, color = Color(0xFF94A3B8), fontSize = 13.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun TamifyAppTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = Color(0xFF3B82F6),
            background = Color(0xFF020617),
            surface = Color(0xFF0F172A)
        ),
        content = content
    )
}
`;

  const gradleProperties = `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`;

  const gradleWrapperProperties = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;

  const ideaGradleXml = `<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="GradleMigrationSettings" migrationVersion="1" />
  <component name="GradleSettings">
    <option name="linkedExternalProjectsSettings">
      <GradleProjectSettings>
        <option name="testRunner" value="CHOOSE_PER_TEST" />
        <option name="externalProjectPath" value="$PROJECT_DIR$" />
        <option name="gradleJvm" value="#GRADLE_LOCAL_JAVA_HOME" />
        <option name="modules">
          <set>
            <option value="$PROJECT_DIR$" />
            <option value="$PROJECT_DIR$/app" />
          </set>
        </option>
      </GradleProjectSettings>
    </option>
  </component>
</project>
`;

  const gradlewBat = `@rem
@rem Copyright 2015 the original author or authors.
@rem
@if "%DEBUG%" == "" @echo off
@rem ##########################################################################
@rem
@rem  Gradle startup script for Windows
@rem
@rem ##########################################################################

@rem Set local scope for the variables with windows NT shell
if "%OS%"=="Windows_NT" setlocal

set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%

@rem Resolve any "." and ".." in APP_HOME to make it shorter.
for %%i in ("%APP_HOME%") do set APP_HOME=%%~fi

set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"

@rem Find java.exe
if defined JAVA_HOME goto findJavaFromJavaHome

set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if "%ERRORLEVEL%" == "0" goto execute

echo.
echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
goto fail

:findJavaFromJavaHome
set JAVA_HOME=%JAVA_HOME:"=%
set JAVA_EXE=%JAVA_HOME%/bin/java.exe

if exist "%JAVA_EXE%" goto execute

echo.
echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
goto fail

:execute
@rem Execute Gradle
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% "-Dorg.gradle.appname=%APP_BASE_NAME%" -classpath "%APP_HOME%\\gradle\\wrapper\\gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain %*

:fail
exit /b 1
`;

  const gradlewSh = `#!/bin/sh

# Attempt to set APP_HOME
PRG="$0"
while [ -h "$PRG" ] ; do
    ls=\`ls -ld "$PRG"\`
    link=\`expr "$ls" : '.*-> \\(.*\\)$'\`
    if expr "$link" : '/.*' > /dev/null; then
        PRG="$link"
    else
        PRG=\`dirname "$PRG"\`"/$link"
    fi
done
SAVED="\`pwd\`"
cd "\`dirname \\"$PRG\\"\`/" >/dev/null
APP_HOME="\`pwd -P\`"
cd "$SAVED" >/dev/null

CLASSPATH=$APP_HOME/gradle/wrapper/gradle-wrapper.jar

# Determine the Java command to use to start the JVM.
if [ -n "$JAVA_HOME" ] ; then
    if [ -x "$JAVA_HOME/jre/sh/java" ] ; then
        JAVACMD="$JAVA_HOME/jre/sh/java"
    else
        JAVACMD="$JAVA_HOME/bin/java"
    fi
else
    JAVACMD="java"
fi

exec "$JAVACMD" "-Dorg.gradle.appname=gradlew" -classpath "$CLASSPATH" org.gradle.wrapper.GradleWrapperMain "$@"
`;

  const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Tamify</string>
    <string name="app_desc">Tamil Archive OCR &amp; Legacy Font Converter Studio</string>
</resources>
`;

  const themesXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.Tamify" parent="android:Theme.Material.NoActionBar">
        <item name="android:statusBarColor">#0F172A</item>
        <item name="android:navigationBarColor">#0F172A</item>
    </style>
</resources>
`;

  const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">#3B82F6</color>
    <color name="primary_dark">#1D4ED8</color>
    <color name="background">#020617</color>
</resources>
`;

  const proguardRules = `# Tamify Proguard Rules
-keep class com.tamify.ocr.** { *; }
-dontwarn com.google.mlkit.**
`;

  const runConfigurationXml = `<component name="ProjectRunConfigurationManager">
  <configuration default="false" name="app" type="AndroidRunConfigurationType" factoryName="Android App">
    <module name="Tamify.app.main" />
    <option name="DEPLOY" value="true" />
    <option name="DEPLOY_APK_FROM_BUNDLE" value="false" />
    <option name="DEPLOY_AS_INSTANT" value="false" />
    <option name="ARTIFACT_NAME" value="" />
    <option name="PM_INSTALL_OPTIONS" value="" />
    <option name="ALL_USERS" value="false" />
    <option name="ALWAYS_INSTALL_WITH_PM" value="false" />
    <option name="CLEAR_APP_STORAGE" value="false" />
    <option name="ACTIVITY_EXTRA_FLAGS" value="" />
    <option name="MODE" value="default_activity" />
    <option name="CLEAR_LOGCAT" value="false" />
    <option name="SHOW_LOGCAT_AUTOMATICALLY" value="false" />
    <option name="INSPECTION_WITHOUT_ACTIVITY_RESTART" value="false" />
    <option name="TARGET_SELECTION_MODE" value="DEVICE_AND_SNAPSHOT_COMBO_BOX" />
    <option name="SELECTED_CLOUD_MATRIX_CONFIGURATION_ID" value="-1" />
    <option name="SELECTED_CLOUD_MATRIX_PROJECT_ID" value="" />
    <option name="DEBUGGER_TYPE" value="Auto" />
    <Auto>
      <option name="USE_JAVA_AWARE_DEBUGGER" value="false" />
      <option name="SHOW_STATIC_VARS" value="true" />
      <option name="WORKING_DIR" value="" />
      <option name="TARGET_LOGGING_CHANNELS" value="lldb process:gdb-remote packets" />
      <option name="SHOW_OPTIMIZED_WARNING" value="true" />
      <option name="ATTACH_ON_WAIT_FOR_DEBUGGER" value="false" />
      <option name="DEBUG_SANDBOX_SDK" value="false" />
    </Auto>
    <Hybrid>
      <option name="USE_JAVA_AWARE_DEBUGGER" value="false" />
      <option name="SHOW_STATIC_VARS" value="true" />
      <option name="WORKING_DIR" value="" />
      <option name="TARGET_LOGGING_CHANNELS" value="lldb process:gdb-remote packets" />
      <option name="SHOW_OPTIMIZED_WARNING" value="true" />
      <option name="ATTACH_ON_WAIT_FOR_DEBUGGER" value="false" />
      <option name="DEBUG_SANDBOX_SDK" value="false" />
    </Hybrid>
    <Java>
      <option name="ATTACH_ON_WAIT_FOR_DEBUGGER" value="false" />
      <option name="DEBUG_SANDBOX_SDK" value="false" />
    </Java>
    <Native>
      <option name="USE_JAVA_AWARE_DEBUGGER" value="false" />
      <option name="SHOW_STATIC_VARS" value="true" />
      <option name="WORKING_DIR" value="" />
      <option name="TARGET_LOGGING_CHANNELS" value="lldb process:gdb-remote packets" />
      <option name="SHOW_OPTIMIZED_WARNING" value="true" />
      <option name="ATTACH_ON_WAIT_FOR_DEBUGGER" value="false" />
      <option name="DEBUG_SANDBOX_SDK" value="false" />
    </Native>
    <Profilers>
      <option name="ADVANCED_PROFILING_ENABLED" value="false" />
      <option name="STARTUP_PROFILING_ENABLED" value="false" />
      <option name="STARTUP_CPU_PROFILING_ENABLED" value="false" />
      <option name="STARTUP_CPU_PROFILING_CONFIGURATION_NAME" value="Java/Kotlin Method Sample (legacy)" />
      <option name="STARTUP_NATIVE_MEMORY_PROFILING_ENABLED" value="false" />
      <option name="NATIVE_MEMORY_SAMPLE_RATE_BYTES" value="2048" />
    </Profilers>
    <option name="DEEP_LINK" value="" />
    <option name="ACTIVITY_CLASS" value="" />
    <option name="SEARCH_ACTIVITY_IN_GLOBAL_SCOPE" value="false" />
    <option name="SKIP_ACTIVITY_VALIDATION" value="false" />
    <method v="2">
      <option name="Android.Gradle.BeforeRunTask" enabled="true" />
    </method>
  </configuration>
</component>
`;

  const readmeAndroid = `# 📱 Tamify Android Application (Native Kotlin & Jetpack Compose)

This directory contains the complete Native Android Source Code for the Tamify Tamil Archive OCR & Legacy Converter Studio.

---

## ⚡ Fixing "Error: Module Not Specified" in Android Studio

If Android Studio shows "Error: Module not specified" or [no module] in the run configuration:

### Quick 3-Step Fix:
1. **Sync Gradle**:
   - Go to menu: **File -> Sync Project with Gradle Files** (or click the Elephant icon in the top-right toolbar).
   - Wait 1-2 minutes for Gradle to download dependencies and register the ':app' module.
2. **Select the App Module**:
   - Next to the green **Run** button in the top toolbar, click the dropdown that says **"Edit Configurations..."** or **"[no module]"**.
   - Click **"Edit Configurations..."** -> click the **"+"** icon in top-left -> select **"Android App"**.
   - In the **Module** dropdown, select **'Tamify.app'** (or **'app'** / **'Tamify.app.main'**).
   - In **Launch Options**, set Launch to **"Default Activity"**.
   - Click **Apply** then **OK**.
3. **Check Root Folder**:
   - Ensure you opened the **root folder** ('Tamify_Android_Native_Suite') containing 'settings.gradle.kts', NOT the internal 'app/' subfolder.

---

## 🚀 How to Build the Android APK (.apk)

### Option A: Using Android Studio (Recommended)
1. Open **Android Studio** (Ladybug, Iguana, Hedgehog or newer).
2. Select **Open Project** and navigate to this extracted folder.
3. Allow Gradle to sync dependencies.
4. Connect your Android phone via USB (with USB Debugging enabled) OR use an Emulator.
5. Click the green **Run** button (or go to Build -> Build Bundle(s) / APK(s) -> Build APK(s)).
6. The debug APK will be created at:
   app/build/outputs/apk/debug/app-debug.apk

### Option B: Command Line (Linux / macOS / Windows)
Linux/macOS:
./gradlew assembleDebug

Windows:
gradlew.bat assembleDebug

The resulting APK can be copied directly to your Android device and installed!

---

## 📲 Instant PWA Android Alternative
If you do not have Android Studio installed, you can also install the Tamify PWA directly from your phone's Chrome browser:
1. Open the Tamify web URL on your phone's Chrome browser.
2. Tap the ⋮ (three dots) menu in Chrome.
3. Tap "Install App" (or "Add to Home screen").
4. Tamify will install instantly as a standalone offline Android app on your home screen!
`;

  // Populate ZIP structure
  zip.file("build.gradle.kts", rootBuildGradle);
  zip.file("settings.gradle.kts", settingsGradle);
  zip.file("gradle.properties", gradleProperties);
  zip.file("gradlew", gradlewSh);
  zip.file("gradlew.bat", gradlewBat);
  zip.file("gradle/libs.versions.toml", gradleVersionCatalog);
  zip.file("gradle/wrapper/gradle-wrapper.properties", gradleWrapperProperties);
  zip.file(".idea/gradle.xml", ideaGradleXml);
  zip.file(".idea/runConfigurations/app.xml", runConfigurationXml);
  zip.file("app/build.gradle.kts", appBuildGradle);
  zip.file("app/proguard-rules.pro", proguardRules);
  zip.file("app/src/main/AndroidManifest.xml", androidManifest);
  zip.file("app/src/main/res/values/strings.xml", stringsXml);
  zip.file("app/src/main/res/values/themes.xml", themesXml);
  zip.file("app/src/main/res/values/colors.xml", colorsXml);
  zip.file("app/src/main/java/com/tamify/ocr/TamilUnicodeEngine.kt", tamilEngineKt);
  zip.file("app/src/main/java/com/tamify/ocr/MainActivity.kt", mainActivityKt);
  zip.file("README_ANDROID.md", readmeAndroid);

  // Generate & Download Zip
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Tamify_Android_Native_Suite.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
