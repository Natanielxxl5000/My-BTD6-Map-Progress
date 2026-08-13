let profileStats = {}
let exclusiveStats = {}
let medalsInOrder = {}

let progressSubText = {}
let processedMapData = {}

let useNamedMonkeys = true;

let currentlySelectedHero = "";

let allHeroesShown = false;
let allTowersShown = false;

let currentMapView = "grid";
let coopEnabled = true;
let currentDifficultyFilter = "All";
let mapPage = 0;

let currentInstaView = "game";
let instasMissingToggle = false;

let currentAchievementFilter = "game";
let currentAchievementRewardFilter = "None";

let processedInstaData = {};

let showElite = false;

let currentBrowserView = "grid";

let currentCollectionChest = "None";
let currentCollectionTower = "All";
let collectionMissingToggle = true;
let collectionListSortType = "Highest Total Chance";

let chestSelectorMap = {
    "wood": "Wooden",
    "bronze": "Bronze",
    "silver": "Silver",
    "gold": "Gold",
    "diamond": "Diamond"
}

let showFeaturedFilter = false;
let currentFeaturedTower = "All";

let trophyStoreSubFilter = "All";
let trophyStoreSortOption = "Default";
let subFiltersMap = {
    "Heroes": ["All", "HeroPlacementUpgrades", "HeroPets"],
    "Monkeys": ["All", "TowerPlacementUpgrades", "TowerPets", "Projectiles", "Flags"],
    "Bloons": ["All", "PopFX", "AllBloonSkins", "RegularSkins", "MoabSkins"],
    "Coop": ["All", "StandardEmotes", "TextEmotes", "SoundEmotes", "FullScreenEmotes"],
    "GameUI": ["All", "MusicTracks","Avatars", "ProfileBanners", "PowerSkins", "Misc"]
}
let trophyStoreShowHidden = false;

let showTeamsItems = false;

let abilitiesFilter = "Default";
let abilitiesFilterType = "All";
let allInstaFilter = "Tier (Ascending)";

let currentKnowledgeTree = "primary";
let knowledgeTowerFilter = null;

let questsFilter = "All";

let loggedIn = false;
let seenOutOfDate = false;

let isHeroTransformed = false;

let imageScrollIndex = 0;

function generateIfReady(){
    if (readyFlags.every(flag => flag === 1)){
        if(document.getElementById("home-content")){
            document.getElementById("home-content").style.display = "none";
        }
        document.body.classList.add('transition-bg')
        generateMapData()
        changeTab('profile');
    } else if(!loggedIn && readyFlags.slice(2).every(flag => flag === 1)){
        document.getElementById("home-content").style.display = "none";
        document.body.classList.add('transition-bg')
        changeTab('profile');
    }
}

function generateMapData() {
    processedMapData = {
        "Maps": {},
        "Medals": {
            "single": {},
            "coop": {}
        },
        "Borders": {
            "single": {},
            "coop": {}
        }
    }

    for (let [map, data] of Object.entries(btd6usersave.mapProgress)) {
        let mapData = {"single": {}, "coop": {}}
        mapData["single"]["Easy"] = data.difficulty?.Easy?.single?.["Standard"];
        mapData["single"]["PrimaryOnly"] = data.difficulty?.Easy?.single?.["PrimaryOnly"];
        mapData["single"]["Deflation"] = data.difficulty?.Easy?.single?.["Deflation"];
        mapData["single"]["Medium"] = data.difficulty?.Medium?.single?.["Standard"];
        mapData["single"]["MilitaryOnly"] = data.difficulty?.Medium?.single?.["MilitaryOnly"];
        mapData["single"]["Apopalypse"] = data.difficulty?.Medium?.single?.["Apopalypse"];
        mapData["single"]["Reverse"] = data.difficulty?.Medium?.single?.["Reverse"];
        mapData["single"]["Hard"] = data.difficulty?.Hard?.single?.["Standard"];
        mapData["single"]["MagicOnly"] = data.difficulty?.Hard?.single?.["MagicOnly"];
        mapData["single"]["DoubleMoabHealth"] = data.difficulty?.Hard?.single?.["DoubleMoabHealth"];
        mapData["single"]["HalfCash"] = data.difficulty?.Hard?.single?.["HalfCash"];
        mapData["single"]["AlternateBloonsRounds"] = data.difficulty?.Hard?.single?.["AlternateBloonsRounds"];
        mapData["single"]["Impoppable"] = data.difficulty?.Hard?.single?.["Impoppable"];
        mapData["single"]["Clicks"] = data.difficulty?.Hard?.single?.["Clicks"];
        mapData["coop"]["Easy"] = data.difficulty?.Easy?.coop?.["Standard"];
        mapData["coop"]["PrimaryOnly"] = data.difficulty?.Easy?.coop?.["PrimaryOnly"];
        mapData["coop"]["Deflation"] = data.difficulty?.Easy?.coop?.["Deflation"];
        mapData["coop"]["Medium"] = data.difficulty?.Medium?.coop?.["Standard"];
        mapData["coop"]["MilitaryOnly"] = data.difficulty?.Medium?.coop?.["MilitaryOnly"];
        mapData["coop"]["Apopalypse"] = data.difficulty?.Medium?.coop?.["Apopalypse"];
        mapData["coop"]["Reverse"] = data.difficulty?.Medium?.coop?.["Reverse"];
        mapData["coop"]["Hard"] = data.difficulty?.Hard?.coop?.["Standard"];
        mapData["coop"]["MagicOnly"] = data.difficulty?.Hard?.coop?.["MagicOnly"];
        mapData["coop"]["DoubleMoabHealth"] = data.difficulty?.Hard?.coop?.["DoubleMoabHealth"];
        mapData["coop"]["HalfCash"] = data.difficulty?.Hard?.coop?.["HalfCash"];
        mapData["coop"]["AlternateBloonsRounds"] = data.difficulty?.Hard?.coop?.["AlternateBloonsRounds"];
        mapData["coop"]["Impoppable"] = data.difficulty?.Hard?.coop?.["Impoppable"];
        mapData["coop"]["Clicks"] = data.difficulty?.Hard?.coop?.["Clicks"];

        mapData["highestRound"] = Math.max(...Object.values(mapData["single"]).map(diffData => diffData ? diffData["bestRound"] : 0), ...Object.values(mapData["coop"]).map(diffData => diffData ? diffData["bestRound"] : 0));
        mapData["totalWins"] = Object.values(mapData["single"]).map(diffData => diffData ? diffData["timesCompleted"] : 0).reduce((acc, amount) => acc + amount) + Object.values(mapData["coop"]).map(diffData => diffData ? diffData["timesCompleted"] : 0).reduce((acc, amount) => acc + amount);

        //this is necessary because sometimes maps will randomly show up as incomplete despite having parameters such as a completed best round number or "completedWithoutLoadSave" is true.
        //this is a workaround to ensure that the map is marked as completed if it meets the requirements for a bronze/silver/gold/black border
        for (let [difficulty, diffData] of Object.entries(mapData["single"])) {
            if (diffData && diffData["completed"] === false && (diffData["bestRound"] >= constants.endRound[difficulty] || diffData.completedWithoutLoadingSave) ) {
                diffData["completed"] = true;
            }
        }

        //the opposite is also true, sometimes "completed" will be true even when the highest round is not of the required amount for it to even be considered completed
        for (let [difficulty, diffData] of Object.entries(mapData["single"])) {
            if (diffData && diffData["completed"] === true && (diffData["bestRound"] < constants.endRound[difficulty]) && diffData.timesCompleted == 0) {
                diffData["completed"] = false;
            }
        }

        for (let [difficulty, diffData] of Object.entries(mapData["coop"])) {
            if (diffData && diffData["completed"] === false && (diffData["bestRound"] >= constants.endRound[difficulty] || diffData.completedWithoutLoadingSave) ) {
                diffData["completed"] = true;
            }
        }

        for (let [difficulty, diffData] of Object.entries(mapData["coop"])) {
            if (diffData && diffData["completed"] === true && (diffData["bestRound"] < constants.endRound[difficulty]) && diffData.timesCompleted  == 0) {
                diffData["completed"] = false;
            }
        }

        processedMapData.Medals.single[map] = {};
        processedMapData.Medals.coop[map] = {};

        for (let [difficulty, diffData] of Object.entries(mapData["single"])) {
            (diffData && diffData["completed"]) ? processedMapData.Medals.single[map][difficulty] = true : processedMapData.Medals.single[map][difficulty] = false;
        }

        for (let [difficulty, diffData] of Object.entries(mapData["coop"])) {
            (diffData && diffData["completed"]) ? processedMapData.Medals.coop[map][difficulty] = true : processedMapData.Medals.coop[map][difficulty] = false;
        }

        processedMapData.Medals.single[map]["CHIMPS-BLACK"] = mapData["single"]["Clicks"] && mapData["single"]["Clicks"].completed ? mapData["single"]["Clicks"].completedWithoutLoadingSave : false;
        processedMapData.Medals.coop[map]["CHIMPS-BLACK"] = mapData["coop"]["Clicks"] && mapData["coop"]["Clicks"].completed ? mapData["coop"]["Clicks"].completedWithoutLoadingSave : false;

        let bronzeBorder = ["Easy", "PrimaryOnly", "Deflation"].every(key => 
            mapData["single"][key] && mapData["single"][key]["completed"] === true
        );
        let silverBorder = bronzeBorder && ["Medium", "MilitaryOnly", "Apopalypse", "Reverse"].every(key =>
            mapData["single"][key] && mapData["single"][key]["completed"] === true
        );
        let goldBorder = silverBorder && ["Hard", "MagicOnly", "DoubleMoabHealth", "HalfCash", "AlternateBloonsRounds", "Impoppable", "Clicks"].every(key =>
            mapData["single"][key] && mapData["single"][key]["completed"] === true
        );
        let blackBorder = goldBorder && mapData["single"]["Clicks"].completedWithoutLoadingSave;
        
        processedMapData["Borders"]["single"][map] = blackBorder ? "Black" : goldBorder ? "Gold" : silverBorder ? "Silver" : bronzeBorder ? "Bronze" : "None";
        
        bronzeBorder = ["Easy", "PrimaryOnly", "Deflation"].every(key =>
            mapData["coop"][key] && mapData["coop"][key]["completed"] === true
        );
        silverBorder = bronzeBorder && ["Medium", "MilitaryOnly", "Apopalypse", "Reverse"].every(key =>
            mapData["coop"][key] && mapData["coop"][key]["completed"] === true
        );
        goldBorder = silverBorder && ["Hard", "MagicOnly", "DoubleMoabHealth", "HalfCash", "AlternateBloonsRounds", "Impoppable", "Clicks"].every(key =>
            mapData["coop"][key] && mapData["coop"][key]["completed"] === true
        );
        blackBorder = goldBorder && mapData["coop"]["Clicks"].completedWithoutLoadingSave;

        processedMapData["Borders"]["coop"][map] = blackBorder ? "Black" : goldBorder ? "Gold" : silverBorder ? "Silver" : bronzeBorder ? "Bronze" : "None";
        
        processedMapData["Maps"][map] = mapData;
    }
}

