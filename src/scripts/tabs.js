const fs = require('fs');
const $TABS = document.getElementById("tabs");
const $TABS_CONTEXT_MENU = document.getElementById('editTabContext')
let currentTabContext


function getAllTabs() {
    db.serialize(() => {
        db.each('SELECT * FROM files WHERE isTab = true', (err, row) => {
            if (err) {
                console.error(err.message);
            } else {
                addTabToUI(row)
            }
        });
    });
}

function setUpDB() {
    db.run(
        'CREATE TABLE IF NOT EXISTS files (id TEXT PRIMARY KEY, name TEXT, content TEXT, isTab BOOLEAN, isTabOpen BOOLEAN, created_at TEXT, updated_at TEXT)'
    )
}

function addTabToUI(tab) {
    $TABS.innerHTML += `
        <div class="tab" onclick="editNote('${tab.id}')" oncontextmenu="tabContextMenu('${tab.id}', event)" id="tab-${tab.id}" ${tab.isTabOpen ? `style="background: var(--background)"` : ""}>
            <img src="../svgs/note.svg" width="18" height="18" style="color:white">
            <div class="input-container">
                <span class="text-measurer" id="textMeasurer-${tab.id}"></span>
                <input disabled="true" value="${tab.name}" id="rename-input-${tab.id}" class="renameInput">
            </div>
            <img onClick="event.stopPropagation(); closeTab('${tab.id}')" src="../svgs/cross.svg" width="16" height="16" id="close-icon" class="close-icon">
        </div>
    `;

    let _measurer = document.getElementById(`textMeasurer-${tab.id}`)
    let _input = document.getElementById(`rename-input-${tab.id}`)

    _input.addEventListener('input', () => {
        _measurer.textContent = _input.value || _input.value; // Set text in measurer
        _input.style.width = `${(_measurer.offsetWidth + 10) > 150 ? 150 : (_measurer.offsetWidth + 10)}px`; // Adjust input width
    });

    _measurer.textContent = _input.value;
    _input.style.width = `${(_measurer.offsetWidth + 10) > 150 ? 150 : (_measurer.offsetWidth + 10)}px`;

}

function editNote(id) {
    if (currentOpenTabId != id) {
        db.run(`UPDATE files SET isTabOpen = false WHERE isTabOpen = true`)

        db.run(`UPDATE files set isTabOpen = true WHERE id = '${id}' AND isTab = true`)
        currentOpenTabId = id
        reloadTabs()
        reloadContent()
    }
}

function deleteNote(id) {
    try {
        db.run(`DELETE FROM files WHERE id = '${id}'`)
        if (currentOpenTabId == id) {
            currentOpenTabId = undefined
        }
        reloadTabs()
        loadAllSearchResults()   
        reloadContent()
    } catch (error) {
        console.log(error)
    }
}

function tabContextMenu(tabId, event) {
    $TABS_CONTEXT_MENU.style.top = `${event.clientY}px`
    $TABS_CONTEXT_MENU.style.left = `${event.clientX}px`
    $TABS_CONTEXT_MENU.style.display = "block"
    currentTabContext = tabId
}

function reloadContent() {

    let index = 0

    db.serialize(() => {

        let isEmpty = true

        db.each('SELECT * FROM files WHERE isTabOpen = true', (err, row) => {
            if (err) {
                console.log(err)
            } else {
                if (index == 1) {
                    throw new Error("Something went wrong with the tab management")
                }
                editor.innerHTML = row.content
                index++
                isEmpty = false
                updateLineCount()
            }
        }, () => {
            if (isEmpty) {
                document.getElementById('noTabOpenContent').style.display = "flex"
            } else {
                document.getElementById('noTabOpenContent').style.display = "none"
            }
        });
    });
}





