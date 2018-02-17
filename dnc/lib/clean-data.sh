#!/bin/bash

# Handles spaces in filenames
OIFS="$IFS"
IFS=$'\n'

# Directory to read files from
dir=~/src/github/SDS235/project/dnc

# Deletes HTML version of .eml file from end of file
for filename in $dir/*.txt; do

    # Delete HTML from end of file
    sed -n '/<html>/q;p' $filename > "$filename"'.txt' && mv "$filename"'.txt' $filename && rm "$filename"'.txt'
done
IFS="$OIFS"
