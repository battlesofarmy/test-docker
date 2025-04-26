require("events").EventEmitter.defaultMaxListeners = 15;


const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { exec } = require("child_process");


const app = express();
app.use(express.json());
app.use(cors());

app.post("/submit", (req, res) => {
    const { code, input } = req.body; // C++ code and input from frontend
  
    // Save code to a file
    fs.writeFileSync("code.cpp", code);
  
    // Compile C++ Code
    exec("g++ code.cpp -o code.exe", (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        return res.json({ status: "Compilation Error", error: compileStderr });
      }
  
      // Run the compiled program with input
      exec(`echo ${input} | code.exe`, (runError, runStdout, runStderr) => {
        if (runError) {
          return res.json({ status: "Runtime Error", error: runStderr });
        }
  
        res.json({ status: "Success", output: runStdout });
      });
    });
  });
  

app.get("/",(req, res)=>{
    res.send("HI")
})

app.listen(5000, () => console.log("Server running on port 5000"));
