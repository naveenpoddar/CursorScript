@echo off

echo Publishing Language..
call ./PublishLanguage.bat

echo Publishing VS Code extension..
call "C:\AIML2\cursorscript-vsc-support\publish.bat"

echo All tasks complete!