function changeTab(tab) {
    clearBackQueue();
    resetScroll();
    if(timerInterval) { clearInterval(timerInterval); }
    changeHexBGColor(constants.BGColor)

    for (let tabDiv of document.querySelector('.content').children) {
        tabDiv.id === (tab + "-content") ? tabDiv.style.display = "flex" : tabDiv.style.display = 'none';
    }
    if(document.getElementById(tab)){
        document.getElementById(tab).classList.add('selected');
    }
    for (let subtab of document.getElementsByClassName('sub-content-div')){
        subtab.style.display = 'none';
    }
    switch(tab){
        case 'profile':
            generateProgress();
            break;
    }
}

function generateProgress(){
    let progressContent = document.getElementById('profile-content');
    progressContent.innerHTML = "";

    changeHexBGColor(constants.BGColor);

    if(loggedIn){
        let progressPage = document.createElement('div');
        progressPage.classList.add('progress-page');
        progressContent.appendChild(progressPage);

        let selectorsDiv = document.createElement('div');
        selectorsDiv.classList.add('selectors-div');
        progressPage.appendChild(selectorsDiv);

        currentInstaView = "game";

        let logoutDiv = createEl('div', { classList: ['d-flex', 'jc-between', 'ai-center', 'bg-color-tertiary', 'pointer'], style: {padding: "10px", margin: "10px", borderRadius: "10px"} });
        logoutDiv.addEventListener('click', () => {
            logoutProgress();
        })
        logoutDiv.appendChild(createEl('p', { classList: ['profile-name', 'tc-white', 'font-luckiest', 'black-outline'], innerHTML: (btd6publicprofile == null) ? "Logged In (Limited Profile Info)" : 'Logged in as: ' + btd6publicprofile.displayName }));
        const logoutBtn = createEl('img', { style:{height: "50px"}, src: './Assets/UI/BackBtn.png' });
        logoutDiv.appendChild(logoutBtn);
        selectorsDiv.appendChild(logoutDiv);

        if(parseInt(btd6usersave.latestGameVersion.split(".")[0]) > constants.projectContentVersion && !seenOutOfDate) {
            selectorsDiv.appendChild(
                generateComment("The content of this site (v" + constants.projectContentVersion + ".0) is out of date with the current version (v" + btd6usersave.latestGameVersion + "). New content might be missing or appear incorrect, but everything else should remain functional.", () => {
                seenOutOfDate = true;
            }));
        }
        
        if (btd6publicprofile != null) {
            let profileSelectorDiv = document.createElement('div');
            profileSelectorDiv.classList.add('d-flex', 'jc-between', 'ai-center', 'view-profile', 'pointer', 'transparent-border');
            profileSelectorDiv.style.backgroundImage = `url(${getProfileBanner(btd6publicprofile)})`;
            profileSelectorDiv.addEventListener('click', () => {
                openProfile("profile", btd6publicprofile, generateProgress)
            })
            selectorsDiv.appendChild(profileSelectorDiv);

            let profileSelectorImg = document.createElement('img');
            profileSelectorImg.classList.add('selector-img');
            profileSelectorImg.src = getProfileAvatar(btd6publicprofile);
            profileSelectorDiv.appendChild(profileSelectorImg);

            let profileSelectorText = document.createElement('p');
            profileSelectorText.classList.add('selector-text','black-outline');
            profileSelectorText.innerHTML = "View Your Profile & Stats";
            profileSelectorDiv.appendChild(profileSelectorText);

            let profileSelectorGoImg = document.createElement('img');
            profileSelectorGoImg.classList.add('selector-go-img');
            profileSelectorGoImg.src = './Assets/UI/ContinueBtn.png';
            profileSelectorDiv.appendChild(profileSelectorGoImg);

            // let completionistDiv = createEl('div', {
            //     classList: ['d-flex', 'jc-between', 'ai-center', 'view-profile', 'pointer', 'transparent-border'],
            //     style: {
            //         height: "80px",
            //     }
            // })
            // selectorsDiv.appendChild(completionistDiv)
            // completionistDiv.addEventListener("click", () => {
            //     generateCompletionist();
            // })
        } else {
            let statsUnavailableText = createEl('p', { classList: ['font-gardenia'], style: {fontSize: "1em", lineHeight: "1.5"}, innerHTML: "Profile & stats are temporarily unavailable, but most other tracking like Insta Monkey collections is still available, excluding new content. This Open Data API error happens after a new major update and is usually fixed within a couple days." });
            selectorsDiv.appendChild(statsUnavailableText);
        }

        let selectors = ['Towers', 'Heroes', 'ActivatedAbilities', 'MapProgress', 'PowersUsable', "PowersPro", 'InstaMonkeysUsable', 'Knowledge', 'Achievements', 'Quests', 'TrophyStore', 'TeamsStore', 'Extras'];
        if (btd6publicprofile == null) {
            selectors.splice(selectors.indexOf("ActivatedAbilities"),1);
        }

    } else {
        let notLoggedInContent = document.createElement('div');
        notLoggedInContent.classList.add('bg-color-primary', 'content-div', 'progress', 'd-flex');
        progressContent.appendChild(notLoggedInContent);

        let loginDiv = generateLoginDiv();
        notLoggedInContent.appendChild(loginDiv);

        let OtherInfoHeader = document.createElement('p');
        OtherInfoHeader.classList.add('site-info-header','black-outline');
        OtherInfoHeader.innerHTML = 'When an OAK token is entered:';
        notLoggedInContent.appendChild(OtherInfoHeader);

        let panels = {
            "Maps": {
                "name": "View Extra Map Stats!",
                "desc": "You can view your highest round and times completed count for every map on every mode!"
            },
            "InstaMonkeys": {
                "name": "View Your Insta Monkeys Collection!",
                "desc": "You can view how many of each Insta Monkey you've accumulated here as well as track your collection."
            },
            "CollectionEvent": {
                "name": "Collection Event Helper!",
                "desc": "Using your current inventory, you can view the odds of getting a new Insta Monkey for each chest type in general and when selecting a featured tower."
            },
            "Achievements": {
                "name": "View Achievements!",
                "desc": "You can view your achievement progress here as well as use a few useful filters such as finding Monkey Knowledge points as rewards."
            },
            "Towers": {
                "name": "View Your Towers!",
                "desc": "You can view portait art and total xp for every tower you've unlocked here."},
            "Heroes": {
                "name": "View Your Heroes!",
                "desc": "You can view all portrait art for all heroes and skins you've unlocked as well as hero level information here."
            },
            "Powers": {
                "name": "View Your Powers!",
                "desc": "You can view how many of each power you've accumulated here."
            },
            "Knowledge": {
                "name": "View Your Knowledge!",
                "desc": "You can view your Monkey Knowledge point unlock progress here."
            }
        }

        let instaMonkeyGuideContainer = document.createElement('div');
        instaMonkeyGuideContainer.classList.add('insta-monkey-guide-container');
        instaMonkeyGuideContainer.style.width = "800px";
        notLoggedInContent.appendChild(instaMonkeyGuideContainer);

        Object.keys(panels).forEach(method => {
            let instaMonkeyGuideMethod = document.createElement('div');
            instaMonkeyGuideMethod.classList.add('insta-monkey-guide-method');
            instaMonkeyGuideContainer.appendChild(instaMonkeyGuideMethod);

            let instaMonkeyGuideMethodText = document.createElement('p');
            instaMonkeyGuideMethodText.classList.add('insta-monkey-guide-method-text','black-outline');
            instaMonkeyGuideMethodText.innerHTML = panels[method].name;
            instaMonkeyGuideMethod.appendChild(instaMonkeyGuideMethodText);

            let instaMonkeyGuideMethodDesc = document.createElement('p');
            instaMonkeyGuideMethodDesc.classList.add('insta-monkey-guide-method-desc');
            instaMonkeyGuideMethodDesc.innerHTML = panels[method].desc;
            instaMonkeyGuideMethod.appendChild(instaMonkeyGuideMethodDesc);

            let instaMonkeyImage = document.createElement('img');
            instaMonkeyImage.classList.add('insta-monkey-guide-method-img');
            instaMonkeyImage.src = `./Assets/UI/Progress${method}.png`;
            instaMonkeyGuideMethod.appendChild(instaMonkeyImage);
        })
    }
    changeProgressTab('MapProgress');
}

