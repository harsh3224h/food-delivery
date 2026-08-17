import { Point, PathResult, GridCell } from '../types/warehouse';

interface PriorityNode {
  point: Point;
  f: number;
  g: number;
}

export function findPathAStar(
  grid: GridCell[][],
  start: Point,
  target: Point,
  allowTargetCellOccupied = true
): PathResult {
  const height = grid.length;
  if (height === 0) return { path: [], distance: 0, manhattanDistance: 0, estimatedTimeSeconds: 0 };
  const width = grid[0].length;

  const manhattan = Math.abs(target.x - start.x) + Math.abs(target.y - start.y);

  // If start is target
  if (start.x === target.x && start.y === target.y) {
    return { path: [start], distance: 0, manhattanDistance: 0, estimatedTimeSeconds: 15 };
  }

  // Find valid walkable target neighbor if target cell itself is a rack/obstacle
  let actualTarget = target;
  if (
    grid[target.y] &&
    grid[target.y][target.x] &&
    grid[target.y][target.x].type !== 'walkable' &&
    grid[target.y][target.x].type !== 'dispatch'
  ) {
    if (allowTargetCellOccupied) {
      const neighbors = getNeighbors(target, width, height);
      const walkableNeighbors = neighbors.filter(
        p => grid[p.y][p.x].type === 'walkable' || grid[p.y][p.x].type === 'dispatch'
      );
      if (walkableNeighbors.length > 0) {
        // Choose closest neighbor to start
        walkableNeighbors.sort(
          (a, b) =>
            Math.abs(a.x - start.x) + Math.abs(a.y - start.y) -
            (Math.abs(b.x - start.x) + Math.abs(b.y - start.y))
        );
        actualTarget = walkableNeighbors[0];
      }
    }
  }

  const openSet: PriorityNode[] = [];
  const closedSet = new Set<string>();
  const parentMap = new Map<string, Point>();
  const gScore = new Map<string, number>();

  const key = (p: Point) => `${p.x},${p.y}`;
  const heuristic = (p: Point) => Math.abs(actualTarget.x - p.x) + Math.abs(actualTarget.y - p.y);

  const startKey = key(start);
  gScore.set(startKey, 0);
  openSet.push({ point: start, g: 0, f: heuristic(start) });

  while (openSet.length > 0) {
    // Sort openSet by f score ascending
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!.point;
    const currentKey = key(current);

    if (current.x === actualTarget.x && current.y === actualTarget.y) {
      // Reconstruct path
      const path: Point[] = [];
      let curr: Point | undefined = current;
      while (curr) {
        path.unshift(curr);
        curr = parentMap.get(key(curr));
      }
      const distance = path.length - 1; // steps
      // Time = (distance * 1.0 meter / 1.2 m/s picker speed) + 15 sec item retrieval pick time
      const timeSeconds = Math.round((distance * 1.0) / 1.2 + 15);

      return {
        path,
        distance,
        manhattanDistance: manhattan,
        estimatedTimeSeconds: timeSeconds
      };
    }

    closedSet.add(currentKey);

    const neighbors = getNeighbors(current, width, height);
    for (const neighbor of neighbors) {
      const neighborKey = key(neighbor);
      if (closedSet.has(neighborKey)) continue;

      const cell = grid[neighbor.y][neighbor.x];
      const isTargetCell = neighbor.x === actualTarget.x && neighbor.y === actualTarget.y;

      // Obstacle or non-walkable rack check
      if (cell.type !== 'walkable' && cell.type !== 'dispatch' && !isTargetCell) {
        continue;
      }

      const tentativeG = (gScore.get(currentKey) ?? Infinity) + 1;
      if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
        parentMap.set(neighborKey, current);
        gScore.set(neighborKey, tentativeG);
        const f = tentativeG + heuristic(neighbor);

        const existingIdx = openSet.findIndex(n => n.point.x === neighbor.x && n.point.y === neighbor.y);
        if (existingIdx >= 0) {
          openSet[existingIdx].g = tentativeG;
          openSet[existingIdx].f = f;
        } else {
          openSet.push({ point: neighbor, g: tentativeG, f });
        }
      }
    }
  }

  // Fallback if blocked (returns Manhattan approximation path)
  const distance = manhattan;
  const timeSeconds = Math.round((distance * 1.0) / 1.2 + 15);
  return {
    path: [start, actualTarget],
    distance,
    manhattanDistance: manhattan,
    estimatedTimeSeconds: timeSeconds
  };
}

function getNeighbors(p: Point, width: number, height: number): Point[] {
  const res: Point[] = [];
  const dirs = [
    { x: 0, y: -1 }, // Up
    { x: 1, y: 0 },  // Right
    { x: 0, y: 1 },  // Down
    { x: -1, y: 0 }  // Left
  ];
  for (const d of dirs) {
    const nx = p.x + d.x;
    const ny = p.y + d.y;
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      res.push({ x: nx, y: ny });
    }
  }
  return res;
}

export function findMultiItemPickRoute(
  grid: GridCell[][],
  start: Point,
  targets: Point[]
): PathResult {
  if (targets.length === 0) {
    return { path: [start], distance: 0, manhattanDistance: 0, estimatedTimeSeconds: 0 };
  }

  // Nearest Neighbor TSP heuristic for pick order
  let current = start;
  const unvisited = [...targets];
  const fullPath: Point[] = [start];
  let totalDistance = 0;
  let totalManhattan = 0;
  let totalTime = 0;

  while (unvisited.length > 0) {
    // Find closest unvisited target
    unvisited.sort(
      (a, b) =>
        Math.abs(a.x - current.x) + Math.abs(a.y - current.y) -
        (Math.abs(b.x - current.x) + Math.abs(b.y - current.y))
    );

    const nextTarget = unvisited.shift()!;
    const res = findPathAStar(grid, current, nextTarget);

    // Append path (excluding first node if already in path)
    if (res.path.length > 1) {
      fullPath.push(...res.path.slice(1));
    }
    totalDistance += res.distance;
    totalManhattan += res.manhattanDistance;
    totalTime += res.estimatedTimeSeconds;
    current = nextTarget;
  }

  // Return to dispatch
  const returnRes = findPathAStar(grid, current, start);
  if (returnRes.path.length > 1) {
    fullPath.push(...returnRes.path.slice(1));
  }
  totalDistance += returnRes.distance;
  totalManhattan += returnRes.manhattanDistance;
  totalTime += returnRes.estimatedTimeSeconds;

  return {
    path: fullPath,
    distance: totalDistance,
    manhattanDistance: totalManhattan,
    estimatedTimeSeconds: totalTime
  };
}
