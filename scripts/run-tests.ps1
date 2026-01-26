# scripts/run-tests.ps1
# This script runs vitest and logs the output with a timestamp and failure count.

$logDir = Join-Path $PSScriptRoot "..\test-logs"
if (-not (Test-Path -LiteralPath $logDir)) {
    New-Item -ItemType Directory $logDir | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-ddTHHmmss"
Write-Host "Running tests..."

# Run vitest and capture both stdout and stderr
# We use --run to ensure it doesn't stay in watch mode
$output = npx vitest run $args 2>&1 | Out-String

# Strip ANSI codes for easier parsing
$cleanOutput = $output -replace "\x1B\[[0-9;]*[mK]", ""

# Extract failed tests count
# Output format: "Tests  2 failed | 41 passed (43)"
$failedMatch = [regex]::Match($cleanOutput, 'Tests\s+(\d+)\s+failed')
$failedCount = 0
if ($failedMatch.Success) {
    $failedCount = $failedMatch.Groups[1].Value
}
else {
    # If no "failed" found but "passed" exists, it's 0 failures
    if ($cleanOutput -match '\d+\s+passed') {
        $failedCount = 0
    }
    else {
        Write-Host "Warning: Could not determine test results from output."
    }
}

# --- SUMMARY GENERATION ---
$summary = "
============================================================
TEST EXECUTION SUMMARY (Added by run-tests.ps1)
============================================================
"

# Extract Test Suites summary (last occurrence)
if ($cleanOutput -match '(?s)Test Files\s+(?<details>.*failed.*\|.*passed.*)') {
    $summary += "Test Suites: $($Matches['details'] -split "`n" | Select-Object -First 1 | ForEach-Object { $_.Trim() -replace '\s+', ' ' })`n"
}

# Extract Tests summary (last occurrence)
if ($cleanOutput -match '(?s)Tests\s+(?<details>.*failed.*\|.*passed.*)') {
    $summary += "Tests:       $($Matches['details'] -split "`n" | Select-Object -First 1 | ForEach-Object { $_.Trim() -replace '\s+', ' ' })`n"
}

# Extract failed files - look for lines starting with FAIL and containing src/
$failedFiles = $cleanOutput -split "`n" | Where-Object { $_ -match '^\s*FAIL\s+src/' } | ForEach-Object { 
    $_.Trim() -replace 'FAIL\s+', '' -replace '\s+>.*$', ''
} | Select-Object -Unique

if ($failedFiles) {
    $summary += "`nFAILED TEST FILES:`n"
    foreach ($file in $failedFiles) {
        $summary += "- $file`n"
    }
}

# Extract specific failed test cases (look for file paths and line numbers)
$specificFailures = $cleanOutput -split "`n" | Where-Object { $_ -match 'src/test/.*:\d+' } | ForEach-Object { 
    $_.Trim() -replace '^\s*[^a-zA-Z0-9/.\\]+\s+', ''
} | Select-Object -Unique

if ($specificFailures) {
    $summary += "`nSPECIFIC FAILURES:`n"
    foreach ($fail in $specificFailures) {
        $summary += "- $fail`n"
    }
}

$summary += "============================================================
"

# Append summary to the full verbose output
$finalOutput = $output + $summary

$filename = "${timestamp}-tests[${failedCount}].log"
$filePath = Join-Path (Get-Location) "test-logs\$filename"

# Save output to file - Use -LiteralPath because [ ] are wildcards in PS
$finalOutput | Out-File -LiteralPath $filePath -Encoding utf8

if (Test-Path -LiteralPath $filePath) {
    Write-Host "Tests completed. Log successfully saved to: test-logs\$filename"
}
else {
    Write-Host "ERROR: Failed to save log file to: $filePath"
}

# Exit with failure code if tests failed
if ($failedCount -gt 0) {
    exit 1
}
exit 0
