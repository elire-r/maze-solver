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
