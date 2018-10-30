
let inputData = [];
let outputData = [];

function download(data, filename, type) {
    const file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        const a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

function gatherDataAndTrain() {
    const curData = getDataInput();

    if (outputData.length < inputData.length) {
        outputData.push(pacman.dirEnum / 4);
    }

    if(curData != null) {

        inputData.push(curData);

    } else {
        const fullData = [];
        for(let i = 0; i < inputData.length; i++) {
            if(i % 60 === 0) {
                fullData.push({
                    input: inputData[i],
                    output: [outputData[i]]
                });
            }
        }

        download(JSON.stringify({data: fullData}), "file.txt", "application/json");
    }
}

//[pacmanX, pacmanY, nearestDotX, nearestDotY, ghostX, ghostY, board]

// function getDataInput() {
//
//     const pacmanInput = [pacman.tile.x / 50, pacman.tile.y / 50];
//
//     const ghostData = ghosts.flatMap(ghost => [ghost.tile.x / 50, ghost.tile.y / 50]);
//
//     const board = map.tiles.split("").map(character => (character == '|' || character == '_') ? 1 : 0);
//
//     const nearest = calculateDistanceToNearestDot(pacman.tile.x, pacman.tile.y);
//
//     if(nearest != null) {
//
//         const nearestNormalize = [nearest.x / 50, nearest.y / 50];
//
//         const dataArr = [...pacmanInput, ...nearestNormalize, ...ghostData, ...board];
//
//         //console.log(dataArr);
//
//         return dataArr;
//     }
//
//     return null;
//
//     // let newTiles = [];
//     //
//     // for(let i = 0; i < map.numRows; i++) {
//     //
//     //     newTiles[i] = map.currentTiles.slice(i * map.numCols, (i + 1) * map.numCols);
//     // }
//     //
//     // console.log(newTiles);
//
//     //console.log(map);
// }

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

let Neat = neataptic.Neat;
let architect = neataptic.architect;
let methods = neataptic.methods;
//var Config  = neataptic.Config;

// GA settings
let PLAYER_AMOUNT     = 10;
let ITERATIONS        = 1000;
let INPUT_GENOME_SIZE = 1020;
let OUTPUT_GENOME_SIZE = 2;
let START_HIDDEN_SIZE = 0;
let MUTATION_RATE     = 0.3;
let ELITISM_PERCENT   = 0.1;

// Trained population
let USE_TRAINED_POP = true;

let neat;

/** Construct the genetic algorithm */
function initNeat(){
    neat = new Neat(
        INPUT_GENOME_SIZE,
        OUTPUT_GENOME_SIZE,
        null,
        {
            mutation: methods.mutation.ALL,
            popsize: PLAYER_AMOUNT,
            mutationRate: MUTATION_RATE,
            elitism: Math.round(ELITISM_PERCENT * PLAYER_AMOUNT),
            network: new architect.Random(INPUT_GENOME_SIZE, START_HIDDEN_SIZE, OUTPUT_GENOME_SIZE)
        }
    );

    console.log(neat);

    // if(USE_TRAINED_POP)
    //     neat.population = population;
}

/** Start the evaluation of the current generation */
function startEvaluation(){
    console.log(`generation: ${neat.generation}`);
    players = [];
    highestScore = 0;

    genomeIndex = 0;

    neat.mutate();

    evaluateGenome();
}

function evaluateGenome() {



    if(genomeIndex < neat.population.length) {
        const genome = neat.population[genomeIndex];

        console.log(genome);

        pacman.setGenome(genome);
        // pacman.name = "pacman";
        // pacman.color = "#FFFF00";
        // pacman.pathColor = "rgba(255,255,0,0.8)";

        gameover = false;
        newGameState.setStartLevel(1);
        switchState(newGameState);
        executive.init();
        genomeIndex++;
    } else {
        endEvaluation();
    }
}

/** End the evaluation of the current generation */
function endEvaluation(){
    console.log('Generation:', neat.generation, '- average score:', neat.getAverage());

    neat.sort();
    var newPopulation = [];

    // Elitism
    for(var i = 0; i < neat.elitism; i++){
        newPopulation.push(neat.population[i]);
    }

    // Breed the next individuals
    for(var i = 0; i < neat.popsize - neat.elitism; i++){
        newPopulation.push(neat.getOffspring());
    }

    // Replace the old population with the new population
    neat.population = newPopulation;
    neat.mutate();

    neat.generation++;
    startEvaluation();
}