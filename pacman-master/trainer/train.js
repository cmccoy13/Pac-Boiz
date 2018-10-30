const neataptic = require("neataptic");
const fs = require('fs');

main();

function main() {

    const data = [];

    for(let i = 1; i <= 11; i++ ) {
        const contents = fs.readFileSync(`training_data/file${i}.txt`, 'utf8');
        const curData = JSON.parse(contents).data;

        data.push(...curData.map(thing => {
            var newOutput;
            if(thing.output == 0) {
                newOutput = [0,0];
            } else if(thing.output == .25) {
                newOutput = [0, 1];
            } else if(thing.output == .50) {
                newOutput = [1, 0];
            } else {
                newOutput = [1, 1];
            }
            return {input: thing.input, output: newOutput}
        }));
        console.log(i);
    }

    console.log(data[0]);

    const myNetwork = neataptic.architect.Perceptron(data[0].input.length, data[0].input.length + 2, 2);

    console.log(myNetwork);

    myNetwork.train(data, {
        log: 1,
        error: 0.01,
        iterations: 1,
        rate: 0.3
    });

    //download(JSON.stringify(myNetwork.toJSON()), "file.txt", "application/json");


    //console.log(JSON.stringify(myNetwork.toJSON()));

    //data.forEach(thing => console.log(myNetwork.activate(thing.input)));
    console.log(myNetwork.activate(data[0].input));
    console.log(myNetwork.activate(data[100].input));
    console.log(myNetwork.activate(data[200].input));

    fs.writeFile("model.txt", JSON.stringify(myNetwork.toJSON()), function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });

}