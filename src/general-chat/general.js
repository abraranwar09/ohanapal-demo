
//system message for the assessment
const systemMessage = `You are Ohana. You are an AI assistant specializing in assisting individuals with autism and ADHD. You can assist with specific capabilities through tool calling. Your primary focus is to aid the user in their daily life.
Available Functions:
1. cameraCapture (cameraCapture)
   - Captures and analyzes images from the connected camera
   - Returns detailed descriptions of what the camera sees
2. Computer Control (executeComputerCommand)
   - Executes safe computer commands via Claude's API
   - All commands are validated for safety before execution
3. getCalendarEvents (getCalendarEvents)
    - function to retrieve events from the users google calendar
    - Can be used to check for events in the last 30 days, last week, today, next week and next 30 days
4. saveEvent (saveEvent)
    -  function to save events to the users google calendar
    - Can be used to save events to the users google calendar
    - Uses parameters: summary, start, end, description
5. usePerplexity (usePerplexity)
    - function to search for information on the web using Perplexity AI
    - Can be used to search for information on the web
    - Uses parameters: query
6. getGmailMessage (getGmailMessage)
    - function to fetch details of a specific Gmail message using its messageId
    - Can be used to fetch details of a specific Gmail message
    - Uses parameters: messageId
7. sendGmailMessage (sendGmailMessage)
    - function to send an email through Gmail
    - Can be used to send an email through Gmail
    - Uses parameters: to, subject, body, cc, bcc, isHtml
8. listGmailMessages (listGmailMessages)
    - function to list the users Gmail messages
    - Can be used to list the users Gmail messages
    - Uses parameters: query, maxResults

Guidelines:
- Combine tools when needed for comprehensive responses
- Always provide clear explanations of tool usage
- Handle errors gracefully with informative messages
- Handle errors gracefully with informative messages`;

const originalButtonContent = thinkButton.innerHTML;


