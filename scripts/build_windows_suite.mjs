import fs from "node:fs";
import path from "node:path";
import stream from "node:stream/promises";
import zlib from "node:zlib";
import archiver from "archiver";
import { execSync } from "node:child_process";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const stubPath = path.join(rootDir, "node_modules", "caxa", "stubs", "stub--win32--x64");
const publicDownloadDir = path.join(rootDir, "public", "download");
const distDownloadDir = path.join(rootDir, "dist", "download");

// Clean stale artifacts before building
if (fs.existsSync(publicDownloadDir)) {
  fs.rmSync(publicDownloadDir, { recursive: true, force: true });
}
if (fs.existsSync(distDownloadDir)) {
  fs.rmSync(distDownloadDir, { recursive: true, force: true });
}
fs.mkdirSync(publicDownloadDir, { recursive: true });
fs.mkdirSync(distDownloadDir, { recursive: true });

console.log("==> Step 1: Building frontend assets with Vite...");
execSync("npx vite build", { stdio: "inherit", cwd: rootDir });

console.log("==> Step 2: Preparing portable assets...");

// Clean, rock-solid PowerShell launcher for Windows 10/11
const launchPs1 = `# Tamify Desktop - Standalone Windows Launcher
# Zero-dependency local micro-server with Edge/Chrome App Mode
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
Add-Type -AssemblyName System.Windows.Forms -ErrorAction SilentlyContinue

$dir = $PSScriptRoot
if ([string]::IsNullOrEmpty($dir)) { $dir = (Get-Location).Path }

# Proactively cleanup stale caxa locks from previous runs
try {
    $tempCaxa = Join-Path $env:TEMP "caxa\\applications"
    if (Test-Path $tempCaxa) {
        Get-ChildItem -Path $tempCaxa -Filter "tamify-*" -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    }
} catch { }

# Try HttpListener first, fallback to TcpListener if HttpListener permissions are restricted
$port = 39080
$maxAttempts = 30
$listener = $null
$isTcpFallback = $false

for ($i = 0; $i -lt $maxAttempts; $i++) {
    $testPort = $port + $i
    try {
        $temp = New-Object System.Net.HttpListener
        $temp.Prefixes.Add("http://127.0.0.1:$testPort/")
        $temp.Start()
        $listener = $temp
        $port = $testPort
        break
    } catch {
        if ($temp) { $temp.Close() }
    }
}

if ($null -eq $listener) {
    for ($i = 0; $i -lt $maxAttempts; $i++) {
        $testPort = $port + $i
        try {
            $tcp = New-Object System.Net.Sockets.TcpListener ([System.Net.IPAddress]::Loopback, $testPort)
            $tcp.Start()
            $listener = $tcp
            $port = $testPort
            $isTcpFallback = $true
            break
        } catch {
            if ($tcp) { $tcp.Stop() }
        }
    }
}

$url = "http://127.0.0.1:$port/"

# Search for Edge or Chrome executable for dedicated App Mode
$edgeCandidates = @(
    "\${env:ProgramFiles(x86)}\\Microsoft\\Edge\\Application\\msedge.exe",
    "$env:ProgramFiles\\Microsoft\\Edge\\Application\\msedge.exe",
    "$env:LOCALAPPDATA\\Microsoft\\Edge\\Application\\msedge.exe",
    "$env:ProgramW6432\\Microsoft\\Edge\\Application\\msedge.exe",
    "\${env:ProgramFiles(x86)}\\Google\\Chrome\\Application\\chrome.exe",
    "$env:ProgramFiles\\Google\\Chrome\\Application\\chrome.exe",
    "$env:LOCALAPPDATA\\Google\\Chrome\\Application\\chrome.exe"
)

$browserExe = $null
foreach ($c in $edgeCandidates) {
    if (-not [string]::IsNullOrEmpty($c) -and (Test-Path $c)) {
        $browserExe = $c
        break
    }
}

if ($browserExe) {
    Start-Process $browserExe -ArgumentList "--app=$url", "--window-size=1440,920"
} else {
    Start-Process $url
}

$mimeTypes = @{
    ".html"  = "text/html; charset=utf-8"
    ".js"    = "application/javascript; charset=utf-8"
    ".mjs"   = "application/javascript; charset=utf-8"
    ".css"   = "text/css; charset=utf-8"
    ".json"  = "application/json; charset=utf-8"
    ".svg"   = "image/svg+xml"
    ".png"   = "image/png"
    ".jpg"   = "image/jpeg"
    ".jpeg"  = "image/jpeg"
    ".ico"   = "image/x-icon"
    ".woff2" = "font/woff2"
    ".woff"  = "font/woff"
    ".ttf"   = "font/ttf"
    ".pdf"   = "application/pdf"
    ".docx"  = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ".xlsx"  = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
}

if ($isTcpFallback) {
    while ($listener.Server.IsBound) {
        try {
            $client = $listener.AcceptTcpClient()
            $stream = $client.GetStream()
            $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII)
            $reqLine = $reader.ReadLine()
            if ([string]::IsNullOrEmpty($reqLine)) { $client.Close(); continue }
            $parts = $reqLine.Split(' ')
            if ($parts.Length -lt 2) { $client.Close(); continue }
            $relPath = $parts[1].Split('?')[0].TrimStart('/')
            if ([string]::IsNullOrEmpty($relPath) -or $relPath -eq "index.html") { $relPath = "index.html" }
            $relPath = $relPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            $targetFile = [System.IO.Path]::Combine($dir, $relPath)
            if (-not [System.IO.File]::Exists($targetFile)) {
                $targetFile = [System.IO.Path]::Combine($dir, "index.html")
            }
            $ext = [System.IO.Path]::GetExtension($targetFile).ToLower()
            $ct = $mimeTypes[$ext]
            if ([string]::IsNullOrEmpty($ct)) { $ct = "application/octet-stream" }
            $content = [System.IO.File]::ReadAllBytes($targetFile)
            $crlf = "$([char]13)$([char]10)"
            $header = "HTTP/1.1 200 OK" + $crlf + "Content-Type: " + $ct + $crlf + "Content-Length: " + $content.Length + $crlf + "Connection: close" + $crlf + "Access-Control-Allow-Origin: *" + $crlf + $crlf
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($content, 0, $content.Length)
            $stream.Flush()
            $client.Close()
        } catch {
            try { if ($client) { $client.Close() } } catch { }
        }
    }
} else {
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $req = $context.Request
            $res = $context.Response

            $relPath = $req.Url.LocalPath.TrimStart('/')
            if ([string]::IsNullOrEmpty($relPath) -or $relPath -eq "index.html") {
                $relPath = "index.html"
            }

            $relPath = $relPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            $targetFile = [System.IO.Path]::Combine($dir, $relPath)

            if (-not [System.IO.File]::Exists($targetFile)) {
                $targetFile = [System.IO.Path]::Combine($dir, "index.html")
            }

            $ext = [System.IO.Path]::GetExtension($targetFile).ToLower()
            $contentType = $mimeTypes[$ext]
            if ([string]::IsNullOrEmpty($contentType)) {
                $contentType = "application/octet-stream"
            }

            $bytes = [System.IO.File]::ReadAllBytes($targetFile)
            $res.ContentType = $contentType
            $res.ContentLength64 = $bytes.Length
            $res.AddHeader("Cache-Control", "no-cache")
            $res.AddHeader("Access-Control-Allow-Origin", "*")
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            $res.OutputStream.Close()
        } catch {
            try {
                if ($res -and $res.OutputStream) { $res.OutputStream.Close() }
            } catch { }
        }
    }
}
`;

