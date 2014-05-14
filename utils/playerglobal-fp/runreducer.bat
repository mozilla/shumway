@set UTILS_HOME=%~dp0..
%UTILS_HOME%\apparat\scala-2.8.0.final\bin\scala.bat -cp ".;%UTILS_HOME%\apparat\apparat-1.0-RC9\*" apparat.tools.reducer.Reducer %*
