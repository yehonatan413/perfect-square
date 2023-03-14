"use strict";

const rect = document.querySelector(".rect");
const playArea = document.querySelector(".play_area");
const timer = document.querySelector(".timer");
const arcadeLabel = document.querySelector("h1");
const percentageLabel = document.querySelector(".percentage");
const widthLabel = document.querySelector(".width");
const heightLabel = document.querySelector(".height");
const labels = document.querySelectorAll(".label");

const logo = document.querySelector(".img_logo");

const btnArcade = document.querySelector(".btn_arcade");
const btnStats = document.querySelector(".btn_stats");
const modalStats = document.querySelector(".modal_stats");
const overlay = document.querySelector(".overlay");

const stats = document.querySelectorAll(".stat_data");

const sfxPop = document.querySelector(".sfx_pop");
const sfxPerfect = document.querySelector(".sfx_perfect");
const music = document.querySelector(".music_arcadeMode");
music.volume = 0.65;

let x1 = 0,
    y1 = 0,
    x2 = 0,
    y2 = 0;
let streak = 0;
let arcadePerfectCount = 0;
let arcadeMode = false;
let mouseDown = false;

//hide rect on start
rect.classList.add("hidden");
arcadeLabel.style.display = "none";

function redrawRect() {
    //This will restyle the div
    let x3 = Math.min(x1, x2); //Smaller X
    let x4 = Math.max(x1, x2); //Larger X
    let y3 = Math.min(y1, y2); //Smaller Y
    let y4 = Math.max(y1, y2); //Larger Y
    rect.style.left = x3 + "px";
    rect.style.top = y3 + "px";
    rect.style.width = x4 - x3 + "px";
    rect.style.height = y4 - y3 + "px";
    if (rect.offsetWidth < 75 || rect.offsetHeight < 75)
        rect.classList.add("rect_invalid"); //display rect in red if too small
    else rect.classList.remove("rect_invalid");
}

playArea.addEventListener("mousedown", function (e) {
    mouseDown = true;

    rect.classList.add("rect_dashed");
    rect.classList.remove(
        "hidden",
        "rect_solid",
        "rect_aftertrans",
        "rect_perfect"
    ); //Display rect creation

    //Hide labels
    for (const label of labels) {
        label.style.visibility = "hidden";
    }

    x1 = e.clientX; //Set the initial X
    y1 = e.clientY; //Set the initial Y
    redrawRect();
});

playArea.addEventListener("mousemove", function (e) {
    x2 = e.clientX; //Update the current position X
    y2 = e.clientY; //Update the current position Y
    if (mouseDown) redrawRect(); //Continue drawing rectangle while mouse is down
});

document.addEventListener("mouseup", function (e) {
    //for UI changes
    mouseDown = false;

    const rectWidth = rect.offsetWidth;
    const rectHeight = rect.offsetHeight;
    const percentage = getSquarePercentage(rectWidth, rectHeight); //the % of a perfect square

    if (rectWidth < 75 || rectHeight < 75 || !playArea.contains(e.target)) {
        rect.classList.add("hidden"); //hide rect if built too small or mouseup is not in playArea
        return;
    }
    //Set text for labels
    percentageLabel.textContent = percentage.toFixed(1) + "%";
    widthLabel.textContent = rectWidth;
    heightLabel.textContent = rectHeight;

    //Center percentage label vertically
    percentageLabel.style.top =
        (rectHeight - percentageLabel.offsetHeight) / 2 + "px";

    const padding = 10;

    widthLabel.style.bottom = rectHeight + padding + "px";

    heightLabel.style.right = rectWidth + padding + "px";
    heightLabel.style.top = (rectHeight - heightLabel.offsetHeight) / 2 + "px"; //Center height label vertically

    if (percentage === 100) rect.classList.add("rect_perfect");

    rect.classList.remove("rect_dashed");
    rect.classList.add("rect_pretrans"); //in this state the rect has an outline of 0px and thus is invisible
    rect.classList.add("rect_solid"); //now the outline width transitions to 5px

    //display labels with correct color
    for (const label of labels) {
        label.style.color = percentage === 100 ? "#55f2ae" : "white";
        label.style.visibility = "visible";
    }
    rect.classList.remove("rect_pretrans"); //remove transitionary class
    playCreationSFX();
});

playArea.addEventListener("mouseup", function (e) {
    //for logic changes
    const rectWidth = rect.offsetWidth;
    const rectHeight = rect.offsetHeight;
    const percentage = getSquarePercentage(rectWidth, rectHeight);

    if (rectWidth < 75 || rectHeight < 75) {
        return; //cancel if rect is too small
    }

    setCookie("count", Number(getCookie("count")) + 1); //increment total count

    const avg = Number(getCookie("avgPercentage").split("%")[0]);
    const totalRects = Number(getCookie("count"));
    if (getCookie("avgPercentage"))
        setCookie(
            "avgPercentage",
            ((totalRects * avg + percentage) / (totalRects + 1)).toFixed(1) +
                "%"
        );
    //update average percentage
    else setCookie("avgPercentage", percentage.toFixed(1) + "%"); //first rect

    if (percentage === 100) {
        setCookie("perfectCount", Number(getCookie("perfectCount")) + 1); //increment perfect count

        const maxSize = Math.max(
            getCookie("perfectLargest").split("x")[0],
            rectWidth
        );
        setCookie("perfectLargest", maxSize + "x" + maxSize); //update largest size

        streak++;
        const maxStreak = Math.max(getCookie("perfectStreak"), streak);
        setCookie("perfectStreak", maxStreak);

        if (arcadeMode) arcadeLabel.textContent++; //increment arcade counter
    } else streak = 0;
});

function getSquarePercentage(width, height) {
    //returns how square a rect is
    return (Math.min(width, height) / Math.max(width, height)) * 100;
}

function playCreationSFX() {
    if (getSquarePercentage(rect.offsetWidth, rect.offsetHeight) === 100) {
        sfxPerfect.load();
        sfxPerfect.play();
    } else {
        sfxPop.load();
        sfxPop.play();
    }
}

btnArcade.addEventListener("click", function () {
    timer.classList.remove("hidden");
    btnArcade.classList.add("hidden");

    logo.style.display = "none";
    arcadeLabel.style.display = "unset";

    timer.textContent = "30"; //30sec timer
    arcadeLabel.textContent = "0";
    arcadeMode = true;

    music.load();
    music.play();

    const timerInterval = setInterval(() => {
        if (timer.textContent === "0") {
            clearInterval(timerInterval);

            arcadeMode = false;
            timer.classList.add("hidden");
            btnArcade.classList.remove("hidden");

            const currHighScore = getCookie("highScore");
            if (currHighScore < arcadeLabel.textContent) {
                setCookie("highScore", arcadeLabel.textContent); //update high score
            }
            arcadeLabel.style.display = "none";
            logo.style.display = "unset";
        }
        timer.textContent--;
    }, 1000);
});

btnStats.addEventListener("click", function () {
    modalStats.classList.remove("hidden");
    overlay.classList.remove("hidden");

    for (const stat of stats) {
        if (getCookie(stat.id)) stat.textContent = getCookie(stat.id); //get data for stats screen if exists
    }
});

overlay.addEventListener("click", function () {
    if (!overlay.classList.contains("hidden")) {
        modalStats.classList.add("hidden");
        overlay.classList.add("hidden");
    }
});

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(name, value) {
    document.cookie = `${name}=${value};expires=${new Date(
        2147483647 * 1000
    ).toUTCString()};path=/;SameSite=Lax`;
}
