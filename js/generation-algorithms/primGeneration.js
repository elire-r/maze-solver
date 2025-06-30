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