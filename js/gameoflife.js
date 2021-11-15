function seed(...args) {
  return args;
}

function same([x, y], [j, k]) {
  return x === j && y === k;
}

// The game state to search for `cell` is passed as the `this` value of the function.
function contains(cell) {
  return !!this.find(livingCell => same(cell, livingCell));
}

const printCell = (cell, state) => {
  if (contains.call(state, cell)) {
    return '\u25A3';
  }

  return '\u25A2';
};

const minMax = (values = []) => {
  return values.reduce((acc, value) => {
    if (value > acc.max) {
      acc.max = value;
    }
    if (value < acc.min) {
      acc.min = value;
    }

    return acc;
  }, { min: values[0] || 0, max: values[0] || 0 });
}

const corners = (state = []) => {
  const [allX, allY] = state.reduce((acc, [x, y]) => {
    acc[0].push(x);
    acc[1].push(y);

    return acc;
  }, [[], []]);

  const { min: minX, max: maxX } = minMax(allX);
  const { min: minY, max: maxY } = minMax(allY);

  return {
    topRight: [maxX, maxY],
    bottomLeft: [minX, minY],
  }
};

const printCells = (state) => {
  const { topRight, bottomLeft } = corners(state);
  let board = '';
  
  for (let y = topRight[1]; y >= bottomLeft[1]; y -= 1) {
    for (let x = bottomLeft[0]; x <= topRight[0]; x += 1) {
      board += printCell([x, y], state) + ' ';
    }

    board = board.trim() + '\n';
  }

  return board;
};

const gridBoundedByCorners = (bottomLeft = [], topRight = []) => {
  const grid = [];

  for (let x = bottomLeft[0]; x <= topRight[0]; x += 1) {
    for (let y = bottomLeft[1]; y <= topRight[1]; y += 1) {
      grid.push([x, y]);
    }
  }

  return grid;
}

const getNeighborsOf = ([x, y]) =>  gridBoundedByCorners([x - 1, y - 1], [x + 1, y + 1]).filter(cell => !same([x, y], cell));

const getLivingNeighbors = (cell, state) => {
  const neighbors = getNeighborsOf(cell);

  return neighbors.filter(neighbor => contains.bind(state)(neighbor));
};

const willBeAlive = (cell, state) => {
  const livingNeighbors = getLivingNeighbors(cell, state);

  return (
    livingNeighbors.length === 3 ||
    (livingNeighbors.length === 2 && contains.bind(state)(cell))
  );
};

const calculateNext = (state) => {
  const { topRight, bottomLeft } = corners(state);
  const newBottomLeft = [bottomLeft[0] - 1, bottomLeft[1] - 1];
  const newTopRight = [topRight[0] + 1, topRight[1] + 1];
  const newGrid = gridBoundedByCorners(newBottomLeft, newTopRight);

  return newGrid.filter(cell => willBeAlive(cell, state));
};

const iterate = (state, iterations) => {
  const gameStates = [state];

  let intermediateState = [...state];
  for (let times = 0; times < iterations; times += 1) {
    intermediateState = calculateNext(intermediateState);
    gameStates.push([...intermediateState]);
  }

  return gameStates;
};

const main = (pattern, iterations) => {
  let initialState = [...startPatterns[pattern]];
  if (!initialState) {
    console.log('');

    return;
  };

  const states = iterate(initialState, iterations);

  console.log(states.map(state => printCells(state)).join('\n'));
};

const startPatterns = {
    rpentomino: [
      [3, 2],
      [2, 3],
      [3, 3],
      [3, 4],
      [4, 4]
    ],
    glider: [
      [-2, -2],
      [-1, -2],
      [-2, -1],
      [-1, -1],
      [1, 1],
      [2, 1],
      [3, 1],
      [3, 2],
      [2, 3]
    ],
    square: [
      [1, 1],
      [2, 1],
      [1, 2],
      [2, 2]
    ]
  };
  
  const [pattern, iterations] = process.argv.slice(2);
  const runAsScript = require.main === module;
  
  if (runAsScript) {
    if (startPatterns[pattern] && !isNaN(parseInt(iterations))) {
      main(pattern, parseInt(iterations));
    } else {
      console.log("Usage: node js/gameoflife.js rpentomino 50");
    }
  }
  
  exports.seed = seed;
  exports.same = same;
  exports.contains = contains;
  exports.getNeighborsOf = getNeighborsOf;
  exports.getLivingNeighbors = getLivingNeighbors;
  exports.willBeAlive = willBeAlive;
  exports.corners = corners;
  exports.calculateNext = calculateNext;
  exports.printCell = printCell;
  exports.printCells = printCells;
  exports.startPatterns = startPatterns;
  exports.iterate = iterate;
  exports.main = main;