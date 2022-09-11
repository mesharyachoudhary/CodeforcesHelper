document.addEventListener('DOMContentLoaded', async () => {

    fetch('https://codeforces.com/api/contest.list?gym=false')
        .then(res => {
            return res.json();
        })
        .then((allcontests) => {
            const contestList = document.getElementById('contestList');
            let upcomingContests = [];
            allcontests.result.forEach(contest => {
                if (contest.phase === "BEFORE") {
                    upcomingContests.push([contest.durationSeconds, contest.name, contest.startTimeSeconds, contest.relativeTimeSeconds]);
                }
            });
            upcomingContests.sort(function (x, y) {
                const xstart = x[2];
                const ystart = y[2];
                if (xstart < ystart) {
                    return -1;
                }
                if (xstart > ystart) {
                    return 1;
                }
                return 0;
            });
            let contesttable = `<tr><th>Name</th><th>Time Remaining</th><th>Duration</th></tr>`;
            let rows = upcomingContests.map(contest => {
                let duration;
                let totalseconds = parseInt(contest[0]);
                let hours = Math.floor(totalseconds/3600);
                totalseconds -= hours*3600;
                let minutes = Math.floor(totalseconds/ 60);
                totalseconds -= minutes*60; 
                let seconds = totalseconds;
                if (hours < 10) { hours = "0" + hours; }
                if (minutes < 10) { minutes = "0" + minutes; }
                if (seconds < 10) { seconds = "0" + seconds; }
                duration = hours + ':' + minutes + ':' + seconds;
                let startsin = - parseInt(contest[3]);
                days = Math.floor(startsin/86400);
                startsin -= days*86400;
                hours = Math.floor(startsin/3600);
                startsin -= hours*3600;
                minutes = Math.floor(startsin/60);
                let starttime = days + " Days " + hours + " Hours " + minutes + " Minutes";

                return `<tr>
                <td style = "width = 60%"><a target = "_blank" href = "https://codeforces.com/contests">${contest[1]}</a></td>
                <td style = "width = 40%">${starttime} </td>
                <td style = "width = 40%">${duration}</td>
              </tr> `
            });
            for(let i=0;i<rows.length;i++){
                contesttable += rows[i];
            }
            contestList.innerHTML = contesttable;
        })
        .catch(error => console.log(error));

    const searchButton = document.getElementById('searchButton');
    searchButton.addEventListener('click', async function () {
        const tag = document.getElementById('selectTag').value;
        const handle = document.getElementById('handle').value;
        let alreadysubmitted = [];
        if(handle==""){

        }else{
            const submissions = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=5000`).then(res=>res.json());
            console.log(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=5000`);
            console.log(submissions);
            console.log(submissions.result);
            for(let i=0;i<submissions.result.length;i++){
               alreadysubmitted.push(submissions.result[i].problem.name);
            }
            console.log(alreadysubmitted);
        }
        fetch(`https://codeforces.com/api/problemset.problems?tags=${tag}`)
            .then(res => {
                return res.json();
            })
            .then((allquestions) => {
                const questionList = document.getElementById('questionsListTable');
                let questions = [];
                let minRating = document.getElementById('minRating').value;
                let maxRating = document.getElementById('maxRating').value;
                console.log(minRating+" "+maxRating);
                allquestions.result.problems.forEach(problem => {
                    if (problem.rating <= maxRating && problem.rating >= minRating && !alreadysubmitted.includes(problem.name)) {
                        questions.push([problem.contestId, problem.index, problem.name, problem.rating]);
                    }
                });
                let shuffledquestions = questions.sort(() => Math.random()- 0.5);
                shuffledquestions = shuffledquestions.slice(0, Math.min(5, shuffledquestions.length));
                let problemtable = `
                <tr>
                <th>Name</th>
                <th>Link</th>
                <th>Rating</th>
              </tr> `;
                let rows = shuffledquestions.map(question => {

                    return `<tr>
                <td>${question[2]}</td>
                <td><a target="_blank" href="https://codeforces.com/problemset/problem/${question[0]}/${question[1]}">Solve</a> </td>
                <td>${question[3]}</td>
                </tr> `
                });
                for(let i=0;i<rows.length;i++){
                    problemtable += rows[i];
                }
                questionList.innerHTML = problemtable;

            })
            .catch(error => console.log(error));

    });
    const virtualButton = document.getElementById('virtualButton');
    virtualButton.addEventListener('click', async function () {
        const handles = document.getElementById('handles').value.split(',');
        console.log(handles);
        let submittedcontests = new Set();
        for(let i=0;i<handles.length;i++){
            if(handles[i]==""){

            }else{
                const submissions = await fetch(`https://codeforces.com/api/user.status?handle=${handles[i]}&from=1&count=5000`).then(res=>res.json());
                for(let i=0;i<submissions.result.length;i++){
                   submittedcontests.add(submissions.result[i].contestId);
                }
            }            
        }

        fetch('https://codeforces.com/api/contest.list?gym=false')
        .then(res => {
            return res.json();
        })
        .then((allcontests) => {
            const virtualcontestList = document.getElementById('virtualcontestListTable');
            let virtualContests = [];
            allcontests.result.forEach(contest => {
                if (contest.phase === "FINISHED" && !submittedcontests.has(contest.id)) {
                    virtualContests.push([contest.durationSeconds, contest.name, contest.startTimeSeconds, contest.relativeTimeSeconds, contest.id]);
                }
            });
            virtualContests.sort(function (x, y) {
                const xstart = x[2];
                const ystart = y[2];
                if (xstart > ystart) {
                    return -1;
                }
                if (xstart < ystart) {
                    return 1;
                }
                return 0;
            });
            virtualContests = virtualContests.slice(0, Math.min(500, virtualContests.length));
            let virtualcontesttable = `<tr><th>Name</th></tr>`;
            let rows = virtualContests.map(contest => {
                console.log(`${contest[4]}`);
                return `<tr>
                <td style = "width = 60%"><a target = "_blank" href = "https://codeforces.com/contest/${contest[4]}">${contest[1]}</a></td>
              </tr> `
            });
            for(let i=0;i<rows.length;i++){
                virtualcontesttable += rows[i];
            }
            virtualcontestList.innerHTML = virtualcontesttable;
        })
        .catch(error => console.log(error));
    });
})


