export default class State {
  #score;
  #scoreElement;
  constructor(defaultValue, scoreBox) {
    this.#score = defaultValue.score;
    this.#scoreElement = document.createElement('div');
    this.createScoreElement(scoreBox);
  }

  get score() {
    return this.#score;
  }

  set score(countOfOneMove) {
    return this.#score + Number(countOfOneMove);
  }

  createScoreElement(scoreBox) {
    this.#scoreElement = document.createElement('span');
    this.#scoreElement.classList.add('score-amount');
    this.#scoreElement.setAttribute('id', 'score');
    this.#scoreElement.innerText = this.#score;
    scoreBox.insertAdjacentElement('beforeend', this.#scoreElement);
  }

  updateScore(amountOfScore) {
    if (amountOfScore == 0) return;

    this.#score = this.#score + amountOfScore;
    this.#scoreElement.innerHTML = `${this.#score}`;
  }

  increaseScore(tile) {}
}
