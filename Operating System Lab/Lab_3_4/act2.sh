#!/nim/bash
echo "Following files exist at the current location"
ls
echo "write the name of the file you wanna delete"
read fname
rm -r $fname
echo "The remaining files are"
ls
echo "following files exits at the current lacation"
ls -l