const startBat = `@echo off
title Tamify Desktop
cd /d "%~dp0"

start "" powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0launch.ps1"
exit
`;

const installShortcutBat = `@echo off
title Tamify - Install Desktop Shortcut
cd /d "%~dp0"

powershell.exe -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $desktop = [Environment]::GetFolderPath('Desktop'); $s = $ws.CreateShortcut([System.IO.Path]::Combine($desktop, 'Tamify Desktop.lnk')); $s.TargetPath = [System.IO.Path]::Combine('%~dp0', 'start.bat'); $s.WorkingDirectory = '%~dp0'; $s.Description = 'Tamify - Tamil Document Studio (Offline)'; $s.Save()"

echo Desktop shortcut created on your Desktop!
timeout /t 2 >nul
exit
`;

const readmeTxt = `================================================================================
TAMIFY DESKTOP FOR WINDOWS (tamify.exe / Tamify-Desktop-x64.exe)
தமிழ் மற்றும் இந்திய மொழிகள் ஆவண அரங்கம் (TAMIL DOCUMENT STUDIO)
================================================================================

1. அறிமுகம் (INTRODUCTION):
   Tamify Desktop is a 100% offline standalone Windows application.
   No internet connection, no Node.js, and no installation wizard needed.

2. இயக்குவது எப்படி? (HOW TO RUN):
   • முறை 1 (Standard): Double-click 'tamify.exe' or 'Tamify-Desktop-x64.exe'.
   • முறை 2 (Fastest): In the ZIP folder, double-click 'start.bat'.
   • முறை 3 (Desktop Icon): Double-click 'Install-Desktop-Shortcut.bat' to put
     a 'Tamify தமிழ் ஆவண அரங்கம்' icon directly on your Windows Desktop!

3. உலாவி மூலம் நேரடியாக திறக்க (DIRECT BROWSER ACCESS):
   The app runs locally on: http://localhost:39080/
   You can also open this link in any browser (Edge, Chrome, Brave, Firefox).

4. கோப்பு பிழை சரிசெய்தல் (CORRUPTED / UNREADABLE / NOT LAUNCHING):
   If Windows displays "The file or directory is corrupted and unreadable" or blocks it:
   a) Method 1: Right-click 'tamify.exe' -> Select 'Properties'
      At the bottom under Security, check the box: [x] Unblock -> Click 'Apply' then 'OK'.
   b) Method 2: Extract the 'Tamify_Windows_Desktop_x64.zip' file (Right-click -> Extract All)
      and double-click 'start.bat'.
   c) Method 3: Run 'Install-Desktop-Shortcut.bat' to launch directly from your Desktop.

5. கணினி தேவைகள் (SYSTEM REQUIREMENTS):
   • Windows 10 (64-bit) or Windows 11 (64-bit)
   • 100% Offline (No Internet Required)
================================================================================
`;

