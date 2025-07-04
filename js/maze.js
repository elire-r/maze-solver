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



function solve() {
  if (!startCell || !endCell) return;

  if (!selectedSolving) {
    alert("Të lutem zgjedh një algoritëm për zgjidhjen e labirintit!");
    return;
  }

  visitedPath.clear();
  previewPathSet.clear();

  let visitedOrder = []; // qelizat qe eksplorohen me radhe
  const algo = selectedSolving;
  lastAlgorithmUsed = algo;

  function bfsWithOrder(start, end) {
    let queue = [start];
    let visited = new Set([start]);
    let parent = new Map();
    visitedOrder.push(start);

    while (queue.length > 0) {
      let current = queue.shift();
      if (current === end) break;

      for (let neighbor of getValidNeighbors(current)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          visitedOrder.push(neighbor);
          parent.set(neighbor, current);
          queue.push(neighbor);
        }
      }
    }

    let path = [];
    if (parent.has(end)) {
      let current = end;
      while (current !== start) {
        path.push(current);
        current = parent.get(current);
      }
      path.push(start);
      path.reverse();
    }
    return path;
  }

  function dfsWithOrder(start, end) {
    let stack = [start];
    let visited = new Set([start]);
    let parent = new Map();
    visitedOrder.push(start);

    while (stack.length > 0) {
      let current = stack.pop();
      if (current === end) break;

      for (let neighbor of getValidNeighbors(current)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          visitedOrder.push(neighbor);
          parent.set(neighbor, current);
          stack.push(neighbor);
        }
      }
    }

    let path = [];
    if (parent.has(end)) {
      let current = end;
      while (current !== start) {
        path.push(current);
        current = parent.get(current);
      }
      path.push(start);
      path.reverse();
    }
    return path;
  }

  function aStarWithOrder(start, end) {
    let openSet = [start];
    let cameFrom = new Map();
    let gScore = new Map(grid.map(c => [c, Infinity]));
    let fScore = new Map(grid.map(c => [c, Infinity]));
    let visited = new Set();
    gScore.set(start, 0);
    fScore.set(start, heuristic(start, end));
    visitedOrder.push(start);

    while (openSet.length > 0) {
      openSet.sort((a, b) => fScore.get(a) - fScore.get(b));
      let current = openSet.shift();

      if (current === end) break;

      visited.add(current);

      for (let neighbor of getValidNeighbors(current)) {
        if (visited.has(neighbor)) continue;
        visitedOrder.push(neighbor);

        let tentativeG = gScore.get(current) + 1;
        if (tentativeG < gScore.get(neighbor)) {
          cameFrom.set(neighbor, current);
          gScore.set(neighbor, tentativeG);
          fScore.set(neighbor, tentativeG + heuristic(neighbor, end));
          if (!openSet.includes(neighbor)) openSet.push(neighbor);
        }
      }
    }

    let path = [];
    if (cameFrom.has(end)) {
      let current = end;
      while (current !== start) {
        path.push(current);
        current = cameFrom.get(current);
      }
      path.push(start);
      path.reverse();
    }
    return path;
  }

  if (algo === "astar") {
    path = aStarWithOrder(startCell, endCell);
  } else if (algo === "dfs") {
    path = dfsWithOrder(startCell, endCell);
  } else {
    path = bfsWithOrder(startCell, endCell);
  }

  if (path && path.length > 0) {
    animateExploration(visitedOrder, path);
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
  const isDarkMode = document.body.classList.contains("dark-mode");
ctx.fillStyle = isDarkMode ? "#3c3c3c" : "#f7f0df";
ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let cell of grid) {
    let x = cell.j * w;
    let y = cell.i * h;

    // 1. Rruga perfundimtare (mbivendoset siper)
if (previewPathSet.has(cell)) {
  ctx.fillStyle =
    lastAlgorithmUsed === "astar"
      ? (isDarkMode ? "#8c6b3f" : "#f8dea6")
      : lastAlgorithmUsed === "dfs"
      ? (isDarkMode ? "#43553d" : "#d8e5c2")
      : (isDarkMode ? "#3e6c89" : "#88bedb");
  ctx.fillRect(x, y, w, h);

// 2. Qelizat e vizituara gjate eksplorimit (ngjyre gri)
} else if (visitedPath.has(cell)) {
  ctx.fillStyle = isDarkMode ? "#3c3c3c" : "#f7e6c8";
  ctx.fillRect(x, y, w, h);

// 3. Qelizat e gjeneruara ne labirint
} else if (cell.visited) {
  ctx.fillStyle = isDarkMode ? "#2a2a2a" : "#faf1e4";
  ctx.fillRect(x, y, w, h);
}


    // 4. Vizato muret
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

  // 5. Vizato qenin (starti)
  if (startCell) {
    let x = startCell.j * w;
    let y = startCell.i * h;
    ctx.font = `${Math.min(w, h) * 0.8}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🐶", x + w / 2, y + h / 2);
  }

  // 6. Vizato shtepine (fundi)
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


function animateExploration(order, finalPath) {
  let i = 0;
  animating = true;

  let interval = setInterval(() => {
    if (i < order.length) {
      visitedPath.add(order[i]); // gri – vizitimi
      draw();
      i++;
    } else {
      clearInterval(interval);

      // rruga me ngjyren perkatese per algoritmin
      finalPath.forEach(cell => previewPathSet.add(cell));
      draw();

      setTimeout(() => {
        previewPathSet.clear();
        animatePath(); // qeni ndjek rrugen
      }, 600);
    }
  }, 30); // kontrollo shpejtesine
}



// === NIGHT MODE FUNCTIONALITY ===
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("themeToggle");
  const text = document.getElementById("modeText");

  toggle.addEventListener("change", () => {
    const isDark = toggle.checked;
    document.body.classList.toggle("dark-mode", isDark);
    text.textContent = isDark ? "Dark mode" : "Light mode";

    // Kjo siguron qe canvas te ridizajnohet me sfond të erret/qarte
    draw();
  });
});

