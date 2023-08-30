#!/usr/bin/env node

"use strict";

import { Formatter } from "./formatter.js";
import { Answers } from "./answers.js";
import enquirer from "enquirer";

const { Select, Input } = enquirer;

async function main() {
  try {
    const digits = 25;
    const seconds = await selectSecondsPrompt().run();
    const answers = new Answers(digits, "");
    await asyncClearTerminalAfterDelay(digits, seconds, answers.correctAnswer);

    let usersAnswer = await inputUsersAnswerPrompt().run();
    answers.usersAnswer = usersAnswer;
    await announcementResult(digits, answers);

    checkAnswerOrNot(answers);
  } catch (error) {
    console.error("Error:", error);
  }
}

function selectSecondsPrompt() {
  return new Select({
    message: "How many seconds for limit time?",
    choices: ["3", "5", "10", "30", "60", "120", "180"],
    hint: " (Enter a number.)"
  });
}

function asyncClearTerminalAfterDelay(digits, seconds, correctAnswer) {
  return new Promise((resolve) => {
    clearTerminalAfterDelay(digits, seconds, correctAnswer, () => {
      resolve(correctAnswer);
    });
  });
}

function clearTerminalAfterDelay(digits, seconds, correctAnswer, callback) {
  const formatter = new Formatter(correctAnswer);
  formatter.selectFormat();

  setTimeout(() => {
    process.stdout.write("\x1b[18A\x1b[0J");
    callback();
  }, seconds * 1000);
}

function inputUsersAnswerPrompt() {
  return new Input({
    message: "Input your answer",
    hint: " (Enter a number.)",
    multiline: true,
    validate(value) {
      value = value.replace(/\s/g, "");
      return value.length === 0 || value.length > 25 || /[^\d]/.test(value)
        ? "Input must be between 1 and 25 characters and consist of numbers only."
        : true;
    }
  });
}

function announcementResult(digits, answers) {
  return new Promise((resolve) => {
    if (answers.compareAnswers()) {
      console.log("Perfect score. You are amazing!");
    } else {
      console.log(
        `Your socre is ${answers.calcPoints(
          answers.findIncorrectIndexes
        )}/100 points.`
      );
      console.log();
      resolve();
    }
  });
}

async function checkAnswerOrNot(answers) {
  const checkAnswerOrNotPrompt = new Select({
    message: "Do you check the answer?",
    choices: ["yes", "no"]
  });

  const key = await checkAnswerOrNotPrompt.run();
  if (key === "yes") {
    formattedAnswer("-- Your answer --", answers.generateHighlightedNumbers());
    formattedAnswer("-- Correct answer --", answers.correctAnswer);
  }
}

function formattedAnswer(titleOfAnswer, answer) {
  console.log(titleOfAnswer);

  const formattedAnswer = new Formatter(answer);
  return formattedAnswer.selectFormat();
}

main();
