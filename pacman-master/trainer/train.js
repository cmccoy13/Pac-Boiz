const neataptic = require("neataptic");
const fs = require('fs');

main();

function main() {

    const contents = fs.readFileSync('training_data/file.txt', 'utf8');
    const data = JSON.parse(contents).data;

    const myNetwork = neataptic.architect.Perceptron(data[0].input.length, data[0].input.length + 1, 1);

    console.log(myNetwork);

    myNetwork.train(data, {
        log: 1,
        error: 0.01,
        iterations: 10,
        rate: 0.3
    });

    //download(JSON.stringify(myNetwork.toJSON()), "file.txt", "application/json");


    //console.log(JSON.stringify(myNetwork.toJSON()));

    data.forEach(thing => console.log(myNetwork.activate(thing.input)));
}