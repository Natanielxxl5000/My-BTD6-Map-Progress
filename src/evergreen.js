let readyFlags = [0,0,0,0,0]
let timerInterval = null;
let activeTimers = new Map();

let constants = {}
let locJSON = {}
let achievementsJSON = {}
let trophyStoreItemsJSON = {}
let teamsStoreItemsJSON = {}
let rogueJSON = {}

let seenFTMessages = [];

let rulesMap = {
    "Monkey Knowledge Disabled": "NoKnowledgeIcon",
    "No Lives Lost": "NoLivesLostIcon",
    "Selling Disabled": "SellingDisabledIcon",
    "Powers Disabled": "PowersDisabledIcon",
    "No Continues": "NoContinuesIcon",
    "All Camo": "AllCamoIcon",
    "All Regrow": "AllRegenIcon",
    "Double Cash Disabled": "NoDoubleCashIcon",
    "No Round 100 Reward": "NoInstaMonkeys",
    "Custom Rounds": "CustomRoundIcon",
    "Paragon Limit": "ParagonLimitIcon"
}

let backQueue = [];
/*let backButton = createEl('img', { src: './Assets/UI/BackBtn.png', classList: ['back-button', 'pointer'] });
backButton.addEventListener('click', () => {
    goBack();
})
document.querySelector('.header').prepend(backButton);
*/
function goBack(noScroll){
    let currentState = backQueue.pop();
    if (currentState.source) {
        document.getElementById(currentState.destination + "-content").style.display = 'none';
        document.getElementById(currentState.source + "-content").style.display = 'flex';
        // changeHexBGColor(constants.BGColor)
    }

    if (currentState.callback) {
        currentState.callback();
    }

    if (backQueue.length === 0) {
        //backButton.classList.remove('visible');
    }
    if (!noScroll) {
        resetScroll();
    }
    hideLoading();
}

function addToBackQueue(object) {
    backQueue.push(object);
    //backButton.classList.add('visible');
}

function clearBackQueue() {
    backQueue = [];
    //backButton.classList.remove('visible');
}

function createEl(tag, options = {}) {
    const el = document.createElement(tag);
    if (options.classList) el.classList.add(...options.classList);
    if (options.innerHTML) el.innerHTML = options.innerHTML;
    if (options.textContent) el.textContent = options.textContent;
    if (options.id) el.id = options.id;
    if (options.src) el.src = options.src;
    if (options.placeholder) el.placeholder = options.placeholder;
    if (options.style) Object.assign(el.style, options.style);
    if (options.onclick) el.onclick = options.onclick;
    if (options.type) el.type = options.type;
    if (options.name) el.name = options.name;
    el.loading = options.loading || "lazy";
    if (options.attributes) {
        for (const [key, value] of Object.entries(options.attributes)) {
            el.setAttribute(key, value);
        }
    }
    if (options.children) {
        options.children.forEach(child => el.appendChild(child));
    }
    return el;
}

function createModal({ header = '', content = '', footer = '', backgroundColor = "var(--profile-secondary)" } = {}) {
    const modalOverlay = createEl('div', {
        classList: ['modal-overlay']
    });

    const modalBox = createEl('div', { classList: ['modal-box'] });

    const modalHeader = createEl('div', { classList: ['modal-header'] });
    if(header != '') {
        modalBox.appendChild(modalHeader);

    }


    const collectionHeaderModalLeft = createEl('div', { classList: ['collection-header-modal-left'] });
    modalHeader.appendChild(collectionHeaderModalLeft);

    const modalTitle = createEl('p', {
        classList: ['collection-modal-header-text', 'black-outline'],
        innerHTML: header
    });
    modalHeader.appendChild(modalTitle);

    const modalClose = createEl('img', {
        classList: ['collection-modal-close', 'pointer'],
        src: "./Assets/UI/CloseBtn.png"
    });
    modalClose.addEventListener('click', () => {
        goBack(true);
    });
    modalHeader.appendChild(modalClose);

    const modalContent = createEl('div', { classList: ['modal-content'], style: { backgroundColor: backgroundColor }});
    modalBox.appendChild(modalContent);

    if (typeof content === 'string') {
        modalContent.innerHTML = content;
    } else if (content) {
        modalContent.appendChild(content);
    }

    if (footer) {
        const modalFooter = createEl('div', { classList: ['modal-footer'] });
        if (typeof footer === 'string') {
            modalFooter.innerHTML = footer;
        } else {
            modalFooter.appendChild(footer);
        }
        modalBox.appendChild(modalFooter);
    }

    modalOverlay.appendChild(modalBox);
    document.body.appendChild(modalOverlay);
    addToBackQueue({callback: closeModal});
}

