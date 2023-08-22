#!/usr/bin/env node

"use strict";

import { Formatter } from "./formatter.js";
import enquirer from "enquirer";

const { Select, Input } = enquirer;

async function main() {
  const selectSecondsPrompt = new Select({
    message: "How many seconds for limit time?",
    choices: ["3", "5", "10", "30", "60", "120", "180"],
    hint: " (Enter a number.)",
  });

  const inputUsersAnswerPrompt = new Input({
    message: "Input your answer",
    hint: " (Enter a number.)",
    multiline: true,
    validate(value) {
      value = value.replace(/\s/g, "");
      return value.length === 0 || value.length > 25 || /[^\d]/.test(value)
        ? "Input must be between 1 and 25 characters and consist of numbers only."
        : true;
    },
  });

  function asyncClearTerminalAfterDelay(digits, seconds, correctAnswer) {
    return new Promise((resolve) => {
      clearTerminalAfterDelay(digits, seconds, correctAnswer, () => {
        resolve(correctAnswer);
      });
    });
  }

  function announcementResult(correctAnswer, usersAnswer) {
    return new Promise((resolve) => {
      usersAnswer = usersAnswer.replace(/\s/g, "").split("").map(Number);
      if (usersAnswer.join("") === correctAnswer.join("")) {
        console.log("Perfect score. You are amazing!");
      } else {
        console.log(
          `Your socre is ${calcPoints(
            findIncorrectIndexes(correctAnswer, usersAnswer)
          )}/100 points.`
        );
        console.log();
        resolve(usersAnswer);
      }
    });
  }

  function checkAnswerOrNot(correctAnswer, usersAnswer) {
    const checkAnswerOrNotPrompt = new Select({
      message: "Do you check the answer?",
      choices: ["yes", "no"],
    })
      .run()
      .then((key) => {
        if (key === "yes") {
          console.log("-- Your answer --");
          const formattedUsersAnswer = new Formatter(
            generateHighlightedNumbers(
              usersAnswer,
              findIncorrectIndexes(correctAnswer, usersAnswer)
            )
          );
          formattedUsersAnswer.selectFormat();
          console.log("-- Correct answer --");
          const formattedCorrectAnswer = new Formatter(correctAnswer);
          formattedCorrectAnswer.selectFormat();
        }
      });
  }

  try {
    const seconds = await selectSecondsPrompt.run();
    const digits = 25;
    const correctAnswer = generateRandomNumbers(digits);
    await asyncClearTerminalAfterDelay(digits, seconds, correctAnswer);

    let usersAnswer = await inputUsersAnswerPrompt.run();
    usersAnswer = await announcementResult(correctAnswer, usersAnswer);

    checkAnswerOrNot(correctAnswer, usersAnswer);
  } catch (error) {
    console.error("Error:", error);
  }
}
main();

function generateRandomNumbers(digits) {
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  let randomNumbers = [];

  for (let i = 0; i < digits; i++) {
    const randomIndex = Math.floor(Math.random() * numbers.length);
    randomNumbers.push(numbers[randomIndex]);
  }
  return randomNumbers;
}

function clearTerminalAfterDelay(digits, seconds, correctAnswer, callback) {
  const formatter = new Formatter(correctAnswer);
  formatter.selectFormat();

  setTimeout(() => {
    process.stdout.write("\x1b[18A\x1b[0J");
    callback();
  }, seconds * 1000);
}

function findIncorrectIndexes(correctAnswer, usersAnswer) {
  const incorrectIndexes = [];
  for (let i = 0; i < correctAnswer.length; i++) {
    if (correctAnswer[i] !== usersAnswer[i]) {
      incorrectIndexes.push(i);
    }
  }
  return incorrectIndexes;
}

function calcPoints(incorrectIndexes) {
  return 100 - incorrectIndexes.length * 4;
}

function generateHighlightedNumbers(numbers, highlightIndexes) {
  const highlightedNumbers = numbers.map((number, index) =>
    highlightIndexes.includes(index) ? `\x1b[7m${number}\x1b[0m` : number
  );
  return highlightedNumbers;
}
