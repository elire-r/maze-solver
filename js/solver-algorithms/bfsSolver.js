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