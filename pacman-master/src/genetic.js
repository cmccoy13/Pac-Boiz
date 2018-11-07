
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

// function gatherDataAndTrain() {
//     const curData = getDataInput();
//
//     if (outputData.length < inputData.length) {
//         outputData.push(pacman.dirEnum / 4);
//     }
//
//     if(curData != null) {
//
//         inputData.push(curData);
//
//     } else {
//         const fullData = [];
//         for(let i = 0; i < inputData.length; i++) {
//             if(i % 60 === 0) {
//                 fullData.push({
//                     input: inputData[i],
//                     output: [outputData[i]]
//                 });
//             }
//         }
//
//         download(JSON.stringify({data: fullData}), "file.txt", "application/json");
//     }
// }


let Neat = neataptic.Neat;
let architect = neataptic.architect;
let methods = neataptic.methods;
//var Config  = neataptic.Config;

// GA settings
let PLAYER_AMOUNT     = 180;
let ITERATIONS        = 1000;
let INPUT_GENOME_SIZE = 18;
let OUTPUT_GENOME_SIZE = 4;
let START_HIDDEN_SIZE = 2;
let MUTATION_RATE     = 0.7;
let ELITISM_PERCENT   = 0.1;

// Trained population
let USE_TRAINED_POP = true;

let SAVE_EVERY = 5;

let neat;

/** Construct the genetic algorithm */
function initNeat(){
    neat = new Neat(
        INPUT_GENOME_SIZE,
        OUTPUT_GENOME_SIZE,
        fitness,
        {
            mutation: methods.mutation.ALL,
            crossover: [
                methods.crossover.UNIFORM,
                methods.crossover.AVERAGE,
                methods.crossover.SINGLE_POINT,
                methods.crossover.TWO_POINT
            ],
            popsize: PLAYER_AMOUNT,
            mutationRate: MUTATION_RATE,
            elitism: Math.round(ELITISM_PERCENT * PLAYER_AMOUNT),
            network: new architect.Random(INPUT_GENOME_SIZE, START_HIDDEN_SIZE, OUTPUT_GENOME_SIZE)
        }
    );

    console.log(neat);

     if(USE_TRAINED_POP) {
         var newPop = [];
         for(var i = 0; i < PLAYER_AMOUNT; i++){
             var json = population.data[i % population.data.length];
             newPop[i] = neataptic.Network.fromJSON(json);
         }
         neat.population = newPop;
         neat.generation = population.generation;
         console.log(neat.generation);
         //neat.population = neataptic.Network.fromJSON(population);
     } else {
         neat.mutate();
     }
}

function fitness(genome) {
    return genome.score;
}

/** Start the evaluation of the current generation */
function startEvaluation(){

    if(neat.generation != 0) {
        if (USE_TRAINED_POP && neat.generation != population.generation && neat.generation % SAVE_EVERY === 0) {
            download(`var population = {generation: ${neat.generation}, data: ${JSON.stringify(neat.population)}}`, `population${neat.generation}.txt`, "text/plain");
        } else if (!USE_TRAINED_POP && neat.generation % SAVE_EVERY === 0) {
            download(`var population = {generation: ${neat.generation}, data: ${JSON.stringify(neat.population)}}`, `population${neat.generation}.txt`, "text/plain");
        }
    }

    console.log(`generation: ${neat.generation}`);
    players = [];
    highestScore = 0;

    genomeIndex = 0;

    document.getElementById("generation").textContent = neat.generation;

    evaluateGenome();
}

function evaluateGenome() {

    console.log(`generation: ${neat.generation}, genome: ${genomeIndex}`);

    if(genomeIndex < neat.population.length) {
        const genome = neat.population[genomeIndex];

        document.getElementById("agent").textContent = genomeIndex + 1;


        drawGraph(genome.graph(600, 200), '.draw');

        //console.log(genome);

        pacman.setGenome(genome);
        // pacman.name = "pacman";
        // pacman.color = "#FFFF00";
        // pacman.pathColor = "rgba(255,255,0,0.8)";

        gameover = false;
        newGameState.setStartLevel(1);
        switchState(newGameState);
        executive.init();
        //genomeIndex++;
    } else {
        endEvaluation();
    }
}

/** End the evaluation of the current generation */
function endEvaluation(){
    console.log('Generation:', neat.generation, '- average score:', neat.getAverage());


    // if(neat.generation % 10 === 0) {
    //     download(`var population = {generation: ${neat.generation}, data: ${JSON.stringify(neat.population)}}`, `population${neat.generation}.txt`, "text/plain");
    // }

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
    //neat.crossOver();

    neat.generation++;
    startEvaluation();
}