// Helper: collect files to bundle (STRICTLY EXCLUDING dist/download)
function getDistFiles(dir, baseDir = dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(baseDir, full);
    // CRITICAL: NEVER include download folder, executables, maps, or server files
    if (
      rel.startsWith("download") ||
      entry.name === "download" ||
      entry.name === ".caxa_staging" ||
      rel.endsWith(".exe") ||
      rel.endsWith(".zip") ||
      rel.endsWith(".map") ||
      rel.startsWith("server.")
    ) {
      continue;
    }
    if (entry.isDirectory()) {
      results.push(...getDistFiles(full, baseDir));
    } else {
      results.push({ full, rel });
    }
  }
  return results;
}

const distFiles = getDistFiles(distDir);
console.log(`Found ${distFiles.length} distribution files to bundle.`);

// Step 3: Build verified portable ZIP
console.log("==> Step 3: Generating Tamify portable ZIP bundle...");
const zipOutPublic = path.join(publicDownloadDir, "tamify-windows-x64.zip");
const zipOutDist = path.join(distDownloadDir, "tamify-windows-x64.zip");
const zipAltPublic = path.join(publicDownloadDir, "Tamify_Windows_Desktop_x64.zip");
const zipAltDist = path.join(distDownloadDir, "Tamify_Windows_Desktop_x64.zip");

const zipArchive = archiver("zip", { zlib: { level: 9 } });
const zipStream = fs.createWriteStream(zipOutPublic);

zipArchive.pipe(zipStream);
zipArchive.append(launchPs1, { name: "launch.ps1" });
zipArchive.append(startBat, { name: "start.bat" });
zipArchive.append(installShortcutBat, { name: "Install-Desktop-Shortcut.bat" });
zipArchive.append(readmeTxt, { name: "README_WINDOWS.txt" });

for (const f of distFiles) {
  zipArchive.file(f.full, { name: f.rel });
}

await zipArchive.finalize();
await stream.finished(zipStream);
fs.copyFileSync(zipOutPublic, zipOutDist);
fs.copyFileSync(zipOutPublic, zipAltPublic);
fs.copyFileSync(zipOutPublic, zipAltDist);
console.log(`ZIP created: ${(fs.statSync(zipOutPublic).size / (1024 * 1024)).toFixed(2)} MB`);

