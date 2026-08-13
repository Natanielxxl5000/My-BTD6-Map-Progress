let oak_token = ""

let btd6usersave = {};
let _btd6usersave = {};

let btd6publicprofile = true;
let _btd6publicprofile = true;

let localStorageOAK = {}

let refreshRateLimited = false;

let profileCache = {}

let browserData = null;
let browserLink = null;
let browserPage = 1;
let browserPageEntryCount = null;

let browserFilter = "newest";

let cacheBust = false;

let isErrorModalOpen = false;

let rateLimited = false;
let preventRateLimiting = false;

let maxRequests = 100;
let baseInterval = 200;
let requestCount = 0;
let completedRequests = 0;
let lastResetTime = Date.now();

let requestQueue = [];
let isProcessing = false;

const TIMEOUT_TTL = 10 * 60 * 1000;

const isStale = (cachedAt) => (!cachedAt || (Date.now() - cachedAt) > TIMEOUT_TTL);

function addRequestToQueue(profile, request) {
    requestQueue.push({id: profile, request: request});
    if (!isProcessing) {
        processRequestQueue();
    }
}

function removeRequestFromQueue(profile) {
    requestQueue = requestQueue.filter(request => request.id !== profile);
}

function calculateDelay() {
    const ratio = requestCount / (maxRequests / 2);
    return baseInterval + (baseInterval * Math.pow(ratio, 2));
}

async function processRequestQueue() {
    if (isProcessing) return;
    isProcessing = true;
    function process() {
        if (requestQueue.length === 0) {
            isProcessing = false;
            return;
        }
        const now = Date.now();
        if (now - lastResetTime >= 180000) {
            requestCount = 0;
            lastResetTime = now;
        }
        if (requestCount < maxRequests) {
            const request = requestQueue.shift();
            requestCount++;
            request.request();
        }
        const delay = calculateDelay();
        setTimeout(process, delay);
    }
    process();
}
processRequestQueue();

async function fetchData(url, onSuccess) {
    let res = null;
    try {
        if (cacheBust) {
            res = await fetch(url, {cache: "reload"});
            cacheBust = false;
            rateLimited = false;
        } else {
            res = await fetch(url);
            rateLimited = false;
        }
    } catch (e) {
        if (!navigator.onLine) {
            errorModal(`You are currently offline. Please check your internet connection.`, "api");
            return `You are currently offline. [${e}]`;
        }

        rateLimited = true;
        requestQueue = [];        
        // errorModal(`You have hit the rate limit.<br>If you are browsing the leaderboards or content browsers, please slow down!<br><br>The rate limit will clear after a short time. You can also help prevent rate limiting by toggling the setting below which stops player profiles from loading automatically.`, "ratelimit")
        errorModal(`Failed to reach the Ninja Kiwi Open Data API. The API server may be down, or you may have hit the rate limit. Please try again later.`)
        hideLoading();
        return `Failed to reach the Ninja Kiwi Open Data API. [${e}]`;
    }
    try {
        let json = await res.json();
        if(json["success"] == true){
            onSuccess(json);
        } else {
            if(json["reason"] == "Rate limit") {
                isErrorModalOpen = true;
                errorModal("You have hit the rate limit. Please try again later.", "api");
            } else {
                document.getElementById("loading").style.transform = "scale(0)";
                errorModal(json["error"], "api");
            }
        }
        return json;
    } catch (e) {
        errorModal(`Something went wrong with the request. Response Code: ${res.status} [${e}]`, "api")
        return `Something went wrong with the request. Response Code: ${res.status} [${e}]`;
    }
}

async function getSaveData(oak_token) {
    cacheBust = true;
    let expiryCheck = true;
    let savePromise = new Promise(async (resolve, reject) => {
        await fetchData(`https://data.ninjakiwi.com/btd6/save/${oak_token}`, (json) => {
            btd6usersave = json["body"]
            _btd6usersave = json["model"]
            readyFlags[0] = 1
            expiryCheck = false;
            resolve();
        });
    });
    await savePromise;
    if(expiryCheck && !rateLimited){
        let elements = document.getElementsByClassName("error-modal-overlay");
        for(element of elements){
            element.parentNode.removeChild(element);
        }
        errorModal("Your Open Access Key has expired. Please make a new one and try again.", "expire", true)
        return;
    }
    await getPublicProfileData(oak_token);
}

async function getPublicProfileData(oak_token) {
    cacheBust = true;
    readyFlags[1] = 1
    await fetchData(`https://data.ninjakiwi.com/btd6/users/${oak_token}`, (json) => {
        btd6publicprofile = json["body"]
        _btd6publicprofile = json["model"]
        localStorageOAK[oak_token] = {
            "displayName": btd6publicprofile["displayName"],
            "avatar": getProfileAvatar(btd6publicprofile),
            "banner": getProfileBanner(btd6publicprofile)
        }
        readyFlags[1] = 1
    });
}

async function getUserProfile(key) {
    let player = key.split("/").pop();
    if (profileCache[player] == null) {
        await fetchData(key, (json) => {
            profileCache[player] = { ...json["body"], _cachedAt: Date.now() };
        });
    } else {
        // console.log(`used cache for ${player}`)
    }
    return profileCache[player];
}

function clearProfileRequestQueue() {
    requestQueue = [];
    isProcessing = false;
}