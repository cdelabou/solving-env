#!/bin/bash

if [ ! -d "./workspace/$1" ]
then
    echo "Project not found, choose another name or create it !"
    exit
fi

cp ./lib/locallib.js "./workspace/$1/local.js"
cp "./workspace/$1/index.js" "./workspace/$1/export.js"
browserify "./workspace/$1/export.js" -o "./workspace/$1/export"
cat "./workspace/$1/index.js" >> "./workspace/$1/local.js"

echo ""
echo -e "\e[34mStarting tests for '$1'..."
echo ""

if [ -z $2 ]
then # no test provided: test all
    for test in $(ls "./workspace/$1/tests/" | grep -oP 'input\K[0-9]+.txt')
    do
        result=$( unbuffer diff --color "./workspace/$1/tests/output$test" <(cat "./workspace/$1/tests/input$test" | node "./workspace/$1/local.js") )
        if [ -n "$result" ]
        then
            echo -e "\e[1m\e[31m[output$test] Test failed :\e[0m"
            echo "$result"
        else
            echo -e "\e[1m\e[32m[output$test] Test completed !\e[0m"
        fi
    done
    
else # otherwise test one
    cat "./workspace/$1/tests/input$2.txt" | node "./workspace/$1/local.js"
fi

echo ""