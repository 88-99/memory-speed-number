"use strict";

export class Formatter {
  #numbers;
  #chunkSize;

  constructor(numbers) {
    this.#numbers = numbers;
    this.#chunkSize = 5;
  }

  selectFormat() {
    if (this.checkChunkSize()) {
      this.formatOneLine();
    } else {
      this.formatMultipleLines();
    }
  }

  formatOneLine() {
    console.log();
    console.log(this.space() + this.#numbers.join(" "));
    console.log();
  }

  formatMultipleLines() {
    const chunkedNumbers = this.makeChunkedNumbers();
    for (let i = 0; i < chunkedNumbers.length; i++) {
      const chunk = chunkedNumbers[i];
      if (i === 0) {
        console.log();
      }
      console.log(this.space() + chunk.join(" "));
      console.log();

      if (i !== chunkedNumbers.length - 1) {
        const HighlitedStrings = this.findHighlitedStrings(chunk);
        if (HighlitedStrings > 0) {
          console.log(
            this.space() +
              "-".repeat(chunk.join(" ").length - HighlitedStrings * 8),
          );
        } else {
          console.log(this.space() + "-".repeat(chunk.join(" ").length));
        }
        console.log();
      }
    }
  }

  checkChunkSize() {
    if (this.#numbers.length <= this.#chunkSize) {
      return true;
    }
  }

  space() {
    return " ".repeat(12);
  }

  makeChunkedNumbers() {
    let chunkedNumbers = [];
    for (let i = 0; i < this.#numbers.length; i += this.#chunkSize) {
      chunkedNumbers.push(this.#numbers.slice(i, i + this.#chunkSize));
    }
    return chunkedNumbers;
  }

  findHighlitedStrings(numbers) {
    const highlitedStrings = numbers.filter(
      (element) => typeof element === "string" && element.startsWith("\x1B["),
    );
    return highlitedStrings.length;
  }
}
