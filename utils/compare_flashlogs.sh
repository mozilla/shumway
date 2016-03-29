#!/bin/bash
awk '{ print substr($0, index($0, " ") + 1)}' ~/Library/Preferences/Macromedia/Flash\ Player/Logs/flashlog.txt > ./build/logs/flashlog-fp.txt
awk '{ print substr($0, index($0, " ") + 1)}' ./build/logs/flashlog.txt > ./build/logs/flashlog-insp.txt
sdiff ./build/logs/flashlog-fp.txt ./build/logs/flashlog-insp.txt
