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