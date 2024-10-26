const fs = require('fs');
const $TABS = document.getElementById("tabs");
const $TABS_CONTEXT_MENU = document.getElementById('editTabContext')

function getAllTabs() {
    db.serialize(() => {
        db.each('SELECT * FROM files WHERE isTab = true', (err, row) => {
            if (err) {
                console.error(err.message);
                setUpTabs();
            } else {
                addTabToUI(row)
            }
        });
    });
}

function setUpTabs() {
    console.log("e");
    db.run(
        'CREATE TABLE IF NOT EXISTS files (id TEXT PRIMARY KEY, name TEXT, content TEXT, isTab BOOLEAN, isTabOpen BOOLEAN, created_at TEXT, updated_at TEXT)'
    );

    const stmt = db.prepare(
        'INSERT INTO files (id, name, content, isTab, isTabOpen, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    stmt.run(cuid(), "Untitled Note", "", true, true, now(), now(), (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log("Row inserted successfully");
        }
    });
    stmt.finalize();
}

function addTabToUI(tab) {
    console.log(tab);
    $TABS.innerHTML += `
        <div class="tab" id="tab-${tab.id}">
            <img src="../svgs/note.svg" width="18" height="18" style="color:white">
            <p>
                ${tab.name}
            </p>
            <img onClick="closeTab('${tab.id}')" src="../svgs/cross.svg" width="16" height="16" id="close-icon" class="close-icon">
        </div>
    `;

    document.getElementById(`tab-${tab.id}`).addEventListener('click', (e) => {
        console.log(e.clientX, e.clientY)
    })

    document.getElementById(`tab-${tab.id}`).oncontextmenu = (e) => {
        console.log(e)
        $TABS_CONTEXT_MENU.style.top = `${e.clientY}px`
        $TABS_CONTEXT_MENU.style.left = `${e.clientX}px`
        $TABS_CONTEXT_MENU.style.display = "block"
    }
}


function closeTab(tabId) {
    if (tabId) {
        try {
            db.run(`UPDATE files SET isTab = false, isTabOpen = false WHERE id = "${tabId}"`)
            reloadTabs()
            loadAllSearchResults()
        } catch (error) {
            console.log("This id does not exists")
        }
    }
    
}

function createNewFile() {
    const stmt = db.prepare(
        'INSERT INTO files (id, name, content, isTab, isTabOpen, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    stmt.run(cuid(), "Untitled Note", "", true, true, now(), now(), (err) => {
        if (err) {
            console.error(err.message);
        } else {
            reloadTabs()
        }
    });
    stmt.finalize();
}

function reloadTabs() {
    $TABS.innerHTML = ""
    getAllTabs()
}

function now() {
    const date = new Date();
    return date.toISOString().slice(0, 19).replace('T', ' '); // Format as "YYYY-MM-DD HH:MM:SS"
}

function cuid() {
    const timestamp = Date.now().toString(36); // Convert current timestamp to base-36
    const random = Math.random().toString(36).substring(2, 10); // Generate a random 8-character string
    const counter = cuid.counter = (cuid.counter || 0) + 1; // Increment counter

    return `c${timestamp}${random}${counter.toString(36)}`; // Combine with a 'c' prefix
}

document.addEventListener('DOMContentLoaded', () => {
    getAllTabs();
});

document.addEventListener('click', () => {
    $TABS_CONTEXT_MENU.style.display = "none"
}, true)

document.addEventListener('contextmenu', () => {
    $TABS_CONTEXT_MENU.style.display = "none"
}, true)