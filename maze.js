const rows = 20;
const cols = 20;

const canvas = document.getElementById("maze");
canvas.width = 480;
canvas.height = 480;

const ctx = canvas.getContext("2d");
const w = canvas.width / cols;
const h = canvas.height / rows;

let grid = [];
let path = [];
let visitedPath = new Set();
let previewPathSet = new Set();
let startCell = null;
let endCell = null;
let currentStep = 0;
let animating = false;
let clickState = 0;
let lastAlgorithmUsed = "bfs";

class Cell {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.walls = [true, true, true, true];
    this.visited = false;
  }

  getUnvisitedNeighbors() {
    let neighbors = [];
    const top = grid[index(this.i - 1, this.j)];
    const right = grid[index(this.i, this.j + 1)];
    const bottom = grid[index(this.i + 1, this.j)];
    const left = grid[index(this.i, this.j - 1)];

    if (top && !top.visited) neighbors.push(top);
    if (right && !right.visited) neighbors.push(right);
    if (bottom && !bottom.visited) neighbors.push(bottom);
    if (left && !left.visited) neighbors.push(left);

    return neighbors;
  }
}

function index(i, j) {
  if (i < 0 || j < 0 || i >= rows || j >= cols) return -1;
  return i * cols + j;
}

function removeWalls(a, b) {
  let x = a.j - b.j;
  let y = a.i - b.i;

  if (x === 1) {
    a.walls[3] = false;
    b.walls[1] = false;
  } else if (x === -1) {
    a.walls[1] = false;
    b.walls[3] = false;
  }
  if (y === 1) {
    a.walls[0] = false;
    b.walls[2] = false;
  } else if (y === -1) {
    a.walls[2] = false;
    b.walls[0] = false;
  }
}

function initializeGrid() {
  grid = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      grid.push(new Cell(i, j));
    }
  }
}

function generateMaze() {
  const type = selectedGeneration;
  if (!type) {
    alert("Të lutem zgjedh një algoritëm për gjenerimin e labirintit!");
    return;
  }

  initializeGrid();
  visitedPath.clear();
  previewPathSet.clear();
  startCell = null;
  endCell = null;
  clickState = 0;

  if (type === "dfs") generateDFS();
  else generatePrim();
}

function generateDFS() {
  let current = grid[0];
  let stack = [];
  current.visited = true;
  stack.push(current);

  let interval = setInterval(() => {
    let next = current.getUnvisitedNeighbors().sort(() => Math.random() - 0.5)[0];
    if (next) {
      next.visited = true;
      stack.push(current);
      removeWalls(current, next);
      current = next;
    } else if (stack.length > 0) {
      current = stack.pop();
    } else {
      clearInterval(interval);
      draw();
    }
    draw();
  }, 10);
}

function generatePrim() {
  let frontier = [];
  let current = grid[0];
  current.visited = true;

  function addFrontier(cell) {
    for (let neighbor of getUnvisitedNeighbors(cell)) {
      if (!frontier.includes(neighbor)) frontier.push(neighbor);
    }
  }

  function getUnvisitedNeighbors(cell) {
    let neighbors = [];
    const i = cell.i;
    const j = cell.j;
    const top = grid[index(i - 1, j)];
    const right = grid[index(i, j + 1)];
    const bottom = grid[index(i + 1, j)];
    const left = grid[index(i, j - 1)];

    if (top && !top.visited) neighbors.push(top);
    if (right && !right.visited) neighbors.push(right);
    if (bottom && !bottom.visited) neighbors.push(bottom);
    if (left && !left.visited) neighbors.push(left);

    return neighbors;
  }

  function getVisitedNeighbors(cell) {
    let neighbors = [];
    const i = cell.i;
    const j = cell.j;
    const top = grid[index(i - 1, j)];
    const right = grid[index(i, j + 1)];
    const bottom = grid[index(i + 1, j)];
    const left = grid[index(i, j - 1)];

    if (top && top.visited) neighbors.push(top);
    if (right && right.visited) neighbors.push(right);
    if (bottom && bottom.visited) neighbors.push(bottom);
    if (left && left.visited) neighbors.push(left);

    return neighbors;
  }

  addFrontier(current);

  let interval = setInterval(() => {
    if (frontier.length === 0) {
      clearInterval(interval);
      draw();
      return;
    }

    const randIndex = Math.floor(Math.random() * frontier.length);
    const cell = frontier.splice(randIndex, 1)[0];
    const neighbors = getVisitedNeighbors(cell);

    if (neighbors.length > 0) {
      const neighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      removeWalls(cell, neighbor);
    }

    cell.visited = true;
    addFrontier(cell);
    draw();
  }, 10);
}

function getValidNeighbors(cell) {
  let neighbors = [];
  const i = cell.i;
  const j = cell.j;

  if (!cell.walls[0]) neighbors.push(grid[index(i - 1, j)]);
  if (!cell.walls[1]) neighbors.push(grid[index(i, j + 1)]);
  if (!cell.walls[2]) neighbors.push(grid[index(i + 1, j)]);
  if (!cell.walls[3]) neighbors.push(grid[index(i, j - 1)]);

  return neighbors.filter(n => n);
}

function heuristic(a, b) {
  return Math.abs(a.i - b.i) + Math.abs(a.j - b.j);
}

function bfs(start, end) {
  let queue = [start];
  let visited = new Set([start]);
  let parent = new Map();

  while (queue.length > 0) {
    let current = queue.shift();
    if (current === end) {
      let path = [];
      while (current !== start) {
        path.push(current);
        current = parent.get(current);
      }
      path.push(start);
      path.reverse();
      return path;
    }

    for (let neighbor of getValidNeighbors(current)) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }
  return null;
}

