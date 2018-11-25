
var GeneticPlayer = function(genome) {

    // inherit data from Actor
    Player.apply(this);
    this.brain = genome;


    this.prevTile = {
        x: 0,
        y: 0
    };
    this.sameSpotCounter = 0;

    console.log(this);

};

//GeneticPlayer.prototype = Object.create(Player.prototype);
//GeneticPlayer.prototype.constructor = GeneticPlayer;

// inherit functions from Actor
GeneticPlayer.prototype = newChildObject(Player.prototype);


function getDataInput() {

    const pacmanInput = [pacman.tile.x / 50, pacman.tile.y / 50];


    const ghostData = ghosts.flatMap(ghost => [ghost.tile.x, ghost.tile.y, ghost.scared ? 1 : 0]);

    if(ghostData != null) {
        const distGhost1 = Math.abs(pacman.tile.x - ghostData[0]) + Math.abs(pacman.tile.y - ghostData[1])
        const distGhost2 = Math.abs(pacman.tile.x - ghostData[3]) + Math.abs(pacman.tile.y - ghostData[4])
        const distGhost3 = Math.abs(pacman.tile.x - ghostData[6]) + Math.abs(pacman.tile.y - ghostData[7])
        const distGhost4 = Math.abs(pacman.tile.x - ghostData[9]) + Math.abs(pacman.tile.y - ghostData[10])

        if(distGhost1 <= distGhost2) {
            if(distGhost3 <= distGhost4) {
                if(distGhost1 <= distGhost3) {
                    const ghostInput = [(((ghostData[0] - pacman.tile.x)+50)/100), (((ghostData[1] - pacman.tile.y)+50)/100)]
                }
                else {
                    const ghostInput = [(((ghostData[6] - pacman.tile.x)+50)/100), (((ghostData[7] - pacman.tile.y)+50)/100)]
                }
            }
            else {
                if(distGhost1 <= distGhost4) {
                    const ghostInput = [(((ghostData[0] - pacman.tile.x)+50)/100), (((ghostData[1] - pacman.tile.y)+50)/100)]
                }
                else {
                    const ghostInput = [(((ghostData[9] - pacman.tile.x)+50)/100), (((ghostData[10] - pacman.tile.y)+50)/100)]
                }
            }
        }
        else {
            if(distGhost3 <= distGhost4) {
                if(distGhost2 <= distGhost3) {
                    const ghostInput = [(((ghostData[3] - pacman.tile.x)+50)/100), (((ghostData[4] - pacman.tile.y)+50)/100)]
                }
                else {
                    const ghostInput = [(((ghostData[6] - pacman.tile.x)+50)/100), (((ghostData[7] - pacman.tile.y)+50)/100)]
                }
            }
            else {
                if(distGhost2 <= distGhost4) {
                    const ghostInput = [(((ghostData[3] - pacman.tile.x)+50)/100), (((ghostData[4] - pacman.tile.y)+50)/100)]
                }
                else {
                    const ghostInput = [(((ghostData[9] - pacman.tile.x)+50)/100), (((ghostData[10] - pacman.tile.y)+50)/100)]
                }
            }
        }
    }
    else {
        const ghostInput = [0, 0]
    }

    //const board = map.tiles.split("").map(character => (character == '|' || character == '_') ? 1 : 0);

    const nearest = calculateDistanceToNearestDot(pacman.tile.x, pacman.tile.y, checkIfDot);

    const nearestPower = calculateDistanceToNearestDot(pacman.tile.x, pacman.tile.y, checkIfPower);

    if(nearest != null) {

        const nearestDist = [(((nearest.x - pacman.tile.x)+50)/100), (((nearest.y - pacman.tile.y)+50)/100)]

        const nearestNormalize = [nearest.x / 50, nearest.y / 50, nearestPower.x / 50, nearestPower.y / 50];

        //const dataArr = [...pacmanInput, ...nearestNormalize, ...ghostData/*, ...board*/];

        const dataARr = [...nearestDist, ...ghostInput]

        //console.log(dataArr);

        return dataArr;
    }

    return null;
}

function calculateDistanceToNearestDot(xs, ys, checkFunc) {

    for (let d = 1; d<map.currentTiles.length; d++)
    {
        for (let i = 0; i < d + 1; i++)
        {
            const x1 = xs - d + i;
            const y1 = ys - i;

            if(checkFunc(x1, y1)) {
                return {
                    x: x1,
                    y: y1
                }
            }

            const x2 = xs + d - i;
            const y2 = ys + i;

            if(checkFunc(x2, y2)) {
                return {
                    x: x2,
                    y: y2
                }
            }
        }


        for (let i = 1; i < d; i++)
        {
            const x1 = xs - i;
            const y1 = ys + d - i;

            if(checkFunc(x1, y1)) {
                return {
                    x: x1,
                    y: y1
                }
            }

            const x2 = xs + d - i;
            const y2 = ys - i;

            if(checkFunc(x2, y2)) {
                return {
                    x: x2,
                    y: y2
                }
            }
        }
    }

    return null;

}

function checkIfDot(x, y) {
    if(x < 0 || y < 0 || x > map.numCols - 1 || y > map.numRows - 1) {
        return false;
    }
    return map.currentTiles[(map.numCols * y) + x] === ".";
}

function checkIfPower(x, y) {
    if(x < 0 || y < 0 || x > map.numCols - 1 || y > map.numRows - 1) {
        return false;
    }
    return map.currentTiles[(map.numCols * y) + x] === "o";
}


GeneticPlayer.prototype.steer = function() {

    this.brain.score = this.getFitness();

    if(getDataInput() != null) {
        const input = this.brain.activate(getDataInput());

        let maxIndex = 0;
        for(let i = 1; i < input.length; i++) {
            if(input[i] > input[maxIndex]) {
                maxIndex = i;
            }
        }

        // console.log(input);

        if(maxIndex === 0) {
            this.dir = {
                x: -1,
                y: 0
            };
        } else if (maxIndex === 1) {
            this.dir = {
                x: 1,
                y: 0
            };
        } else if (maxIndex === 2) {
            this.dir = {
                x: 0,
                y: -1
            };
        }else {
            this.dir = {
                x: 0,
                y: 1
            };
        }

    }
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
};

GeneticPlayer.prototype.getFitness = function() {

    if(getScore() < -100) {
        switchState(overState)
    }

    if(this.prevTile.x === pacman.tile.x && this.prevTile.y === pacman.tile.y) {
        this.sameSpotCounter++;

        if(this.sameSpotCounter > 250) {
            console.log("over from not moving");
            switchState(overState)
        } else if(this.sameSpotCounter > 60) {
            setScore(getScore() - 5);
        }

    } else {
        this.sameSpotCounter = 0;
    }

    console.log(this.sameSpotCounter)

    this.prevTile = pacman.tile;


    return getScore();


}
