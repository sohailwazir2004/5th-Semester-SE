#!/bin/bash
echo "following files exist at the current location"
ls
echo "write the name of the directory you wanna creat "
read dname
mkdir $dname
echo "$dname directory is created successfully"
ls