function changeProgressTab(selector){
    resetScroll();
    if(timerInterval) { clearInterval(timerInterval); }
    addToBackQueue({source: 'profile', destination: 'profile', callback: generateProgress});
    switch(selector){
        case "MapProgress":
            generateMapsProgress();
            break;
    }
}

function generateMapsProgress(){
    let progressContent = document.getElementById('profile-content');
    progressContent.innerHTML = "";

    currentMapView = "grid";
    coopEnabled = true;
    currentDifficultyFilter = "All";
    mapPage = 0;

    let mapsProgressHeaderBar = document.createElement('div');
    mapsProgressHeaderBar.id = 'maps-progress-header-bar';
    mapsProgressHeaderBar.classList.add('maps-progress-header-bar');
    progressContent.appendChild(mapsProgressHeaderBar);

    let mapsProgressViews = document.createElement('div');
    mapsProgressViews.id = 'maps-progress-views';
    mapsProgressViews.classList.add('maps-progress-views');
    mapsProgressHeaderBar.appendChild(mapsProgressViews);
    
    let mapsProgressViewsText = document.createElement('p');
    mapsProgressViewsText.classList.add('maps-progress-coop-toggle-text','black-outline');
    mapsProgressViewsText.innerHTML = "Display Type:";
    mapsProgressViews.appendChild(mapsProgressViewsText);

    let mapsProgressGame = document.createElement('div');
    mapsProgressGame.id = 'maps-progress-game';
    mapsProgressGame.classList.add('maps-progress-view','black-outline');
    mapsProgressGame.innerHTML = "Game";
    mapsProgressGame.addEventListener('click', () => {
        onChangeMapView("game");
    })
    mapsProgressViews.appendChild(mapsProgressGame);


    let mapsProgressGrid = document.createElement('div');
    mapsProgressGrid.id = 'maps-progress-grid';
    mapsProgressGrid.classList.add('maps-progress-view','black-outline','maps-progress-view-selected');
    mapsProgressGrid.innerHTML = "Grid";
    mapsProgressGrid.addEventListener('click', () => {
        onChangeMapView("grid");
    })
    mapsProgressViews.appendChild(mapsProgressGrid);
    /*
    let mapsProgressList = document.createElement('div');
    mapsProgressList.id = 'maps-progress-list';
    mapsProgressList.classList.add('maps-progress-view','black-outline', 'maps-progress-view-list');
    mapsProgressList.innerHTML = "List";
    mapsProgressList.addEventListener('click', () => {
        onChangeMapView("list");
    })
    mapsProgressViews.appendChild(mapsProgressList);
    */

    let mapsProgressFilter = document.createElement('div');
    mapsProgressFilter.classList.add('maps-progress-filter');
    mapsProgressHeaderBar.appendChild(mapsProgressFilter);

    let mapProgressFilterDifficulty = document.createElement('div');
    mapProgressFilterDifficulty.classList.add('map-progress-filter-difficulty');
    mapsProgressFilter.appendChild(mapProgressFilterDifficulty);

    let mapsProgressFilterDifficultyText = document.createElement('p');
    mapsProgressFilterDifficultyText.classList.add('maps-progress-coop-toggle-text','black-outline');
    mapsProgressFilterDifficultyText.innerHTML = "Filter Difficulty:";
    mapProgressFilterDifficulty.appendChild(mapsProgressFilterDifficultyText);

    let mapProgressFilterDifficultySelect = document.createElement('select');
    mapProgressFilterDifficultySelect.id = 'map-progress-filter-difficulty-select';
    mapProgressFilterDifficultySelect.classList.add('map-progress-filter-difficulty-select');
    mapProgressFilterDifficultySelect.addEventListener('change', () => {
        onChangeDifficultyFilter(mapProgressFilterDifficultySelect.value);
    })
    let options = ["All","Beginner","Intermediate","Advanced","Expert"]
    options.forEach((option) => {
        let difficultyOption = document.createElement('option');
        difficultyOption.value = option;
        difficultyOption.innerHTML = option;
        mapProgressFilterDifficultySelect.appendChild(difficultyOption);
    })
    mapProgressFilterDifficulty.appendChild(mapProgressFilterDifficultySelect);
    /*
    let mapsProgressCoopToggle = document.createElement('div');
    mapsProgressCoopToggle.classList.add('maps-progress-coop-toggle');  
    mapsProgressFilter.appendChild(mapsProgressCoopToggle);

    let mapsProgressCoopToggleText = document.createElement('p');
    mapsProgressCoopToggleText.classList.add('maps-progress-coop-toggle-text','black-outline');
    mapsProgressCoopToggleText.innerHTML = "Co-op: ";
    mapsProgressCoopToggle.appendChild(mapsProgressCoopToggleText);

    let mapsProgressCoopToggleInput = document.createElement('input');
    mapsProgressCoopToggleInput.id = 'maps-progress-coop-toggle-input';
    mapsProgressCoopToggleInput.classList.add('maps-progress-coop-toggle-input');
    mapsProgressCoopToggleInput.type = 'checkbox';
    mapsProgressCoopToggleInput.checked = true;
    mapsProgressCoopToggleInput.addEventListener('change', () => {
        onChangeCoopToggle(mapsProgressCoopToggleInput.checked);
    })
    mapsProgressCoopToggle.appendChild(mapsProgressCoopToggleInput);
    */

    let mapsProgressContainer = document.createElement('div');
    mapsProgressContainer.id = 'maps-progress-container';
    mapsProgressContainer.classList.add('maps-progress-container');
    progressContent.appendChild(mapsProgressContainer);

    let mapProgressContainer = document.createElement('div');
    mapProgressContainer.id = 'map-progress-container';
    mapProgressContainer.classList.add('map-progress-container');
    mapProgressContainer.style.display = "none";
    progressContent.appendChild(mapProgressContainer);

    onChangeMapView("game");
}

