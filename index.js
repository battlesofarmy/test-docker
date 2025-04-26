const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/run', (req, res) => {
  const { code, input } = req.body;

  // Save code to temp file
  fs.writeFileSync('main.cpp', code);

  // Compile code
  exec('g++ main.cpp -o main', (err, stdout, stderr) => {
    if (err) {
      return res.json({ error: stderr });
    }

    // Run executable with input
    const run = exec('./main', (runErr, runOut, runErrOut) => {
      if (runErr) return res.json({ error: runErrOut });
      return res.json({ output: runOut });
    });

    if (input) {
      run.stdin.write(input);
      run.stdin.end();
    }
  });
});

app.get('/', (req, res)=>{
  res.send("Hello Docker!");
})

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
