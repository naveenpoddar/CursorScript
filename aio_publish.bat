@echo off

echo Publishing Language..
call ./PublishLanguage.bat

echo Publishing VS Code extension..
:: Save current directory and jump to the extension folder
pushd "C:\AIML2\cursorscript-vsc-support"

:: Run the publish script
call ./publish.bat

:: Return to the original directory
popd

echo Back in original folder. All tasks complete!