#!/bin/bash
# Activity 1: Basic arithmetic operations on two numbers

echo "Path of the script is: $0"

read -p "Please enter the first number: " num1
read -p "Please enter the second number: " num2

s=$((num1 + num2))
d=$((num1 - num2))
m=$((num1 * num2))
div=$((num1 / num2))
r=$((num1 % num2))
e=$((num1 ** num2))

echo "------------------------------"
echo "Sum of $num1 and $num2 is: $s"
echo "Difference of $num1 and $num2 is: $d"
echo "Product of $num1 and $num2 is: $m"
echo "Division of $num1 by $num2 is: $div"
echo "Remainder of $num1 divided by $num2 is: $r"
echo "$num1 raised to the power $num2 is: $e"
echo "------------------------------"