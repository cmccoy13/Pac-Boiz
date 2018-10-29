
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

function getDataInput() {

    const pacmanInput = [pacman.tile.x / 50, pacman.tile.y / 50];

    const ghostData = ghosts.flatMap(ghost => [ghost.tile.x / 50, ghost.tile.y / 50]);

    const board = map.tiles.split("").map(character => (character == '|' || character == '_') ? 1 : 0);

    const nearest = calculateDistanceToNearestDot(pacman.tile.x, pacman.tile.y);

    if(nearest != null) {

        const nearestNormalize = [nearest.x / 50, nearest.y / 50];

        const dataArr = [...pacmanInput, ...nearestNormalize, ...ghostData, ...board];

        //console.log(dataArr);

        return dataArr;
    }

    return null;

    // let newTiles = [];
    //
    // for(let i = 0; i < map.numRows; i++) {
    //
    //     newTiles[i] = map.currentTiles.slice(i * map.numCols, (i + 1) * map.numCols);
    // }
    //
    // console.log(newTiles);

    //console.log(map);
}

function calculateDistanceToNearestDot(xs, ys) {

    // let distance = 999;
    // let closeX = 0;
    // let closeY = 0;
    //
    // for(let i = 0; i < map.currentTiles.length; i++) {
    //
    //     if(map.currentTiles[i] === ".") {
    //
    //         const y = Math.floor(i / map.numCols);
    //         const x = i % map.numCols;
    //
    //
    //
    //         const curDist = Math.abs(xs - x) + Math.abs(ys - y);
    //
    //         if(curDist < distance) {
    //             distance = curDist;
    //             closeX = x;
    //             closeY = y;
    //         }
    //     }
    // }

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
    return map.currentTiles[(map.numCols * y) + x] === ".";
}