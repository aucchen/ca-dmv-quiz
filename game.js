// 1. load data

import { parse } from './csv.js';

export let dmv_data = [];

export let currentRow = [];

export let wins = 0;

export let losses = 0;

export async function getData() {
    document.getElementById('license').textContent = 'LOADING...';
    const response = await fetch('data/applications.csv');
    const data = await response.text();
    const response2 = await fetch('data/applications2017.csv');
    const data2 = await response2.text();
    const parsed_1 = parse(data);
    const parsed_2 = parse(data2);
    return parsed_1.concat(parsed_2);
}

function onAnswer(answer) {
    if (currentRow[4] == answer) {
        wins += 1;
        document.getElementById('response').textContent = 'CORRECT ✅';
    } else {
        losses += 1;
        document.getElementById('response').textContent = 'INCORRECT ❌';
    }
    let verdict = '';
    if (currentRow[4] == 'Y') {
        verdict = 'Verdict: ACCEPTED';
    } else if (currentRow[4] == 'N') {
        verdict = 'Verdict: REJECTED';
    } else {
        verdict = 'Verdict: UNKNOWN';
    }
    document.getElementById('dmv').textContent = 'DMV: ' + currentRow[3];
    document.getElementById('verdict').textContent = verdict;
    document.getElementById('current_score').textContent = 'Wins: ' + wins + '; Losses: ' + losses;
    // omg set timeout based on length of the dmv text?
    let timeout = 3000;
    if (currentRow[3].length > 40) {
        timeout = 4000;
    } else if (currentRow[3].length < 15) {
        timeout = 2000;
    }
    setTimeout(update, timeout);
    document.getElementById('yes').disabled = true;
    document.getElementById('no').disabled = true;
}

// draw a canvas using the license plate
export async function draw(text) {
    const canvas = document.getElementById('canvas');
    const width = canvas.width;
    const height = canvas.height;
    //const width = canvas.getBoundingClientRect().width;
    //const height = canvas.getBoundingClientRect().height;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = 'resources/template_small.png';
    img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        ctx.font =  Math.floor(height/2.8)+ 'px licenseplate, monospace';
        ctx.fillStyle = '#1F2A64';
        ctx.strokeStyle = '#1F2A64';
        ctx.textAlign = 'center';
        ctx.fillText(text, width/2, 0.76*height);
    };
}

/**
 * Copied from https://github.com/rjindael/ca-dmv-bot/blob/trunk/bot.js
 *
 * This is a small function to automatically correct clerical errors that exist in the source record data.
 * Many entries have columns that are like "NO MEANING REG 17", "NO MICRO", "NOT ON QUICKWEB YET".
 * 
 * If a comment contains a matching keyword, it modifies it to become a meaningless "(not on record)"
 * so that the plate may still be posted while preserving clarity.
 * 
 * This also strips enclosing quotation marks and duplicate quotation marks.
 */
function correctClericalErrors(comment) {
    if (!comment.length) { 
        return "(not on record)";
    }
    let matches = ["no micro", "not on micro", "reg 17", "quickweb", "quick web"];
    for (let i = 0; i < matches.length; i++) {
        if (comment.toLowerCase().includes(matches[i]) || comment.toLowerCase().trim() == matches[i]) {
            return "(not on record)";
        }
    }
    if (comment[0] == "\"" && comment[comment.length - 1] == "\"") {
        comment = comment.slice(1, -1);
    }
    comment = comment.replaceAll("\"\"", "\"");
    comment = comment.replaceAll(/\s/g, " ");
    return comment;
}



function update() {
    let i = Math.floor(Math.random()*(dmv_data.length - 1)) + 1;
    currentRow = dmv_data[i];
    document.getElementById('license').textContent = currentRow[0];
    draw(currentRow[0]);
    document.getElementById('customer').textContent = 'Customer: ' + correctClericalErrors(currentRow[2]);
    document.getElementById('response').textContent = '';
    document.getElementById('dmv').textContent = '';
    document.getElementById('verdict').textContent = '';
    document.getElementById('yes').disabled = false;
    document.getElementById('no').disabled = false;
}

window.onload = async function() {
    dmv_data = await getData();
    update();
    document.getElementById('yes').onclick = () => onAnswer('Y');
    document.getElementById('no').onclick = () => onAnswer('N');
};

