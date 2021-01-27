#!/bin/bash

# time-add.sh
# bash script to time adding a file to IPFS

FILE="$1"
ROUNDS=10
RESULTS_OUT="./results"

counter=0
total_time=0

echo "created results file $RESULTS_OUT/$FILE"
FILE_NAME="$(basename $FILE)"
touch ./results/$FILE_NAME

echo "running test on $FILE"

until [ $counter -ge $ROUNDS ]
do
    echo "ipfs add round $(($counter+1))"
    ipfs repo gc
    START_TIME=$(($(gdate -u +%s%N)/1000000))
    ipfs add $FILE
    FINISH_TIME=$(($(gdate -u +%s%N)/1000000))

    ELASPED_TIME=$(($FINISH_TIME-$START_TIME))
    echo "elasped time: $ELASPED_TIME"
    echo $ELASPED_TIME >> $RESULTS_OUT/$FILE_NAME
    total_time=$(($total_time+$ELASPED_TIME))

    ((counter++))
done

echo "average ipfs add time is  $(($total_time/$ROUNDS)) ms"
