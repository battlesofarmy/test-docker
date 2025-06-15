// const express = require('express');
// const cors = require('cors');
// const fs = require('fs');
// // const { exec } = require('child_process');
// const { exec, spawn } = require('child_process');

// const app = express();
// app.use(cors());
// app.use(express.json());

// // app.post('/run', (req, res) => {
// //   const { code, input } = req.body;

// //   // Save code to temp file
// //   fs.writeFileSync('main.cpp', code);

// //   // Compile code
// //   exec('g++ main.cpp -o main', (err, stdout, stderr) => {
// //     if (err) {
// //       return res.json({ error: stderr });
// //     }

// //     // Run executable with input
// //     const run = exec('./main', (runErr, runOut, runErrOut) => {
// //       if (runErr) return res.json({ error: runErrOut });
// //       return res.json({ output: runOut });
// //     });

// //     if (input) {
// //       run.stdin.write(input);
// //       run.stdin.end();
// //     }
// //   });
// // });



// app.post('/run', (req, res) => {
//   const { code, testCases } = req.body;

//   if (!code || !Array.isArray(testCases)) {
//     return res.status(400).json({ error: "Invalid payload" });
//   }

//   fs.writeFileSync('main.cpp', code);

//   // Compile
//   // exec('g++ main.cpp -o main', async (err, stdout, stderr) => {
//     exec('g++ -I. main.cpp -o main', async(err, stdout, stderr) => {
//     if (err) {
//       return res.json({ error: stderr });
//     }

//     try{
//       const results = [];

//     for (let i = 0; i < testCases.length; i++) {
//       const { input, output: expectedOutput } = testCases[i];

//       const start = process.hrtime();
//       const run = spawn('./main');
//       let stdoutData = '';
//       let stderrData = '';
//       let memory = 0;

//       run.stdout.on('data', (data) => {
//         stdoutData += data.toString();
//       });

//       run.stderr.on('data', (data) => {
//         stderrData += data.toString();
//       });

//       if (input) {
//         run.stdin.write(input);
//         run.stdin.end();
//       }

//       const result = await new Promise((resolve) => {
//         run.on('close', (code) => {
//           const [sec, nano] = process.hrtime(start);
//           const timeMs = (sec * 1e9 + nano) / 1e6;

//           try {
//             const status = fs.readFileSync(`/proc/${run.pid}/status`, 'utf8');
//             const match = status.match(/VmPeak:\s+(\d+)\s+kB/);
//             if (match) memory = parseInt(match[1]);
//           } catch (e) {}

//           const actualOutput = stdoutData.trim();
//           const passed = String(expectedOutput).trim() === actualOutput;

//           resolve({
//             test: i + 1,
//             input,
//             expected: expectedOutput,
//             actual: actualOutput,
//             passed,
//             time: `${timeMs.toFixed(2)} ms`,
//             memory: `${memory} KB`,
//             error: stderrData.trim(),
//           });
//         });
//       });
    

//       results.push(result);
//     }

//     res.json({
//       verdict: results.every(r => r.passed) ? "Accepted" : "Wrong Answer",
//       results,
//     });
//     }catch(err){
//       res.send(err);
//     }



//   });
// });



// app.get('/', (req, res)=>{
//   res.send("Hello Docker!");
// })

// app.listen(5000, () => {
//   console.log('Server running on port 5000');
// });




const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { exec, spawn } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/run', (req, res) => {
  const { code, testCases } = req.body;

  if (!code || !Array.isArray(testCases)) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  fs.writeFileSync('main.cpp', code);

  exec('g++ -I. main.cpp -o main', async (err, stdout, stderr) => {
    if (err) {
      return res.json({ verdict: "Compilation Error", error: stderr });
    }

    try {
      let totalTime = 0;
      let totalMemory = 0;

      for (let i = 0; i < testCases.length; i++) {
        const { input, output: expectedOutput } = testCases[i];

        const start = process.hrtime();
        const run = spawn('./main');

        let stdoutData = '';
        let stderrData = '';
        let memory = 0;

        run.stdout.on('data', (data) => {
          stdoutData += data.toString();
        });

        run.stderr.on('data', (data) => {
          stderrData += data.toString();
        });

        if (input) {
          run.stdin.write(input);
          run.stdin.end();
        }

        const result = await new Promise((resolve) => {
          run.on('close', (code) => {
            const [sec, nano] = process.hrtime(start);
            const timeMs = (sec * 1e9 + nano) / 1e6;

            try {
              const status = fs.readFileSync(`/proc/${run.pid}/status`, 'utf8');
              const match = status.match(/VmPeak:\s+(\d+)\s+kB/);
              if (match) memory = parseInt(match[1]);
            } catch (e) {}

            resolve({
              actual: stdoutData.trim(),
              error: stderrData.trim(),
              timeMs,
              memory,
            });
          });
        });

        totalTime += result.timeMs;
        totalMemory = Math.max(totalMemory, result.memory); // or sum it up

        const passed = String(expectedOutput).trim() === result.actual;

        if (!passed) {
          return res.json({
            verdict: `Wrong Answer on test case ${i + 1}`,
            expected: expectedOutput.trim(),
            actual: result.actual,
            time: `${result.timeMs.toFixed(2)} ms`,
            memory: `${result.memory} KB`,
            error: result.error,
          });
        }
      }

      // All passed
      return res.json({
        verdict: "Accepted",
        time: `${totalTime.toFixed(2)} ms`,
        memory: `${totalMemory} KB`
      });

    } catch (err) {
      return res.json({ verdict: "Runtime Error", error: err.message });
    }
  });
});

app.get('/', (req, res) => {
  res.send("Hello Docker!");
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
