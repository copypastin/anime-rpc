const { app, BrowserWindow, Notification, session } = require('electron');
const { getInfoFromName } = require("./helpers/mal-info");
const { setRPC, initiateRPC } = require("./helpers/rpc");
const { linkFilter } = require("./helpers/linkFilter");
const URL = "https://anix.to/home";
const URL2 = "https://anix.to/";
const repo = "https://github.com/copypastin/better-anime-rpc";


let client;
let RPCDetails;
let lastURL;
let lastTitle;


app.whenReady().then(() => {
    let window = new BrowserWindow({
        backgroundColor: '#FFF',
        useContentSize: false,
        autoHideMenuBar: true,
        resizable: true,
        center: true,
        frame: true,
        alwaysOnTop: false,
        title: 'Anime Tracker',
        icon: __dirname + './assets/arpc.png',
        webPreferences: {
            nodeIntegration: true,
            plugins: true,
        },
        nativeWindowOpen: true
    });

    window.loadURL(URL)
        .then(async () => {
            window.setTitle("Anime Tracker");
            client = await initiateRPC();
        })

    //POPUP BLOCKER 
    window.webContents.setWindowOpenHandler(() => {
        console.log('[ARPC]: popup denied');
        return { action: "deny" };
    });

    // Updates RPC
    setInterval(async () => {
        const currentURL = window.webContents.getURL();

        // Prevents RPC from constantly trying to update
        if (lastURL == currentURL) return;

        // Check for if client has been initiated
        if (!client) client = await initiateRPC();



        // Check if on main menu
        if (currentURL === URL || currentURL === URL2) {
            lastURL = URL;
            lastTitle = "Main Menu";
            lastTitle = undefined;

            RPCDetails = {
                details: 'Main Menu',
                largeImageKey: 'https://github.com/user-attachments/assets/8418e968-60da-465e-9fb6-39d7bf7ae01c',
                largeImageText: 'aaron was here',
                instance: true,
                buttons: [{ label: `Github Repo`, url: repo }]
            }

            window.setTitle("Anime Tracker | Main Menu");
        }

        // Checks if on search page
        else if(linkFilter(currentURL)) {
            lastURL = currentURL;

            RPCDetails = {
                details: `Browsing...`,
                largeImageKey: 'https://github.com/user-attachments/assets/8418e968-60da-465e-9fb6-39d7bf7ae01c',
                largeImageText: "aaron was here",
                instance: true,
                buttons: [
                    { label: `Github Repo`, url: repo, }
                ],
            }
        }

        // Check if watching an anime
        else if (currentURL !== URL) {
            let data;

            try {
                /*
                    The name of the title is burried in the URL, so we have to extract it
                        ex. https://anix.to/anime/jujutsu-kaisen-2nd-season-ll3x3/ep-1
                            "jujutsu kaisen 2nd season" is extracted
                */
                let obfsuTitle = currentURL.toString().split("/")[4].split("-").slice(0, -1).join(" ")
                data = await getInfoFromName(obfsuTitle.replace(/[0-9]/g, ''))
            } catch (err) {
                session.defaultSession.clearStorageData([], {});
                await window.loadURL(URL);
                console.log(`[ARPC]: Failed to load ${currentURL}, going to homepage.`);
                new Notification({
                    title: "ARPC | Something went wrong!",
                    body: "Page was reloaded for your convience."
                }).show();
            }

            lastURL = currentURL;
            lastTitle = data.title

            RPCDetails = {
                details: `Watching ${data.title}`,
                largeImageKey: data.picture,
                largeImageText: data.genres.join(", "),
                state: `Episode ${currentURL.split("ep-")[1]}` ?? `Episode ?`,
                instance: true,
                buttons: [
                    { label: `Github Repo`, url: repo },
                    {label: `${data.popularity} in Popularity`, url: `${data.url}`}, 
                ],
                startTimestamp: new Date().getTime()
            }

            window.setTitle(`Anime Tracker | Watching ${data.title}`);
        } 

        await setRPC(client, RPCDetails);
    }, 5E3); // 5 seconds
})


