document.addEventListener('DOMContentLoaded', () => {
    const todoList = document.getElementById('todo-list');
    const newTodoInput = document.getElementById('new-todo');
    const addButton = document.getElementById('add-button');
    const todayScoreSpan = document.getElementById('today-score');
    const weeklyAverageSpan = document.getElementById('weekly-average');
    const scoresKey = 'dailyScores';
    const lastUpdateKey = 'lastUpdate';

    function createTodoItem(text, checked = false) {
        const li = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = checked;
        checkbox.dataset.score = 20;
        
        const label = document.createElement('label');
        label.textContent = text;

        if (checked) {
            li.classList.add('completed');
        }

        li.appendChild(checkbox);
        li.appendChild(label);

        checkbox.addEventListener('change', () => {
            li.classList.toggle('completed', checkbox.checked);
            if (checkbox.checked) {
                todoList.appendChild(li); // 완료 시 맨 아래로 이동
            }
            saveTasks();
            updateScoreDisplay();
            saveDailyScore();
        });

        return li;
    }

    function saveTasks() {
        const tasks = [];
        todoList.querySelectorAll('li').forEach(li => {
            const checkbox = li.querySelector('input[type="checkbox"]');
            const label = li.querySelector('label');
            tasks.push({
                text: label.textContent,
                checked: checkbox.checked
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const savedTasks = JSON.parse(localStorage.getItem('tasks'));
        if (savedTasks) {
            todoList.innerHTML = ''; // 기존 항목 초기화
            savedTasks.forEach(task => {
                const li = createTodoItem(task.text, task.checked);
                todoList.appendChild(li);
            });
        } else {
            // 초기 5개 항목
            const initialTasks = [
                "1시간마다 스쿼트 운동하기",
                "AI 일반 공부하기",
                "앱 개발 공부하기",
                "요리하기",
                "해질 무렵 줄넘기 50번하기"
            ];
            initialTasks.forEach(text => {
                const li = createTodoItem(text);
                todoList.appendChild(li);
            });
            saveTasks();
        }
    }

    function calculateDailyScore() {
        let score = 0;
        todoList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            if (checkbox.checked) {
                score += parseInt(checkbox.dataset.score);
            }
        });
        return score;
    }

    function updateScoreDisplay() {
        todayScoreSpan.textContent = calculateDailyScore();
    }

    function saveDailyScore() {
        const today = new Date().toDateString();
        let dailyScores = JSON.parse(localStorage.getItem(scoresKey)) || {};
        dailyScores[today] = calculateDailyScore();
        localStorage.setItem(scoresKey, JSON.stringify(dailyScores));
        localStorage.setItem(lastUpdateKey, today);
        updateWeeklyAverage();
    }

    function updateWeeklyAverage() {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        let totalScore = 0;
        let daysCounted = 0;
        const savedScores = JSON.parse(localStorage.getItem(scoresKey)) || {};

        for (const date in savedScores) {
            const scoreDate = new Date(date);
            if (scoreDate >= startOfWeek && scoreDate <= new Date()) {
                totalScore += savedScores[date];
                daysCounted++;
            }
        }

        const average = daysCounted > 0 ? Math.round(totalScore / daysCounted) : 0;
        weeklyAverageSpan.textContent = average;
    }

    addButton.addEventListener('click', () => {
        const text = newTodoInput.value.trim();
        if (text !== '') {
            const li = createTodoItem(text);
            todoList.appendChild(li);
            newTodoInput.value = '';
            saveTasks();
        }
    });

    // Enter 키로 할 일 추가
    newTodoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addButton.click();
        }
    });

    loadTasks();
    updateScoreDisplay();
    updateWeeklyAverage();
    
    // 매일 자정에 점수 초기화
    const checkMidnight = () => {
        const now = new Date();
        const lastSaved = localStorage.getItem(lastUpdateKey);
        if (lastSaved !== now.toDateString()) {
            // 새 날이 시작되면 점수 초기화
            localStorage.removeItem('tasks'); // 체크리스트 초기화
            loadTasks();
            updateScoreDisplay();
        }
    };
    
    setInterval(checkMidnight, 60 * 60 * 1000); // 1시간마다 자정 확인
});