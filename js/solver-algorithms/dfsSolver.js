function dfs(start, end) {
  let stack = [start];
  let visited = new Set([start]);
  let parent = new Map();

  while (stack.length > 0) {
    let current = stack.pop();
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
        stack.push(neighbor);
      }
    }
  }

  return null;
}
