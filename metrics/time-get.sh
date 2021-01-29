#!/bin/bash

# time-get.sh
# bash script to time download files from ipfs

CID="$1"
FILE_OUT="/tmp"
SUMMARY_OUT="./results"
ROUNDS=10

echo "start download test."
echo "file downloaded to $FILE_OUTPUT folder.\n"

counter=0
total_time=0

until [ $counter -ge $ROUNDS ]
do
    echo "downloading $line"
    START_TIME=$(($(gdate -u +%s%N)/1000000))
    ipfs get $CID --output="$FILE_OUT"
    FINISH_TIME=$(($(gdate -u +%s%N)/1000000))

    ELASPED_TIME=$(($FINISH_TIME-$START_TIME))
    echo $ELASPED_TIME >> "$SUMMARY_OUT/$CID-result.txt"

    total_time=$(($total_time+$ELASPED_TIME))
    echo "elasped time: $ELASPED_TIME ms."

    ((counter++))
done 
echo "average ipfs add time is  $(($total_time/$ROUNDS)) ms."
echo "download timing test complete."
