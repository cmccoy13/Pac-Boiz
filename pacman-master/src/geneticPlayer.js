
var GeneticPlayer = function(genome) {

    // inherit data from Actor
    Player.apply(this);
    this.brain = genome;


    this.prevTile = {
        x: 0,
        y: 0
    };
    this.sameSpotCounter = 0;
    this.highscore = 0;

};

//GeneticPlayer.prototype = Object.create(Player.prototype);
//GeneticPlayer.prototype.constructor = GeneticPlayer;

// inherit functions from Actor
GeneticPlayer.prototype = newChildObject(Player.prototype);


// function getDataInput() {
//
//     const pacmanInput = [pacman.tile.x / 50, pacman.tile.y / 50];
//
//     const ghostData = ghosts.flatMap(ghost => [ghost.tile.x / 50, ghost.tile.y / 50, ghost.scared ? 1 : 0]);
//
//     //const board = map.tiles.split("").map(character => (character == '|' || character == '_') ? 1 : 0);
//
//     const nearest = calculateDistanceToNearestDot(pacman.tile.x, pacman.tile.y, checkIfDot);
//
//     const nearestPower = calculateDistanceToNearestDot(pacman.tile.x, pacman.tile.y, checkIfPower);
//
//     if(nearest != null) {
//
//         const nearestNormalize = [nearest.x / 50, nearest.y / 50, nearestPower.x / 50, nearestPower.y / 50];
//
//         const dataArr = [...pacmanInput, ...nearestNormalize, ...ghostData/*, ...board*/];
//
//         //console.log(dataArr);
//
//         return dataArr;
//     }
//
//     return null;
// }

// function calculateDistanceToNearestDot(xs, ys, checkFunc) {
//
//     for (let d = 1; d<map.currentTiles.length; d++)
//     {
//         for (let i = 0; i < d + 1; i++)
//         {
//             const x1 = xs - d + i;
//             const y1 = ys - i;
//
//             if(checkFunc(x1, y1)) {
//                 return {
//                     x: x1,
//                     y: y1
//                 }
//             }
//
//             const x2 = xs + d - i;
//             const y2 = ys + i;
//
//             if(checkFunc(x2, y2)) {
//                 return {
//                     x: x2,
//                     y: y2
//                 }
//             }
//         }
//
//
//         for (let i = 1; i < d; i++)
//         {
//             const x1 = xs - i;
//             const y1 = ys + d - i;
//
//             if(checkFunc(x1, y1)) {
//                 return {
//                     x: x1,
//                     y: y1
//                 }
//             }
//
//             const x2 = xs + d - i;
//             const y2 = ys - i;
//
//             if(checkFunc(x2, y2)) {
//                 return {
//                     x: x2,
//                     y: y2
//                 }
//             }
//         }
//     }
//
//     return null;
//
// }

function checkThreatLevel() {
    const distanceCheck = 8;
    const visited = new Set();

    const initUp = {
        x: pacman.tile.x,
        y: pacman.tile.y - 1,
        distance: 1,
        dir: 0
    };
    const initRight = {
        x: pacman.tile.x + 1,
        y: pacman.tile.y,
        distance: 1,
        dir: 1
    };
    const initDown = {
        x: pacman.tile.x,
        y: pacman.tile.y + 1,
        distance: 1,
        dir: 2
    };
    const initLeft = {
        x: pacman.tile.x - 1,
        y: pacman.tile.y,
        distance: 1,
        dir: 3
    };

    const queue = [initUp, initRight, initDown, initLeft];
    const threat = [0,0,0,0];

    while(queue.length > 0) {
        let current = queue.pop();

        const visitedString = current.x + " " + current.y;

        if(threat[current.dir] !== 1 && !visited.has(visitedString) && map.isFloorTile(current.x, current.y)) {

            visited.add(visitedString);

            if (ghosts.filter(ghost => ghost.tile.x === current.x && ghost.tile.y === current.y && !ghost.scared && ghost.mode !== GHOST_GOING_HOME).length > 0) {
                threat[current.dir] = 1;
            } else if(current.distance + 1 <= distanceCheck) {
                const up = {
                    x: current.x,
                    y: current.y - 1,
                    distance: current.distance + 1,
                    dir: current.dir
                };
                const right = {
                    x: current.x + 1,
                    y: current.y,
                    distance: current.distance + 1,
                    dir: current.dir
                };
                const down = {
                    x: current.x,
                    y: current.y + 1,
                    distance: current.distance + 1,
                    dir: current.dir
                };
                const left = {
                    x: current.x - 1,
                    y: current.y,
                    distance: current.distance + 1,
                    dir: current.dir
                };

                queue.unshift(...[up, right, down, left])
            }
        }
    }
    return threat;
}

