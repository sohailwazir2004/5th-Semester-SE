#!/bin/bash
echo "enter the path of files to be copied"
read copied_files
echo "enter the path where the selected files to be copied"
read dest
cp $copied_files "$dest"
echo "files succesfully copied to $dest"

