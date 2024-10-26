const searchBar = document.getElementById('searchBar')
const searchDrawer = document.getElementById('searchDrawer')
const searchResults = document.getElementById('searchResults')

console.log("e")

searchBar.addEventListener('click', () => {
    searchDrawer.style.display = "block"
})

document.addEventListener('click', (e) => {
    console.log(e)
    if (!e.target.className.includes("ingore-search-close")) {
        searchDrawer.style.display = "none"
    }
}, true)

function loadAllSearchResults() {
    searchResults.innerHTML = ""
    db.serialize(() => {
        db.each('SELECT * FROM files', (err, row) => {
            if (err) {
                console.error(err.message);
                setUpTabs();
            } else {
                addFileToSearchResults(row)
            }
        });
    });
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
            db.run(`UPDATE files SET isTab = true, isTabOpen = true WHERE id = "${fileId}"`)
            reloadTabs()
            loadAllSearchResults()
        } catch (error) {
            console.log("This id does not exists")
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadAllSearchResults()
})