function closeModal() {
    const overlays = document.querySelectorAll('.modal-overlay');
    if (overlays.length) overlays[overlays.length - 1].remove();
}

function showLoading(force){
    let imagesToLoad = 0;
    if (!force) {
        let observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeName === 'IMG') {
                            imagesToLoad++;
                            node.addEventListener('load', imageLoaded);
                            node.addEventListener('error', imageLoaded);
                        }
                    });
                }
            });
        });
        function imageLoaded() {
            imagesToLoad--;
            if (imagesToLoad === 0) {
                document.getElementById("loading").style.transform = "scale(0)";
                observer.disconnect();
            }
        }
        observer.observe(document.body, { childList: true, subtree: true });
    }
    document.getElementById("loading").style.removeProperty("transform")
}

function hideLoading(){
    document.getElementById("loading").style.transform = "scale(0)";
}

function fetchConstants() {
    return fetch('./data/Constants.json')
        .then(response => response.json())
        .then(data => {
            constants = data;
            readyFlags[4] = 1
        })
        .catch(error => {
            console.error('Error:', error)
            errorModal(error, "js")
    });
}

function fetchLocKeys() {
    return fetch('./data/English.json').then(response => response.json()).then(data => {
        locJSON = data;
    })
}

async function fetchMainDependencies() {
    if (!Object.keys(constants.heroesInOrder).includes(btd6usersave.primaryHero)) {
        btd6usersave.primaryHero = Object.keys(constants.heroesInOrder)[0];
    }

    await fetchLocKeys();
    Promise.all([
        fetch('./data/Achievements.json').then(response => response.json()),
        fetch('./data/trophyStoreItems.json').then(response => response.json()),
        fetch('./data/teamsStoreItems.json').then(response => response.json())
    ])
    .then(([achievementsData, trophyStoreItems, teamsStoreItems]) => {
        achievementsJSON = achievementsData;
        trophyStoreItemsJSON = trophyStoreItems;
        teamsStoreItemsJSON = teamsStoreItems;
        readyFlags[2] = 1;
        readyFlags[3] = 1;
        generateIfReady();
    })
    .catch(error => {
        console.error('Error:', error);
        errorModal(error, "js");
    });

    showLoading();
}

function resetScroll() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

function changeHexBGColor(color){
    if (color == null) { 
        document.body.style.removeProperty("background-color")
        return; 
    }
    if (typeof color == "string") {
        document.body.style.backgroundColor = color;
    } else if (Array.isArray(color)) {
        document.body.style.backgroundColor = `rgb(${color[0] * 255},${color[1] * 255},${color[2] * 255})`;
    }
}

function ratioCalc(unknown, x1, x2, y1, y2){
    switch(unknown){
        case 1:
            // x1/x2 == y1/y2
            return x2 * (y1/y2)
        case 2:
            // x1/x2 == y1/y2
            return x1 * (y2/y1)
        case 3:
            // x1/x2 == y1/y2
            return y2 * (x1/x2)
        case 4:
            // x1/x2 == y1/y2
            return y1 * (x2/x1)
    }
}

function generateLoginDiv(callback, loginCallback) {
    async function autoStart() {
        document.getElementById("loading").style.removeProperty("transform");
        oak_token = 'oak_1b39e9f701449ceb00cf';
    
        if (loginCallback) {
            await loginCallback(oak_token);
        } else {
            await getSaveData(oak_token);
            loggedIn = true;
        }
    
        if (callback) {
            callback(oak_token);
        } else {
            fetchMainDependencies();
        }
    }
    autoStart();
}

