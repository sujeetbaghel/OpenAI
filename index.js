require('dotenv').config();
const { Server } = require('ssh2');
const fs = require('fs');

// Load the private key from the specified file
const privateKey = fs.readFileSync('/etc/secrets/my_host_key', 'utf8'); 

// Create a new SSH server instance
const server = new Server({
    hostKeys: [privateKey], // Use the loaded PEM private key
}, (client) => {
    client.on('authentication', (ctx) => {
        if (ctx.method === 'password' && ctx.username === process.env.SSH_USERNAME && ctx.password === process.env.SSH_PASSWORD) {
            ctx.accept(); // Accept the connection
        } else {
            ctx.reject(); // Reject the connection
        }
    }).on('ready', () => {
        console.log('Client :: authenticated');
        
        // Handle session requests
        client.on('session', (accept, reject) => {
            const session = accept();
            
            session.on('shell', (accept, reject) => {
                const stream = accept({
                    pty: true // Request PTY allocation
                });
                stream.write('Welcome to the shell!\n');
            
                // Handle incoming data from the client
                stream.on('data', (data) => {
                    const command = data.toString().trim();
                    console.log('Received command:', command);
            
                    // Process command and provide a response
                    if (command === 'exit') {
                        stream.write('Goodbye!\n');
                        stream.exit(0); // Exit the shell
                    } else {
                        stream.write('You said: ' + command + '\n'); // Echo the command back
                    }
                });
            
                // Handle stream closure
                stream.on('close', () => {
                    console.log('Stream :: close');
                    client.end(); // End the client connection
                });
            });
            
        });
    });
});

// Start listening for incoming connections on port 2222
server.listen(2222, '0.0.0.0', () => {
    console.log('Listening on port 2222');
});