function closeTab(tabId) {
    if (tabId) {
        try {
            db.run(`UPDATE files SET isTab = false, isTabOpen = false WHERE id = "${tabId}"`)
            if (currentOpenTabId == tabId) {
                currentOpenTabId = undefined
            }


            reloadTabs()
            loadAllSearchResults()
            reloadContent()
        } catch (error) {
            console.log("This id does not exists")
        }
    }
    
}

function closeAllTabs() {
    try {
        db.run(`UPDATE files SET isTab = false, isTabOpen = false`)
        currentOpenTabId = undefined
        reloadContent()
        reloadTabs()
        loadAllSearchResults()
    } catch (error) {
        console.log("This id does not exists")
    }
}


function createNewFile() {
    db.run(`UPDATE files SET isTabOpen = false WHERE isTabOpen = true`)
    const stmt = db.prepare(
        'INSERT INTO files (id, name, content, isTab, isTabOpen, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const id = cuid()
    stmt.run(id, "Untitled Note", "", true, true, now(), now(), (err) => {
        if (err) {
            console.error(err.message);
        } else {
            currentOpenTabId = id
            reloadTabs()
            loadAllSearchResults()
            reloadContent()
            document.getElementById('editor').focus()
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
    setUpDB()
    getAllTabs();
});

document.addEventListener('click', () => {
    $TABS_CONTEXT_MENU.style.display = "none"
}, true)

document.addEventListener('contextmenu', () => {
    $TABS_CONTEXT_MENU.style.display = "none"
}, true)


document.getElementById('tab-context-close').addEventListener('click', () => {
    closeTab(currentTabContext)
})

document.getElementById('tab-context-open').addEventListener('click', () => {
    editNote(currentTabContext)
})

document.getElementById('tab-context-delete').addEventListener('click', () => {
    deleteNote(currentTabContext)
})

document.getElementById('tab-context-rename').addEventListener('click', () => {
    document.getElementById(`rename-input-${currentTabContext}`).removeAttribute("disabled")
    document.getElementById(`rename-input-${currentTabContext}`).focus()
    document.getElementById(`rename-input-${currentTabContext}`).select()

    document.getElementById(`rename-input-${currentTabContext}`).addEventListener('blur', () => {
        document.getElementById(`rename-input-${currentTabContext}`).setAttribute("disabled","true")  
        let value = document.getElementById(`rename-input-${currentTabContext}`).value
        if (value.trim() == "") {
            value = "Untitled Note"
        }
        try {
            console.log(value)
            db.run(`UPDATE files SET name = ? WHERE id = ?`, [value, currentTabContext])
            loadAllSearchResults()
            reloadTabs()    
        } catch (error) {
          console.log(error)  
        }
    })

    document.getElementById(`rename-input-${currentTabContext}`).addEventListener('change', () => {
        document.getElementById(`rename-input-${currentTabContext}`).setAttribute("disabled","true")  
    })
})

document.addEventListener('DOMContentLoaded', () => {
    reloadContent()
})

function renameCurrentFile() {
    if (currentOpenTabId) {
        document.getElementById(`rename-input-${currentOpenTabId}`).removeAttribute("disabled")
        document.getElementById(`rename-input-${currentOpenTabId}`).focus()
        document.getElementById(`rename-input-${currentOpenTabId}`).select()
    
        document.getElementById(`rename-input-${currentOpenTabId}`).addEventListener('blur', () => {
            document.getElementById(`rename-input-${currentOpenTabId}`).setAttribute("disabled","true")  
            let value = document.getElementById(`rename-input-${currentOpenTabId}`).value
            if (value.trim() == "") {
                value = "Untitled Note"
            }
            try {
                console.log(value)
                db.run(`UPDATE files SET name = ? WHERE id = ?`, [value, currentOpenTabId])
                loadAllSearchResults()
                reloadTabs()    
            } catch (error) {
              console.log(error)  
            }
        })
    
        document.getElementById(`rename-input-${currentOpenTabId}`).addEventListener('change', () => {
            document.getElementById(`rename-input-${currentOpenTabId}`).setAttribute("disabled","true")  
        })
    }
}