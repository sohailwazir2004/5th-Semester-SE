#!/bin/bash
read -p "enter the name of the directory you wanna creat" name
read -p "enter the destination of dir" dest
mkdir "$dest/$name"
echo "$name is succesfully created at the destination $dest"
ls -l "$dest"
