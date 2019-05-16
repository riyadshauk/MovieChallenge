#!/bin/bash
# https://stackoverflow.com/questions/53924934/can-i-run-my-expo-app-on-multiple-ios-simulators-at-once
declare -a simulators=("B35D3F98-8E14-445C-A25A-0FC3431DD30D" "349F2C5B-B651-4E8E-B262-D265A417270F")

for i in "${simulators[@]}"
do
    xcrun simctl boot $i
    xcrun instruments -w $i
    #xcrun simctl install $i ~/.expo/ios-simulator-app-cache/$(ls -t -1 | head -n 1)
    xcrun simctl openurl $i exp://127.0.0.1:19000      
done
