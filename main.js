#!/usr/bin/env node

import enquirer from "enquirer";

const { Input } = enquirer;
const { Select } = enquirer;

const prompt = new Input({
  message: "How many digits for memorized number?",
  hint: " (Enter a number.)",
});

prompt
  .run()
  .then((answer) => {
    return parseInt(answer);
  })
  .then((digits) => {
    const prompt = new Input({
      message: "How many seconds for limit time?",
      hint: " (Enter a number.)",
    });

    prompt
      .run()
      .then((seconds) => {
        const randomNumbers = generateRandomNumbers(digits);
        const milliseconds = seconds * 1000;

        return new Promise((resolve) => {
          clearTerminalAfterDelay(digits, randomNumbers, milliseconds, () => {
            resolve(randomNumbers);
          });
        });
      })
      .then((randomNumbers) => {
        const usersAnswer = new Input({
          message: "Input your answer",
          hint: " (Enter a number.)",
          multiline: true,
        });

        usersAnswer.run().then((answer) => {
          answer = answer.replace(/\s/g, "").split("").map(Number);
          if (answer.join("") === randomNumbers.join("")) {
            console.log("Correct");
          } else {
            console.log("Incorrect");

            const prompt = new Select({
              name: "memo",
              message: "Do you check the answer?",
              choices: ["yes", "no"],
            });
            prompt
              .run()
              .then((key) => {
                if (key === "yes") {
                  outputForm(randomNumbers);
                }
              })
              .catch(console.error);
          }
        });
      });
  });

function generateRandomNumbers(digits) {
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  let randomNumbers = [];

  for (let i = 0; i < digits; i++) {
    const randomIndex = Math.floor(Math.random() * numbers.length);
    const randomNumber = numbers[randomIndex];

    randomNumbers.push(numbers[randomIndex]);
  }

  return randomNumbers;
}

function outputForm(randomNumbers) {
  const chunkSize = 40;
  const chunkedNumbers = [];

  const space = () => {
    return " ".repeat(12);
  };

  if (randomNumbers.length <= chunkSize) {
    console.log();
    console.log(space() + randomNumbers.join(" "));
    console.log();
  } else {
    for (let i = 0; i < randomNumbers.length; i += chunkSize) {
      chunkedNumbers.push(randomNumbers.slice(i, i + chunkSize));
    }

    for (let i = 0; i < chunkedNumbers.length; i++) {
      const chunkedNumber = chunkedNumbers[i];

      if (i === 0) {
        console.log();
      }
      console.log(space() + chunkedNumber.join(" "));
      console.log();

      if (i !== chunkedNumbers.length - 1) {
        console.log(space() + "-".repeat(chunkedNumber.join(" ").length));
        console.log();
      }
    }
  }
}

function clearTerminalAfterDelay(
  digits,
  randomNumbers,
  milliseconds,
  callback
) {
  // process.stdout.write(outputForm(randomNumbers));
  outputForm(randomNumbers);

  let deleteLine = 3;
  deleteLine = getDleteLine(digits, deleteLine);

  setTimeout(() => {
    process.stdout.write(`\x1b[${deleteLine}A\x1b[0J`);
    callback();
  }, milliseconds);
}

function getDleteLine(digits, deleteLine) {
  const step = Math.ceil(digits / 40) - 1;
  return deleteLine + 4 * step;
}
