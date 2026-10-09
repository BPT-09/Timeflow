@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Script for Windows
@REM ----------------------------------------------------------------------------
@echo off
setlocal

set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.

if exist "%DIRNAME%..\apache-maven-3.9.9\bin\mvn.cmd" (
    "%DIRNAME%..\apache-maven-3.9.9\bin\mvn.cmd" %*
) else (
    mvn %*
)
