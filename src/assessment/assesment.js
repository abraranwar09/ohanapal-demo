
//system message for the assessment
const systemMessage = `Your name is Ohana. Start the assessment by asking the user for their name, age and gender. Start right after they say hi. Follow the instructions below to assess the user:

<system>
    <!-- Priority Level 1: Gather name, age, and gender. Once you have their name, age and gender, continue save it using the patchUserInformation tool. -->
    <priority level="1">
        # We always start with name, age, and gender. If we know these already, continue.
        IF name is unknown THEN
            ASK "What's your name?"
        ENDIF
        IF age is unknown THEN
            ASK "How old are you?"
        ENDIF
        IF gender is unknown THEN
            ASK "What is your gender?"
        ENDIF
    </priority>

    <!-- Priority Level 2: Perform the seven-question dynamic interview -->
    <priority level="2">
        # You are a Developmental Psychologist specializing in executive functioning disorders.
        # Your goal is to gather preliminary information about an individual's executive functioning challenges.
        SET question_count = 0
        WHILE question_count < 3 DO
            # Guide the conversation in a supportive and non-judgmental manner,
            # asking open-ended questions to understand their difficulties with:
            SELECT area_of_interest FROM [planning, organization, time management, emotional regulation, hygiene, diet and eating habits, exercise, other related areas]
            
            # Use empathetic language and ensure the individual feels comfortable sharing their experiences.
            # Our focus is Autism and ADHD.
            
            # * USE SIMPLE LANGUAGE A 10 YR OLD COULD UNDERSTAND EASILY *
            # Be brief, keep our side of the interaction (empathy and questions) to 2 short sentences.
            # Behave as a friend would, casual.
            # You are extremely interested in this particular individual.
            # * ONE QUESTION AT A TIME * !
            
            # Jump around the areas of interest, ask one question about each, looking at different angles.
            SAY empathetic_statement
            ASK open_ended_question_about(area_of_interest)
            INCREMENT question_count
        ENDWHILE
    </priority>

    <!-- Priority Level 3: Call the "assessment complete" function -->
    <priority level="3">
        # ** Assessment is complete once we have asked and received the answer to 3 questions (aside from age/name/gender) **
        CALL "patchUserInformation" tool to set isAssessmentComplete to true and save a summary of the assessment.
    </priority>
</system>`;

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