function errorModal(body, source, force) {
    if (isErrorModalOpen && !force) { return; }
    let modalOverlay = document.createElement('div');
    modalOverlay.classList.add('error-modal-overlay');
    document.body.appendChild(modalOverlay);

    let modal = document.createElement('div');
    modal.id = 'error-modal';
    modal.classList.add('error-modal');
    modalOverlay.appendChild(modal);

    let modalHeader = document.createElement('div');
    modalHeader.id = 'error-modal-header';
    modalHeader.classList.add('error-modal-header');
    modal.appendChild(modalHeader);

    let modalHeaderImg = document.createElement('img');
    modalHeaderImg.id = 'error-modal-header-img';
    modalHeaderImg.classList.add('error-modal-header-img');
    modalHeaderImg.src = "./Assets/UI/BadConnectionBtn.png";
    modalHeader.appendChild(modalHeaderImg);

    let modalHeaderText = document.createElement('p');
    modalHeaderText.classList.add('error-modal-header-text','black-outline');
    modalHeaderText.innerHTML = "Error";
    modalHeader.appendChild(modalHeaderText);

    let dummyElmnt = document.createElement('div');
    dummyElmnt.classList.add('error-modal-dummy');
    modalHeader.appendChild(dummyElmnt);

    let modalContent = document.createElement('div');
    modalContent.id = 'error-modal-content';
    modalContent.classList.add('error-modal-content');
    modalContent.innerHTML = (source == "api" ? "" : "") + body;
    modal.appendChild(modalContent);

    let modalContent2  = document.createElement('div');
    modalContent2.classList.add('error-modal-content');
    switch(body) {
        case "Invalid user ID / Player Does not play this game":
            modalContent2.innerHTML = "Please try again or create a new Open Access Key.";
            modal.appendChild(modalContent2);
            break;
        case "Cannot load public profile. Player does not play this game or is running a newer version":
            modalContent2.innerHTML = "Note from this site: If a major update for the game just released, the Open Data API may be temporarily broken until updated to be compatible with the new version (usually within a couple days)";
            preventRateLimiting = true;
            clearProfileRequestQueue();
            modal.appendChild(modalContent2);
            break;
    }

    if(source == "ratelimit") {
        let mapsProgressCoopToggle = document.createElement('div');
        mapsProgressCoopToggle.classList.add('error-toggle-div');  
        modal.appendChild(mapsProgressCoopToggle);

        let mapsProgressCoopToggleText = document.createElement('p');
        mapsProgressCoopToggleText.classList.add('maps-progress-coop-toggle-text','black-outline');
        mapsProgressCoopToggleText.innerHTML = "Manually Load Profiles: ";
        mapsProgressCoopToggle.appendChild(mapsProgressCoopToggleText);

        let mapsProgressCoopToggleInput = document.createElement('input');
        mapsProgressCoopToggleInput.classList.add('maps-progress-coop-toggle-input');
        mapsProgressCoopToggleInput.type = 'checkbox';
        mapsProgressCoopToggleInput.checked = preventRateLimiting;
        mapsProgressCoopToggleInput.addEventListener('change', () => {
            mapsProgressCoopToggleInput.checked ? preventRateLimiting = true : preventRateLimiting = false;
        })
        mapsProgressCoopToggle.appendChild(mapsProgressCoopToggleInput);
    }

    let okButtonDiv = document.createElement('div');
    okButtonDiv.classList.add('error-modal-ok-button-div');
    modal.appendChild(okButtonDiv);

    let okButton = document.createElement('div');
    okButton.classList.add('start-button', 'modal-ok-button', 'black-outline');
    okButton.innerHTML = 'OK';
    okButton.addEventListener('click', () => {
        isErrorModalOpen = false;
        document.body.removeChild(modalOverlay);
    })
    okButtonDiv.appendChild(okButton);

    let modalClose = document.createElement('img');
    modalClose.classList.add('error-modal-close');
    modalClose.src = "./Assets/UI/CloseBtn.png";
    modalClose.addEventListener('click', () => {
        isErrorModalOpen = false;
        document.body.removeChild(modalOverlay);
    })
    modalContent.appendChild(modalClose);
    isErrorModalOpen = true;
}

function generateComment(text, callback) {
    let commentDiv = createEl('div', {
        classList: ['round-hint-div','coop-border']
    });

    let closeBtn = createEl('p', {
        classList: ['round-hint-x', 'white-outline'],
        innerHTML: 'X'
    });
    closeBtn.addEventListener('click', () => {
        commentDiv.style.display = "none";
        if (callback) {
            callback();
        }   
    })
    commentDiv.appendChild(closeBtn);

    let commentText = createEl('p', {
        classList: ['round-hint'],
        innerHTML: text
    });
    commentDiv.appendChild(commentText);

    return commentDiv;
}