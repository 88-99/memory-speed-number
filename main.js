#!/usr/bin/env node

import enquirer from "enquirer";

const { Select } = enquirer;
const { Input } = enquirer;

const prompt = new Select({
  message: "How many seconds for limit time?",
  choices: ["3", "5", "10", "30", "60", "120", "180"],
  hint: " (Enter a number.)",
});

prompt
  .run()
  .then((seconds) => {
    const digits = 25;
    const randomNumbers = generateRandomNumbers(digits);
    const milliseconds = Number(seconds) * 1000;

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

    usersAnswer.run().then((usersAnswer) => {
      usersAnswer = usersAnswer.replace(/\s/g, "").split("").map(Number);
      if (usersAnswer.join("") === randomNumbers.join("")) {
        console.log("Perfect score. You are amazing!");
      } else {
        console.log(
          `Your socre is ${calcPoints(
            findIncorrectIndexes(randomNumbers, usersAnswer)
          )}/100 points.`
        );
        console.log();

        const prompt = new Select({
          name: "memo",
          message: "Do you check the answer?",
          choices: ["yes", "no"],
        });
        prompt
          .run()
          .then((key) => {
            if (key === "yes") {
              console.log("-- Your answer --");
              printWithHighlight(
                usersAnswer,
                findIncorrectIndexes(randomNumbers, usersAnswer)
              );
              console.log("-- Correct answer --");
              outputForm(randomNumbers);
            }
          })
          .catch(console.error);
      }
    });
  });
// });

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
  const chunkSize = 5;
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
        if (findHighlitedStrings(chunkedNumber) > 0) {
          console.log(
            space() +
              "-".repeat(
                chunkedNumber.join(" ").length -
                  findHighlitedStrings(chunkedNumber) * 8
              )
          );
        } else {
          console.log(space() + "-".repeat(chunkedNumber.join(" ").length));
        }
        console.log();
      }
    }
  }
}

function findHighlitedStrings(randomNumber) {
  const highlitedStrings = randomNumber.filter(
    (element) => typeof element === "string" && element.startsWith("\x1B[")
  );
  return highlitedStrings.length;
}

function clearTerminalAfterDelay(
  digits,
  randomNumbers,
  milliseconds,
  callback
) {
  outputForm(randomNumbers);

  setTimeout(() => {
    process.stdout.write("\x1b[18A\x1b[0J");
    callback();
  }, milliseconds);
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

function printWithHighlight(chars, highlightIndexes) {
  const highlightedText = chars.map((char, index) =>
    highlightIndexes.includes(index) ? `\x1b[7m${char}\x1b[0m` : char
  );

  return outputForm(highlightedText);
}