function onChangeMapView(view){
    currentMapView = view;
    switch(view){
        case "grid":
            document.getElementById('maps-progress-grid').classList.add('stats-tab-yellow');
            //document.getElementById('maps-progress-list').classList.remove('stats-tab-yellow');
            document.getElementById('maps-progress-game').classList.remove('stats-tab-yellow');
            document.getElementById('maps-progress-header-bar').classList.add('border-top-only');
            generateMapsGridView();
            break;
        /*case "list":
            document.getElementById('maps-progress-grid').classList.remove('stats-tab-yellow');
            document.getElementById('maps-progress-list').classList.add('stats-tab-yellow');
            document.getElementById('maps-progress-game').classList.remove('stats-tab-yellow');
            document.getElementById('maps-progress-header-bar').classList.add('border-top-only');
            generateMapsListView();
            break;*/
        case "game":
            document.getElementById('maps-progress-grid').classList.remove('stats-tab-yellow');
            //document.getElementById('maps-progress-list').classList.remove('stats-tab-yellow');
            document.getElementById('maps-progress-game').classList.add('stats-tab-yellow');
            document.getElementById('maps-progress-header-bar').classList.remove('border-top-only');
            generateMapsGameView();
            break;
    }
}

function onChangeCoopToggle(coop){
    coopEnabled = coop;
    document.getElementById('maps-progress-coop-toggle-input').checked = coop;
    switch(currentMapView) {
        case "grid":
            generateMapsGridView();
            break;
        /*case "list":
            generateMapsListView();
            break;*/
        case "game":
            generateMapsGameView();
            break;
    }
}

function onChangeDifficultyFilter(difficulty){
    currentDifficultyFilter = difficulty;
    switch(currentMapView) {
        case "grid":
            generateMapsGridView();
            break;
        /*case "list":
            generateMapsListView();
            break;*/
        case "game":
            generateMapsGameView();
            break;
    }
}
/*
function onSelectMap(map){
    document.getElementById('maps-progress-container').style.display = "none";
    document.getElementById('maps-progress-header-bar').style.display = "none";
    document.getElementById('map-progress-container').style.display = "flex";
    resetScroll();
    generateMapDetails(map);
}
*/
function onExitMap(){
    document.getElementById('map-progress-container').style.display = "none";
    document.getElementById('maps-progress-header-bar').style.display = "flex";
    document.getElementById('maps-progress-container').style.display = "block";
}

