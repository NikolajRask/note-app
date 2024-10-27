const searchBar = document.getElementById('searchBar')
const searchDrawer = document.getElementById('searchDrawer')
const searchResults = document.getElementById('searchResults')
const actualSearch = document.getElementById('realSearch')

function openSearch() {
    actualSearch.value = ""
    searchDrawer.style.display = "block"
    actualSearch.focus()
}

searchBar.addEventListener('click', () => {
    openSearch()
})

document.addEventListener('click', (e) => {
    if (!e.target.className.includes("ignore-search-close")) {
        searchDrawer.style.display = "none"
    }
}, true)

function loadAllSearchResults(searchTerm) {

    if (searchTerm) {
        let combinedResults = ``
        db.serialize(() => {

            let isEmpty = true

            db.each(`SELECT * FROM files WHERE name LIKE '%${searchTerm}%' ORDER BY updated_at DESC`, (err, row) => {
                if (err) {
                    console.error(err.message);
                    setUpTabs();
                } else {
                    combinedResults = combinedResults + `
                        <div class="searchResult" onClick="openFile('${row.id}')">
                            <div class="searchResultInfo">
                                <img src="../svgs/note.svg" width="18" height="18" style="color:white">
                                <p>${row.name}</p>
                            </div>
                            <div class="searchResultOptions">
                                <p>${row.isTab ? `Already Open` : ``}</p>
                            </div>
                        </div>
                    `
                    
                    isEmpty = false
                }
            }, () => {
                if (isEmpty) {
                    searchResults.innerHTML = `
                    
                        <div class="noSearchResults">
                            <h3>We couldn't find your notes :(</h3>
                            <p>Try searching for something else</p>
                        </div>
                    
                    `
                } else {
                    searchResults.innerHTML = combinedResults
                }
            });
        });
    } else {
        searchResults.innerHTML = ""
        db.serialize(() => {

            let isEmpty = true

            db.each('SELECT * FROM files ORDER BY updated_at DESC', (err, row) => {
                if (err) {
                    console.error(err.message);
                    setUpTabs();
                } else {
                    addFileToSearchResults(row)
                    isEmpty = false
                }
            }, () => {
                if (isEmpty) {
                    searchResults.innerHTML = `
                    
                        <div class="noSearchResults">
                            <p>No notes was found here!</p>
                            <button onclick="createFirstNote()">Create Note</button>
                        </div>
                    
                    `
                }
            });
        });

    }
}

function createFirstNote() {
    createNewFile()
}

function addFileToSearchResults(file) {
    searchResults.innerHTML = searchResults.innerHTML + `
        <div class="searchResult" onClick="openFile('${file.id}')">
            <div class="searchResultInfo">
                <img src="../svgs/note.svg" width="18" height="18" style="color:white">
                <p>${file.name}</p>
            </div>
            <div class="searchResultOptions">
                <p>${file.isTab ? `Already Open` : ``}</p>
            </div>
        </div>
    `
}

function openFile(fileId) {
    if (fileId) {
        try {
            db.run(`UPDATE files SET isTabOpen = false WHERE isTabOpen = true`)
            db.run(`UPDATE files SET isTab = true, isTabOpen = true WHERE id = "${fileId}"`)
            reloadTabs()
            loadAllSearchResults()
            reloadContent()
        } catch (error) {
            console.log("This id does not exists")
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadAllSearchResults()
})

actualSearch.addEventListener('input', () => {
    loadAllSearchResults(actualSearch.value)
})