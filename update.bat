@echo off
timeout /T 1 /NOBREAK
del /f /q /a %1\app.asar
ren %1\update.as app.asar
start "" %2