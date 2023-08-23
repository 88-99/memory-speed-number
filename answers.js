"use strict";

export class Answers {
  #digits;
  #correctAnswer;
  #usersAnswer;

  constructor(digits, usersAnswer) {
    this.#digits = digits;
    this.#correctAnswer = this.generateRandomNumbers();
    this.#usersAnswer = usersAnswer;
  }

  get correctAnswer() {
    return this.#correctAnswer;
  }

  set usersAnswer(inputValue) {
    this.#usersAnswer = inputValue.replace(/\s/g, "").split("").map(Number);
  }

  generateRandomNumbers() {
    const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let randomNumbers = [];
    for (let i = 0; i < this.#digits; i++) {
      const randomIndex = Math.floor(Math.random() * numbers.length);
      randomNumbers.push(numbers[randomIndex]);
    }
    return randomNumbers;
  }

  compareAnswers() {
    return this.#correctAnswer.join("") === this.#usersAnswer.join("")
      ? true
      : false;
  }

  findIncorrectIndexes() {
    const incorrectIndexes = [];
    for (let i = 0; i < this.#correctAnswer.length; i++) {
      if (this.#correctAnswer[i] !== this.#usersAnswer[i]) {
        incorrectIndexes.push(i);
      }
    }
    return incorrectIndexes;
  }

  calcPoints() {
    return 100 - this.findIncorrectIndexes().length * 4;
  }

  generateHighlightedNumbers() {
    const highlightedNumbers = this.#usersAnswer.map((number, index) =>
      this.findIncorrectIndexes().includes(index)
        ? `\x1b[7m${number}\x1b[0m`
        : number
    );
    return highlightedNumbers;
  }
}
