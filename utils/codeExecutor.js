const Docker = require('dockerode');
const docker = new Docker();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const executeCode = async (code, input, timeLimit = 2, memoryLimit = 256) => {
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    const fileName = `${uuidv4()}.cpp`;
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, code);

    const containerName = `cpp-runner-${uuidv4()}`;

    try {
        // Create and start container
        const container = await docker.createContainer({
            Image: 'gcc',
            name: containerName,
            HostConfig: {
                Memory: memoryLimit * 1024 * 1024, // Convert MB to bytes
                MemorySwap: memoryLimit * 1024 * 1024,
                NetworkMode: 'none',
                CpuPeriod: 100000,
                CpuQuota: 100000,
                Binds: [`${filePath}:/usr/src/app/${fileName}`]
            },
            Cmd: ['sh', '-c', `g++ /usr/src/app/${fileName} -o /usr/src/app/a.out && timeout ${timeLimit}s /usr/src/app/a.out`],
            Tty: false,
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            OpenStdin: true
        });

        await container.start();

        // Send input to the container if provided
        if (input) {
            const stream = await container.attach({
                stream: true,
                stdin: true,
                stdout: true,
                stderr: true
            });
            stream.write(input + '\n');
            stream.end();
        }

        // Wait for container to finish
        const output = await container.wait();
        const logs = await container.logs({
            stdout: true,
            stderr: true
        });

        // Clean up
        await container.remove();

        return {
            output: logs.toString().trim(),
            exitCode: output.StatusCode,
            error: output.StatusCode !== 0 ? logs.toString() : null
        };
    } catch (error) {
        console.error('Execution error:', error);
        return { error: error.message };
    } finally {
        // Clean up temp files
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};

module.exports = { executeCode };