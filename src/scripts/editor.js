//word count
document.getElementById("editor").addEventListener("input", () => {

    if (document.getElementById("editor").innerText.trim() == "") {
        document.getElementById('wordCount').innerHTML = `0 Words` 
            document.getElementById('characterCount').innerHTML = `0 Characters` 
        return
    }

    document.getElementById('wordCount').innerHTML = `${String(document.getElementById("editor").innerText.split(" ").filter(x => x.trim() != "").length)} Words` 
    document.getElementById('characterCount').innerHTML = `${String(document.getElementById("editor").innerText.length)} Characters` 
})