class VinylProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
      return [{ name: 'noiseLevel', defaultValue: 0.02 }];
    }
  
    process(inputs, outputs, parameters) {
      const output = outputs[0];
      const noiseLevel = parameters.noiseLevel;
      output.forEach(channel => {
        for (let i = 0; i < channel.length; i++) {
          channel[i] = (Math.random() * 2 - 1) * noiseLevel[0];
        }
      });
      return true;
    }
  }
  
  registerProcessor('vinyl-processor', VinylProcessor);
  