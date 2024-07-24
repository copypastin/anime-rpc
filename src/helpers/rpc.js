const RPC = require('discord-rpc')
const client = new RPC.Client({ transport: 'ipc' })

const setRPC = async (client, details) => {
    await client.setActivity(details);
    console.log("[ARPC]: RPC set successfully!");
}

const initiateRPC = async () => {
    await client.login({ clientId: "978118830318559252" });
    console.log("[ARPC]: RPC initiated successfully!");
    return client;
}

module.exports = {
    setRPC,
    initiateRPC
}