// Step 4: Build standalone Windows executables using official caxa CLI with dynamic identifier
console.log("==> Step 4: Compiling standalone Windows executable with official caxa engine...");
const stagingDir = path.join(rootDir, "dist", ".caxa_staging");
if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}
fs.mkdirSync(stagingDir, { recursive: true });

// Copy launcher files to staging
fs.writeFileSync(path.join(stagingDir, "launch.ps1"), launchPs1, "utf8");
fs.writeFileSync(path.join(stagingDir, "start.bat"), startBat, "utf8");
fs.writeFileSync(path.join(stagingDir, "Install-Desktop-Shortcut.bat"), installShortcutBat, "utf8");
fs.writeFileSync(path.join(stagingDir, "README_WINDOWS.txt"), readmeTxt, "utf8");

// Copy distribution files to staging
for (const f of distFiles) {
  const dest = path.join(stagingDir, f.rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(f.full, dest);
}

// Generate unique identifier to completely eliminate collision with any old %TEMP% locks
const buildTimestamp = Date.now().toString(36);
const uniqueId = `tamify-desktop-${buildTimestamp}`;
console.log(`Using fresh unique extraction identifier: ${uniqueId}`);

const tempExe = path.join(rootDir, "dist", "tamify_temp.exe");
if (fs.existsSync(tempExe)) fs.unlinkSync(tempExe);

if (!fs.existsSync(stubPath)) {
  throw new Error(`Stub not found at ${stubPath}`);
}

const caxaCmd = `npx caxa -i "${stagingDir}" -o "${tempExe}" -N -s "${stubPath}" --identifier "${uniqueId}" -- cmd.exe /c "{{caxa}}\\\\start.bat"`;
console.log("Executing caxa packager...");
execSync(caxaCmd, { stdio: "inherit", cwd: rootDir });

// Clean up staging
fs.rmSync(stagingDir, { recursive: true, force: true });

// Step 5: Verify the binary's structural integrity
console.log("==> Step 5: Verifying binary structural integrity & uncompression...");
const exeBytes = fs.readFileSync(tempExe);

// Check MZ signature
if (exeBytes[0] !== 0x4d || exeBytes[1] !== 0x5a) {
  throw new Error("Validation failed: PE MZ signature missing");
}

// Find footer
const footerSep = Buffer.from("\n");
const footerIdx = exeBytes.lastIndexOf(footerSep);
if (footerIdx === -1) throw new Error("Validation failed: footer separator missing");
const footerParsed = JSON.parse(exeBytes.subarray(footerIdx + 1).toString());
console.log("Verified footer JSON identifier:", footerParsed.identifier);

// Find archive
const archSep = Buffer.from("\nCAXACAXACAXA\n");
const archIdx = exeBytes.indexOf(archSep);
if (archIdx === -1) throw new Error("Validation failed: CAXACAXACAXA separator missing");
const archiveSlice = exeBytes.subarray(archIdx + archSep.length, footerIdx);

// Verify gzip header
if (archiveSlice[0] !== 0x1f || archiveSlice[1] !== 0x8b) {
  throw new Error(`Validation failed: Archive does not start with gzip header 1f8b (starts with ${archiveSlice.subarray(0, 4).toString("hex")})`);
}

// Verify gunzip
const gunzipped = zlib.gunzipSync(archiveSlice);
console.log(`Verified gzip decompression! Tarball size: ${(gunzipped.length / (1024 * 1024)).toFixed(2)} MB`);

// Move to public & dist with multiple friendly filenames
const targets = [
  path.join(publicDownloadDir, "tamify.exe"),
  path.join(distDownloadDir, "tamify.exe"),
  path.join(publicDownloadDir, "Tamify-Desktop-x64.exe"),
  path.join(distDownloadDir, "Tamify-Desktop-x64.exe")
];

for (const t of targets) {
  fs.copyFileSync(tempExe, t);
}
fs.unlinkSync(tempExe);

const exeSizeMB = (fs.statSync(targets[0]).size / (1024 * 1024)).toFixed(2);
console.log(`==> SUCCESS! Windows executables built and verified: ${exeSizeMB} MB`);
console.log(`Available files: tamify.exe, Tamify-Desktop-x64.exe, Tamify_Windows_Desktop_x64.zip`);
