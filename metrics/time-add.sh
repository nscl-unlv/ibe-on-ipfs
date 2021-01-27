#!/bin/bash

# time-add.sh
# bash script to time adding a file to IPFS

FOLDER="files"
ROUNDS=10
RESULTS_OUT="./results"

for file in $FOLDER/*.txt
do

    counter=0
    total_time=0

    echo "created results file $RESULTS_OUT/$file"
    FILE_NAME=$(basename $file)
    touch $RESULTS_OUT/$FILE_NAME

    echo "running test on $FILE_NAME"

    until [ $counter -ge $ROUNDS ]
    do
        echo "ipfs add round $(($counter+1))"
        ipfs repo gc
        START_TIME=$(($(gdate -u +%s%N)/1000000))
        ipfs add $file
        FINISH_TIME=$(($(gdate -u +%s%N)/1000000))

        ELASPED_TIME=$(($FINISH_TIME-$START_TIME))
        echo "elasped time: $ELASPED_TIME"
        echo $ELASPED_TIME >> $RESULTS_OUT/$FILE_NAME
        total_time=$(($total_time+$ELASPED_TIME))

        ((counter++))
    done
    echo "average ipfs add time is  $(($total_time/$ROUNDS)) ms"
done
echo "done with test!"
