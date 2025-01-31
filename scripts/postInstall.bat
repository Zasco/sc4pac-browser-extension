:: scripts/install.bat
@echo off
if not exist vendor if exist node_modules (
    mklink /J vendor node_modules
)