function aStar(start, end) {
  let openSet = [start];
  let cameFrom = new Map();
  let gScore = new Map(grid.map(c => [c, Infinity]));
  let fScore = new Map(grid.map(c => [c, Infinity]));
  gScore.set(start, 0);
  fScore.set(start, heuristic(start, end));
  let visited = new Set();

  while (openSet.length > 0) {
    openSet.sort((a, b) => fScore.get(a) - fScore.get(b));
    let current = openSet.shift();

    if (current === end) {
      let path = [];
      while (current !== start) {
        path.push(current);
        current = cameFrom.get(current);
      }
      path.push(start);
      path.reverse();
      return path;
    }

    visited.add(current);

    for (let neighbor of getValidNeighbors(current)) {
      if (visited.has(neighbor)) continue;

      let tentativeG = gScore.get(current) + 1;
      if (tentativeG < gScore.get(neighbor)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeG);
        fScore.set(neighbor, tentativeG + heuristic(neighbor, end));
        if (!openSet.includes(neighbor)) openSet.push(neighbor);
      }
    }
  }

  return null;
}

function solve() {
  if (!startCell || !endCell) return;

  if (!selectedSolving) {
    alert("Të lutem zgjedh një algoritëm për zgjidhjen e labirintit!");
    return;
  }

  visitedPath.clear();
  previewPathSet.clear();

  const algo = selectedSolving;
  lastAlgorithmUsed = algo;

  if (algo === "astar") {
    path = aStar(startCell, endCell);
  } else {
    path = bfs(startCell, endCell);
  }

  if (path) {
    path.forEach(cell => previewPathSet.add(cell));
    draw();

    setTimeout(() => {
      previewPathSet.clear();
      animatePath();
    }, 1000);
  }
}

function animatePath() {
  if (!path || path.length === 0 || animating) return;
  currentStep = 0;
  animating = true;
  let interval = setInterval(() => {
    if (currentStep < path.length) {
      visitedPath.add(path[currentStep]);
      startCell = path[currentStep];
      draw();
      currentStep++;
    } else {
      animating = false;
      startCell = path[0];
      draw();
      clearInterval(interval);
    }
  }, 100);
}

function resetMaze() {
  initializeGrid();
  path = [];
  visitedPath.clear();
  previewPathSet.clear();
  startCell = null;
  endCell = null;
  clickState = 0;
  draw();
}

function draw() {
  ctx.fillStyle = "#f7f0df";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let cell of grid) {
    let x = cell.j * w;
    let y = cell.i * h;

    if (previewPathSet.has(cell)) {
      ctx.fillStyle = "#CCCCCC";
      ctx.fillRect(x, y, w, h);
    } else if (visitedPath.has(cell)) {
      ctx.fillStyle =
        lastAlgorithmUsed === "astar" ? "#f8dea6" : "#88bedb";
      ctx.fillRect(x, y, w, h);
    } else if (cell.visited) {
      ctx.fillStyle = "#faf1e4";
      ctx.fillRect(x, y, w, h);
    }

    ctx.strokeStyle = "black";
    ctx.lineWidth = 0.4;
    if (cell.walls[0]) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.stroke();
    }
    if (cell.walls[1]) {
      ctx.beginPath();
      ctx.moveTo(x + w, y);
      ctx.lineTo(x + w, y + h);
      ctx.stroke();
    }
    if (cell.walls[2]) {
      ctx.beginPath();
      ctx.moveTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.stroke();
    }
    if (cell.walls[3]) {
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }

  if (startCell) {
    let x = startCell.j * w;
    let y = startCell.i * h;
    ctx.font = `${Math.min(w, h) * 0.8}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🐶", x + w / 2, y + h / 2);
  }

  if (endCell) {
    let x = endCell.j * w;
    let y = endCell.i * h;
    ctx.font = `${Math.min(w, h) * 0.8}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🏠", x + w / 2, y + h / 2);
  }
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const j = Math.floor(x / w);
  const i = Math.floor(y / h);
  const clickedCell = grid[index(i, j)];

  if (clickState === 0) {
    startCell = clickedCell;
    clickState = 1;
  } else if (clickState === 1) {
    endCell = clickedCell;
    clickState = 2;
    draw();
  }
  draw();
});

initializeGrid();
draw();

function toggleDropdown() {
  document.querySelector(".dropdown-options").classList.toggle("show");
}

function selectGeneration(value, label) {
  document.querySelectorAll(".custom-dropdown .dropdown-selected")[0].textContent = label;
  document.querySelector(".dropdown-options").classList.remove("show");
  selectedGeneration = value;
}

let selectedGeneration = "";

let selectedSolving = "";

function toggleSolveDropdown() {
  document.getElementById("solve-options").classList.toggle("show");
}

function selectSolving(value, label) {
  document.querySelector(".dropdown-selected-2").textContent = label;
  document.getElementById("solve-options").classList.remove("show");
  selectedSolving = value;
}

document.addEventListener("click", function (event) {
  const dropdown = document.querySelector(".dropdown-options");
  const selected = document.querySelector(".dropdown-selected");

  if (!dropdown.contains(event.target) && !selected.contains(event.target)) {
    dropdown.classList.remove("show");
  }

  const solveDropdown = document.getElementById("solve-options");
  const solveSelected = document.querySelector(".dropdown-selected-2");

  if (!solveDropdown.contains(event.target) && !solveSelected.contains(event.target)) {
    solveDropdown.classList.remove("show");
  }
});