function generateMapDetails(map){
    let mapProgressContainer = document.getElementById('map-progress-container');
    mapProgressContainer.innerHTML = "";

    let mapProgressHeaderBar = document.createElement('div');
    mapProgressHeaderBar.classList.add('single-map-progress-header-bar');
    mapProgressContainer.appendChild(mapProgressHeaderBar);

    let mapNextAndPrev = createEl('div', {
        classList: ['map-next-and-prev'],
        style: {
            width: "230px"
        }
    });
    mapProgressHeaderBar.appendChild(mapNextAndPrev);

    let mapProgressPrevBtn = document.createElement('div');
    mapProgressPrevBtn.classList.add('maps-progress-view','black-outline');
    mapProgressPrevBtn.innerHTML = "Previous";
    mapProgressPrevBtn.addEventListener('click', () => {
        let maps = Object.keys(constants.mapsInOrder).filter(value => Object.keys(btd6usersave.mapProgress).includes(value));; //Object.keys(constants.mapsInOrder);
        if (maps.indexOf(map) == 0) {
            onSelectMap(maps[maps.length - 1]);
        } else {
            onSelectMap(maps[maps.indexOf(map) - 1])
        }
    })
    mapNextAndPrev.appendChild(mapProgressPrevBtn);

    let mapProgressNextBtn = document.createElement('div');
    mapProgressNextBtn.classList.add('maps-progress-view','black-outline');
    mapProgressNextBtn.innerHTML = "Next";
    mapProgressNextBtn.addEventListener('click', () => {
        let maps = Object.keys(constants.mapsInOrder).filter(value => Object.keys(btd6usersave.mapProgress).includes(value));; //Object.keys(constants.mapsInOrder);
        if (maps.indexOf(map) == maps.length - 1) {
            onSelectMap(maps[0]);
        } else {
            onSelectMap(maps[maps.indexOf(map) + 1])
        }
    })
    mapNextAndPrev.appendChild(mapProgressNextBtn);

    let mapProgressHeaderText = createEl('p', {
        classList: ['black-outline'],
        style: {
            fontSize: "32px",
        },
        innerHTML: 'Map Stats'
    })
    mapProgressHeaderBar.appendChild(mapProgressHeaderText);

    let mapHeaderRight = createEl('div', {
        classList: ['d-flex', 'jc-end'],
        style: {
            width: "230px",
        }
    })
    mapProgressHeaderBar.appendChild(mapHeaderRight);

    let modalClose = document.createElement('img');
    modalClose.classList.add('modal-close');
    modalClose.src = "./Assets/UI/CloseBtn.png";
    modalClose.addEventListener('click', () => {
        // onExitMap();
        goBack();
    })
    mapHeaderRight.appendChild(modalClose);

    let mapBelowHeaderBar = document.createElement('div');
    mapBelowHeaderBar.classList.add('map-below-header-bar');
    mapProgressContainer.appendChild(mapBelowHeaderBar);

    let mapLeftColumn = document.createElement('div');
    mapLeftColumn.classList.add('map-left-column');
    mapBelowHeaderBar.appendChild(mapLeftColumn);

    let mapNameAndIcon = document.createElement('div');
    mapNameAndIcon.classList.add('map-progress-div', 'd-flex', 'fd-column', 'ai-center');
    mapLeftColumn.appendChild(mapNameAndIcon);

    let mapNameTop = document.createElement('div');
    mapNameTop.classList.add('map-name-top', 'w-100');
    mapNameAndIcon.appendChild(mapNameTop);

    let mapDifficultyIcon = document.createElement('img');
    mapDifficultyIcon.classList.add('map-difficulty-icon');
    mapDifficultyIcon.src = `./Assets/DifficultyIcon/Map${constants.mapsInOrder[map].difficulty}Btn.png`;
    mapNameTop.appendChild(mapDifficultyIcon);

    let mapNameAndMedals = document.createElement('div');
    mapNameAndMedals.classList.add('map-name-and-medals');
    mapNameTop.appendChild(mapNameAndMedals);
    
    let mapName = document.createElement('p');
    mapName.classList.add('map-name-large','black-outline');
    mapName.innerHTML = getLocValue(map);
    mapNameAndMedals.appendChild(mapName);
    
    let mapProgressSingle = document.createElement('div');
    mapProgressSingle.classList.add('map-progress-subtext');
    mapProgressSingle.innerHTML = `${Object.values(processedMapData.Medals.single[map]).filter(a=>a==true).length}/15 Single Player Medals`;
    mapNameAndMedals.appendChild(mapProgressSingle);

    let mapProgressCoop = document.createElement('div');
    mapProgressCoop.classList.add('map-progress-subtext');
    mapProgressCoop.innerHTML = `${Object.values(processedMapData.Medals.coop[map]).filter(a=>a==true).length}/15 Coop Medals`;
    mapNameAndMedals.appendChild(mapProgressCoop);

    let overallHighestRound = document.createElement('div');
    overallHighestRound.classList.add('map-progress-subtext');
    overallHighestRound.innerHTML = `Overall Highest Round: ${processedMapData.Maps[map].highestRound}`;
    mapNameAndMedals.appendChild(overallHighestRound);

    let totalWins = document.createElement('div');
    totalWins.classList.add('map-progress-subtext');
    totalWins.innerHTML = `Total Wins: ${processedMapData.Maps[map].totalWins}`;
    mapNameAndMedals.appendChild(totalWins);

    let mapIcon = document.createElement('img');
    mapIcon.classList.add('map-icon');
    mapIcon.src = getMapIcon(map);
    mapNameAndIcon.appendChild(mapIcon);

    let mapProgressSingleMedals = document.createElement('div');
    mapProgressSingleMedals.classList.add('map-progress-medals');
    mapLeftColumn.appendChild(mapProgressSingleMedals);

    switch(processedMapData.Borders["single"][map]) {
        case "None":
            mapProgressSingleMedals.classList.add('none-border');
            break;
        case "Bronze":
            mapProgressSingleMedals.classList.add('bronze-border');
            break;
        case "Silver":
            mapProgressSingleMedals.classList.add('silver-border');
            break;
        case "Gold":
            mapProgressSingleMedals.classList.add('gold-border');
            break;
        case "Black":
            mapProgressSingleMedals.classList.add('black-border');
            break;
    }

    for (let [difficulty, completed] of Object.entries(processedMapData.Medals.single[map])) {
        if (completed == null) { continue; }
        let medalDiv = document.createElement('div');
        medalDiv.classList.add('medal-div');
        mapProgressSingleMedals.appendChild(medalDiv);

        let medalImg = document.createElement('img');
        medalImg.classList.add('medal-img');
        medalImg.src = getMedalIcon(completed ? `Medal${medalMap[difficulty]}` : "MedalEmpty");
        if (processedMapData.Borders["single"][map] == "Black") {
            medalImg.classList.add("medal-glow")
        }
        medalImg.style.display = "none";
        medalImg.addEventListener('load', () => {
            if(medalImg.width < medalImg.height){
                medalImg.style.width = `${ratioCalc(3,70,256,0,medalImg.width)}px`
            } else {
                medalImg.style.height = `${ratioCalc(3,70,256,0,medalImg.height)}px`
            }
            medalImg.style.removeProperty('display');
        })
        medalDiv.appendChild(medalImg);

        addTooltip(medalDiv, constants.medalLabels[`Medal${medalMap[difficulty]}`], {});
    }

    let mapProgressCoopMedals = document.createElement('div');
    mapProgressCoopMedals.classList.add('map-progress-medals');
    mapLeftColumn.appendChild(mapProgressCoopMedals);

    for (let [difficulty, completed] of Object.entries(processedMapData.Medals.coop[map])) {
        if (completed == null) { continue; }
        let medalDiv = document.createElement('div');
        medalDiv.classList.add('medal-div');
        mapProgressCoopMedals.appendChild(medalDiv);

        let medalImg = document.createElement('img');
        medalImg.classList.add('medal-img');
        medalImg.src = getMedalIcon(completed ? `Medal${medalMap[difficulty]}` : "MedalCoopEmpty");
        medalImg.style.display = "none";
        if (processedMapData.Borders["coop"][map] == "Black") {
            medalImg.classList.add("medal-glow")
        }
        medalImg.addEventListener('load', () => {
            if(medalImg.width < medalImg.height){
                medalImg.style.width = `${ratioCalc(3,70,256,0,medalImg.width)}px`
            } else {
                medalImg.style.height = `${ratioCalc(3,70,256,0,medalImg.height)}px`
            }
            medalImg.style.removeProperty('display');
        })
        medalDiv.appendChild(medalImg);

        addTooltip(medalDiv, constants.medalLabels[`MedalCoop${medalMap[difficulty]}`], {});
    }

    switch(processedMapData.Borders["coop"][map]) {
        case "None":
            mapProgressCoopMedals.classList.add('coop-border');
            break;
        case "Bronze":
            mapProgressCoopMedals.classList.add('bronze-border');
            break;
        case "Silver":
            mapProgressCoopMedals.classList.add('silver-border');
            break;
        case "Gold":
            mapProgressCoopMedals.classList.add('gold-border');
            break;
        case "Black":
            mapProgressCoopMedals.classList.add('black-border');
            break;
    }

    let mapRightColumn = document.createElement('div');
    mapRightColumn.classList.add('map-right-column');
    mapBelowHeaderBar.appendChild(mapRightColumn);

    let rightColumnHeader = document.createElement('div');
    rightColumnHeader.classList.add('right-column-header');
    mapRightColumn.appendChild(rightColumnHeader);

    let rightColumnHeaderText = document.createElement('p');
    rightColumnHeaderText.classList.add('column-header-text','black-outline');
    rightColumnHeaderText.innerHTML = 'Mode Stats';
    rightColumnHeader.appendChild(rightColumnHeaderText);

    let difficultyModes = {
        "Easy": ["Easy", "PrimaryOnly", "Deflation"],
        "Medium": ["Medium", "MilitaryOnly", "Reverse", "Apopalypse"],
        "Hard": ["Hard", "MagicOnly", "HalfCash", "DoubleMoabHealth", "AlternateBloonsRounds"],
        "Impoppable": ["Impoppable", "Clicks"]
    }
    function getRemainingMM() {
        let mmCount = 0;
        for (let [difficulty, bool] of Object.entries(processedMapData.Medals.single[map])) {
            if (difficulty == "CHIMPS-BLACK") { continue; }
            if (bool == false) {
                let modeDifficulty = Object.entries(difficultyModes).find(([key, value]) => value.includes(difficulty))[0];
                mmCount += constants.mapMonkeyMoney[modeDifficulty] * constants.mapMonkeyMoney[constants.mapsInOrder[map].difficulty];
            }
        }
        return mmCount;
    }

    if (getRemainingMM() > 0) {
        let mapProgressMMLeft = createEl('div', {
            classList: ['d-flex', 'ai-center'],
            style: {
                margin: "10px"
            }
        });
        mapNameAndIcon.appendChild(mapProgressMMLeft);

        let mmCounterLabel = createEl('p', {
            classList: ['trophy-store-item-counter', 'font-gardenia'],
            style: {
                width: "390px"
            },
            innerHTML: "Bonus Monkey Money available by earning medals on single player:"
        });

        let mmCounterValue = createEl('p', {
            classList: ['trophy-store-item-counter', 'black-outline'],
            innerHTML: getRemainingMM()
        });

        let mmIcon = createEl('img', {
            classList: [],
            style: { width: "70px", marginLeft: "5px", marginRight: "10px" },
            src: './Assets/UI/BloonjaminsIcon.png'
        });
        mapProgressMMLeft.appendChild(mmCounterLabel);
        mapProgressMMLeft.appendChild(mmCounterValue);
        mapProgressMMLeft.appendChild(mmIcon);
    }

    let mapProgressCoopToggle = document.createElement('div');
    mapProgressCoopToggle.classList.add('maps-progress-coop-toggle');  
    rightColumnHeader.appendChild(mapProgressCoopToggle);

    let mapProgressCoopToggleText = document.createElement('p');
    mapProgressCoopToggleText.classList.add('maps-progress-coop-toggle-text','black-outline');
    mapProgressCoopToggleText.innerHTML = "Co-op: ";
    mapProgressCoopToggle.appendChild(mapProgressCoopToggleText);

    let mapProgressCoopToggleInput = document.createElement('input');
    mapProgressCoopToggleInput.id = 'maps-progress-coop-toggle-input';
    mapProgressCoopToggleInput.classList.add('maps-progress-coop-toggle-input');
    mapProgressCoopToggleInput.type = 'checkbox';
    mapProgressCoopToggleInput.addEventListener('change', () => {
        onChangeCoopToggle(mapProgressCoopToggleInput.checked);
        generateMapRightColStats(map, coopEnabled)
    })
    mapProgressCoopToggleInput.checked = coopEnabled;
    mapProgressCoopToggle.appendChild(mapProgressCoopToggleInput);

    let mapStatsContainer = document.createElement('div');
    mapStatsContainer.id = 'map-stats-container';
    mapStatsContainer.classList.add('map-stats-container');
    mapRightColumn.appendChild(mapStatsContainer);

    generateMapRightColStats(map, coopEnabled);
}

