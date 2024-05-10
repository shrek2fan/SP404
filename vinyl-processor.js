console.log("Executing vinyl-processor.js");

class VinylProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [{ name: 'noiseLevel', defaultValue: 0.02 }];
    }

    process(inputs, outputs, parameters) {
        console.log("Processing audio in vinyl-processor.");
        // existing processing code
        return true;
    }
}

registerProcessor('vinyl-processor', VinylProcessor);
console.log("VinylProcessor registered successfully.");
