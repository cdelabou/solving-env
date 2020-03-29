#!/bin/bash

source ./config.sh

if [ -d "./workspace/$1" ]
then
    echo "Project already exists, choose another name or delete it !"
    exit
fi

if [ -n "$1" ]
then
    # Create dirs
    mkdir "./workspace/$1"

    # Main script
    touch "./workspace/$1/index.ts"
    cat lib/template.ts >> "./workspace/$1/index.ts"
    
    # Fetch examples
    archive=$(ls -t "$DOWNLOADS/" | head -n1)
    unzip -qq -d "./workspace/$1/" -- "$DOWNLOADS/$archive"
    folder=$(ls --group-directories-first "./workspace/$1/" | head -n1)
    mv "./workspace/$1/$folder/" "./workspace/$1/tests/"

else
    echo "Please specify a project name !"
fi