function getNearestDotDir() {
    const visited = new Set();

    const initUp = {
        x: pacman.tile.x,
        y: pacman.tile.y - 1,
        dir: 0
    };
    const initRight = {
        x: pacman.tile.x + 1,
        y: pacman.tile.y,
        dir: 1
    };
    const initDown = {
        x: pacman.tile.x,
        y: pacman.tile.y + 1,
        dir: 2
    };
    const initLeft = {
        x: pacman.tile.x - 1,
        y: pacman.tile.y,
        dir: 3
    };

    const queue = [initUp, initRight, initDown, initLeft];

    while(queue.length > 0) {
        let current = queue.pop();

        const visitedString = current.x + " " + current.y;

        if(!visited.has(visitedString) && map.isFloorTile(current.x, current.y)) {

            visited.add(visitedString);

            const tileChar = map.getTile(current.x, current.y);
            if (tileChar === '.' || tileChar === 'o') {
                return current.dir;
            }
            else {
                const up = {
                    x: current.x,
                    y: current.y - 1,
                    dir: current.dir
                };
                const right = {
                    x: current.x + 1,
                    y: current.y,
                    dir: current.dir
                };
                const down = {
                    x: current.x,
                    y: current.y + 1,
                    dir: current.dir
                };
                const left = {
                    x: current.x - 1,
                    y: current.y,
                    dir: current.dir
                };

                queue.unshift(...[up, right, down, left])
            }
        }
    }
    return -1;
}

function getSurroundingWalls() {
    const above = map.isFloorTile(pacman.tile.x, pacman.tile.y - 1) ? 1 : 0;
    const right = map.isFloorTile(pacman.tile.x + 1, pacman.tile.y) ? 1 : 0;
    const below = map.isFloorTile(pacman.tile.x, pacman.tile.y + 1) ? 1 : 0;
    const left = map.isFloorTile(pacman.tile.x - 1, pacman.tile.y) ? 1 : 0;

    return [above, right, below, left];
}

function getDataInput() {
    const threat = checkThreatLevel();
    const intended = getNearestDotDir();
    //[up, right, down, left]
    const intendedArr = [intended === 0 ? 1 : 0, intended === 1 ? 1 : 0, intended === 2 ? 1 : 0, intended === 3 ? 1 : 0];
    //console.log(intendedArr);

    const walls = getSurroundingWalls();

    return [...walls, ...intendedArr, ...threat];
}

// function checkIfDot(x, y) {
//     if(x < 0 || y < 0 || x > map.numCols - 1 || y > map.numRows - 1) {
//         return false;
//     }
//     return map.currentTiles[(map.numCols * y) + x] === ".";
// }
//
// function checkIfPower(x, y) {
//     if(x < 0 || y < 0 || x > map.numCols - 1 || y > map.numRows - 1) {
//         return false;
//     }
//     return map.currentTiles[(map.numCols * y) + x] === "o";
// }


GeneticPlayer.prototype.steer = function() {

    this.brain.score = this.getFitness();
    //
    //if(getDataInput() != null) {

    const percept = getDataInput();
    //console.log(percept[4] * 4);
    const input = this.brain.activate(percept);

    let maxIndex = 0;
    for(let i = 1; i < input.length; i++) {
        if(input[i] > input[maxIndex]) {
            maxIndex = i;
        }
    }

    // if(percept[4] == 1) {
    //     maxIndex = 0;
    // } else if(percept[5] == 1) {
    //     maxIndex = 1;
    // } else if(percept[6] == 1) {
    //     maxIndex = 2;
    // } else {
    //     maxIndex = 3;
    // }

    //let maxIndex = percept[4] * 4;

    //console.log(maxIndex);

    // console.log(input);

    if(maxIndex === 0) {
        if(percept[0] === 1) {
            setScore(getScore() - 1000);
        }
        this.inputDirEnum = DIR_UP;
    } else if (maxIndex === 1) {
        if(percept[1] === 1) {
            setScore(getScore() - 1000);
        }
        this.inputDirEnum = DIR_RIGHT;
    } else if (maxIndex === 2) {
        if(percept[2] === 1) {
            setScore(getScore() - 1000);
        }
        this.inputDirEnum = DIR_DOWN;
    }else {
        if(percept[3] === 1) {
            setScore(getScore() - 1000);
        }
        this.inputDirEnum = DIR_LEFT;
    }

    //}
    setScore(getScore() - 1);

    Player.prototype.steer.call(this);
}

GeneticPlayer.prototype.setGenome = function(genome) {
    this.brain = genome;
    this.sameSpotCounter = 0;
    this.prevTile = {
        x: 0,
        y: 0
    };
    this.highscore = 0;
};

GeneticPlayer.prototype.getFitness = function() {

    if(getScore() > this.highscore) {
        this.highscore = getScore();
    } else if(getScore() + 3000 < this.highscore) {
        switchState(overState)
    }

    if(getScore() < -100) {
        switchState(overState)
    }

    if(Math.abs(this.prevTile.x - pacman.tile.x) <= 1 && Math.abs(this.prevTile.y - pacman.tile.y) <= 1) {
        this.sameSpotCounter++;

        if(this.sameSpotCounter > 120) {
            this.sameSpotCounter = 0;
            console.log("over from not moving");
            switchState(overState)
        } else if(this.sameSpotCounter > 30) {
            setScore(getScore() - 5);
        }

    } else {
        this.sameSpotCounter = 0;

        this.prevTile = {
            x: pacman.tile.x,
            y: pacman.tile.y
        };
    }


    return getScore();


}
