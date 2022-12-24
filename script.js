import Grid from './Grid.js';
import Tile from './Tile.js';
import State from './State.js';

const DEFAULT_STATE = {
  score: 0,
};

const gameBoard = document.getElementById('game-board');
const scoreBox = document.getElementById('score-box');
const grid = new Grid(gameBoard);
const state = new State(DEFAULT_STATE, scoreBox);

grid.randomEmptyCell().tile = new Tile(gameBoard);
grid.randomEmptyCell().tile = new Tile(gameBoard);
setupInput();

function setupInput() {
  window.addEventListener('keydown', handleInput, { once: true });
}

async function handleInput(e) {
  switch (e.key) {
    case 'ArrowUp':
      if (!canMoveUp()) {
        setupInput();
        return;
      }
      await moveUp();
      break;
    case 'ArrowDown':
      if (!canMoveDown()) {
        setupInput();
        return;
      }
      await moveDown();
      break;
    case 'ArrowLeft':
      if (!canMoveLeft()) {
        setupInput();
        return;
      }
      await moveLeft();
      break;
    case 'ArrowRight':
      if (!canMoveRight()) {
        setupInput();
        return;
      }
      await moveRight();
      break;
    default:
      setupInput();
      return;
  }

  grid.cells.forEach((cell) => cell.mergeTiles());

  const newTile = new Tile(gameBoard);
  grid.randomEmptyCell().tile = newTile;

  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    newTile.waitForTransition(true).then(() => {
      alert('You lose');
    });
  } else {
    setupInput();
  }
}

function moveUp() {
  return slideTiles(grid.cellsByColumn);
}

function moveDown() {
  return slideTiles(grid.cellsByColumn.map((column) => [...column].reverse()));
}

function moveLeft() {
  return slideTiles(grid.cellsByRow);
}

function moveRight() {
  return slideTiles(grid.cellsByRow.map((row) => [...row].reverse()));
}

async function slideTiles(cells) {
  await Promise.all(
    cells.flatMap((group) => {
      const promises = [];
      for (let i = 1; i < group.length; i++) {
        const cell = group[i];
        if (cell.tile == null) continue;
        let lastValidCell;
        for (let j = i - 1; j >= 0; j--) {
          const moveToCell = group[j];
          if (!moveToCell.canAccept(cell.tile)) break;
          lastValidCell = moveToCell;
        }

        if (lastValidCell != null) {
          promises.push(cell.tile.waitForTransition());
          if (lastValidCell.tile != null) {
            console.log({ cell: cell.tile });

            lastValidCell.mergeTile = cell.tile;
          } else {
            lastValidCell.tile = cell.tile;
          }
          cell.tile = null;
        }
      }
      return promises;
    })
  );

  const increaseScore = cells
    .flatMap((num) => num)
    .reduce((sum, cell) => {
      if (cell.mergeTile == null || cell.tile == null) return sum;
      return sum + cell.mergeTile.value + cell.tile.value;
    }, 0);
  console.log(increaseScore);

  // cells.forEach((cell) => {
  //   // console.log(cell);

  //   cell.forEach((i) => console.log(i.mergeTiles()));
  // });
  state.updateScore(increaseScore);
  return increaseScore;
}

function canMoveUp() {
  return canMove(grid.cellsByColumn);
}
function canMoveDown() {
  return canMove(grid.cellsByColumn.map((column) => [...column].reverse()));
}
function canMoveLeft() {
  return canMove(grid.cellsByRow);
}
function canMoveRight() {
  return canMove(grid.cellsByRow.map((row) => [...row].reverse()));
}

function canMove(cells) {
  return cells.some((group) => {
    return group.some((cell, index) => {
      if (index === 0) return false;
      if (cell.tile == null) return false;
      const moveToCell = group[index - 1];
      return moveToCell.canAccept(cell.tile);
    });
  });
}