function generateMapRightColStats(map,coop){
    let mapStatsContainer = document.getElementById('map-stats-container');
    mapStatsContainer.innerHTML = "";

    for (let [difficulty, data] of Object.entries(coop ? processedMapData.Maps[map].coop : processedMapData.Maps[map].single)) {
        if (data == undefined) { continue; }
        let mapStatsDiv = document.createElement('div');
        mapStatsDiv.classList.add('map-stats-div');
        mapStatsContainer.appendChild(mapStatsDiv);

        let mapStatsIcon = document.createElement('img');
        mapStatsIcon.classList.add('map-stats-icon');
        mapStatsIcon.src = getModeIcon(difficulty);
        mapStatsDiv.appendChild(mapStatsIcon);

        let mapStatsTextDiv = document.createElement('div');
        mapStatsTextDiv.classList.add('map-stats-text-div');
        mapStatsDiv.appendChild(mapStatsTextDiv);

        let mapStatsDifficultyText = document.createElement('p');
        mapStatsDifficultyText.classList.add('map-stats-text-mode','black-outline');
        mapStatsDifficultyText.innerHTML = getLocValue(`Mode ${difficulty}`);
        mapStatsTextDiv.appendChild(mapStatsDifficultyText);

        let mapStatsText = document.createElement('p');
        mapStatsText.classList.add('map-stats-text');
        mapStatsText.innerHTML = `Times Completed: ${data.timesCompleted}`;
        mapStatsTextDiv.appendChild(mapStatsText);

        let mapStatsBestRound = document.createElement('p');
        mapStatsBestRound.classList.add('map-stats-text');
        mapStatsBestRound.innerHTML = `Best Round: ${data.bestRound}`;
        mapStatsTextDiv.appendChild(mapStatsBestRound);
    }

    if (mapStatsContainer.innerHTML == "") {
        let noDataFound = createEl('p', {
            classList: ['font-gardenia', 'ta-center'],
            style: {
                fontSize: "24px",
                marginTop: "20px",
                padding: "20px",
                borderRadius: "10px",
                backgroundColor: "var(--profile-tertiary)",
            },
            innerHTML: `No Data Available for ${coop ? "Co-op" : "Single Player"} on this map.`
        });
        mapStatsContainer.appendChild(noDataFound);
    }
}

