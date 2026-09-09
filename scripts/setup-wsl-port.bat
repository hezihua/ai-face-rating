@echo off
:: 双击此文件会请求管理员权限
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"%~dp0setup-wsl-port.ps1\"'"