document.addEventListener('DOMContentLoaded', async function() {
    const thinkButton = document.getElementById('thinkButton');

    const recordButton = document.getElementById('recordButton');
    const visualization = document.getElementById('visualization');
    const chatButton = document.getElementById('chatButton');
    const chatInput = document.getElementById('chatInput');
    let isRecording = false;
    let animationId;
    let startTime;
    const barCount = 32;

    let audioContext;
    let analyser;
    let dataArray;

    let mediaRecorder;
    let audioChunks = [];

    // Create visualization bars
    for (let i = 0; i < barCount; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        visualization.appendChild(bar);
    }

    const bars = visualization.querySelectorAll('.bar');


    //initialize a variable for session id
    const sessionId = "session_" + Date.now();
    localStorage.setItem('sessionId', sessionId);

    // processResponse("Say the words: Click the button and say hi to get started!", sessionId, systemMessage);


    //get todays date and time and format it        
    const today = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('User Timezone:', userTimeZone);
    const formattedToday = today.toLocaleString('en-US', { timeZone: userTimeZone }).replace(',', '');    


    //make an api call to get user information and check if the user has a userName
    const token = localStorage.getItem('token');
    const response = await fetch("http://localhost:3000/api/user", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    const data = await response.json();
    let prompt = "";

    if (data.userName) {
    console.log('User name found:', data.userName);
    //reprompt
     prompt = "The user's name is " + data.userName + ". Remember the user has autism. Answer the user's question and provide helpful information. The users timezone is " + userTimeZone + ". For context, today's date/time is " + formattedToday + ".";
    } else {
    //reprompt
     prompt = "Remember the user has autism. Answer the user's question and provide helpful information. The users timezone is " + userTimeZone + ". For context, today's date/time is " + formattedToday + ".";
    }
    
    
    //record button click function
    recordButton.addEventListener('click', function() {
        isRecording = !isRecording;
        if (isRecording) {
            recordButton.classList.add('recording');
            startAudioProcessing();
            startTimer();
        } else {
            recordButton.classList.remove('recording');
            stopAudioProcessing();
            stopTimer();
        }
    });

    chatButton.addEventListener('click', function() {
        chatInput.classList.toggle('hidden');
        if (!chatInput.classList.contains('hidden')) {
            chatInput.focus();
        }
    });

    chatInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    settingsButton.addEventListener('click', function() {
        window.location.href = '/settings';
    });

    function sendMessage() {
        // Change button to show loading state
        thinkButton.innerHTML = '<div class="spinner"></div> Ohana is thinking...';

        const message = chatInput.value + ' ' + `Hidden context: ${prompt}`;
        const sessionId = localStorage.getItem('sessionId');
        processResponse(message, sessionId, systemMessage);
        chatInput.value = '';
    }

    //function for audio processing start
    function startAudioProcessing() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);
                analyser.fftSize = 64;
                const bufferLength = analyser.frequencyBinCount;
                dataArray = new Uint8Array(bufferLength);

                // Initialize MediaRecorder
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };
                mediaRecorder.onstop = async () => {
                            // Change button to show loading state
        thinkButton.innerHTML = '<div class="spinner"></div> Ohana is thinking...';

                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' }); // Default type
                    const arrayBuffer = await audioBlob.arrayBuffer();
                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                    // Convert to WAV format using custom function
                    const wavArrayBuffer = audioBufferToWav(audioBuffer);
                    const wavBlob = new Blob([wavArrayBuffer], { type: 'audio/wav' });

                    // Prepare the form data
                    const formdata = new FormData();
                    formdata.append("audioFile", wavBlob, "testrecord.wav");
                    formdata.append("prompt", prompt);
                    formdata.append("session_id", sessionId);
                    formdata.append("system_message", systemMessage);

                    // Set up the headers
                    const myHeaders = new Headers();
                    myHeaders.append("Cookie", "connect.sid=s%3A066rmYVuykdk7zp82ikhqhmhFv7Oemk5.7RfbPxQGjqHMJbAeIRxXo46KGgBUFu6pWv0ih4UdjaU");

                    // Set up the request options
                    const requestOptions = {
                        method: "POST",
                        headers: myHeaders,
                        body: formdata,
                        redirect: "follow"
                    };

                    // Send the request
                    fetch("http://localhost:3000/api/audio/process", requestOptions)
                        .then(response => response.text())
                        .then(async result => {
                            const parsedResult = JSON.parse(result);
                            console.log(parsedResult);

                            handleToolCalls(parsedResult);

                            var logoImage = document.getElementById('logoImage');
                            logoImage.classList.add('animate__animated', 'animate__zoomOut');

                            // Check the finish_reason
                            if (parsedResult.finish_reason === 'stop') {
                                // Play the audio from parsedResult.audio
                                if (parsedResult.audio) {
                                    const audioData = parsedResult.audio;
                                    const audio = new Audio(`data:audio/wav;base64,${audioData}`);
                                    
                                    // Show Lottie animation
                                    lottieContainer.style.display = 'block';
                                    lottieAnimation.play();

                                    audio.play();
                                    audio.onended = () => {
                                        // Hide Lottie animation when audio ends
                                        lottieContainer.style.display = 'none';
                                        lottieAnimation.stop();
                                    };
                                }

                                // Display the transcript
                                const transcript = parsedResult.transcript;
                                console.log('Transcript:', transcript);
                                document.getElementById('aiMessage').innerHTML = `<span class="tlt">${transcript}</span>`;

                                $('.tlt').textillate({
                                    in: {
                                        delayScale: 1
                                    }
                                });

                                // Revert button to original state
                                thinkButton.innerHTML = originalButtonContent;
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);

                            // Revert button to original state even on error
                            thinkButton.innerHTML = originalButtonContent;
                        });
                };
                mediaRecorder.start();

                function animate() {
                    analyser.getByteFrequencyData(dataArray);
                    bars.forEach((bar, index) => {
                        const height = dataArray[index] / 2;
                        bar.style.height = `${height}%`;
                    });
                    animationId = requestAnimationFrame(animate);
                }
                animate();
            })
            .catch(err => console.error('Error accessing audio stream:', err));
    }

    //function for audio processing stop
    function stopAudioProcessing() {
        if (audioContext) {
            audioContext.close();
        }
        cancelAnimationFrame(animationId);
        bars.forEach(bar => {
            bar.style.height = '0%';
        });

        // Stop the MediaRecorder
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
    }

    function startTimer() {
        startTime = Date.now();
        updateTimer();
    }

    //function for timer stop
    function stopTimer() {
        recordButton.setAttribute('data-time', '00:00');
    }
    //function for timer update
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


    // Load Lottie animation
    const lottieContainer = document.createElement('div');
    lottieContainer.id = 'lottieContainer';
    lottieContainer.style.display = 'none'; // Initially hidden
    visualization.appendChild(lottieContainer);

    const lottieAnimation = lottie.loadAnimation({
        container: lottieContainer,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: '../assets/ai-response.json' // Path to your Lottie JSON file
    });
});
