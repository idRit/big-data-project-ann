const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

const csv = require("csvtojson");

const parseCsv = async () => {
    const csvFilePath = __dirname + "/data/results.csv";
    let jsonArray = await csv().fromFile(csvFilePath);

    jsonArray = jsonArray
    .map(el => {
        return {
            raceId: +el.raceId,
            driverId: +el.driverId,
            constructorId: +el.constructorId,
            rank: +el.rank,
        }
    }).filter(el => {
        return el.raceId ?
            el.driverId ?
                el.constructorId ?
                        el.rank ? true : false
                        : false : false : false;
    });

    let trainingData = jsonArray.map(el => {
        return [
            el.raceId, el.driverId, el.constructorId
        ]
    });

    const arrCopy = JSON.parse(JSON.stringify(jsonArray));
    const heighest = arrCopy.sort((a, b) => a.rank - b.rank).pop().rank;
    let outputArray = jsonArray.map(el => {
        let arr = Array(heighest).fill(0);
        arr[el.rank - 1] = 1;
        return arr
    });

    return {
        trainingData,
        outputArray,
        heighest
    };
}

let trainDataSet = async () => {
    let data = await parseCsv();
    
    const trainingData = tf.tensor2d(data.trainingData);
    const outputData = tf.tensor2d(data.outputArray);
    const testingData = tf.tensor2d([[1052, 1, 131]]);
    
    const model = tf.sequential();
    
    model.add(tf.layers.dense({
        inputShape: 3,
        activation: "sigmoid",
        units: 3
    }));
    model.add(tf.layers.dense({
        activation: "sigmoid",
        units: data.heighest + 3
    }));
    model.add(tf.layers.dense({
        activation: "sigmoid",
        units: data.heighest
    }));

    model.compile({
        loss: "meanSquaredError",
        optimizer: tf.train.adam(0.06)
    });
    
    try {
        await model.fit(trainingData, outputData, { epochs: 100 });
        await model.save('file://' + __dirname + "/model");

        model.predict(testingData).print();
    } catch (error) {
        console.log(error);
    }
}

const run = async (datapoint) => {
    const model = await tf
        .loadLayersModel('file://' + 
                        __dirname + 
                         '/model/model.json'
    );
    
    try {
        const testingData = tf.tensor2d([[datapoint.raceId, datapoint.driverId, datapoint.constructorId]]);
        let el = model.predict(testingData);
        let x = indexOfMax(el.arraySync()[0]);
        return x + 1;
    } catch (error) {
        console.log(error);
        return null;
    }
} 

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}

const main = async () => {
    let res = await run({
        raceId: 1053, 
        driverId: 1,
        constructorId: 131,
    });
    console.log("Input: ", {
        raceId: 1053, 
        driverId: 1,
        constructorId: 131,
    });
    console.log("Output: ", res);
}

main();