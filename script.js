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
  gameBoard.addEventListener('touchstart', touchStartHandler, {
    once: true,
    passive: false,
  });

  window.addEventListener('keydown', handleInput, { once: true });
}

async function handleInput(e) {
  console.log(e.key);

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

function handleTouchMove(e) {
  e.preventDefault();
}

function touchStartHandler(e) {
  e.preventDefault();
  const THRESHOLD_DISTANCE = 75;
  const ALLOWED_GESTURE_TIME = 500;
  let startTouchData;

  startTouchData = e.changedTouches[0];
  const startTime = new Date();

  gameBoard.addEventListener('touchmove', handleTouchMove, {
    passive: false,
  });

  gameBoard.addEventListener(
    'touchend',
    async (e) => {
      e.preventDefault();
      gameBoard.removeEventListener('touchmove', handleTouchMove);

      const endTouchData = e.changedTouches[0];

      if (new Date() - startTime > ALLOWED_GESTURE_TIME) {
        setupInput();
        return;
      }

      const distanceX = endTouchData.pageX - startTouchData.pageX;
      const distanceY = endTouchData.pageY - startTouchData.pageY;

      console.log({ distanceY: Math.abs(distanceY >= THRESHOLD_DISTANCE) });

      if (Math.abs(distanceX) >= THRESHOLD_DISTANCE) {
        await handleInput(distanceX > 0 ? { key: 'ArrowRight' } : { key: 'ArrowLeft' });
      } else if (Math.abs(distanceY) >= THRESHOLD_DISTANCE) {
        console.log(distanceY > 0);
        await handleInput(distanceY > 0 ? { key: 'ArrowDown' } : { key: 'ArrowUp' });
      }
      setupInput();
    },
    { once: true }
  );
}
