#! /bin/bash

/Users/lisa/Dev/visual-trace-app/build/app/webtrotter-darwin-x64/webtrotter.app/Contents/MacOS/webtrotter

PROCESS=webthreat
number=$(ps aux | grep $PROCESS | wc -l)

if [ $number -gt 0 ]
    then
        echo Running;
fi
