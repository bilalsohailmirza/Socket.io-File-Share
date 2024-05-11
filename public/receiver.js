(function(){

	const URL = 'http://localhost:5000';
	const socket = io(URL, {
		cors: {
			origin: "*"
		}
	});
	let sender_uid;

	function generateID(){
		return `${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}`;
	}

	document.querySelector("#receiver-start-con-btn").addEventListener("click",function(){
		sender_uid = document.querySelector("#join-id").value;
		if(sender_uid.length == 0){
			return;
		}
		let joinID = generateID();
		socket.emit("receiver-join", {
			sender_uid:sender_uid,
			uid:joinID
		});	
		document.querySelector(".join-screen").classList.remove("active");
		document.querySelector(".fs-screen").classList.add("active");
	});

	let fileShare = {};

	socket.on("fs-meta",function(metadata){
		fileShare.metadata = metadata;
		fileShare.transmitted = 0;
		fileShare.buffer = [];

		let el = document.createElement("div");
		el.classList.add("item");
		// <a href=${metadata.filename}
		el.innerHTML = `
				<div class="progress">0%</div>
				<div class="file-name">${metadata.filename}</div>
				`;
				// download>
		document.querySelector(".files-list").appendChild(el);

		fileShare.progrss_node = el.querySelector(".progress");

		socket.emit("fs-start",{
			uid:sender_uid
		});
	});

	socket.on("fs-share",function(buffer){
		console.log("Buffer", buffer);
		fileShare.buffer.push(buffer);
		fileShare.transmitted += buffer.byteLength;
		fileShare.progrss_node.innerText = Math.trunc(fileShare.transmitted / fileShare.metadata.total_buffer_size * 100) + "%";
		if(fileShare.transmitted == fileShare.metadata.total_buffer_size){
			console.log("Download file: ", fileShare);
            // window.URL.createObjectURL(new Blob(fileShare.buffer, fileShare.metadata.filename))
            // let newFile = new Blob(fileShare.buffer)
			// download(newFile, fileShare.metadata.filename);
			download(new Blob(fileShare.buffer), fileShare.metadata.filename)
            // window.URL.revokeObjectURL()
			fileShare = {};
		} else {
			socket.emit("fs-start",{
				uid:sender_uid
			});
		}
	});

})();