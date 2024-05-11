(
    function () {
        let senderID;
        const socket = io();

        function generateID() {
            return `${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}`;
        }
        
        document.querySelector("#receiver-start-con-btn").addEventListener("click", () => {
            senderID = document.querySelector("#join-id").value
            if(senderID.length === 0) {
                return;
            }
            let joinID = generateID();
            socket.emit("receiver-join", {
                uid: joinID,
                sender_uid:senderID
            })
            document.querySelector(".join-screen").classList.remove("active");
            document.querySelector(".fs-screen").classList.add("active");
        })

        let fileShare = {}

        socket.on("fs-meta", (metadata) => {
            fileShare.metadata = metadata;
            fileShare.transmitted = 0;
            fileShare.buffer = [];

            let el = document.createElement("div")
            el.classList.add("item")
            el.innerHTML = `
                <div class="progress">0%</div>
                <div class="file-name">${metadata.filename}</div>
            `;
            document.querySelector(".file-list").appendChild(el);

            fileShare.progress_node = el.querySelector(".progress")

            socket.emit("fs-start", {
                uid:senderID
            })
        })

        socket.on("fs-share", () => {
            fileShare.buffer.push(buffer);
            fileShare.transmitted += buffer.byteLength;
            fileShare.progress_node.innerText = Math.trunc(fileShare.transmitted / fileShare.metadata.total_buffer_size * 100) + "%";

            if(fileShare.transmitted === fileShare.total_buffer_size) {
                download(new Blob(fileShare.buffer), fileShare.metadata.filename)
                fileShare = {}

            } else {
                socket.emit("fs-start", {
                    uid: senderID
                })
            }
        })
})()