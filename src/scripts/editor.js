//word count
const editor = document.getElementById("editor")
let currentOpenTabId = undefined
let i = 0

document.addEventListener('DOMContentLoaded', () => {
    db.serialize(() => {
        db.each('SELECT * FROM files WHERE isTabOpen = true', (err, row) => {
            if (err) {
                console.log(err)
            } else {
                if (i == 1) {
                    throw new Error("Something went wrong with the tab management")
                }
                currentOpenTabId = row.id
                reloadContent()
                i++
            }
        });
    });
})

function updateLineCount() {
    if (document.getElementById("editor").innerText.trim() == "") {
        document.getElementById('wordCount').innerHTML = `0 Words` 
        document.getElementById('characterCount').innerHTML = `0 Characters` 
        document.getElementById('linesCount').innerHTML = `0 Ln` 
        return
    }

    document.getElementById('wordCount').innerHTML = `${String(document.getElementById("editor").innerText.split(" ").filter(x => x.trim() != "").length)} Words` 
    document.getElementById('characterCount').innerHTML = `${String(document.getElementById("editor").innerText.length)} Characters` 
    document.getElementById('linesCount').innerHTML = `${String(document.getElementById("editor").innerText.split("\n").filter(x => x.trim() != "").length)} Ln` 
}


editor.addEventListener("input", () => {

    updateLineCount()

    if (currentOpenTabId != undefined) {
        try {
            db.run(`UPDATE files SET content = ?, updated_at = ? WHERE id = ?`, [editor.innerHTML, now(), currentOpenTabId]);  
        } catch (error) {
            throw new Error(error)
        }
    }

})
