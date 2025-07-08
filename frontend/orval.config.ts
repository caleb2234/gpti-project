export default {
  gptiProject: {
    input: 'http://localhost:3001/docs/json',
    output: {
      target: './src/api/generated.ts',   
      client: 'fetch',           
    },
  },
};