function generateMapsGridView(){
    let mapsProgressContainer = document.getElementById('maps-progress-container');
    mapsProgressContainer.innerHTML = "";

    let mapsGridContainer = document.createElement('div');
    mapsGridContainer.classList.add('maps-grid-container');
    mapsProgressContainer.appendChild(mapsGridContainer);

    for (let [map, data] of Object.entries(constants.mapsInOrder)) {
        if (processedMapData.Borders[coopEnabled ? "coop" : "single"][map] == null) { continue; }
        if (currentDifficultyFilter != "All" && data.difficulty != currentDifficultyFilter) { continue; }


        let mapDiv = document.createElement('div');
        mapDiv.classList.add('map-div', 'pointer');
        switch(processedMapData.Borders[coopEnabled ? "coop" : "single"][map]) {
            case "None":
                coopEnabled ? mapDiv.classList.add('coop-border') : mapDiv.classList.add('none-border');
                break;
            case "Bronze":
                mapDiv.classList.add('bronze-border');
                break;
            case "Silver":
                mapDiv.classList.add('silver-border');
                break;
            case "Gold":
                mapDiv.classList.add('gold-border');
                break;
            case "Black":
                mapDiv.classList.add('black-border');
                break;
        }
        mapsGridContainer.appendChild(mapDiv);

        let mapImg = document.createElement('img');
        mapImg.classList.add('map-img');
        mapImg.src = getMapIcon(map);
        mapDiv.appendChild(mapImg);

        let mapName = document.createElement('p');
        mapName.classList.add(`map-name`,'black-outline');
        mapName.innerHTML = getLocValue(map);
        mapDiv.appendChild(mapName);

        let mapProgress = document.createElement('div');
        mapProgress.classList.add(`map-progress`);
        mapDiv.appendChild(mapProgress);

        mapDiv.addEventListener('click', () => {
            onSelectMap(map);
            addToBackQueue({callback: onExitMap});
        })
    }
}
/*
function generateMapsListView(){
    let mapsProgressContainer = document.getElementById('maps-progress-container');
    mapsProgressContainer.innerHTML = "";

    let mapsListContainer = document.createElement('div');
    mapsListContainer.classList.add('maps-list-container');
    mapsProgressContainer.appendChild(mapsListContainer);

    let fragment = document.createDocumentFragment();

    let colorToggle = false;
    for (let [map, data] of Object.entries(constants.mapsInOrder)) {
        if (processedMapData.Borders[coopEnabled ? "coop" : "single"][map] == null) { continue; }
        if (currentDifficultyFilter != "All" && data.difficulty != currentDifficultyFilter) { continue; }
        if (Object.entries(coopEnabled ? processedMapData.Maps[map].coop : processedMapData.Maps[map].single).every(([key, value]) => value == undefined)) { continue;}

        let mapContainer = document.createElement('div');
        mapContainer.classList.add('map-container');
        colorToggle ? mapContainer.style.backgroundColor = "var(--profile-secondary)" : mapContainer.style.backgroundColor = "var(--profile-tertiary)"; ;
        colorToggle = !colorToggle;
        fragment.appendChild(mapContainer);

        let mapDiv = document.createElement('div');
        mapDiv.classList.add('map-div');
        switch(processedMapData.Borders[coopEnabled ? "coop" : "single"][map]) {
            case "None":
                coopEnabled ? mapDiv.classList.add('coop-border') : mapDiv.classList.add('none-border');
                break;
            case "Bronze":
                mapDiv.classList.add('bronze-border');
                break;
            case "Silver":
                mapDiv.classList.add('silver-border');
                break;
            case "Gold":
                mapDiv.classList.add('gold-border');
                break;
            case "Black":
                mapDiv.classList.add('black-border');
                break;
        }
        mapContainer.appendChild(mapDiv);

        let mapImg = document.createElement('img');
        mapImg.classList.add('map-img');
        mapImg.src = getMapIcon(map);
        mapDiv.appendChild(mapImg);

        let mapName = document.createElement('p');
        mapName.classList.add(`map-name`,'black-outline');
        mapName.innerHTML = getLocValue(map);
        mapDiv.appendChild(mapName);

        let mapSections = document.createElement('div');
        mapSections.classList.add(`map-sections`);
        mapSections.style.overflowX = "auto";
        mapContainer.appendChild(mapSections);

        let mapSection = document.createElement('div');
        mapSection.classList.add(`map-section`);
        mapSections.appendChild(mapSection);

        let mapLabelMedals = document.createElement('p');
        mapLabelMedals.classList.add(`map-label-medals`,'black-outline');
        mapSection.appendChild(mapLabelMedals);

        let mapLabelBestRound = document.createElement('p');
        mapLabelBestRound.classList.add(`map-label-rounds`,'black-outline');
        mapLabelBestRound.innerHTML = "Best Round:";
        mapSection.appendChild(mapLabelBestRound);

        let mapLabelTimesCompleted = document.createElement('p');
        mapLabelTimesCompleted.classList.add(`map-label-completed`,'black-outline');
        mapLabelTimesCompleted.innerHTML = "Times Completed:";
        mapSection.appendChild(mapLabelTimesCompleted);

        let medalColor = false;
        for (let [difficulty, data] of Object.entries(coopEnabled ? processedMapData.Maps[map].coop : processedMapData.Maps[map].single)) {
            if (data == undefined) { continue; }
            let mapSectionColumn = document.createElement('div');
            mapSectionColumn.classList.add(`map-section-column`);
            mapSections.appendChild(mapSectionColumn);

            let mapSectionMedal = document.createElement('div');
            mapSectionMedal.classList.add(`map-section-medal`);
            mapSectionColumn.appendChild(mapSectionMedal);

            let mapSectionMedalImg = document.createElement('img');
            mapSectionMedalImg.classList.add(`map-section-medal-img`);
            mapSectionMedalImg.src = getMedalIcon(difficulty == "Clicks" && data.completedWithoutLoadingSave ? `Medal${coopEnabled ? "Coop" : ""}${medalMap["CHIMPS-BLACK"]}` : `Medal${coopEnabled ? "Coop" : ""}${medalMap[difficulty]}`);
            mapSectionMedalImg.style.display = "none";

            if (!data.completed && data.bestRound < constants.endRound[difficulty] && !data.completedWithoutLoadingSave) { mapSectionMedalImg.style.filter = "brightness(0.5)" } ;
             mapSectionMedalImg.addEventListener('load', () => {
                if(mapSectionMedalImg.width < mapSectionMedalImg.height){
                    mapSectionMedalImg.style.width = `${ratioCalc(3,70,256,0,mapSectionMedalImg.width)}px`
                } else {
                    mapSectionMedalImg.style.height = `${ratioCalc(3,70,256,0,mapSectionMedalImg.height)}px`
                }
                mapSectionMedalImg.style.removeProperty('display');
            })
            mapSectionMedal.appendChild(mapSectionMedalImg);

            addTooltip(mapSectionMedal, constants.medalLabels[`Medal${coopEnabled ? "Coop" : ""}${medalMap[difficulty]}`], {});

            let mapSectionBestRound = document.createElement('p');
            mapSectionBestRound.classList.add(`map-section-text`,'black-outline');
            mapSectionBestRound.innerHTML = data.bestRound;
            mapSectionColumn.appendChild(mapSectionBestRound);

            let mapSectionTimesCompleted = document.createElement('p');
            mapSectionTimesCompleted.classList.add(`map-section-text`,'black-outline');
            mapSectionTimesCompleted.innerHTML = data.timesCompleted;
            mapSectionColumn.appendChild(mapSectionTimesCompleted);

            medalColor = !medalColor;
            if (medalColor) {
                mapSectionColumn.style.backgroundColor = "rgba(0,0,0,0.1)";
            } else {
                mapSectionColumn.style.backgroundColor = "rgba(255,255,255,0.1)";
            }
        }

        mapDiv.addEventListener('click', () => {
            onSelectMap(map);
            addToBackQueue({callback: onExitMap});
        })
    }
    mapsListContainer.appendChild(fragment);
}
*/
function generateMapsGameView() {
    let mapsProgressContainer = document.getElementById('maps-progress-container');
    mapsProgressContainer.innerHTML = "";

    let mapsGameContainer = document.createElement('div');
    mapsGameContainer.classList.add('maps-game-container');
    mapsProgressContainer.appendChild(mapsGameContainer);

    let maps = Object.keys(constants.mapsInOrder).filter(value => Object.keys(btd6usersave.mapProgress).includes(value)); //Object.keys(constants.mapsInOrder);
    if (currentDifficultyFilter != "All") { maps = maps.filter(map => constants.mapsInOrder[map].difficulty == currentDifficultyFilter) }
    let maxPage = Math.ceil(maps.length / 6) - 1;
    if (mapPage > maxPage) { mapPage = 0; }
    if (mapPage < 0) { mapPage = maxPage; }
    let mapsToDisplay = maps.slice(mapPage * 6, mapPage * 6 + 6);

    let mapPrevArrow = document.createElement('div');
    mapPrevArrow.classList.add('map-arrow');
    mapsGameContainer.appendChild(mapPrevArrow);

    let mapPrevArrowImg = document.createElement('img');
    mapPrevArrowImg.classList.add('map-arrow-img');
    mapPrevArrowImg.src = "./Assets/UI/PrevArrow.png";
    mapPrevArrow.appendChild(mapPrevArrowImg);

    let mapsGameGrid = document.createElement('div');
    mapsGameGrid.classList.add('maps-game-grid');
    mapsGameContainer.appendChild(mapsGameGrid);

    for (let map of mapsToDisplay) {
        let mapDiv = document.createElement('div');
        mapDiv.classList.add('map-div-ingame');
        switch(processedMapData.Borders[coopEnabled ? "coop" : "single"][map]) {
            case "None":
                coopEnabled ? mapDiv.classList.add('coop-border') : mapDiv.classList.add('none-border');
                break;
            case "Bronze":
                mapDiv.classList.add('bronze-border');
                break;
            case "Silver":
                mapDiv.classList.add('silver-border');
                break;
            case "Gold":
                mapDiv.classList.add('gold-border');
                break;
            case "Black":
                mapDiv.classList.add('black-border');
                break;
        }
        mapsGameGrid.appendChild(mapDiv);

        let mapImg = document.createElement('img');
        mapImg.classList.add('map-img-ingame');
        mapImg.src = getMapIcon(map);
        mapDiv.appendChild(mapImg);

        let mapName = document.createElement('p');
        mapName.classList.add(`map-name`,'black-outline');
        mapName.innerHTML = getLocValue(map);
        mapDiv.appendChild(mapName);

        for (let [difficulty, completed] of (coopEnabled ? Object.entries(processedMapData.Medals.coop[map]) : Object.entries(processedMapData.Medals.single[map]))) {
            if (completed == null) { continue; }
            let medalDiv = document.createElement('div');
            let largeMedals = ["Easy", "Medium", "Hard", "Impoppable"]
            largeMedals.includes(difficulty) ? medalDiv.classList.add('medal-div-large') : medalDiv.classList.add('medal-div-small');
            medalDiv.classList.add(`medal-div-${difficulty.toLowerCase()}`);
            mapDiv.appendChild(medalDiv);
    
            let medalImg = document.createElement('img');
            medalImg.classList.add('medal-img');
            medalImg.src = getMedalIcon(completed ? `Medal${medalMap[difficulty]}` : "MedalEmpty");
            if(!completed) { medalImg.classList.add("medal-div-unobtained") }
            medalImg.style.display = "none";
            medalImg.addEventListener('load', () => {
                if(medalImg.width < medalImg.height){
                    medalImg.style.width = `${ratioCalc(3,70,256,0,medalImg.width)}px`
                } else {
                    medalImg.style.height = `${ratioCalc(3,70,256,0,medalImg.height)}px`
                }
                medalImg.style.removeProperty('display');
            })
            medalDiv.appendChild(medalImg);
        }    

        mapDiv.addEventListener('click', () => {
            onSelectMap(map);
            addToBackQueue({callback: onExitMap});
        })
    }

    let mapNextArrow = document.createElement('div');
    mapNextArrow.classList.add('map-arrow');
    mapsGameContainer.appendChild(mapNextArrow);

    let mapNextArrowImg = document.createElement('img');
    mapNextArrowImg.classList.add('map-arrow-img');
    mapNextArrowImg.src = "./Assets/UI/NextArrow.png";
    mapNextArrow.appendChild(mapNextArrowImg);

    mapPrevArrow.addEventListener('click', () => {
        mapPage--;
        generateMapsGameView();
    })

    mapNextArrow.addEventListener('click', () => {
        mapPage++;
        generateMapsGameView();
    })

    let mapPageDots = document.createElement('div');
    mapPageDots.classList.add('map-page-dots');
    mapsProgressContainer.appendChild(mapPageDots);

    for (let i = 0; i <= maxPage; i++) {
        let mapPageDot = document.createElement('div');
        mapPageDot.classList.add('map-page-dot');
        if (i == mapPage) { mapPageDot.classList.add('map-page-dot-active'); }
        mapPageDots.appendChild(mapPageDot);

        mapPageDot.addEventListener('click', () => {
            mapPage = i;
            generateMapsGameView();
        })
    }
}