document.addEventListener('DOMContentLoaded', function() {
    const recordButton = document.getElementById('recordButton');
    const visualization = document.getElementById('visualization');
    const chatButton = document.getElementById('chatButton');
    const chatInput = document.getElementById('chatInput');
    let isRecording = false;
    let animationId;
    let startTime;
    const barCount = 32;

    // Create visualization bars
    for (let i = 0; i < barCount; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        visualization.appendChild(bar);
    }

    const bars = visualization.querySelectorAll('.bar');

    recordButton.addEventListener('click', function() {
        isRecording = !isRecording;
        if (isRecording) {
            recordButton.classList.add('recording');
            startVisualization();
            startTimer();
        } else {
            recordButton.classList.remove('recording');
            stopVisualization();
            stopTimer();
        }
    });

    chatButton.addEventListener('click', function() {
        chatInput.classList.toggle('hidden');
        if (!chatInput.classList.contains('hidden')) {
            chatInput.focus();
        }
    });

    function startVisualization() {
        function animate() {
            bars.forEach(bar => {
                const height = Math.random() * 100;
                bar.style.height = `${height}%`;
            });
            animationId = requestAnimationFrame(animate);
        }
        animate();
    }

    function stopVisualization() {
        cancelAnimationFrame(animationId);
        bars.forEach(bar => {
            bar.style.height = '0%';
        });
    }

    function startTimer() {
        startTime = Date.now();
        updateTimer();
    }

    function stopTimer() {
        recordButton.setAttribute('data-time', '00:00');
    }

    function updateTimer() {
        if (!isRecording) return;

        const elapsedTime = Date.now() - startTime;
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        recordButton.setAttribute('data-time', timeString);
        recordButton.style.setProperty('--time', `'${timeString}'`);

        requestAnimationFrame(updateTimer);
    }

    const socket = new WebSocket(`ws://${window.location.host}`);

    socket.addEventListener('open', function (event) {
        console.log('Connected to the server-side WebSocket proxy.');
        socket.send(JSON.stringify({
            type: "response.create",
            response: {
                modalities: ["text"],
                instructions: "Please assist the user.",
            }
        }));
    });

    socket.addEventListener('message', function (event) {
        const data = JSON.parse(event.data);
        console.log('Message from server ', data);
    });
});