
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

    const ghostData = ghosts.flatMap(ghost => [ghost.tile.x / 50, ghost.tile.y / 50]);

    //const board = map.tiles.split("").map(character => (character == '|' || character == '_') ? 1 : 0);

    const nearest = calculateDistanceToNearestDot(pacman.tile.x, pacman.tile.y);

    if(nearest != null) {

        const nearestNormalize = [nearest.x / 50, nearest.y / 50];

        const dataArr = [...pacmanInput, ...nearestNormalize, ...ghostData/*, ...board*/];

        //console.log(dataArr);

        return dataArr;
    }

    return null;
}

function calculateDistanceToNearestDot(xs, ys) {

    for (let d = 1; d<map.currentTiles.length; d++)
    {
        for (let i = 0; i < d + 1; i++)
        {
            const x1 = xs - d + i;
            const y1 = ys - i;

            if(checkIfDot(x1, y1)) {
                return {
                    x: x1,
                    y: y1
                }
            }

            const x2 = xs + d - i;
            const y2 = ys + i;

            if(checkIfDot(x2, y2)) {
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

            if(checkIfDot(x1, y1)) {
                return {
                    x: x1,
                    y: y1
                }
            }

            const x2 = xs + d - i;
            const y2 = ys - i;

            if(checkIfDot(x2, y2)) {
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
    return map.currentTiles[(map.numCols * y) + x] === "." || map.currentTiles[(map.numCols * y) + x] === "o";
}


GeneticPlayer.prototype.steer = function() {

    this.brain.score = this.getFitness();

    if(getDataInput() != null) {
        const input = this.brain.activate(getDataInput());

        if(input < .25) {
            this.dir = {
                x: -1,
                y: 0
            };
        } else if (input < .5) {
            this.dir = {
                x: 1,
                y: 0
            };
        } else if (input < .75) {
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

    if(this.prevTile.x === pacman.tile.x && this.prevTile.y === pacman.tile.y) {
        this.sameSpotCounter++;

        if(this.sameSpotCounter > 250) {
            console.log("over from not moving");
            switchState(overState)
        } else if(this.sameSpotCounter > 60) {
            setScore(getScore() - 1);
        }

    } else {
        this.sameSpotCounter = 0;
    }

    this.prevTile = pacman.tile;


    return getScore();


}
